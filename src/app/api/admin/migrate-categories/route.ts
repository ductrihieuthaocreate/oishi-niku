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
    // Identify the 3 keepers by slug/name match
    const cats = categories as any[]

    const chickenCat = cats.find(c => c.slug?.includes('chicken') || c.name?.toLowerCase().includes('chicken') || c.name?.toLowerCase().includes('鶏'))
    const porkCat    = cats.find(c => c.slug?.includes('pork')    || c.name?.toLowerCase().includes('pork')    || c.name?.toLowerCase().includes('豚'))
    const beefCat    = cats.find(c =>
      c.slug?.includes('wagyu') || c.slug?.includes('beef') ||
      c.name?.toLowerCase().includes('wagyu') || c.name?.toLowerCase().includes('beef') ||
      c.name?.toLowerCase().includes('牛') || c.name?.toLowerCase().includes('和牛')
    )

    if (!chickenCat || !porkCat || !beefCat) {
      return NextResponse.json({
        error: 'Could not identify all 3 categories — check preview',
        found: { chickenCat, porkCat, beefCat },
      })
    }

    // Rename beef category to "Beef" with slug "beef"
    await sql`UPDATE categories SET name = 'Beef', slug = 'beef' WHERE id = ${beefCat.id}`

    // IDs to keep
    const keepIds = [chickenCat.id, porkCat.id, beefCat.id]

    // Categories to delete
    const toDelete = cats.filter(c => !keepIds.includes(c.id))

    // For each product in a deleted category, remap to closest keeper or null
    for (const cat of toDelete) {
      const lc = (cat.name ?? '').toLowerCase()
      let remapId: number | null = null

      if (lc.includes('wagyu') || lc.includes('beef') || lc.includes('牛') || lc.includes('和牛') || lc.includes('lamb') || lc.includes('ラム') || lc.includes('羊')) {
        remapId = beefCat.id
      } else if (lc.includes('pork') || lc.includes('豚')) {
        remapId = porkCat.id
      } else if (lc.includes('chicken') || lc.includes('鶏')) {
        remapId = chickenCat.id
      }
      // else remapId stays null

      await sql`UPDATE products SET category_id = ${remapId} WHERE category_id = ${cat.id}`
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
