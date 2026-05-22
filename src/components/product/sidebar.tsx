import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Category } from '@/lib/types'

interface SidebarProps {
  categories: Category[]
  selectedCategory?: string | null
}

export function Sidebar({ categories, selectedCategory }: SidebarProps) {
  return (
    <aside className="w-full md:w-52 shrink-0">
      <div className="bg-muted/50 backdrop-blur-sm rounded-3xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <h2 className="font-bold text-sm bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent uppercase tracking-wide">
            Categories
          </h2>
        </div>
        <nav className="p-3 space-y-0.5">
          <Link
            href="/products"
            className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground hover:bg-background/60 hover:text-primary'
            }`}
          >
            すべての商品
            <ArrowUpRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${!selectedCategory ? 'opacity-100' : ''}`} />
          </Link>

          {categories.map(cat => {
            const isActive = selectedCategory === cat.slug
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-background/60 hover:text-primary'
                }`}
              >
                {cat.name}
                <ArrowUpRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
