import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { useApp } from '../state/AppState'
import { buildCombo, sampleForReel, type Combo } from '../lib/pick'
import { formatPrice, type Product } from '../lib/products'
import { primaryBuyLink } from '../lib/stores'
import { ProductImage } from './ProductImage'
import { SpinButton } from './SpinButton'

type Slot = 'sweet' | 'salty' | 'drink'
const SLOTS: { id: Slot; emoji: string }[] = [{ id: 'sweet', emoji: '🍫' }, { id: 'salty', emoji: '🥨' }, { id: 'drink', emoji: '🥤' }]

export function ComboGenerator() {
  const { t, locale, filters, settings, feedback } = useApp()
  const [combo, setCombo] = useState<Combo | null>(null)
  const [locked, setLocked] = useState<Record<Slot, boolean>>({ sweet: true, salty: true, drink: true })
  const [reel, setReel] = useState<Record<Slot, Product | null>>({ sweet: null, salty: null, drink: null })
  const [rolling, setRolling] = useState(false)
  const [open, setOpen] = useState(false)
  const timers = useRef<number[]>([])
  const iv = useRef<number | undefined>(undefined)

  useEffect(() => () => { timers.current.forEach(window.clearTimeout); window.clearInterval(iv.current) }, [])

  const roll = () => {
    if (rolling) return
    feedback.unlock()
    const next = buildCombo(filters)
    const pool = sampleForReel(30)
    const quick = settings.reduceMotion
    setOpen(false)
    setRolling(true)
    setCombo(next)
    setLocked({ sweet: false, salty: false, drink: false })
    let i = 0
    window.clearInterval(iv.current)
    iv.current = window.setInterval(() => {
      i += 1
      setReel({ sweet: pool[i % 30], salty: pool[(i + 7) % 30], drink: pool[(i + 14) % 30] })
      feedback.tick(0.5)
    }, 85)
    const stops: [Slot, number][] = [['sweet', quick ? 150 : 1000], ['salty', quick ? 250 : 1700], ['drink', quick ? 350 : 2400]]
    timers.current.forEach(window.clearTimeout)
    timers.current = stops.map(([slot, ms]) =>
      window.setTimeout(() => {
        setLocked((l) => ({ ...l, [slot]: true }))
        feedback.haptic(20)
        if (slot === 'drink') {
          window.clearInterval(iv.current)
          setRolling(false)
          feedback.win()
        }
      }, ms),
    )
  }

  const done = combo && !rolling

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-5">
      <div>
        <h2 className="text-[clamp(1.75rem,6vw,2.5rem)] font-black">{done ? t('combo.result') : t('combo.title')}</h2>
        {!done && <p className="mt-2 text-ink-soft">{t('combo.sub')}</p>}
      </div>

      <ul className="grid gap-3">
        {SLOTS.map((s) => {
          const real = combo?.[s.id]
          const shown = locked[s.id] ? real : reel[s.id] ?? real
          return (
            <li key={s.id} className="sticker flex items-stretch overflow-hidden">
              {shown ? (
                <ProductImage product={shown} className="aspect-square w-24 shrink-0 border-r-2 border-ink sm:w-28" />
              ) : (
                <div className="grid w-24 shrink-0 place-items-center border-r-2 border-ink bg-paper-2 text-4xl sm:w-28" aria-hidden>{s.emoji}</div>
              )}
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 p-3">
                <span className="eyebrow">{t(`combo.${s.id}`)}</span>
                {shown ? (
                  <>
                    <span className={`line-clamp-2 font-bold leading-snug ${locked[s.id] ? '' : 'opacity-60'}`}>{shown.name}</span>
                    {locked[s.id] && <span className="text-sm font-semibold text-ink-soft">{shown.weight} · {formatPrice(shown.price, locale)}</span>}
                  </>
                ) : (
                  <span className="text-ink-soft">—</span>
                )}
              </div>
              {locked[s.id] && real && <Check className="mr-3 size-6 self-center text-forest" strokeWidth={3} aria-hidden />}
            </li>
          )
        })}
      </ul>

      {done && (
        <div className="sticker bg-mustard p-4 pop-in">
          <p className="eyebrow !text-ink">{t('combo.total')}</p>
          <p className="font-display text-4xl font-black leading-none">≈ {formatPrice(combo.total, locale)}</p>
          <p className="mt-2 text-xs">{t('combo.totalNote', { date: new Date(combo.sweet.priceDate).toLocaleDateString(locale) })}</p>
        </div>
      )}

      {done && open && (
        <ul className="grid gap-2 pop-in">
          {SLOTS.map((s) => {
            const p = combo[s.id]
            const link = primaryBuyLink(p)
            return (
              <li key={s.id}>
                <a className="btn w-full justify-between" href={link.url} target="_blank" rel="noopener noreferrer">
                  <span className="truncate text-left text-sm">{p.emoji} {p.name}</span>
                  <ArrowUpRight className="size-4 shrink-0" aria-hidden />
                </a>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex flex-col items-center gap-3">
        {done && !open && (
          <button type="button" className="btn btn-green w-full max-w-[26rem] !min-h-14 text-base" onClick={() => setOpen(true)}>
            {t('combo.where')}
          </button>
        )}
        <SpinButton tone={done ? 'yellow' : 'red'} label={done ? t('combo.again') : t('combo.button')} busyLabel={t('combo.rolling')} busy={rolling} onClick={roll} />
      </div>
    </div>
  )
}
