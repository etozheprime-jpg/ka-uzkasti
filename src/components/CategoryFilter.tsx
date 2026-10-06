import { useApp } from '../state/AppState'
import type { Mood, Want } from '../lib/products'

const WANTS: { id: Want; emoji: string }[] = [
  { id: 'any', emoji: '🎲' }, { id: 'sweet', emoji: '🍭' }, { id: 'salty', emoji: '🧂' }, { id: 'chocolate', emoji: '🍫' },
  { id: 'crunchy', emoji: '🍿' }, { id: 'sour', emoji: '🍋' }, { id: 'spicy', emoji: '🌶️' }, { id: 'healthy', emoji: '🥜' }, { id: 'unusual', emoji: '👽' },
]

/** "What do you feel like?" mini-quiz: one tap re-tunes the wheel. */
export function CategoryFilter({ scroll }: { scroll?: boolean }) {
  const { filters, setFilters, t } = useApp()
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="eyebrow mb-2 p-0">{t('want.title')}</legend>
      <div className={scroll ? 'hscroll' : 'flex flex-wrap gap-2'} role="group">
        {WANTS.map((w) => (
          <button key={w.id} type="button" className="chip" aria-pressed={filters.want === w.id} onClick={() => setFilters({ want: w.id })}>
            <span aria-hidden>{w.emoji}</span> {t(`want.${w.id}`)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

const MOODS: { id: Mood; emoji: string }[] = [
  { id: 'any', emoji: '✨' }, { id: 'plain', emoji: '😋' }, { id: 'treat', emoji: '🥹' }, { id: 'greasy', emoji: '🤤' }, { id: 'unusual', emoji: '🧠' },
]

export function MoodFilter() {
  const { filters, setFilters, t } = useApp()
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="eyebrow mb-2 p-0">{t('mood.title')}</legend>
      <div className="flex flex-wrap gap-2" role="group">
        {MOODS.map((m) => (
          <button key={m.id} type="button" className="chip" aria-pressed={filters.mood === m.id} onClick={() => setFilters({ mood: m.id })}>
            <span aria-hidden>{m.emoji}</span> {t(`mood.${m.id}`)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
