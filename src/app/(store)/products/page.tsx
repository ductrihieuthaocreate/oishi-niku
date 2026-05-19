import { Suspense } from 'react'
import { sql } from '@/lib/db'
import { ProductCard } from '@/components/product/product-card'
import { ProductFilters } from '@/components/product/product-filters'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string; search?: string; page?: string }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const offset = (page - 1) * PAGE_SIZE

  const qParams: any[] = []
  const conditions: string[] = []

  if (params.search) {
    qParams.push(`%${params.search}%`)
    conditions.push(`p.name ILIKE $${qParams.length}`)
  }

  if (params.category) {
    const cats = await sql`SELECT id FROM categories WHERE slug = ${params.category} LIMIT 1`
    if (cats[0]) {
      qParams.push((cats[0] as any).id)
      conditions.push(`p.category_id = $${qParams.length}`)
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  let orderClause = 'ORDER BY p.created_at DESC'
  if (params.sort === 'popular')     orderClause = 'ORDER BY p.sales_count DESC'
  else if (params.sort === 'price_asc')  orderClause = 'ORDER BY p.price ASC'
  else if (params.sort === 'price_desc') orderClause = 'ORDER BY p.price DESC'

  const mainQuery = `
    SELECT p.*, p.price::float8 AS price,
      CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END AS categories
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ${orderClause}
    LIMIT $${qParams.length + 1} OFFSET $${qParams.length + 2}
  `
  const countQuery = `SELECT COUNT(*)::int AS count FROM products p ${whereClause}`

  const toRows = (r: any) => Array.isArray(r) ? r : (r.rows ?? [])

  const [productsRes, totalRes, categories] = await Promise.all([
    sql.query(mainQuery, [...qParams, PAGE_SIZE, offset]),
    sql.query(countQuery, qParams),
    sql`SELECT * FROM categories ORDER BY name`,
  ])

  const products = toRows(productsRes)
  const total = (toRows(totalRes)[0]?.count ?? 0) as number
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-primary font-medium tracking-widest uppercase mb-2 text-xs sm:text-sm">商品一覧</p>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-wider text-foreground">全商品</h1>
        <p className="text-muted-foreground mt-2">{total}件の商品</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Suspense>
          <ProductFilters categories={categories as unknown as Category[]} />
        </Suspense>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {(products as unknown as Product[]).map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...params, page: String(p) })}`}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-xl mb-2">商品が見つかりません</p>
          <p className="text-sm text-muted-foreground">フィルターまたは検索キーワードを変更してください。</p>
        </div>
      )}
    </div>
  )
}
