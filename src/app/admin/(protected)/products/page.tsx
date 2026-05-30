import Link from 'next/link'
import Image from 'next/image'
import { sql } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Package, TrendingUp, AlertTriangle, Star } from 'lucide-react'
import { DeleteProductButton } from './delete-button'
import type { Product, Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const qParams: any[] = []
  const conditions: string[] = []

  if (params.q) {
    qParams.push(`%${params.q}%`)
    conditions.push(`p.name ILIKE $${qParams.length}`)
  }
  if (params.category) {
    qParams.push(parseInt(params.category))
    conditions.push(`p.category_id = $${qParams.length}`)
  }
  if (params.status === 'low')      conditions.push(`p.stock <= 5 AND p.stock > 0`)
  else if (params.status === 'out') conditions.push(`p.stock = 0`)
  else if (params.status === 'featured') conditions.push(`p.is_featured = true`)

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const queryStr = `
    SELECT p.id, p.name, p.slug, p.price::float8 AS price, p.stock, p.sales_count,
      p.is_featured, p.image_url, p.cut_type, p.grade, p.created_at,
      CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name) ELSE NULL END AS categories
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY p.created_at DESC
  `

  const [productsRes, cats] = await Promise.all([
    sql.query(queryStr, qParams),
    sql`SELECT id, name FROM categories ORDER BY name`,
  ])
  const products = Array.isArray(productsRes) ? productsRes : (productsRes.rows ?? [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">PRODUCTS</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{products.length} results</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> New Product
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-48 relative">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search products..."
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary pr-8"
          />
        </div>
        <select
          name="category"
          defaultValue={params.category ?? ''}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">All Categories</option>
          {(cats as Category[]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ''}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="featured">★ Featured</option>
          <option value="low">⚠ Low Stock (≤5)</option>
          <option value="out">✕ Out of Stock</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground hover:bg-secondary/80 transition-colors"
        >
          Filter
        </button>
        {(params.q || params.category || params.status) && (
          <Link
            href="/admin/products"
            className="px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Sales</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Featured</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Package className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No products found.</p>
                    <Link href="/admin/products/new" className="text-primary text-sm hover:underline mt-1 inline-block">Add your first product</Link>
                  </td>
                </tr>
              ) : (
                (products as unknown as Product[]).map(product => {
                  const stockColor = product.stock === 0
                    ? 'text-red-400 bg-red-500/10'
                    : product.stock <= 5
                    ? 'text-yellow-400 bg-yellow-500/10'
                    : 'text-green-400 bg-green-500/10'

                  return (
                    <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            {product.image_url ? (
                              <Image src={product.image_url} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-heading tracking-wider">IMG</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate max-w-[180px]">{product.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {product.grade && <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{product.grade}</span>}
                              {product.cut_type && <span className="text-[10px] text-muted-foreground">{product.cut_type}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{product.categories?.name ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-primary text-sm">{formatPrice(product.price)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${stockColor}`}>
                          {product.stock === 0 ? 'Out' : product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs">{product.sales_count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        {product.is_featured
                          ? <Star className="w-4 h-4 text-primary fill-primary" />
                          : <Star className="w-4 h-4 text-muted-foreground/30" />
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <DeleteProductButton id={product.id} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
