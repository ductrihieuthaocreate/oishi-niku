import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const name = req.nextUrl.searchParams.get('name')
  if (!name) return NextResponse.json({ error: 'Missing name param' }, { status: 400 })

  const rows = await sql`SELECT id, name FROM products WHERE name ILIKE ${`%${name}%`}`
  if (!(rows as any[]).length) {
    return NextResponse.json({ error: 'Product not found', searched: name })
  }

  const product = (rows as any[])[0]
  await sql`UPDATE order_items SET product_id = NULL WHERE product_id = ${product.id}`
  await sql`DELETE FROM products WHERE id = ${product.id}`

  return NextResponse.json({ deleted: product.name, id: product.id })
}
