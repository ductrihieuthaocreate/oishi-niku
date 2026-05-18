'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Category } from '@/lib/types'

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          current.delete(key)
        } else {
          current.set(key, value)
        }
      }
      current.delete('page')
      return current.toString()
    },
    [searchParams]
  )

  const currentCategory = searchParams.get('category') ?? 'all'
  const currentSort = searchParams.get('sort') ?? 'newest'

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category Filter */}
      <Select
        value={currentCategory}
        onValueChange={(value) => {
          router.push(`${pathname}?${createQueryString({ category: value === 'all' ? null : value })}`)
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={currentSort}
        onValueChange={(value) => {
          router.push(`${pathname}?${createQueryString({ sort: value })}`)
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
