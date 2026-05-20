import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { ProductGallery } from '@/components/product/product-gallery'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'
import { AddToCartButton } from '@/components/product/add-to-cart-button'
import { ProductCard } from '@/components/product/product-card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { Star, Weight, MapPin, Award } from 'lucide-react'
import type { Product } from '@/lib/types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string): Promise<Product | null> {
  const rows = await sql`
    SELECT p.*, p.price::float8 AS price,
      CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END AS categories
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ${parseInt(id)}
    LIMIT 1
  `
  return (rows[0] as unknown as Product) ?? null
}

async function getRelatedProducts(categoryId: number | null, currentId: number): Promise<Product[]> {
  const rows = categoryId
    ? await sql`
        SELECT p.*, p.price::float8 AS price,
          CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END AS categories
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id != ${currentId} AND p.stock > 0 AND p.category_id = ${categoryId}
        ORDER BY p.sales_count DESC
        LIMIT 4
      `
    : await sql`
        SELECT p.*, p.price::float8 AS price,
          CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END AS categories
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id != ${currentId} AND p.stock > 0
        ORDER BY p.sales_count DESC
        LIMIT 4
      `
  return rows as unknown as Product[]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description ?? undefined,
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category_id, product.id)
  const allImages = product.images?.length > 0 ? product.images : (product.image_url ? [product.image_url] : [])
  const isOutOfStock = product.stock <= 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        <ProductGallery images={allImages} productName={product.name} />

        <div className="space-y-6">
          {product.categories && (
            <p className="text-primary font-medium tracking-widest uppercase text-sm">{product.categories.name}</p>
          )}
          <h1 className="font-heading text-4xl lg:text-5xl tracking-wider text-foreground">{product.name}</h1>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.weight_grams && (
              <span className="text-muted-foreground">{product.weight_grams}g あたり</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {product.grade && (
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border/50">
                <Award className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">グレード</p>
                  <p className="font-medium text-sm">{product.grade}</p>
                </div>
              </div>
            )}
            {product.origin && (
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border/50">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">産地</p>
                  <p className="font-medium text-sm">{product.origin}</p>
                </div>
              </div>
            )}
            {product.cut_type && (
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border/50">
                <Star className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">部位</p>
                  <p className="font-medium text-sm">{product.cut_type}</p>
                </div>
              </div>
            )}
            {product.weight_grams && (
              <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border/50">
                <Weight className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">重量</p>
                  <p className="font-medium text-sm">{product.weight_grams}g</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-destructive' : 'bg-green-500'}`} />
            <span className={`text-sm ${isOutOfStock ? 'text-destructive' : 'text-green-500'}`}>
              {isOutOfStock ? '在庫切れ' : `在庫あり（${product.stock}点）`}
            </span>
          </div>

          <Separator />

          {product.description && (
            <div>
              <h3 className="font-heading tracking-wider text-foreground mb-3">商品について</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          <Separator />

          <AddToCartButton product={product} />

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline" className="text-xs">コールドチェーン配送</Badge>
            <Badge variant="outline" className="text-xs">HACCP認証取得</Badge>
            <Badge variant="outline" className="text-xs">真空パック</Badge>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-heading text-3xl tracking-wider text-foreground">こちらもおすすめ</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
