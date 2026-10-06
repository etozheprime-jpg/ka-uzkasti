import { useApp } from '../state/AppState'
import { formatPrice, pickOfTheDay } from '../lib/products'
import { ProductImage } from './ProductImage'
import { FavoriteButton } from './FavoriteButton'

export function DailyPick() {
  const { t, locale, showResult } = useApp()
  const p = pickOfTheDay()
  return (
    <section className="sticker relative flex overflow-hidden bg-card" aria-labelledby="daily-title">
      <ProductImage product={p} className="aspect-square w-28 shrink-0 border-r-2 border-ink sm:w-40" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3 pr-14 sm:p-5 sm:pr-16">
        <p className="eyebrow flex items-center gap-2"><span className="size-2 rounded-full bg-tomato" aria-hidden /> {t('daily.title')}</p>
        <h2 id="daily-title" className="sr-only">{t('daily.title')}</h2>
        <p className="text-sm text-ink-soft">{t('daily.lead')}</p>
        <button type="button" onClick={() => showResult({ product: p, kind: 'view' })} className="text-left">
          <span className="line-clamp-2 font-display text-lg font-black leading-tight tracking-tight sm:text-xl">{p.name}</span>
        </button>
        <p className="text-sm font-bold">{p.weight} · {formatPrice(p.price, locale)}</p>
      </div>
      <FavoriteButton id={p.id} className="absolute right-2 top-2" />
    </section>
  )
}
