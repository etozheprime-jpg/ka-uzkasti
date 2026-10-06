import type { Category } from './products'
import type { Sector } from '../components/WheelSegment'
import { CATEGORY_EMOJI } from './products'

export const CATEGORY_STYLE: Record<Category, { color: string; ink: string }> = {
  chocolate: { color: '#7A3E22', ink: '#FBF1DD' },
  gummies: { color: '#DC3B22', ink: '#FBF1DD' },
  chips: { color: '#F6B81E', ink: '#1B1712' },
  cookie: { color: '#86C9EE', ink: '#1B1712' },
  nuts: { color: '#D08A2E', ink: '#1B1712' },
  icecream: { color: '#FF9DB8', ink: '#1B1712' },
  popcorn: { color: '#FFE08A', ink: '#1B1712' },
  candy: { color: '#1F7A4D', ink: '#FBF1DD' },
  wafer: { color: '#F28A2E', ink: '#1B1712' },
  bar: { color: '#1E7F7C', ink: '#FBF1DD' },
  fruit: { color: '#B5D334', ink: '#1B1712' },
  spicy: { color: '#B5192B', ink: '#FBF1DD' },
  spread: { color: '#D08A2E', ink: '#1B1712' },
  drink: { color: '#86C9EE', ink: '#1B1712' },
}

/** Palette used when the wheel is split by brand instead of category. */
const BRAND_PALETTE: { color: string; ink: string }[] = [
  { color: '#DC3B22', ink: '#FBF1DD' }, { color: '#F6B81E', ink: '#1B1712' }, { color: '#1F7A4D', ink: '#FBF1DD' },
  { color: '#86C9EE', ink: '#1B1712' }, { color: '#FF9DB8', ink: '#1B1712' }, { color: '#7A3E22', ink: '#FBF1DD' },
  { color: '#B5D334', ink: '#1B1712' }, { color: '#F28A2E', ink: '#1B1712' }, { color: '#1E7F7C', ink: '#FBF1DD' },
  { color: '#FFE08A', ink: '#1B1712' }, { color: '#B5192B', ink: '#FBF1DD' }, { color: '#D08A2E', ink: '#1B1712' },
]

export const brandSectorStyle = (i: number) => BRAND_PALETTE[i % BRAND_PALETTE.length]

export function categorySector(cat: Category, label: string): Sector {
  return { id: `cat:${cat}`, label, emoji: CATEGORY_EMOJI[cat], ...CATEGORY_STYLE[cat] }
}

export const tileColor = (cat: Category) => `color-mix(in oklab, ${CATEGORY_STYLE[cat].color} 38%, #FFFAF0)`
