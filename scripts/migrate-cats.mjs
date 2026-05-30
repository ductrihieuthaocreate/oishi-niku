import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_98MpCQofyiOD@ep-odd-voice-aqayl0tm-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require'
const sql = neon(DATABASE_URL)

console.log('Fetching categories...')
const cats = await sql`SELECT id, name, slug FROM categories ORDER BY name`
console.log('Current categories:', cats)

const chickenCat = cats.find(c => c.name?.toLowerCase().includes('chicken'))
const porkCat    = cats.find(c => c.name?.toLowerCase().includes('pork'))
const beefCats   = cats.filter(c => {
  const lc = (c.name ?? '').toLowerCase()
  const sl = (c.slug ?? '').toLowerCase()
  return sl.includes('wagyu') || sl.includes('beef') || lc.includes('wagyu') || lc.includes('beef')
})
const beefCat = beefCats[0]

console.log('\nWill keep:', { chickenCat, porkCat, beefCat })
console.log('Extra beef cats to merge:', beefCats.slice(1).map(c => c.name))

if (!chickenCat || !porkCat || !beefCat) {
  console.error('Could not identify all 3 categories. Aborting.')
  process.exit(1)
}

// Rename beef category to Beef / beef
await sql`UPDATE categories SET name = 'Beef', slug = 'beef' WHERE id = ${beefCat.id}`
console.log(`Renamed "${beefCat.name}" → "Beef"`)

// Remap products from duplicate beef cats
for (const dup of beefCats.slice(1)) {
  const r = await sql`UPDATE products SET category_id = ${beefCat.id} WHERE category_id = ${dup.id} RETURNING id`
  console.log(`Remapped ${r.length} products from "${dup.name}" → Beef`)
}

const keepIds = [chickenCat.id, porkCat.id, beefCat.id]
const toDelete = cats.filter(c => !keepIds.includes(c.id))

for (const cat of toDelete) {
  // Remap any remaining products to beef
  const r = await sql`UPDATE products SET category_id = ${beefCat.id} WHERE category_id = ${cat.id} RETURNING id`
  if (r.length) console.log(`Remapped ${r.length} products from "${cat.name}" → Beef`)
  await sql`DELETE FROM categories WHERE id = ${cat.id}`
  console.log(`Deleted category: "${cat.name}"`)
}

const remaining = await sql`SELECT id, name, slug FROM categories ORDER BY name`
console.log('\nFinal categories:', remaining)
