// Builds src/data/products.json from:
//   scripts/barbora-snapshot.txt  – dated shop snapshot (real names, prices, URLs)
//   scripts/raw/off-lt.json       – Open Food Facts, Lithuanian products (images, Nutri-Score)
//   scripts/raw/prices-lt.json    – Open Prices, community shelf prices in Lithuania
// Nothing is invented: a field that no source confirms stays null.
import { readFile, writeFile, mkdir } from 'node:fs/promises'

const SNAPSHOT_DATE = '2026-10-07'
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const words = (s) => fold(s).replace(/['’]/g, '').split(/[^a-z0-9]+/).filter(Boolean)

const EMOJI = {
  chocolate: '🍫', gummies: '🍬', candy: '🍭', bar: '🍫', wafer: '🧇', cookie: '🍪', chips: '🥨',
  nuts: '🥜', popcorn: '🍿', icecream: '🍦', fruit: '🍓', spicy: '🌶️', spread: '🍯', drink: '🥤',
}
const POPULAR = new Set([
  'Haribo', 'Snickers', 'Mars', 'Twix', 'Bounty', 'Milka', 'Oreo', "M&M's", 'Skittles', 'Kinder', 'Kit Kat',
  'Nutella', 'Pringles', "Lay's", 'Doritos', 'Cheetos', 'Lindt', 'Ferrero', 'Toblerone', 'Ritter Sport',
  'Coca-Cola', 'Pepsi', 'Fanta', 'Sprite', 'Magnum', 'Rūta', 'Pergalė', 'Estrella', 'Trolli', 'Maoam', 'Chupa Chups',
  'Prince Polo', 'Lotus', 'Leibniz', "Ben & Jerry's", 'Mr. Check', 'Well Done', 'Arimex',
])
const WILD = /krevečių|trumų|šonkauliuk|žaliosios arbatos|blue heat|fuego|sauer brenner|crazy sours|birthday cake|cookie dough|kečupo|viduržemio|pocky|ayuko/i
const SOUR = /sour|sauer|pico-balla|kracher/i
const TREAT_BRANDS = new Set(['Lindt', 'Ferrero', 'Toblerone', 'Rūta', "Ben & Jerry's", 'Magnum', 'Ritter Sport'])

const titleCase = (s) =>
  s.replace(/[A-ZĄČĘĖĮŠŲŪŽ][A-ZĄČĘĖĮŠŲŪŽ0-9&'’.!+-]+/g, (w) => {
    if (/^(M&M'S)$/.test(w)) return "M&M's"
    if (/^(GO|ON|XL|XXL|BBQ|PET)$/.test(w)) return w === 'GO' || w === 'ON' ? w[0] + w[1].toLowerCase() : w
    return w[0] + w.slice(1).toLowerCase().replace(/'s$/, "'s")
  })

function parseWeight(name) {
  const m = name.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l)\b(?!.*\d\s*(?:kg|g|ml|l)\b)/i)
  if (!m) return { text: null, grams: null }
  const n = parseFloat(m[1].replace(',', '.'))
  const u = m[2].toLowerCase()
  const norm = u === 'kg' ? n * 1000 : u === 'l' ? n * 1000 : n
  return { text: `${m[1].replace('.', ',')} ${u}`.replace(' l', ' l'), grams: norm }
}

function offWeight(p) {
  if (p.product_quantity && !Number.isNaN(Number(p.product_quantity))) return Number(p.product_quantity)
  const m = String(p.quantity ?? '').match(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|cl)\b/i)
  if (!m) return null
  const n = parseFloat(m[1].replace(',', '.'))
  return { kg: n * 1000, g: n, ml: n, l: n * 1000, cl: n * 10 }[m[2].toLowerCase()]
}

const snapshot = (await readFile('scripts/barbora-snapshot.txt', 'utf8'))
  .split('\n').filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [category, brand, slug, shopName, price, oldPrice, deposit] = l.split('|')
    return { category, brand, slug, shopName, price: Number(price), oldPrice: oldPrice ? Number(oldPrice) : null, deposit: deposit ? Number(deposit) : null }
  })

const offLt = JSON.parse(await readFile('scripts/raw/off-lt.json', 'utf8'))
let offExtra = []
try { offExtra = JSON.parse(await readFile('scripts/raw/off-extra.json', 'utf8')) } catch { /* optional */ }
let offBrands = []
try { offBrands = JSON.parse(await readFile('scripts/raw/off-brands.json', 'utf8')) } catch { /* optional */ }
const seen = new Set()
const off = [...offLt, ...offExtra, ...offBrands].filter((p) => p.image_front_small_url && !seen.has(p.code) && seen.add(p.code))
const openPrices = JSON.parse(await readFile('scripts/raw/prices-lt.json', 'utf8')).filter((p) => p.currency === 'EUR' && p.date)

