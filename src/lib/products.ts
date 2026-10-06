export type Category =
  | 'chocolate' | 'gummies' | 'candy' | 'bar' | 'wafer' | 'cookie' | 'chips'
  | 'nuts' | 'popcorn' | 'icecream' | 'fruit' | 'spicy' | 'spread' | 'drink'

export type Tag = 'sweet' | 'salty' | 'crunchy' | 'chocolatey' | 'spicy' | 'sour' | 'healthy' | 'fatty' | 'treat' | 'unusual'
export type StoreId = 'barbora' | 'maxima' | 'rimi' | 'iki' | 'lidl' | 'norfa'

export interface Product {
  id: string
  name: string
  brand: string
  category: Category
  emoji: string
  weight: string | null
  price: number | null
  oldPrice: number | null
  deposit: number | null
  currency: 'EUR'
  priceDate: string
  /** Stores where the product was actually seen (with link + dated price). */
  stores: { id: StoreId; name: string; url: string; price: number; date: string }[]
  /** Stores that stock this brand widely but where this exact item is NOT confirmed. */
  maybeStores: StoreId[]
  sightings: { store: string; city: string; price: number; date: string; source: string }[]
  image: string | null
  imageLarge: string | null
  imageSource: { name: string; url: string } | null
  nutriscore: 'A' | 'B' | 'C' | 'D' | 'E' | null
  tags: Tag[]
  rarity: 'classic' | 'unexpected' | 'wild'
}

/** Filled in place by loadCatalog(); every module sees the same array / map. */
export const PRODUCTS: Product[] = []
export const BY_ID = new Map<string, Product>()
export const catalogMeta = { generatedAt: '' }

interface CatalogFile { generatedAt: string; products: Product[] }

/** Static JSON first (cacheable, out of the JS bundle); the bundled copy is the offline/local fallback. */
let loading: Promise<void> | null = null

export function loadCatalog(): Promise<void> {
  // one shared promise: React StrictMode (and retries) must never fill the catalog twice
  loading ??= fetchCatalog().catch((e) => { loading = null; throw e })
  return loading
}

async function fetchCatalog(): Promise<void> {
  let data: CatalogFile
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/products.json`, { cache: 'default' })
    if (!res.ok) throw new Error(String(res.status))
    data = (await res.json()) as CatalogFile
  } catch {
    data = (await import('../data/products.json')).default as unknown as CatalogFile
  }
  PRODUCTS.push(...data.products)
  data.products.forEach((p) => BY_ID.set(p.id, p))
  catalogMeta.generatedAt = data.generatedAt
}

/** Categories that appear as wheel sectors, in wheel order. */
export const WHEEL_CATEGORIES: Category[] = [
  'chocolate', 'gummies', 'chips', 'cookie', 'nuts', 'icecream',
  'popcorn', 'candy', 'wafer', 'bar', 'fruit', 'spicy',
]

export const CATEGORY_EMOJI: Record<Category, string> = {
  chocolate: '🍫', gummies: '🍬', candy: '🍭', bar: '🍫', wafer: '🧇', cookie: '🍪', chips: '🥨',
  nuts: '🥜', popcorn: '🍿', icecream: '🍦', fruit: '🍓', spicy: '🌶️', spread: '🍯', drink: '🥤',
}

export type Want = 'any' | 'sweet' | 'salty' | 'chocolate' | 'crunchy' | 'sour' | 'spicy' | 'healthy' | 'unusual'
export type Mood = 'any' | 'plain' | 'treat' | 'greasy' | 'unusual'
export type Budget = 2 | 5 | 10 | null

export interface Filters {
  want: Want
  mood: Mood
  budget: Budget
  stores: StoreId[]
}

export const DEFAULT_FILTERS: Filters = { want: 'any', mood: 'any', budget: null, stores: [] }

const WANT_TAG: Record<Exclude<Want, 'any' | 'unusual'>, Tag> = {
  sweet: 'sweet', salty: 'salty', chocolate: 'chocolatey', crunchy: 'crunchy', sour: 'sour', spicy: 'spicy', healthy: 'healthy',
}

export function availableIn(p: Product, store: StoreId): 'confirmed' | 'maybe' | null {
  if (p.stores.some((s) => s.id === store)) return 'confirmed'
  if (p.maybeStores.includes(store)) return 'maybe'
  return null
}

export function matchesFilters(p: Product, f: Filters): boolean {
  if (f.want === 'unusual') {
    if (p.rarity === 'classic') return false
  } else if (f.want !== 'any' && !p.tags.includes(WANT_TAG[f.want])) return false

  if (f.mood === 'plain' && !(p.rarity === 'classic' && !p.tags.includes('treat'))) return false
  if (f.mood === 'treat' && !p.tags.includes('treat')) return false
  if (f.mood === 'greasy' && !p.tags.includes('fatty')) return false
  if (f.mood === 'unusual' && p.rarity === 'classic') return false

  if (f.budget !== null && (p.price === null || p.price > f.budget)) return false
  if (f.stores.length && !f.stores.some((s) => availableIn(p, s))) return false
  return true
}

export function wheelPool(f: Filters): Product[] {
  return PRODUCTS.filter((p) => WHEEL_CATEGORIES.includes(p.category) && matchesFilters(p, f))
}

export function formatPrice(price: number | null, locale = 'lt-LT'): string | null {
  if (price === null) return null
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(price)
}

export function dayIndex(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
}

/** Deterministic "pick of the day": same product for everyone on a given calendar day. */
export function pickOfTheDay(date = new Date()): Product {
  const pool = PRODUCTS.filter((p) => p.category !== 'drink')
  let h = dayIndex(date) * 2654435761
  h = (h ^ (h >>> 15)) >>> 0
  return pool[h % pool.length]
}
