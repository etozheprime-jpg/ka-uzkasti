import { useApp } from '../state/AppState'
import { BY_ID } from '../lib/products'
import { navigate } from '../lib/route'
import { ProductGrid } from './ProductGrid'

export function Favorites() {
  const { favorites, t } = useApp()
  const items = favorites.map((id) => BY_ID.get(id)).filter((p) => !!p)
  if (!items.length) {
    return (
      <div className="sticker-flat grid place-items-center gap-3 p-8 text-center">
        <span className="text-5xl" aria-hidden>❤️</span>
        <p className="max-w-sm font-bold">{t('favorites.empty')}</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/rulete')}>{t('favorites.emptyCta')}</button>
      </div>
    )
  }
  return <ProductGrid products={items} />
}
