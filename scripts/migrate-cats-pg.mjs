import pg from 'pg'
const { Client } = pg

const DATABASE_URL = 'postgresql://neondb_owner:npg_98MpCQofyiOD@ep-odd-voice-aqayl0tm-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require'

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

console.log('Connecting...')
await client.connect()
console.log('Connected!')

const { rows: cats } = await client.query('SELECT id, name, slug FROM categories ORDER BY name')
console.log('Current categories:', cats)

const chickenCat = cats.find(c => c.name?.toLowerCase().includes('chicken'))
const porkCat    = cats.find(c => c.name?.toLowerCase().includes('pork'))
const beefCats   = cats.filter(c => {
  const lc = (c.name ?? '').toLowerCase()
  const sl = (c.slug ?? '').toLowerCase()
  return sl.includes('wagyu') || sl.includes('beef') || lc.includes('wagyu') || lc.includes('beef')
})
const beefCat = beefCats[0]

if (!chickenCat || !porkCat || !beefCat) {
  console.error('Could not identify all 3 categories:', { chickenCat, porkCat, beefCat })
  await client.end()
  process.exit(1)
}

console.log('\nKeeping:', chickenCat.name, '/', porkCat.name, '/', beefCat.name, '→ renamed to Beef')
console.log('Merging into Beef:', beefCats.slice(1).map(c => c.name))

// Rename beef to Beef / slug beef
await client.query('UPDATE categories SET name = $1, slug = $2 WHERE id = $3', ['Beef', 'beef', beefCat.id])
console.log(`Renamed "${beefCat.name}" → Beef`)

// Remap products from duplicate beef cats
for (const dup of beefCats.slice(1)) {
  const r = await client.query('UPDATE products SET category_id = $1 WHERE category_id = $2 RETURNING id', [beefCat.id, dup.id])
  console.log(`Remapped ${r.rowCount} products from "${dup.name}" → Beef`)
}

// Delete everything not in the 3 keepers
const keepIds = [chickenCat.id, porkCat.id, beefCat.id]
const toDelete = cats.filter(c => !keepIds.includes(c.id))
for (const cat of toDelete) {
  const r = await client.query('UPDATE products SET category_id = $1 WHERE category_id = $2 RETURNING id', [beefCat.id, cat.id])
  if (r.rowCount) console.log(`Remapped ${r.rowCount} products from "${cat.name}" → Beef`)
  await client.query('DELETE FROM categories WHERE id = $1', [cat.id])
  console.log(`Deleted: "${cat.name}"`)
}

const { rows: final } = await client.query('SELECT id, name, slug FROM categories ORDER BY name')
console.log('\nFinal categories:', final)

await client.end()
