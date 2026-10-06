import { Volume2, VolumeX } from 'lucide-react'
import { useApp } from '../state/AppState'
import { hrefFor, navigate, useRoute, type Route } from '../lib/route'
import { LanguageSwitcher } from './LanguageSwitcher'

export const NAV: { route: Route; key: 'nav.home' | 'nav.roulette' | 'nav.favorites' | 'nav.products' | 'nav.settings' }[] = [
  { route: '/', key: 'nav.home' },
  { route: '/rulete', key: 'nav.roulette' },
  { route: '/megstami', key: 'nav.favorites' },
  { route: '/prekes', key: 'nav.products' },
  { route: '/nustatymai', key: 'nav.settings' },
]

export function Logo() {
  return (
    <a href={hrefFor('/')} onClick={(e) => { e.preventDefault(); navigate('/') }} className="flex items-center gap-2.5 no-underline" aria-label="Ką užkąsti? — Maisto ruletė">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="34" height="34" className="size-[34px]" />
      <span className="font-display text-[1.15rem] font-black leading-none tracking-tight">Ką užkąsti?</span>
    </a>
  )
}

export function Header() {
  const { t, settings, setSettings } = useApp()
  const route = useRoute()
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur-[2px] pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label={t('nav.main')}>
          {NAV.map((n) => (
            <a
              key={n.route}
              href={hrefFor(n.route)}
              onClick={(e) => { e.preventDefault(); navigate(n.route) }}
              aria-current={route === n.route ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-sm font-bold no-underline transition-colors ${route === n.route ? 'bg-ink text-paper' : 'hover:bg-paper-2'}`}
            >
              {t(n.key)}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border-2 border-ink bg-card"
            aria-pressed={settings.sound}
            aria-label={settings.sound ? t('sound.on') : t('sound.off')}
            onClick={() => setSettings({ sound: !settings.sound })}
          >
            {settings.sound ? <Volume2 className="size-5" aria-hidden /> : <VolumeX className="size-5" aria-hidden />}
          </button>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
