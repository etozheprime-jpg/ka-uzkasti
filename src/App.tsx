import { Component, useCallback, useEffect, useState, type ReactNode } from 'react'
import { AppProvider, useApp } from './state/AppState'
import { loadCatalog } from './lib/products'
import { useRoute } from './lib/route'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { ResultModal } from './components/ResultModal'
import { Toast } from './components/Toast'
import { Home } from './pages/Home'
import { RoulettePage } from './pages/RoulettePage'
import { FavoritesPage } from './pages/FavoritesPage'
import { ProductsPage } from './pages/ProductsPage'
import { SettingsPage } from './pages/SettingsPage'

function Page() {
  const route = useRoute()
  switch (route) {
    case '/rulete': return <RoulettePage />
    case '/megstami':
    case '/istorija': return <FavoritesPage />
    case '/prekes': return <ProductsPage />
    case '/nustatymai': return <SettingsPage />
    default: return <Home />
  }
}

function Loading() {
  const { t } = useApp()
  return (
    <div className="grid min-h-[60dvh] place-items-center px-4 text-center" role="status">
      <div className="grid justify-items-center gap-4">
        <span className="animate-bounce text-6xl" aria-hidden>🍭</span>
        <p className="font-display text-lg font-bold">{t('state.loading')}</p>
        <div className="skeleton h-3 w-48 rounded-full" aria-hidden />
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useApp()
  return (
    <div className="grid min-h-[60dvh] place-items-center px-4 text-center" role="alert">
      <div className="sticker grid max-w-sm justify-items-center gap-3 p-6">
        <span className="text-5xl" aria-hidden>🫠</span>
        <p className="font-bold">{t('state.error')}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>{t('state.retry')}</button>
      </div>
    </div>
  )
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <ErrorState onRetry={() => this.setState({ failed: false })} />
    return this.props.children
  }
}

function Shell() {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const load = useCallback(() => {
    setState('loading')
    loadCatalog().then(() => setState('ready'), () => setState('error'))
  }, [])
  useEffect(load, [load])

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Skip to content</a>
      <Header />
      <main id="main" className="pb-28 md:pb-10">
        {state === 'loading' && <Loading />}
        {state === 'error' && <ErrorState onRetry={load} />}
        {state === 'ready' && <Boundary><Page /></Boundary>}
      </main>
      {state === 'ready' && <Footer />}
      <Navigation />
      {state === 'ready' && <ResultModal />}
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
