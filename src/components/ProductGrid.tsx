import type { Product } from '../lib/products'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products, compact }: { products: Product[]; compact?: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.id} className="contents">
          <ProductCard product={p} compact={compact} />
        </li>
      ))}
    </ul>
  )
}
