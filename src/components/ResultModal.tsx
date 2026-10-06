import { useEffect, useRef } from 'react'
import { ArrowUpRight, RotateCw, Shuffle, X } from 'lucide-react'
import { useApp } from '../state/AppState'
import { formatPrice, type Category, type Product } from '../lib/products'
import { primaryBuyLink, STORES, STORE_BY_ID, storeLink } from '../lib/stores'
import { buildWheel, anotherInGroup, surprisePick } from '../lib/pick'
import { navigate } from '../lib/route'
import { ProductImage } from './ProductImage'
import { FavoriteButton } from './FavoriteButton'
import { useRoute } from '../lib/route'

const NUTRI: Record<string, string> = {
  A: 'bg-forest text-paper', B: 'bg-[#8CBF3F] text-ink', C: 'bg-mustard text-ink', D: 'bg-[#F28A2E] text-ink', E: 'bg-tomato text-paper',
}

export function ResultModal() {
  const app = useApp()
  const { result, showResult, t, locale, filters, requestSpin, addHistory } = app
  const route = useRoute()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (result && !d.open) d.showModal()
    if (!result && d.open) d.close()
  }, [result])

  const p = result?.product
  const buy = p ? primaryBuyLink(p) : null

  const another = () => {
    if (!result || !p) return
    let next: Product | null = null
    if (result.kind === 'wheel') {
      next = anotherInGroup(buildWheel(filters, (c: Category) => t(`cat.${c}`)), p)
    } else if (result.kind === 'surprise' || result.kind === 'super') {
      next = surprisePick(result.level ?? 'wild', p.id)
    }
    if (next) {
      addHistory(next.id)
      showResult({ ...result, product: next })
    }
  }

  const spinAgain = () => {
    showResult(null)
    if (route !== '/' && route !== '/rulete') navigate('/rulete')
    requestSpin()
  }

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="result-title"
      onClose={() => showResult(null)}
      onClick={(e) => { if (e.target === ref.current) showResult(null) }}
    >
      {result && p && buy && (
        <div className="relative p-4 pb-6 sm:p-6">
          <button type="button" className="btn absolute right-3 top-3 z-10 !min-h-11 !w-11 !px-0" onClick={() => showResult(null)} aria-label={t('result.close')}>
            <X className="size-5" aria-hidden />
          </button>

          {result.kind === 'super' && (
            <div className="mb-3 -mx-1 rounded-2xl border-2 border-ink bg-mustard p-3 pr-14 [background-image:repeating-linear-gradient(135deg,#F6B81E_0_14px,#FF9DB8_14px_28px,#86C9EE_28px_42px)]">
              <p className="font-display text-xl font-black uppercase tracking-tight">🦄 {t('egg.super')}</p>
              <p className="text-sm font-semibold">{t('egg.superBody')}</p>
            </div>
          )}

          {result.kind !== 'view' && result.kind !== 'super' && (
            <p className="eyebrow pr-12">{result.kind === 'surprise' ? t('surprise.title') : t('result.headline')}</p>
          )}

          <div className="mt-2 grid gap-4 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-6">
            <div className="sticker-flat mx-auto w-full max-w-[16rem] overflow-hidden pop-in sm:max-w-none">
              <ProductImage product={p} large eager className="aspect-[5/4] sm:aspect-square" />
            </div>

            <div className="flex min-w-0 flex-col gap-3">
              <div>
                <p className="eyebrow">{p.brand}</p>
                <h2 id="result-title" className="mt-1 text-[clamp(1.5rem,5.5vw,2.25rem)] font-black leading-[1.02]">
                  {result.kind === 'surprise' ? t('surprise.sentence', { name: p.name }) : p.name}
                </h2>
              </div>

              <ul className="flex flex-wrap gap-1.5 text-xs font-bold">
                <li className="rounded-full border-2 border-ink bg-card px-2.5 py-1">{p.emoji} {t(`cat.${p.category}`)}</li>
                {p.weight && <li className="rounded-full border-2 border-ink bg-card px-2.5 py-1">{p.weight}</li>}
                {p.rarity !== 'classic' && <li className="rounded-full border-2 border-ink bg-bubble px-2.5 py-1">{t(`rarity.${p.rarity}`)}</li>}
                {p.nutriscore && <li className={`rounded-full border-2 border-ink px-2.5 py-1 ${NUTRI[p.nutriscore]}`}>{t('result.nutri', { grade: p.nutriscore })}</li>}
              </ul>

              <div className="sticker-flat flex flex-wrap items-end gap-x-4 gap-y-1 p-3">
                <div>
                  <p className="eyebrow">{t('result.price')}</p>
                  <p className="font-display text-3xl font-black leading-none">
                    {formatPrice(p.price, locale) ?? t('result.noPrice')}
                    {p.oldPrice && <span className="ml-2 align-middle text-sm font-semibold text-ink-soft line-through">{formatPrice(p.oldPrice, locale)}</span>}
                  </p>
                </div>
                {p.oldPrice && <span className="rounded-full border-2 border-ink bg-tomato px-2.5 py-1 text-xs font-extrabold uppercase text-paper">{t('result.sale')}</span>}
                <p className="basis-full text-xs text-ink-soft">
                  {t('result.priceNote', { date: new Date(p.priceDate).toLocaleDateString(locale) })}
                  {p.deposit ? ` ${t('result.deposit', { amount: formatPrice(p.deposit, locale) ?? '' })}.` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* where to buy */}
          <section className="mt-5" aria-label={t('result.where')}>
            <h3 className="text-lg">{t('result.where')}</h3>
            <ul className="mt-2 grid gap-2">
              {p.stores.map((s) => (
                <li key={s.id} className="sticker-flat flex flex-wrap items-center gap-2 p-2.5">
                  <span className="rounded-full border-2 border-ink bg-forest px-2.5 py-0.5 text-xs font-extrabold uppercase text-paper">{t('result.confirmed')}</span>
                  <span className="font-bold">{s.name}</span>
                  <span className="text-sm text-ink-soft">{formatPrice(s.price, locale)} · {new Date(s.date).toLocaleDateString(locale)}</span>
                  <a className="btn btn-yellow ml-auto !min-h-11 text-sm" href={s.url} target="_blank" rel="noopener noreferrer">
                    {t('result.openProduct', { store: s.name })} <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            {p.maybeStores.length > 0 && (
              <div className="mt-3">
                <p className="eyebrow">{t('result.maybe')}</p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {STORES.filter((s) => p.maybeStores.includes(s.id)).map((s) => (
                    <li key={s.id}>
                      {s.search ? (
                        <a className="chip !min-h-10 text-sm" href={storeLink(STORE_BY_ID[s.id], p)} target="_blank" rel="noopener noreferrer" title={t('result.searchStore', { store: s.name })}>
                          {s.name} <ArrowUpRight className="size-3.5" aria-hidden />
                        </a>
                      ) : (
                        <span className="chip !min-h-10 border-dashed text-sm text-ink-soft">{s.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5 text-xs text-ink-soft">{t('result.maybeHint')}</p>
              </div>
            )}
          </section>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <a className="btn btn-primary text-base sm:col-span-2" href={buy.url} target="_blank" rel="noopener noreferrer">
              {t('result.where')} <ArrowUpRight className="size-5" aria-hidden />
            </a>
            <button type="button" className="btn btn-yellow" onClick={spinAgain}>
              <RotateCw className="size-4" aria-hidden /> {t('result.again')}
            </button>
            {result.kind !== 'view' ? (
              <button type="button" className="btn" onClick={another}>
                <Shuffle className="size-4" aria-hidden /> {t('result.another')}
              </button>
            ) : (
              <FavoriteButton id={p.id} label className="!rounded-full shadow-[2px_2px_0_0_#1B1712]" />
            )}
            {result.kind !== 'view' && <FavoriteButton id={p.id} label className="!rounded-full shadow-[2px_2px_0_0_#1B1712] sm:col-span-2" />}
          </div>

          {p.imageSource && (
            <p className="mt-4 text-xs text-ink-soft">
              {t('result.imageBy', { source: '' })}
              <a className="underline underline-offset-2" href={p.imageSource.url} target="_blank" rel="noopener noreferrer">{p.imageSource.name}</a>
              {' · CC BY-SA'}
            </p>
          )}
        </div>
      )}
    </dialog>
  )
}
