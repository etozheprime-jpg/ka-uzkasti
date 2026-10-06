import { useApp } from '../state/AppState'
import { catalogMeta } from '../lib/products'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }) {
  const { t } = useApp()
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="font-bold">{label}</p>
        <p className="text-sm text-ink-soft">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`${label}: ${on ? t('settings.on') : t('settings.off')}`}
        onClick={() => onChange(!on)}
        className={`relative h-9 w-16 shrink-0 rounded-full border-2 border-ink transition-colors ${on ? 'bg-forest' : 'bg-paper-2'}`}
      >
        <span className={`absolute top-0.5 size-6 rounded-full border-2 border-ink bg-card transition-[left] duration-200 ${on ? 'left-[2.1rem]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

export function SettingsPage() {
  const { t, locale, settings, setSettings, wipeAll, pushToast } = useApp()
  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:pt-10">
      <h1 className="text-[clamp(2rem,7vw,3.5rem)] font-black uppercase">{t('settings.title')}</h1>

      <div className="sticker mt-6 divide-y-2 divide-ink">
        <div className="flex items-center justify-between gap-4 p-4">
          <p className="font-bold">{t('settings.language')}</p>
          <LanguageSwitcher large />
        </div>
        <Toggle label={t('settings.sound')} hint={t('settings.soundHint')} on={settings.sound} onChange={(sound) => setSettings({ sound })} />
        <Toggle label={t('settings.vibration')} hint={t('settings.vibrationHint')} on={settings.vibration} onChange={(vibration) => setSettings({ vibration })} />
        <Toggle label={t('settings.motion')} hint={t('settings.motionHint')} on={settings.reduceMotion} onChange={(reduceMotion) => setSettings({ reduceMotion })} />
      </div>

      <section className="sticker-flat mt-6 p-4">
        <h2 className="text-lg">{t('settings.data')}</h2>
        <p className="mt-2 text-sm text-ink-soft">{t('settings.dataHint')}</p>
        <button type="button" className="btn mt-3" onClick={() => { wipeAll(); pushToast(t('settings.cleared')) }}>{t('settings.clear')}</button>
      </section>

      <section className="sticker-flat mt-6 bg-paper-2 p-4">
        <h2 className="text-lg">{t('settings.about')}</h2>
        <p className="mt-2 text-sm leading-relaxed">{t('settings.aboutBody', { date: new Date(catalogMeta.generatedAt).toLocaleDateString(locale) })}</p>
        <p className="mt-3 text-sm">
          <a className="font-bold underline underline-offset-4" href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer">Open Food Facts</a>
          {' · '}
          <a className="font-bold underline underline-offset-4" href="https://barbora.lt" target="_blank" rel="noopener noreferrer">Barbora</a>
        </p>
      </section>
    </div>
  )
}
