import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { ProductForm } from '../product-form'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'
import { updateProduct } from '../actions'
import type { Product, Category } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params

  const [products, categories] = await Promise.all([
    sql`
      SELECT p.*, p.price::float8 AS price,
        CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END AS categories
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${parseInt(id)}
      LIMIT 1
    `,
    sql`SELECT * FROM categories ORDER BY name`,
  ])

  if (!products[0]) notFound()

  const updateProductWithId = updateProduct.bind(null, parseInt(id))

  return (
    <div>
      <h1 className="font-heading text-3xl tracking-wider text-foreground mb-8">EDIT PRODUCT</h1>
      <ProductForm
        product={products[0] as unknown as Product}
        categories={categories as unknown as Category[]}
        action={updateProductWithId}
      />
    </div>
  )
}
