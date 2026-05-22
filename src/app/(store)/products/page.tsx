import { Suspense } from 'react'
import { sql } from '@/lib/db'
import { getLang, dict } from '@/lib/lang'
import { ProductCard } from '@/components/product/product-card'
import { ProductFilters } from '@/components/product/product-filters'
import { Pagination } from '@/components/product/pagination'
import { Sidebar } from '@/components/product/sidebar'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string; search?: string; page?: string }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const [params, lang] = await Promise.all([searchParams, getLang()])
  const t = dict[lang]
  const p = t.products
  const page = parseInt(params.page ?? '1')
  const offset = (page - 1) * PAGE_SIZE

  const qParams: unknown[] = []
  const conditions: string[] = []

  if (params.search) {
    qParams.push(`%${params.search}%`)
    conditions.push(`p.name ILIKE $${qParams.length}`)
  }

  if (params.category) {
    const cats = await sql`SELECT id FROM categories WHERE slug = ${params.category} LIMIT 1`
    if ((cats as any[])[0]) {
      qParams.push((cats as any[])[0].id)
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
    (sql as any).query(mainQuery, [...qParams, PAGE_SIZE, offset]),
    (sql as any).query(countQuery, qParams),
    sql`SELECT * FROM categories ORDER BY name`,
  ])

  const products = toRows(productsRes) as Product[]
  const total = (toRows(totalRes)[0]?.count ?? 0) as number
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 pb-16">
        <div className="pt-6 mb-4">
          <p className="text-primary font-medium tracking-widest uppercase mb-1 text-xs">{p.eyebrow}</p>
          <h1
            className="font-serif text-4xl tracking-wider text-foreground"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {p.title}
          </h1>
        </div>
        <div className="flex gap-6">
          <Sidebar categories={categories as unknown as Category[]} selectedCategory={params.category} />
          <div className="flex-1 min-w-0">
            <Suspense><ProductFilters categories={categories as unknown as Category[]} total={total} /></Suspense>
            {products.length > 0 ? (
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
            ) : (
              <div className="bg-muted/50 rounded-3xl p-16 text-center">
                <p className="text-muted-foreground">{p.notFound}</p>
                <a href="/products" className="mt-4 inline-block text-primary hover:underline text-sm">{p.notFoundDesc}</a>
              </div>
            )}
            <Suspense><Pagination currentPage={page} totalPages={totalPages} /></Suspense>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-4 pb-8">
        <div className="pt-4 mb-4">
          <h1
            className="font-serif text-3xl tracking-wider text-foreground"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {p.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{p.countBefore}{total}{p.countAfter}</p>
        </div>
        <Suspense><ProductFilters categories={categories as unknown as Category[]} total={total} /></Suspense>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="bg-muted/50 rounded-3xl p-12 text-center mt-4">
            <p className="text-muted-foreground">{p.notFound}</p>
            <a href="/products" className="mt-3 inline-block text-primary text-sm font-medium">{p.notFoundDesc}</a>
          </div>
        )}
        <Suspense><Pagination currentPage={page} totalPages={totalPages} /></Suspense>
      </div>
    </div>
  )
}
