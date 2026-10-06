import { Heart } from 'lucide-react'
import { useApp } from '../state/AppState'

export function FavoriteButton({ id, className = '', label = false }: { id: string; className?: string; label?: boolean }) {
  const { isFavorite, toggleFavorite, t, feedback } = useApp()
  const on = isFavorite(id)
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? t('favorites.remove') : t('favorites.add')}
      onClick={(e) => {
        e.stopPropagation()
        if (!on) feedback.haptic(18)
        toggleFavorite(id)
      }}
      className={`grid min-h-11 min-w-11 place-items-center rounded-full border-2 border-ink bg-card transition-transform active:scale-90 ${on ? 'bg-bubble' : ''} ${label ? 'w-auto gap-2 px-4 font-bold' : ''} ${className}`}
    >
      <span className="flex items-center gap-2">
        <Heart className={`size-5 transition-transform duration-300 ${on ? 'scale-110 fill-tomato text-tomato' : ''}`} strokeWidth={2.4} aria-hidden />
        {label && <span>{on ? t('result.saved') : t('result.save')}</span>}
      </span>
    </button>
  )
}
