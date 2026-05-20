import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  if (!q.trim()) return NextResponse.json({ products: [] })

  const products = await sql`
    SELECT p.id, p.name, p.price::float8 AS price, p.image_url,
      CASE WHEN c.id IS NOT NULL THEN json_build_object('name', c.name) ELSE NULL END AS categories
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.name ILIKE ${`%${q}%`} AND p.stock > 0
    LIMIT 8
  `

  return NextResponse.json({ products })
}
