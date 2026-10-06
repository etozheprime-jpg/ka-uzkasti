import { useEffect, useRef, useState } from 'react'
import { Dices } from 'lucide-react'
import { useApp } from '../state/AppState'
import { sampleForReel, type SurpriseLevel } from '../lib/pick'
import type { Product } from '../lib/products'
import { SpinButton } from './SpinButton'

const LEVELS: { id: SurpriseLevel; emoji: string }[] = [
  { id: 'classic', emoji: '😋' }, { id: 'unexpected', emoji: '😮' }, { id: 'wild', emoji: '🤪' },
]

export function SurpriseMode({ onPick }: { onPick: (level: SurpriseLevel) => void }) {
  const { t, settings, feedback } = useApp()
  const [level, setLevel] = useState<SurpriseLevel>('unexpected')
  const [rolling, setRolling] = useState(false)
  const [shown, setShown] = useState<Product | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const levelRef = useRef<SurpriseLevel>('unexpected')
  const choose = (l: SurpriseLevel) => { levelRef.current = l; setLevel(l) }

  useEffect(() => () => window.clearInterval(timer.current), [])

  const go = () => {
    if (rolling) return
    feedback.unlock()
    setRolling(true)
    const pool = sampleForReel(40)
    let i = 0
    setShown(pool[0])
    window.clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      i += 1
      setShown(pool[i % pool.length])
      feedback.tick(0.6)
    }, 90)
    window.setTimeout(() => {
      window.clearInterval(timer.current)
      setRolling(false)
      onPick(levelRef.current)
    }, settings.reduceMotion ? 300 : 1700)
  }

  return (
    <div className="mx-auto grid w-full max-w-xl gap-6">
      <div>
        <h2 className="text-[clamp(1.75rem,6vw,2.5rem)] font-black">{t('surprise.title')}</h2>
        <p className="mt-2 text-ink-soft">{t('surprise.sub')}</p>
      </div>

      <div className="sticker grid min-h-44 place-items-center overflow-hidden p-5 text-center" aria-live="polite">
        {shown ? (
          <div key={shown.id} className="grid gap-1">
            <span className="text-6xl" aria-hidden>{shown.emoji}</span>
            <span className="eyebrow">{shown.brand}</span>
          </div>
        ) : (
          <Dices className="size-16" strokeWidth={1.6} aria-hidden />
        )}
      </div>

      <fieldset className="border-0 p-0">
        <legend className="sr-only">{t('surprise.title')}</legend>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={level === l.id}
              onClick={() => choose(l.id)}
              className={`sticker-flat p-3 text-left transition-colors ${level === l.id ? 'bg-mustard' : 'hover:bg-paper-2'}`}
            >
              <span className="text-2xl" aria-hidden>{l.emoji}</span>
              <span className="mt-1 block font-bold">{t(`surprise.${l.id}`)}</span>
              <span className="block text-xs text-ink-soft">{t(`surprise.${l.id}Hint` as 'surprise.classicHint')}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-center">
        <SpinButton tone="yellow" label={t('surprise.button')} busyLabel={t('spin.spinning')} busy={rolling} onClick={go} />
      </div>
    </div>
  )
}
