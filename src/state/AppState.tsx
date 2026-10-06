import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { LANGS, translate, type Key, type Lang } from '../i18n'
import { DEFAULT_FILTERS, type Filters, type Product } from '../lib/products'
import { clearStore, usePersisted } from '../lib/storage'
import { sfx, vibrate } from '../lib/feedback'

export interface Settings { sound: boolean; vibration: boolean; reduceMotion: boolean }
export interface HistoryEntry { id: string; at: number }
export interface ResultState { product: Product; kind: 'wheel' | 'surprise' | 'super' | 'view'; level?: 'classic' | 'unexpected' | 'wild' }
export type Egg = 'hungry' | 'shop' | null

interface Ctx {
  lang: Lang
  setLang: (l: Lang) => void
  locale: string
  t: (key: Key, params?: Record<string, string | number>) => string
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  history: HistoryEntry[]
  addHistory: (id: string) => void
  clearHistory: () => void
  settings: Settings
  setSettings: (patch: Partial<Settings>) => void
  filters: Filters
  setFilters: (patch: Partial<Filters>) => void
  resetFilters: () => void
  result: ResultState | null
  showResult: (r: ResultState | null) => void
  toast: string | null
  pushToast: (msg: string) => void
  registerSpin: () => Egg
  spinRequest: number
  requestSpin: () => void
  wipeAll: () => void
  feedback: { tick: (speed?: number) => void; win: (big?: boolean) => void; haptic: (p: number | number[]) => void; unlock: () => void }
}

const AppContext = createContext<Ctx | null>(null)

const prefersReduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = usePersisted<Lang>('lang', 'lt')
  const [favorites, setFavorites] = usePersisted<string[]>('favorites', [])
  const [history, setHistory] = usePersisted<HistoryEntry[]>('history', [])
  const [settings, setSettingsState] = usePersisted<Settings>('settings', { sound: true, vibration: true, reduceMotion: prefersReduced() })
  const [filters, setFiltersState] = usePersisted<Filters>('filters', DEFAULT_FILTERS)
  const [result, showResult] = useState<ResultState | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const spinTimes = useRef<number[]>([])
  const totalSpins = useRef(0)
  const [spinRequest, setSpinRequest] = useState(0)
  const requestSpin = useCallback(() => setSpinRequest(Date.now()), [])

  const t = useCallback((key: Key, params?: Record<string, string | number>) => translate(lang, key, params), [lang])
  const locale = LANGS.find((l) => l.id === lang)?.locale ?? 'lt-LT'

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = translate(lang, 'meta.title')
    document.querySelector('meta[name="description"]')?.setAttribute('content', translate(lang, 'meta.description'))
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', translate(lang, 'meta.title'))
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', translate(lang, 'meta.description'))
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.motion = settings.reduceMotion ? 'reduced' : 'full'
  }, [settings.reduceMotion])

  const pushToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const toggleFavorite = useCallback((id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f])), [setFavorites])
  const addHistory = useCallback((id: string) => setHistory((h) => [{ id, at: Date.now() }, ...h].slice(0, 40)), [setHistory])
  const clearHistory = useCallback(() => setHistory([]), [setHistory])
  const setSettings = useCallback((patch: Partial<Settings>) => setSettingsState((s) => ({ ...s, ...patch })), [setSettingsState])
  const setFilters = useCallback((patch: Partial<Filters>) => setFiltersState((f) => ({ ...f, ...patch })), [setFiltersState])
  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), [setFiltersState])

  // Easter eggs: many spins in a row, or lots of spins in one visit.
  const registerSpin = useCallback((): Egg => {
    const now = Date.now()
    spinTimes.current = [...spinTimes.current.filter((x) => now - x < 90_000), now]
    totalSpins.current += 1
    if (totalSpins.current === 10) return 'shop'
    if (spinTimes.current.length === 5) return 'hungry'
    return null
  }, [])

  const wipeAll = useCallback(() => {
    clearStore()
    setFavorites([])
    setHistory([])
    setFiltersState(DEFAULT_FILTERS)
  }, [setFavorites, setHistory, setFiltersState])

  const feedback = useMemo(
    () => ({
      unlock: () => { if (settings.sound) sfx.unlock() },
      tick: (speed = 1) => {
        if (settings.sound) sfx.tick(speed)
        if (settings.vibration && speed < 0.55) vibrate(6) // only the slow, suspenseful ticks buzz
      },
      win: (big = false) => {
        if (settings.sound) (big ? sfx.super : sfx.win)()
        if (settings.vibration) vibrate(big ? [80, 40, 80, 40, 160] : [60, 30, 120])
      },
      haptic: (p: number | number[]) => { if (settings.vibration) vibrate(p) },
    }),
    [settings.sound, settings.vibration],
  )

  const value: Ctx = {
    lang, setLang, locale, t,
    favorites, toggleFavorite, isFavorite: (id) => favorites.includes(id),
    history, addHistory, clearHistory,
    settings, setSettings,
    filters, setFilters, resetFilters,
    result, showResult,
    toast, pushToast,
    registerSpin, spinRequest, requestSpin, wipeAll, feedback,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): Ctx {
  const c = useContext(AppContext)
  if (!c) throw new Error('useApp outside AppProvider')
  return c
}
