import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const action = req.nextUrl.searchParams.get('action') ?? 'preview'

  const categories = await sql`SELECT id, name, slug FROM categories ORDER BY name`
  const products = await sql`SELECT id, name, category_id FROM products ORDER BY name`

  if (action === 'preview') {
    return NextResponse.json({ categories, products })
  }

  if (action === 'migrate') {
    const cats = categories as any[]

    const chickenCat = cats.find(c =>
      c.slug?.includes('chicken') || c.name?.toLowerCase().includes('chicken') || c.name?.toLowerCase().includes('鶏')
    )
    const porkCat = cats.find(c =>
      c.slug?.includes('pork') || c.name?.toLowerCase().includes('pork') || c.name?.toLowerCase().includes('豚')
    )

    // Find ALL beef-like categories — keep the first, delete duplicates
    const beefCats = cats.filter(c => {
      const lc = (c.name ?? '').toLowerCase()
      const sl = (c.slug ?? '').toLowerCase()
      return sl.includes('wagyu') || sl.includes('beef') || lc.includes('wagyu') || lc.includes('beef') || lc.includes('牛') || lc.includes('和牛')
    })

    const beefCat = beefCats[0]

    if (!chickenCat || !porkCat || !beefCat) {
      return NextResponse.json({
        error: 'Could not identify all 3 categories — check preview',
        found: { chickenCat, porkCat, beefCat },
      })
    }

    // Rename primary beef category to "Beef" with slug "beef"
    await sql`UPDATE categories SET name = 'Beef', slug = 'beef' WHERE id = ${beefCat.id}`

    // Remap products from duplicate beef categories to the kept beef cat
    const duplicateBeefCats = beefCats.slice(1)
    for (const dup of duplicateBeefCats) {
      await sql`UPDATE products SET category_id = ${beefCat.id} WHERE category_id = ${dup.id}`
    }

    // All categories to delete: duplicateBeef + anything not in our 3 keepers
    const keepIds = [chickenCat.id, porkCat.id, beefCat.id]
    const toDelete = cats.filter(c => !keepIds.includes(c.id))

    // Remap products from non-beef deleted categories to beef (best fallback)
    for (const cat of toDelete) {
      if (duplicateBeefCats.some(d => d.id === cat.id)) continue // already remapped above
      await sql`UPDATE products SET category_id = ${beefCat.id} WHERE category_id = ${cat.id}`
    }

    // Delete removed categories
    for (const cat of toDelete) {
      await sql`DELETE FROM categories WHERE id = ${cat.id}`
    }

    const remaining = await sql`SELECT id, name, slug FROM categories`
    const remapped  = await sql`SELECT id, name, category_id FROM products ORDER BY name`

    return NextResponse.json({
      success: true,
      kept: remaining,
      deleted: toDelete.map(c => c.name),
      products: remapped,
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
