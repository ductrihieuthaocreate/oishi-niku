import { sql } from '@/lib/db'
import { CategoryManager } from './category-manager'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const categories = await sql`
    SELECT c.id, c.name, c.slug, COUNT(p.id)::int AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name
  `

  return (
    <div>
      <h1 className="font-heading text-3xl tracking-wider text-foreground mb-8">CATEGORIES</h1>
      <CategoryManager categories={categories as any[]} />
    </div>
  )
}
