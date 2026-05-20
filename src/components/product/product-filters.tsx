'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Category } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useLang()
  const p = t.products

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
      <Select
        value={currentCategory}
        onValueChange={(value) => {
          router.push(`${pathname}?${createQueryString({ category: value === 'all' ? null : value })}`)
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={p.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{p.allCategories}</SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentSort}
        onValueChange={(value) => {
          router.push(`${pathname}?${createQueryString({ sort: value })}`)
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{p.sortNewest}</SelectItem>
          <SelectItem value="popular">{p.sortPopular}</SelectItem>
          <SelectItem value="price_asc">{p.sortPriceAsc}</SelectItem>
          <SelectItem value="price_desc">{p.sortPriceDesc}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
