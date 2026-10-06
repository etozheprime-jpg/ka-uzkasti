import { Dices, Heart, House, Settings, ShoppingBasket } from 'lucide-react'
import { useApp } from '../state/AppState'
import { hrefFor, navigate, useRoute, type Route } from '../lib/route'
import { NAV } from './Header'

const ICONS = { '/': House, '/rulete': Dices, '/megstami': Heart, '/prekes': ShoppingBasket, '/nustatymai': Settings } as Record<Route, typeof House>

/** Thumb-reach bottom bar for phones. */
export function Navigation() {
  const { t } = useApp()
  const route = useRoute()
  const active = route === '/istorija' ? '/megstami' : route
  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-2 pt-1.5 pb-1.5">
        {NAV.map((n) => {
          const Icon = ICONS[n.route]
          const on = active === n.route
          return (
            <li key={n.route}>
              <a
                href={hrefFor(n.route)}
                onClick={(e) => { e.preventDefault(); navigate(n.route) }}
                aria-current={on ? 'page' : undefined}
                className="flex min-h-[3.4rem] flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.68rem] font-bold no-underline"
              >
                <span className={`grid h-7 w-12 place-items-center rounded-full border-2 transition-colors ${on ? 'border-ink bg-mustard' : 'border-transparent'}`}>
                  <Icon className="size-[1.2rem]" strokeWidth={on ? 2.6 : 2.2} aria-hidden />
                </span>
                <span>{t(n.key)}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
