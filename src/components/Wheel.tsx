import { useEffect, useRef } from 'react'
import { motion, type MotionValue } from 'motion/react'
import { WheelSegment, type Sector } from './WheelSegment'

interface Props {
  sectors: Sector[]
  rotation: MotionValue<number>
  winnerIndex: number | null
  spinning: boolean
  disabled?: boolean
  label: string
  hubLabel: string
  onSpin: () => void
  onTick: (speed: number) => void
}

const BULBS = 24

export function Wheel({ sectors, rotation, winnerIndex, spinning, disabled, label, hubLabel, onSpin, onTick }: Props) {
  const step = 360 / sectors.length
  const pointer = useRef<HTMLDivElement>(null)
  const last = useRef({ idx: 0, v: 0, t: 0 })
  const onTickRef = useRef(onTick)
  useEffect(() => { onTickRef.current = onTick })

  // Pointer flick + tick whenever a sector boundary passes under the arrow.
  useEffect(() => {
    last.current = { idx: Math.floor(rotation.get() / step + 0.5), v: rotation.get(), t: performance.now() }
    return rotation.on('change', (v) => {
      const idx = Math.floor(v / step + 0.5)
      if (idx === last.current.idx) return
      const now = performance.now()
      const speed = Math.abs(v - last.current.v) / Math.max(now - last.current.t, 1) // deg per ms
      last.current = { idx, v, t: now }
      onTickRef.current(Math.min(speed / 0.9, 1))
      pointer.current?.animate(
        [{ transform: 'rotate(-26deg)' }, { transform: 'rotate(0deg)' }],
        { duration: Math.min(220, 70 + 60 / Math.max(speed, 0.05)), easing: 'cubic-bezier(.2,.9,.3,1.4)' },
      )
    })
  }, [rotation, step])

  return (
    <div
      className={`relative mx-auto aspect-square w-[min(92vw,34rem,calc(100dvh-16rem))] select-none ${spinning ? 'spinning' : 'idle'}`}
      role="group"
      aria-label={label}
    >
      {/* hard offset shadow */}
      <div className="absolute inset-0 translate-x-[3%] translate-y-[3%] rounded-full bg-ink" aria-hidden />

      {/* rotating disc */}
      <div className="absolute inset-0 overflow-hidden rounded-full" aria-hidden>
      <motion.div className="absolute inset-0 will-change-transform" style={{ rotate: rotation }}>
        <svg viewBox="0 0 200 200" className="size-full">
          <circle cx="100" cy="100" r="92" fill="#FFFAF0" />
          {sectors.map((s, i) => (
            <WheelSegment
              key={s.id}
              sector={s}
              index={i}
              step={step}
              state={winnerIndex === null ? 'idle' : winnerIndex === i ? 'winner' : 'dim'}
            />
          ))}
        </svg>
      </motion.div>
      </div>

      {/* fixed rim with bulbs */}
      <svg viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <circle cx="100" cy="100" r="91" fill="none" stroke="#1B1712" strokeWidth="11" />
        <circle cx="100" cy="100" r="96.4" fill="none" stroke="#FFFAF0" strokeWidth="0.8" opacity="0.35" />
        {Array.from({ length: BULBS }, (_, i) => {
          const a = (i * 360) / BULBS
          const x = 100 + 91 * Math.sin((a * Math.PI) / 180)
          const y = 100 - 91 * Math.cos((a * Math.PI) / 180)
          return <circle key={i} className={i % 2 ? 'bulb-a' : 'bulb-b'} cx={x} cy={y} r="2.1" fill="#F6B81E" stroke="#1B1712" strokeWidth="0.7" />
        })}
        <circle cx="100" cy="100" r="86" fill="none" stroke="#1B1712" strokeWidth="1.2" />
      </svg>

      {/* pointer */}
      <div className="pointer-events-none absolute left-1/2 top-[-3.5%] z-20 w-[13%] -translate-x-1/2" aria-hidden>
        <div ref={pointer} style={{ transformOrigin: '50% 18%' }}>
          <svg viewBox="0 0 60 78" className="drop-shadow-[2px_3px_0_#1B1712]">
            <path d="M30 76 6 40C-2 26 6 4 30 4s32 22 24 36Z" fill="#DC3B22" stroke="#1B1712" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="30" cy="26" r="8" fill="#FBF1DD" stroke="#1B1712" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* hub */}
      <button
        type="button"
        onClick={onSpin}
        disabled={disabled || spinning}
        className="hub-pulse absolute left-1/2 top-1/2 z-10 grid size-[21%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-ink bg-paper font-display text-[clamp(0.6rem,2.6vw,0.95rem)] font-extrabold uppercase tracking-tight shadow-[0_3px_0_0_#1B1712] transition-transform active:scale-95 disabled:cursor-not-allowed"
        aria-label={hubLabel}
      >
        <span aria-hidden>{hubLabel}</span>
      </button>
    </div>
  )
}
