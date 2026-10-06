import type { Product, StoreId } from './products'

export interface StoreInfo {
  id: StoreId
  name: string
  home: string
  /** Only set where the search URL pattern was checked to respond; never guessed. */
  search?: (q: string) => string
}

export const STORES: StoreInfo[] = [
  { id: 'barbora', name: 'Barbora', home: 'https://barbora.lt/', search: (q) => `https://barbora.lt/paieska?q=${encodeURIComponent(q)}` },
  { id: 'maxima', name: 'Maxima', home: 'https://www.maxima.lt/' },
  { id: 'rimi', name: 'Rimi', home: 'https://www.rimi.lt/', search: (q) => `https://www.rimi.lt/e-parduotuve/lt/paieska?query=${encodeURIComponent(q)}` },
  { id: 'iki', name: 'IKI', home: 'https://www.iki.lt/' },
  { id: 'lidl', name: 'Lidl', home: 'https://www.lidl.lt/', search: (q) => `https://www.lidl.lt/q/search?q=${encodeURIComponent(q)}` },
  { id: 'norfa', name: 'Norfa', home: 'https://www.norfa.lt/' },
]

export const STORE_BY_ID = Object.fromEntries(STORES.map((s) => [s.id, s])) as Record<StoreId, StoreInfo>

/** Best link for a "where to buy" click: the confirmed product page, else a shop search. */
export function primaryBuyLink(p: Product): { url: string; storeName: string; exact: boolean } {
  const confirmed = p.stores[0]
  if (confirmed) return { url: confirmed.url, storeName: confirmed.name, exact: true }
  return { url: STORE_BY_ID.barbora.search!(p.name), storeName: 'Barbora', exact: false }
}

export function storeLink(store: StoreInfo, p: Product): string {
  return store.search ? store.search(p.name) : store.home
}
