// Second pass for pack shots: pull the most-scanned OFF products per brand (any country) for every brand
// that still has image-less items in the catalogue. build-data.mjs then matches by brand + weight + variant.
import { readFile, writeFile } from 'node:fs/promises'

const UA = 'UzkaskWheel/0.1 (open-source hobby project)'
const FIELDS = 'code,product_name,product_name_en,product_name_lt,brands,quantity,product_quantity,image_front_small_url,nutriscore_grade,unique_scans_n'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const slug = (b) => b.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const products = JSON.parse(await readFile('src/data/products.json', 'utf8')).products
const brands = [...new Set(products.filter((p) => !p.image).map((p) => p.brand))]
const pool = new Map()

async function get(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) })
      const text = await res.text()
      if (text.trimStart().startsWith('{')) return JSON.parse(text)
    } catch { /* retry */ }
    await sleep(5000 * (i + 1))
  }
  return null
}

for (const brand of brands) {
  const s = slug(brand)
  const tries = [...new Set([s, s.replace(/-s$/, ''), s.replace(/-/g, '')])]
  let got = 0
  for (const t of tries) {
    const data = await get(`https://world.openfoodfacts.org/api/v2/search?brands_tags=${t}&page_size=100&sort_by=unique_scans_n&fields=${FIELDS}`)
    for (const p of data?.products ?? []) if (p.image_front_small_url) { pool.set(p.code, p); got++ }
    await sleep(7000)
    if (got) break
  }
  console.log(brand, '->', got, 'pool', pool.size)
  await writeFile('scripts/raw/off-brands.json', JSON.stringify([...pool.values()]))
}
