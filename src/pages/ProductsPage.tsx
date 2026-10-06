import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useApp } from '../state/AppState'
import { availableIn, PRODUCTS, type Category, type StoreId } from '../lib/products'
import { ProductGrid } from '../components/ProductGrid'
import { StoreFilter } from '../components/StoreFilter'

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
type Sort = 'popular' | 'priceAsc' | 'priceDesc' | 'name'
type Taste = 'all' | 'sweet' | 'salty'
const PAGE = 24

export function ProductsPage() {
  const { t } = useApp()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [brand, setBrand] = useState('all')
  const [stores, setStores] = useState<StoreId[]>([])
  const [taste, setTaste] = useState<Taste>('all')
  const [sort, setSort] = useState<Sort>('popular')
  const [limit, setLimit] = useState(PAGE)
  const [panel, setPanel] = useState(false)

  const categories = useMemo(() => [...new Set(PRODUCTS.map((p) => p.category))] as Category[], [])
  const brands = useMemo(() => [...new Set(PRODUCTS.map((p) => p.brand))].sort((a, b) => a.localeCompare(b)), [])

  const list = useMemo(() => {
    const needle = fold(q.trim())
    const rank = { classic: 0, unexpected: 1, wild: 2 }
    const out = PRODUCTS.filter((p) => {
      if (needle && !fold(`${p.brand} ${p.name}`).includes(needle)) return false
      if (category !== 'all' && p.category !== category) return false
      if (maxPrice !== null && (p.price ?? 99) > maxPrice) return false
      if (brand !== 'all' && p.brand !== brand) return false
      if (taste !== 'all' && !p.tags.includes(taste)) return false
      if (stores.length && !stores.some((s) => availableIn(p, s))) return false
      return true
    })
    const by: Record<Sort, (a: (typeof out)[number], b: (typeof out)[number]) => number> = {
      popular: (a, b) => rank[a.rarity] - rank[b.rarity] || Number(!!b.image) - Number(!!a.image) || a.brand.localeCompare(b.brand),
      priceAsc: (a, b) => (a.price ?? 99) - (b.price ?? 99),
      priceDesc: (a, b) => (b.price ?? 0) - (a.price ?? 0),
      name: (a, b) => a.name.localeCompare(b.name),
    }
    return out.sort(by[sort])
  }, [q, category, maxPrice, brand, stores, taste, sort])

  const dirty = q || category !== 'all' || maxPrice !== null || brand !== 'all' || stores.length || taste !== 'all'
  const reset = () => { setQ(''); setCategory('all'); setMaxPrice(null); setBrand('all'); setStores([]); setTaste('all'); setLimit(PAGE) }
  const touch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setLimit(PAGE) }

  const filters = (
    <div className="grid gap-5">
      <fieldset className="border-0 p-0">
        <legend className="eyebrow mb-2 p-0">{t('products.category')}</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={category === 'all'} onClick={() => touch(setCategory)('all')}>{t('products.allCategories')}</button>
          {categories.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => touch(setCategory)(c)}>{t(`cat.${c}`)}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-0 p-0">
        <legend className="eyebrow mb-2 p-0">{t('products.taste')}</legend>
        <div className="flex flex-wrap gap-2">
          {(['all', 'sweet', 'salty'] as Taste[]).map((x) => (
            <button key={x} type="button" className="chip" aria-pressed={taste === x} onClick={() => touch(setTaste)(x)}>
              {x === 'all' ? t('products.allCategories') : t(`tag.${x}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-0 p-0">
        <legend className="eyebrow mb-2 p-0">{t('products.price')}</legend>
        <div className="flex flex-wrap gap-2">
          {[null, 2, 5, 10].map((n) => (
            <button key={String(n)} type="button" className="chip" aria-pressed={maxPrice === n} onClick={() => touch(setMaxPrice)(n)}>
              {n === null ? t('budget.any') : t('products.priceMax', { n })}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <label className="grid gap-1.5">
          <span className="eyebrow">{t('products.brand')}</span>
          <select className="field" value={brand} onChange={(e) => touch(setBrand)(e.target.value)}>
            <option value="all">{t('products.allBrands')}</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="eyebrow">{t('products.sort')}</span>
          <select className="field" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="popular">{t('products.sortPopular')}</option>
            <option value="priceAsc">{t('products.sortPriceAsc')}</option>
            <option value="priceDesc">{t('products.sortPriceDesc')}</option>
            <option value="name">{t('products.sortName')}</option>
          </select>
        </label>
      </div>

      <StoreFilter value={stores} onChange={touch(setStores)} />
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-10">
      <h1 className="text-[clamp(2rem,7vw,3.5rem)] font-black uppercase">{t('products.title')}</h1>

      <div className="mt-5 flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">{t('products.searchLabel')}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input
            type="search"
            className="field !pl-11"
            placeholder={t('products.search')}
            value={q}
            onChange={(e) => { setQ(e.target.value); setLimit(PAGE) }}
          />
        </label>
        <button type="button" className="btn lg:hidden" aria-expanded={panel} onClick={() => setPanel((v) => !v)}>
          <SlidersHorizontal className="size-5" aria-hidden /> <span className="sr-only sm:not-sr-only">{t('products.filters')}</span>
        </button>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        <aside className={`${panel ? 'block' : 'hidden'} sticker-flat h-fit p-4 lg:sticky lg:top-24 lg:block`}>{filters}</aside>

        <section aria-live="polite">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-bold">{t('products.count', { n: list.length })}</p>
            {dirty && (
              <button type="button" className="btn btn-ghost !min-h-10 text-sm" onClick={reset}><X className="size-4" aria-hidden /> {t('products.reset')}</button>
            )}
          </div>
          {list.length ? (
            <>
              <ProductGrid products={list.slice(0, limit)} compact />
              {list.length > limit && (
                <div className="mt-8 flex justify-center">
                  <button type="button" className="btn btn-yellow" onClick={() => setLimit((l) => l + PAGE)}>{t('products.more')}</button>
                </div>
              )}
            </>
          ) : (
            <div className="sticker-flat grid place-items-center gap-3 p-8 text-center">
              <span className="text-5xl" aria-hidden>🔍</span>
              <p className="font-bold">{t('products.empty')}</p>
              <button type="button" className="btn" onClick={reset}>{t('products.reset')}</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
