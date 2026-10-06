import { LANGS } from '../i18n'
import { useApp } from '../state/AppState'

export function LanguageSwitcher({ large }: { large?: boolean }) {
  const { lang, setLang, t } = useApp()
  return (
    <div role="radiogroup" aria-label={t('lang.label')} className="inline-flex rounded-full border-2 border-ink bg-card p-0.5">
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          aria-checked={lang === l.id}
          aria-label={l.label}
          lang={l.id}
          onClick={() => setLang(l.id)}
          className={`rounded-full px-3 text-sm font-extrabold tracking-wide transition-colors ${large ? 'min-h-12 px-5 text-base' : 'min-h-10'} ${lang === l.id ? 'bg-ink text-paper' : 'hover:bg-paper-2'}`}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}
