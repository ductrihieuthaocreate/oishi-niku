import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import { sql } from '@/lib/db'
import { getLang, dict } from '@/lib/lang'
import { ProductCard } from '@/components/product/product-card'
import { BestSellers } from '@/components/home/best-sellers'
import { AnnouncementCarousel } from '@/components/home/announcement-carousel'
import { Sidebar } from '@/components/product/sidebar'
import { ProductFilters } from '@/components/product/product-filters'
import { Pagination } from '@/components/product/pagination'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
    inStock?: string
    page?: string
  }>
}

const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const rows = await sql`SELECT * FROM categories ORDER BY name`
    return rows as unknown as Category[]
  },
  ['categories'],
  { revalidate: 300 }
)

async function getProducts(params: Awaited<PageProps['searchParams']>) {
  const page = Number(params.page ?? 1)
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

  if (params.inStock === '1') {
    conditions.push('p.stock > 0')
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  let orderClause = 'ORDER BY p.sort_order ASC NULLS LAST, p.created_at DESC'
  if (params.sort === 'popular')     orderClause = 'ORDER BY p.sort_order ASC NULLS LAST, p.sales_count DESC'
  else if (params.sort === 'price_asc')  orderClause = 'ORDER BY p.sort_order ASC NULLS LAST, p.price ASC'
  else if (params.sort === 'price_desc') orderClause = 'ORDER BY p.sort_order ASC NULLS LAST, p.price DESC'

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

  const [productsRes, totalRes] = await Promise.all([
    (sql as any).query(mainQuery, [...qParams, PAGE_SIZE, offset]),
    (sql as any).query(countQuery, qParams),
  ])

  const products = toRows(productsRes) as Product[]
  const total = (toRows(totalRes)[0]?.count ?? 0) as number
  return { products, total }
}

const getBestSellers = unstable_cache(
  async (): Promise<Product[]> => {
    const rows = await sql`
      SELECT p.*, p.price::float8 AS price
      FROM products p
      WHERE p.stock > 0
      ORDER BY p.sales_count DESC
      LIMIT 5
    `
    return rows as unknown as Product[]
  },
  ['best-sellers'],
  { revalidate: 120 }
)

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const lang = await getLang()
  const t = dict[lang]

  const [categories, { products, total }, bestSellers] = await Promise.all([
    getCategories(),
    getProducts(params),
    getBestSellers(),
  ])

  const page = Number(params.page ?? 1)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="w-full">
      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:block w-full px-4 mx-auto max-w-7xl">
        <div className="mt-6 pb-16">
          <Suspense><AnnouncementCarousel /></Suspense>
          <div className="flex gap-6">
            <Sidebar categories={categories} selectedCategory={params.category} />
            <div className="flex-1 min-w-0">
              <Suspense><ProductFilters categories={categories} total={total} /></Suspense>
              {products.length === 0 ? (
                <div className="bg-muted/50 rounded-3xl p-16 text-center">
                  <p className="text-muted-foreground">{t.products.notFound}</p>
                  <a href="/" className="mt-4 inline-block text-primary hover:underline text-sm">{t.products.notFoundDesc}</a>
                </div>
              ) : (
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
              <Suspense><Pagination currentPage={page} totalPages={totalPages} basePath="/" /></Suspense>
            </div>
            <aside className="w-52 shrink-0">
              <BestSellers products={bestSellers} />
            </aside>
          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden">
        <div className="px-4 pt-3">
          <Suspense><AnnouncementCarousel /></Suspense>
        </div>

        <div className="px-4">
          <Suspense><ProductFilters categories={categories} total={total} /></Suspense>
        </div>

        <div className="px-4">
          {products.length === 0 ? (
            <div className="bg-muted/50 rounded-3xl p-12 text-center mt-4">
              <p className="text-muted-foreground">{t.products.notFound}</p>
              <a href="/" className="mt-3 inline-block text-primary text-sm font-medium">フィルターをクリア</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>

        <div className="px-4">
          <Suspense><Pagination currentPage={page} totalPages={totalPages} basePath="/" /></Suspense>
        </div>

        {bestSellers.length > 0 && (
          <div className="px-4 mt-6 mb-4">
            <BestSellers products={bestSellers} />
          </div>
        )}
      </div>
    </div>
  )
}
