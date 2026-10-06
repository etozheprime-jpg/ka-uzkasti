import { useEffect, useState } from 'react'

export type Route = '/' | '/rulete' | '/megstami' | '/istorija' | '/prekes' | '/nustatymai'
const ROUTES: Route[] = ['/', '/rulete', '/megstami', '/istorija', '/prekes', '/nustatymai']
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Public URL for a route (respects a sub-path deploy such as GitHub Pages). */
export const hrefFor = (r: Route) => BASE + r

function current(): Route {
  const path = location.pathname.startsWith(BASE) ? location.pathname.slice(BASE.length) : location.pathname
  const p = (path.replace(/\/+$/, '') || '/') as Route
  return ROUTES.includes(p) ? p : '/'
}

/** `to` may carry a query string, e.g. '/rulete?mode=combo'. */
export function navigate(to: Route | `${Route}?${string}`) {
  const path = to.split('?')[0] as Route
  if (to === current()) return window.scrollTo({ top: 0, behavior: 'smooth' })
  history.pushState({}, '', BASE + to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  if (path !== '/' || !to.includes('?')) window.scrollTo({ top: 0 })
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(current)
  useEffect(() => {
    const on = () => setRoute(current())
    window.addEventListener('popstate', on)
    return () => window.removeEventListener('popstate', on)
  }, [])
  return route
}
