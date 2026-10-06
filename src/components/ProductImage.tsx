import { useState } from 'react'
import { tileColor } from '../lib/theme'
import type { Product } from '../lib/products'

interface Props {
  product: Product
  large?: boolean
  className?: string
  eager?: boolean
}

/**
 * Wrapper-style tile (emoji + brand) is always underneath; a real pack shot, when we have one with a
 * matching variant, fades in on top. So loading, failed and missing photos all keep the layout intact.
 */
export function ProductImage({ product, large, className = '', eager }: Props) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading')
  const src = large ? (product.imageLarge ?? product.image) : product.image
  const hasImg = !!src && state !== 'failed'
  return (
    <div
      className={`tile-bg relative grid place-items-center overflow-hidden ${className}`}
      style={{ backgroundColor: tileColor(product.category) }}
    >
      <div className="grid min-w-0 max-w-full place-items-center gap-1.5 px-2 text-center" role={hasImg ? undefined : 'img'} aria-label={hasImg ? undefined : product.name} aria-hidden={hasImg || undefined}>
        <span className={`select-none leading-none drop-shadow-[2px_3px_0_rgba(27,23,18,0.22)] ${large ? 'text-[clamp(4rem,16vw,6.5rem)]' : 'text-[clamp(2.2rem,9vw,3.6rem)]'}`} aria-hidden>
          {product.emoji}
        </span>
        <span
          className={`max-w-full -rotate-2 border-2 border-ink bg-paper font-display font-black uppercase leading-[1.05] tracking-tight [overflow-wrap:anywhere] line-clamp-2 shadow-[2px_2px_0_0_#1B1712] ${large ? 'px-3 py-1.5 text-xl' : 'px-2 py-1 text-[0.7rem] sm:text-xs'}`}
          aria-hidden
        >
          {product.brand}
        </span>
      </div>
      {hasImg && (
        <img
          src={src}
          alt={product.name}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          width={large ? 400 : 200}
          height={large ? 400 : 200}
          onLoad={() => setState('ready')}
          onError={() => setState('failed')}
          className={`absolute inset-0 size-full bg-white object-contain p-1.5 transition-opacity duration-300 ${state === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}
