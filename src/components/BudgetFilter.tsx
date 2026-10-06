import { useApp } from '../state/AppState'
import type { Budget } from '../lib/products'

const OPTIONS: { value: Budget; key: 'budget.2' | 'budget.5' | 'budget.10' | 'budget.any' }[] = [
  { value: 2, key: 'budget.2' }, { value: 5, key: 'budget.5' }, { value: 10, key: 'budget.10' }, { value: null, key: 'budget.any' },
]

export function BudgetFilter() {
  const { filters, setFilters, t } = useApp()
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="eyebrow mb-2 p-0">{t('budget.title')}</legend>
      <div className="flex flex-wrap gap-2" role="group">
        {OPTIONS.map((o) => (
          <button key={String(o.value)} type="button" className="chip" aria-pressed={filters.budget === o.value} onClick={() => setFilters({ budget: o.value })}>
            {t(o.key)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