const OVERRIDES = JSON.parse(await readFile('scripts/image-overrides.json', 'utf8')) // slug -> null (no photo) | OFF code
const PLAIN_BRANDS = new Set(['Ferrero', 'Toblerone', 'Kinder', 'Lindt'])
const GENERIC = new Set(['chocolate','chocolat','alpine','alpen','bar','candy','candies','snack','snacks','chips','crisps','potato','corn','cookies','biscuits','wafer','sweets','original','classic','gummy','gummies','fruit','gum','the','and','with','mini','maxi','pack','bag','king','size','sized','edition','sokoladas','pieninis','sausainiai','guminukai','saldainiai','traskuciai','schokolade','tafel'])

// generic Lithuanian product-type words: they describe the kind of product, not the variant
const STOP = new Set(['pieninis','juodasis','baltasis','sokoladas','sokoladinis','sokoladiniai','batonelis','batoneliai','vaflinis','vafliniai','guminukai','kramtomieji','saldainiai','traskuciai','bulviu','kukuruzu','sausainiai','kakaviniai','sviestiniai','vafliai','valgomieji','ledai','draze','tepamasis','kremas','uzkandis','ledinukas','ledinukai','gazuotas','gerimas','vnt','nauja','proc','rieb','pieno','spraginti','kukuruzai','karamelizuoti','skrudintos','sudytos','kepinti','kepintos','sudyti','ir','su','be','pieniniame','kakavos','rinkinys','triufeliai','sok','pieninio','sokolado','kiausinis','zaislu','zaislas','laisku'])
const TRAITS = { dark: /\b(dark|noir|zartbitter|juodasis|70|85)\b/, white: /\b(white|blanc|weiss|baltasis)\b/ }
const traitsOf = (text) => Object.entries(TRAITS).filter(([, re]) => re.test(text)).map(([k]) => k).sort().join(',')

