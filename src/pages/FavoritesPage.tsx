import { useApp } from '../state/AppState'
import { navigate, useRoute } from '../lib/route'
import { Favorites } from '../components/Favorites'
import { HistoryList } from '../components/History'

export function FavoritesPage() {
  const { t, favorites, history } = useApp()
  const route = useRoute()
  const tab = route === '/istorija' ? 'history' : 'favorites'
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-10">
      <h1 className="text-[clamp(2rem,7vw,3.5rem)] font-black uppercase">{tab === 'favorites' ? t('favorites.title') : t('history.title')}</h1>
      <div role="group" aria-label={t('nav.favorites')} className="mt-5 flex gap-2">
        <button aria-pressed={tab === 'favorites'} className="chip" onClick={() => navigate('/megstami')}>
          {t('favorites.tab')} <span className="text-ink-soft" aria-hidden>{favorites.length}</span>
        </button>
        <button aria-pressed={tab === 'history'} className="chip" onClick={() => navigate('/istorija')}>
          {t('nav.history')} <span className="text-ink-soft" aria-hidden>{history.length}</span>
        </button>
      </div>
      <div className="mt-6">{tab === 'favorites' ? <Favorites /> : <HistoryList />}</div>
    </div>
  )
}
