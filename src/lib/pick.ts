import { PRODUCTS, WHEEL_CATEGORIES, wheelPool, type Category, type Filters, type Product } from './products'
import { pick, randInt, shuffle } from './random'
import type { Sector } from '../components/WheelSegment'
import { brandSectorStyle, categorySector } from './theme'

export interface WheelModel {
  sectors: Sector[]
  /** products per sector, same order as sectors */
  groups: Product[][]
  total: number
}

const MIN_SECTORS = 8
const MAX_SECTORS = 12

/**
 * Builds the wheel from whatever the filters leave. Category sectors when there are enough of them,
 * otherwise brand sectors, otherwise one sector per product (so the wheel always has 8+ slices when it can).
 */
export function buildWheel(f: Filters, catLabel: (c: Category) => string): WheelModel {
  const pool = wheelPool(f)
  const byCat = new Map<Category, Product[]>()
  for (const p of pool) byCat.set(p.category, [...(byCat.get(p.category) ?? []), p])
  const cats = WHEEL_CATEGORIES.filter((c) => byCat.has(c))

  if (cats.length >= MIN_SECTORS) {
    return { sectors: cats.map((c) => categorySector(c, catLabel(c))), groups: cats.map((c) => byCat.get(c)!), total: pool.length }
  }

  const byBrand = new Map<string, Product[]>()
  for (const p of pool) byBrand.set(p.brand, [...(byBrand.get(p.brand) ?? []), p])
  const brands = [...byBrand.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, MAX_SECTORS)
  if (brands.length >= MIN_SECTORS || brands.length >= pool.length) {
    const ordered = shuffleStable(brands)
    return {
      sectors: ordered.map(([b, items], i) => ({ id: `brand:${b}`, label: b, emoji: items[0].emoji, ...brandSectorStyle(i) })),
      groups: ordered.map(([, items]) => items),
      total: pool.length,
    }
  }

  const items = shuffleStable(pool.slice(0, MAX_SECTORS))
  return {
    sectors: items.map((p, i) => ({ id: p.id, label: shortLabel(p), emoji: p.emoji, ...brandSectorStyle(i) })),
    groups: items.map((p) => [p]),
    total: pool.length,
  }
}

/** "Takis Fuego" from "Kukurūzų traškučiai Takis Fuego": brand + the first words that follow it. */
export function shortLabel(p: Product): string {
  const i = p.name.toLowerCase().indexOf(p.brand.toLowerCase())
  const rest = i >= 0 ? p.name.slice(i + p.brand.length).replace(/^[\s,]+/, '').split(/[,]/)[0].split(' ').slice(0, 2).join(' ') : ''
  return `${p.brand} ${rest}`.trim().slice(0, 16)
}

// deterministic interleave so neighbouring slices rarely share a brand colour family
function shuffleStable<T>(arr: T[]): T[] {
  const out: T[] = []
  const a = [...arr]
  while (a.length) out.push(a.splice(0, 1)[0], ...(a.length > 3 ? a.splice(Math.floor(a.length / 2), 1) : []))
  return out
}

export function spinTarget(model: WheelModel) {
  const sector = randInt(model.sectors.length)
  const product = pick(model.groups[sector])
  return { sector, product }
}

/** "Another one" inside the same slice (or brand/category) as the last result. */
export function anotherInGroup(model: WheelModel, current: Product): Product | null {
  const group = model.groups.find((g) => g.some((p) => p.id === current.id))
  const rest = group?.filter((p) => p.id !== current.id) ?? []
  return rest.length ? pick(rest) : null
}

export type SurpriseLevel = 'classic' | 'unexpected' | 'wild'

export function surprisePick(level: SurpriseLevel, exclude?: string): Product {
  const edible = PRODUCTS.filter((p) => p.category !== 'drink' && p.id !== exclude)
  const pool = edible.filter((p) => p.rarity === level)
  return pick(pool.length ? pool : edible)
}

export interface Combo { sweet: Product; salty: Product; drink: Product; total: number }

export function buildCombo(f: Filters): Combo {
  const ok = (p: Product) => f.budget === null || (p.price ?? 99) <= f.budget
  const sweet = PRODUCTS.filter((p) => p.tags.includes('sweet') && !['spread', 'drink', 'icecream'].includes(p.category) && ok(p))
  const salty = PRODUCTS.filter((p) => p.tags.includes('salty') && p.category !== 'drink' && ok(p))
  const drinks = PRODUCTS.filter((p) => p.category === 'drink')
  const s = pick(sweet.length ? sweet : PRODUCTS.filter((p) => p.tags.includes('sweet')))
  const t = pick(salty.length ? salty : PRODUCTS.filter((p) => p.tags.includes('salty')))
  const d = pick(drinks)
  return { sweet: s, salty: t, drink: d, total: Math.round(((s.price ?? 0) + (t.price ?? 0) + (d.price ?? 0)) * 100) / 100 }
}

export const sampleForReel = (n: number): Product[] => shuffle(PRODUCTS.filter((p) => p.category !== 'drink')).slice(0, n)
