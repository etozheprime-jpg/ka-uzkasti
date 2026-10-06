import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { animate, useMotionValue } from 'motion/react'
import { SlidersHorizontal } from 'lucide-react'
import { useApp } from '../state/AppState'
import { buildWheel, spinTarget, surprisePick } from '../lib/pick'
import { PRODUCTS, type Category } from '../lib/products'
import { pick, randFloat, randInt } from '../lib/random'
import { Wheel } from './Wheel'
import { SpinButton } from './SpinButton'
import { CategoryFilter, MoodFilter } from './CategoryFilter'
import { BudgetFilter } from './BudgetFilter'
import { StoreFilter } from './StoreFilter'
import { SurpriseMode } from './SurpriseMode'
import { ComboGenerator } from './ComboGenerator'

export type Mode = 'wheel' | 'surprise' | 'combo'

const CONFETTI_COLORS = ['#DC3B22', '#F6B81E', '#1F7A4D', '#FF9DB8', '#86C9EE', '#1B1712']

async function celebrate(big: boolean) {
  const { default: confetti } = await import('canvas-confetti')
  const base = { colors: CONFETTI_COLORS, disableForReducedMotion: true, zIndex: 80 }
  confetti({ ...base, particleCount: big ? 160 : 90, spread: 80, origin: { y: 0.62 }, startVelocity: 48 })
  if (big) {
    setTimeout(() => confetti({ ...base, particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } }), 250)
    setTimeout(() => confetti({ ...base, particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } }), 450)
    setTimeout(() => confetti({ ...base, particleCount: 120, spread: 160, startVelocity: 30, origin: { y: 0.3 }, scalar: 1.2 }), 700)
  }
}

export function Roulette({ variant }: { variant: 'home' | 'full' }) {
  const app = useApp()
  const { filters, resetFilters, t, lang, settings, feedback, registerSpin, showResult, addHistory, pushToast, spinRequest } = app
  const [mode, setMode] = useState<Mode>(() => {
    const m = new URLSearchParams(location.search).get('mode')
    return m === 'combo' || m === 'surprise' ? m : 'wheel'
  })
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [frozen, setFrozen] = useState<ReturnType<typeof buildWheel> | null>(null) // wheel as it was when the spin began
  const [status, setStatus] = useState<string | null>(null)
  const rotation = useMotionValue(0)
  const timers = useRef<number[]>([])

  const model = useMemo(
    () => buildWheel(filters, (c: Category) => t(`cat.${c}`)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, lang],
  )

  useEffect(() => { setWinner(null) }, [model])
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const spin = useCallback(async () => {
    if (spinning || model.sectors.length === 0) return
    feedback.unlock()
    const egg = registerSpin()
    const isSuper = randInt(100) === 0 // ~1 %
    const target = spinTarget(model)
    const product = isSuper ? pick(PRODUCTS.filter((p) => p.rarity === 'wild' && p.category !== 'drink')) : target.product

    const step = 360 / model.sectors.length
    const off = (randFloat() - 0.5) * step * 0.7
    const r0 = rotation.get()
    const delta = ((-(target.sector * step + off) - r0) % 360 + 360) % 360
    const reduced = settings.reduceMotion
    const turns = reduced ? 2 : 5 + randInt(3)
    const duration = reduced ? 1.4 : 5.8 + randFloat() * 1.2

    setWinner(null)
    setFrozen(model)
    setSpinning(true)
    setStatus(t('spin.s1'))
    timers.current.forEach(window.clearTimeout)
    timers.current = [
      window.setTimeout(() => setStatus(t('spin.s2')), duration * 1000 * 0.45),
      window.setTimeout(() => setStatus(t('spin.s3')), duration * 1000 * 0.78),
    ]
    feedback.haptic(25)

    await animate(rotation, r0 + turns * 360 + delta, { duration, ease: [0.1, 0.72, 0.08, 1] })

    setWinner(target.sector)
    setStatus(t('spin.won'))
    feedback.win(isSuper)
    if (!settings.reduceMotion) void celebrate(isSuper)
    addHistory(product.id)
    if (egg) pushToast(t(egg === 'hungry' ? 'egg.hungry' : 'egg.shop'))

    await new Promise((r) => window.setTimeout(r, settings.reduceMotion ? 300 : 1100))
    setSpinning(false)
    setFrozen(null)
    showResult({ product, kind: isSuper ? 'super' : 'wheel' })
  }, [spinning, model, feedback, registerSpin, rotation, settings.reduceMotion, t, addHistory, pushToast, showResult])

  // "Spin again" from the result sheet
  const handled = useRef(0)
  useEffect(() => {
    if (spinRequest && spinRequest !== handled.current) {
      handled.current = spinRequest
      if (Date.now() - spinRequest < 2500 && mode === 'wheel') void spin()
    }
  }, [spinRequest, mode, spin])

  const shown = frozen ?? model
  const empty = model.sectors.length === 0
  const idleStatus = empty ? t('filters.empty') : t('filters.summary', { n: model.total })

  const surprise = (level: 'classic' | 'unexpected' | 'wild') => {
    const isSuper = randInt(100) === 0
    const p = isSuper ? pick(PRODUCTS.filter((x) => x.rarity === 'wild' && x.category !== 'drink')) : surprisePick(level)
    addHistory(p.id)
    feedback.win(isSuper)
    if (!settings.reduceMotion) void celebrate(isSuper)
    showResult({ product: p, kind: isSuper ? 'super' : 'surprise', level })
  }

  return (
    <div className="grid gap-6 lg:gap-10">
      {variant === 'full' && (
        <div role="group" aria-label={t('nav.roulette')} className="flex gap-2 overflow-x-auto pb-1">
          {(['wheel', 'surprise', 'combo'] as Mode[]).map((m) => (
            <button key={m} className="chip" aria-pressed={mode === m} onClick={() => setMode(m)}>
              {t(`mode.${m}`)}
            </button>
          ))}
        </div>
      )}

      {mode === 'wheel' && (
        <div className={variant === 'full' ? 'grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]' : 'grid gap-6'}>
          <div className="flex flex-col items-center gap-5">
            <Wheel
              sectors={shown.sectors.length ? shown.sectors : [{ id: 'x', label: '—', emoji: '🍬', color: '#F3E3C1', ink: '#1B1712' }]}
              rotation={rotation}
              winnerIndex={winner}
              spinning={spinning}
              disabled={empty}
              label={t('spin.wheelLabel')}
              hubLabel={t('spin.hub')}
              onSpin={spin}
              onTick={feedback.tick}
            />
            <p className="min-h-[1.5rem] text-center font-display text-[0.95rem] font-bold" aria-live="polite">
              {spinning ? status : status === t('spin.won') && winner !== null ? status : idleStatus}
            </p>
            <SpinButton label={t('spin.button')} busyLabel={t('spin.spinning')} busy={spinning} disabled={empty} onClick={spin} />
          </div>

          {variant === 'full' && (
            <aside className="sticker grid gap-5 p-4" aria-label={t('filters.title')}>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg"><SlidersHorizontal className="size-5" aria-hidden /> {t('filters.title')}</h2>
                <button type="button" className="btn btn-ghost !min-h-10 text-sm" onClick={resetFilters}>{t('filters.reset')}</button>
              </div>
              <CategoryFilter />
              <MoodFilter />
              <BudgetFilter />
              <StoreFilter />
            </aside>
          )}
        </div>
      )}

      {mode === 'surprise' && <SurpriseMode onPick={surprise} />}
      {mode === 'combo' && <ComboGenerator />}
    </div>
  )
}
