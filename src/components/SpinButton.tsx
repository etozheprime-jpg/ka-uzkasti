import { Dices } from 'lucide-react'

interface Props {
  label: string
  busyLabel: string
  busy: boolean
  disabled?: boolean
  onClick: () => void
  tone?: 'red' | 'green' | 'yellow'
  icon?: boolean
}

export function SpinButton({ label, busyLabel, busy, disabled, onClick, tone = 'red', icon = true }: Props) {
  const toneCls = tone === 'red' ? 'bg-tomato text-paper hover:bg-tomato-deep' : tone === 'green' ? 'bg-forest text-paper' : 'bg-mustard text-ink'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className={`group relative w-full max-w-[26rem] rounded-[22px] border-[3px] border-ink px-6 py-4 font-display text-[clamp(1.15rem,4.8vw,1.6rem)] font-black uppercase tracking-tight shadow-[0_6px_0_0_#1B1712] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_0_0_#1B1712] active:translate-y-[5px] active:shadow-[0_1px_0_0_#1B1712] disabled:translate-y-[3px] disabled:cursor-not-allowed disabled:opacity-80 disabled:shadow-[0_3px_0_0_#1B1712] ${toneCls}`}
    >
      <span className="flex items-center justify-center gap-3">
        {icon && <Dices className={`size-7 ${busy ? 'animate-spin' : 'transition-transform group-hover:rotate-12'}`} strokeWidth={2.6} aria-hidden />}
        <span aria-live="polite">{busy ? busyLabel : label}</span>
      </span>
    </button>
  )
}