function matchOff(item) {
  if (item.slug in OVERRIDES) return OVERRIDES[item.slug] ? off.find((p) => p.code === OVERRIDES[item.slug]) ?? null : null
  const brandWords = words(item.brand)
  const capsRaw = (item.shopName.match(/[A-ZĄČĘĖĮŠŲŪŽ][A-ZĄČĘĖĮŠŲŪŽ0-9&'’.!+-]+/g) ?? [])
  const caps = capsRaw.flatMap(words).filter((w) => !brandWords.includes(w) && !['g', 'vnt', 'l', 'ml', 'sugar'].includes(w))
  const capsSet = new Set(capsRaw.flatMap(words))
  const shopWords = words(item.shopName)
  const qualifiers = shopWords.filter((w) => !brandWords.includes(w) && !capsSet.has(w) && !STOP.has(w) && !/^\d+$/.test(w) && !['g', 'ml', 'l', 'kg'].includes(w))
  // no distinguishing CAPS word and a flavour qualifier ("grietinės", "pistacijomis") => cannot match safely
  if (!caps.length && qualifiers.length > 0 && !PLAIN_BRANDS.has(item.brand)) return null
  const { grams } = parseWeight(item.shopName)
  const shopTraits = traitsOf(fold(item.shopName))
  let best = null
  for (const p of off) {
    const pb = fold(p.brands ?? '').replace(/['’]/g, '')
    if (!brandWords.every((w) => pb.includes(w))) continue
    const w = offWeight(p)
    if (!grams || !w || Math.abs(w - grams) / grams > 0.03) continue
    const offText = fold(`${p.product_name ?? ''} ${p.product_name_en ?? ''} ${p.product_name_lt ?? ''}`)
    const nameList = words(offText)
    const nameWords = new Set(nameList)
    const hit = caps.filter((c) => nameWords.has(c)).length
    if (caps.length && hit < caps.length) continue
    if (traitsOf(offText) !== shopTraits && (shopTraits || traitsOf(offText))) continue
    const extra = [...nameWords].filter((x) => !brandWords.includes(x) && !shopWords.includes(x) && !/^\d+$/.test(x) && x.length > 2 && !GENERIC.has(x)).length
    if (extra > (caps.length ? 1 : 2)) continue
    const score = hit * 10 - extra * 0.8 + Math.min(p.unique_scans_n ?? 0, 50) / 50
    if (!best || score > best.score) best = { score, p }
  }
  return best?.p ?? null
}

function toTags(item, name) {
  const t = new Set()
  const c = item.category
  if (['chocolate', 'gummies', 'candy', 'bar', 'wafer', 'cookie', 'icecream', 'spread'].includes(c)) t.add('sweet')
  if (c === 'fruit' && !/baltymin/i.test(name)) t.add('sweet')
  if (['chips', 'spicy', 'popcorn'].includes(c) || (c === 'nuts' && /sūdyt|druska/i.test(name))) t.add('salty')
  if (['chips', 'spicy', 'popcorn', 'cookie', 'wafer', 'nuts'].includes(c) || /traškus|riešut|migdol/i.test(name)) t.add('crunchy')
  if (c === 'chocolate' || /šokolad|kakav/i.test(name)) t.add('chocolatey')
  if (c === 'spicy' || /aštr|aitr/i.test(name)) t.add('spicy')
  if (SOUR.test(item.slug) || /rūgšt/i.test(name)) t.add('sour')
  if (c === 'fruit' || /^(Migdolai)/.test(name)) t.add('healthy')
  if (['chips', 'spicy', 'icecream', 'spread'].includes(c) || /kepinti|sūris|sviest/i.test(name)) t.add('fatty')
  if (TREAT_BRANDS.has(item.brand) || item.price >= 4.4) t.add('treat')
  const rarity = WILD.test(item.slug + ' ' + name) ? 'wild' : POPULAR.has(item.brand) ? 'classic' : 'unexpected'
  if (rarity !== 'classic') t.add('unusual')
  return { tags: [...t], rarity }
}

const sightingsByCode = new Map()
for (const p of openPrices) {
  if (!sightingsByCode.has(p.code)) sightingsByCode.set(p.code, [])
  sightingsByCode.get(p.code).push({ store: p.store, city: p.city, price: p.price, date: p.date, source: 'Open Prices' })
}

let imageHits = 0
const report = []
const products = snapshot.map((item) => {
  const match = matchOff(item)
  const name = titleCase(item.shopName.replace(/,?\s*\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l)\b\.?\s*$/i, '').replace(/,\s*$/, ''))
  const { text: weight } = parseWeight(item.shopName)
  const { tags, rarity } = toTags(item, name)
  if (match) imageHits++
  report.push(`${item.shopName}  ==>  ${match ? `${match.brands} | ${match.product_name ?? match.product_name_en} | ${match.quantity}` : '—'}`)
  return {
    id: item.slug,
    name,
    brand: item.brand,
    category: item.category,
    emoji: EMOJI[item.category],
    weight,
    price: item.price,
    oldPrice: item.oldPrice,
    deposit: item.deposit,
    currency: 'EUR',
    priceDate: SNAPSHOT_DATE,
    stores: [{ id: 'barbora', name: 'Barbora', url: `https://barbora.lt/produktai/${item.slug}`, price: item.price, date: SNAPSHOT_DATE }],
    // brands stocked widely by the big chains; this exact item is NOT confirmed there
    maybeStores: POPULAR.has(item.brand) ? ['maxima', 'rimi', 'iki', 'norfa', 'lidl'] : [],
    sightings: match ? (sightingsByCode.get(match.code) ?? []) : [],
    image: match ? match.image_front_small_url : null,
    imageLarge: match ? match.image_front_small_url.replace(/\.200\.jpg$/, '.400.jpg') : null,
    imageSource: match ? { name: 'Open Food Facts', url: `https://world.openfoodfacts.org/product/${match.code}` } : null,
    nutriscore: match?.nutriscore_grade && /^[a-e]$/.test(match.nutriscore_grade) ? match.nutriscore_grade.toUpperCase() : null,
    tags,
    rarity,
  }
})

await mkdir('src/data', { recursive: true })
const out = JSON.stringify({ generatedAt: SNAPSHOT_DATE, products })
await writeFile('src/data/products.json', out) // bundled fallback copy
await mkdir('public/data', { recursive: true })
await writeFile('public/data/products.json', out) // served statically
await writeFile('scripts/raw/match-report.txt', report.join('\n'))
const byCat = {}
products.forEach((p) => (byCat[p.category] = (byCat[p.category] ?? 0) + 1))
console.log('products', products.length, 'with image', imageHits, byCat)
console.log('no image:', products.filter((p) => !p.image).map((p) => p.id).join('\n'))
