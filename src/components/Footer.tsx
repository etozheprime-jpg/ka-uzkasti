import { useApp } from '../state/AppState'
import { catalogMeta } from '../lib/products'

export function Footer() {
  const { t, locale } = useApp()
  return (
    <footer className="mx-auto mt-16 max-w-6xl px-4 pb-8 text-xs text-ink-soft">
      <div className="border-t-2 border-ink pt-4">
        <p>{t('footer.data', { date: new Date(catalogMeta.generatedAt).toLocaleDateString(locale) })}</p>
        <p className="mt-1">{t('footer.note')}</p>
      </div>
    </footer>
  )
}
