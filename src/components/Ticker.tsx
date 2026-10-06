import { PRODUCTS } from '../lib/products'

/** Marquee of real brands in the catalogue. */
export function Ticker() {
  const brands = [...new Set(PRODUCTS.map((p) => p.brand))]
  const row = brands.map((b) => (
    <span key={b} className="flex items-center gap-6 whitespace-nowrap px-3 font-display text-lg font-black uppercase tracking-tight">
      {b}
      <span className="size-2 rotate-45 bg-tomato" aria-hidden />
    </span>
  ))
  return (
    <div className="overflow-hidden border-y-2 border-ink bg-mustard py-3" aria-hidden>
      <div className="ticker-track">
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
    </div>
  )
}
