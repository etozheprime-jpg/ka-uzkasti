import { useApp } from '../state/AppState'
import { formatPrice, type Product } from '../lib/products'
import { ProductImage } from './ProductImage'
import { FavoriteButton } from './FavoriteButton'

export function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
  const { showResult, locale, t } = useApp()
  const price = formatPrice(product.price, locale)
  return (
    <article className="sticker group relative flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
      <button
        type="button"
        onClick={() => showResult({ product, kind: 'view' })}
        className="flex flex-1 flex-col text-left"
        aria-label={`${product.brand} — ${product.name}`}
      >
        <ProductImage product={product} className={`${compact ? 'aspect-[5/3]' : 'aspect-[4/3]'} border-b-2 border-ink`} />
        <div className="flex flex-1 flex-col gap-1 p-3">
          <span className="eyebrow">{product.brand}</span>
          <h3 className="font-body! text-[0.95rem] font-bold leading-snug tracking-normal! line-clamp-2">{product.name}</h3>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-ink-soft">{product.weight}</span>
            <span className="text-right leading-tight">
              {product.oldPrice && <span className="mr-1.5 text-xs text-ink-soft line-through">{formatPrice(product.oldPrice, locale)}</span>}
              <span className="font-display text-base font-extrabold">{price ?? t('result.noPrice')}</span>
            </span>
          </div>
        </div>
      </button>
      <FavoriteButton id={product.id} className="absolute right-2 top-2 shadow-[2px_2px_0_0_#1B1712]" />
    </article>
  )
}
