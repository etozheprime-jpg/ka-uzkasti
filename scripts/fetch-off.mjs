// Pulls real Lithuanian products from Open Food Facts (ODbL / CC-BY-SA images)
// and real community-reported shelf prices from Open Prices.
// Usage: node scripts/fetch-off.mjs [outDir]
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT = process.argv[2] ?? 'scripts/raw'
const UA = 'UzkaskWheel/0.1 (open-source hobby project)'
const FIELDS = [
  'code', 'product_name', 'product_name_lt', 'product_name_en', 'brands', 'quantity',
  'product_quantity', 'image_front_small_url', 'image_front_url', 'stores_tags',
  'categories_tags', 'unique_scans_n', 'nutriscore_grade', 'countries_tags',
].join(',')

const CATEGORIES = [
  'chocolates', 'chocolate-bars', 'candies', 'gummy-candies', 'hard-candies', 'chewing-gum',
  'chips-and-crisps', 'salty-snacks', 'crackers', 'biscuits', 'cookies', 'wafers',
  'snack-bars', 'cereal-bars', 'nuts', 'popcorn', 'dried-fruits', 'ice-creams-and-sorbets',
  'sodas', 'energy-drinks', 'chocolate-spreads', 'pastries', 'cakes', 'marshmallows',
  'pretzels', 'sunflower-seeds', 'jerky', 'fruit-snacks', 'protein-bars', 'iced-teas',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJson(url, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) })
      const text = await res.text()
      if (text.trimStart().startsWith('{')) return JSON.parse(text)
    } catch { /* retry */ }
    await sleep(4000 * (i + 1))
  }
  return null
}

const products = new Map()
for (const cat of CATEGORIES) {
  for (let page = 1; page <= 3; page++) {
    const url =
      `https://world.openfoodfacts.org/api/v2/search?countries_tags_en=lithuania&categories_tags_en=${cat}` +
      `&page_size=100&page=${page}&sort_by=unique_scans_n&fields=${FIELDS}`
    const data = await getJson(url)
    if (!data) { console.warn('FAILED', cat, page); break }
    for (const p of data.products ?? []) products.set(p.code, p)
    console.log(cat, page, data.products?.length ?? 0, 'total', products.size)
    if ((data.products?.length ?? 0) < 100) break
    await sleep(6500)
  }
  await sleep(6500)
}

// Open Prices: only locations in Lithuania ("Lietuva" in OSM address)
const locs = await getJson('https://prices.openfoodfacts.org/api/v1/locations?osm_address_country__like=Lietuva&size=100')
const locationIds = (locs?.items ?? []).map((l) => l.id)
const prices = []
for (let page = 1; page < 20; page++) {
  const url = `https://prices.openfoodfacts.org/api/v1/prices?location_id__in=${locationIds.join(',')}&size=100&page=${page}&type=PRODUCT`
  const data = await getJson(url)
  if (!data?.items?.length) break
  for (const i of data.items) {
    prices.push({
      code: i.product_code, price: i.price, currency: i.currency, date: i.date,
      discounted: i.price_is_discounted, store: i.location?.osm_name, city: i.location?.osm_address_city,
      brand: i.location?.osm_brand,
    })
  }
  if (page >= data.pages) break
}

await mkdir(OUT, { recursive: true })
await writeFile(path.join(OUT, 'off-lt.json'), JSON.stringify([...products.values()]))
await writeFile(path.join(OUT, 'prices-lt.json'), JSON.stringify(prices, null, 1))
console.log('products', products.size, 'prices', prices.length)
