import { Check } from 'lucide-react'
import { useApp } from '../state/AppState'
import { STORES } from '../lib/stores'
import type { StoreId } from '../lib/products'

interface Props {
  value?: StoreId[]
  onChange?: (v: StoreId[]) => void
  hint?: boolean
}

export function StoreFilter({ value, onChange, hint = true }: Props) {
  const { filters, setFilters, t } = useApp()
  const selected = value ?? filters.stores
  const set = onChange ?? ((stores: StoreId[]) => setFilters({ stores }))
  const toggle = (id: StoreId) => set(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="eyebrow mb-2 p-0">{t('filters.stores')}</legend>
      <div className="flex flex-wrap gap-2" role="group">
        {STORES.map((s) => {
          const on = selected.includes(s.id)
          return (
            <button key={s.id} type="button" className="chip" role="checkbox" aria-checked={on} onClick={() => toggle(s.id)}>
              <span className={`grid size-4 place-items-center rounded-[5px] border-2 ${on ? 'border-paper bg-paper text-ink' : 'border-ink'}`} aria-hidden>
                {on && <Check className="size-3" strokeWidth={4} />}
              </span>
              {s.name}
            </button>
          )
        })}
      </div>
      {hint && <p className="mt-2 text-xs text-ink-soft">{t('filters.storesHint')}</p>}
    </fieldset>
  )
}
