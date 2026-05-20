import { sql } from '@/lib/db'
import { ProductForm } from '../product-form'
import { createProduct } from '../actions'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default async function NewProductPage() {
  const categories = await sql`SELECT * FROM categories ORDER BY name`

  return (
    <div>
      <h1 className="font-heading text-3xl tracking-wider text-foreground mb-8">NEW PRODUCT</h1>
      <ProductForm categories={categories as unknown as Category[]} action={createProduct} />
    </div>
  )
}
