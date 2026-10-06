export interface Sector {
  id: string
  label: string
  emoji: string
  color: string
  ink: string
}

const C = 100
const R = 86

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return [C + r * Math.sin(a), C - r * Math.cos(a)] as const
}

export function sectorPath(center: number, step: number, r = R) {
  const [x0, y0] = polar(r, center - step / 2)
  const [x1, y1] = polar(r, center + step / 2)
  return `M${C} ${C} L${x0.toFixed(3)} ${y0.toFixed(3)} A${r} ${r} 0 0 1 ${x1.toFixed(3)} ${y1.toFixed(3)} Z`
}

interface Props {
  sector: Sector
  index: number
  step: number
  state: 'idle' | 'winner' | 'dim'
}

/** One slice of the wheel: coloured wedge, emoji near the rim, label running along the radius. */
export function WheelSegment({ sector, index, step, state }: Props) {
  const center = index * step
  const label = sector.label.toUpperCase()
  const len = Math.min(38, label.length * 3.85)
  const size = step >= 28 ? 6.3 : 5.4
  return (
    <g opacity={state === 'dim' ? 0.45 : 1} style={{ transition: 'opacity 0.5s' }}>
      <path d={sectorPath(center, step)} fill={sector.color} stroke="#1B1712" strokeWidth={1.1} strokeLinejoin="round" />
      <g transform={`rotate(${center} ${C} ${C})`}>
        <text x={C} y={C - 70} textAnchor="middle" dominantBaseline="central" fontSize={step >= 28 ? 14 : 11.5} transform={`rotate(0 ${C} ${C - 70})`}>
          {sector.emoji}
        </text>
        <text
          transform={`translate(${C + size * 0.34} ${C - 21}) rotate(-90)`}
          fontSize={size}
          fontWeight={800}
          letterSpacing={0.4}
          fill={sector.ink}
          textLength={len}
          lengthAdjust="spacingAndGlyphs"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {label}
        </text>
      </g>
      {state === 'winner' && (
        <path d={sectorPath(center, step, R - 1)} fill="rgba(255,255,255,0.28)" stroke="#fff" strokeWidth={2.4} strokeLinejoin="round" />
      )}
    </g>
  )
}

export const WHEEL_VIEW = { C, R }
