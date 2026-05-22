'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect, useRef } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useLang } from '@/lib/lang-context'
import type { Category } from '@/lib/types'

interface ProductFiltersProps {
  categories: Category[]
  total?: number
}

export function ProductFilters({ categories, total }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useLang()
  const p = t.products
  const [mobileOpen, setMobileOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchParams.get('focus') === 'search') {
      setMobileOpen(true)
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [searchParams])

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, searchParams, pathname])

  const hasFilters = searchParams.get('search') || searchParams.get('inStock') || searchParams.get('sort') || searchParams.get('category')

  const FilterControls = () => (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="text"
        placeholder={p.searchPlaceholder}
        defaultValue={searchParams.get('search') ?? ''}
        className="border border-border bg-background rounded-xl px-3 py-2 text-sm flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
        onKeyDown={e => { if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value) }}
        onBlur={e => updateParam('search', e.target.value)}
      />
      <select
        defaultValue={searchParams.get('category') ?? ''}
        className="border border-border bg-background rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-foreground"
        onChange={e => updateParam('category', e.target.value)}
      >
        <option value="">{p.allCategories}</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.slug}>{t.categoryNames[cat.slug] ?? cat.name}</option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get('sort') ?? 'newest'}
        className="border border-border bg-background rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-foreground"
        onChange={e => updateParam('sort', e.target.value)}
      >
        <option value="newest">{p.sortNewest}</option>
        <option value="popular">{p.sortPopular}</option>
        <option value="price_asc">{p.sortPriceAsc}</option>
        <option value="price_desc">{p.sortPriceDesc}</option>
      </select>
      {hasFilters && (
        <a href={pathname} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-2">
          <X className="w-3.5 h-3.5" /> {p.clearFilters}
        </a>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop filters */}
      <div className="hidden md:block bg-card rounded-2xl border border-border/60 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <FilterControls />
          {total !== undefined && (
            <p className="text-sm text-muted-foreground font-medium whitespace-nowrap">{total.toLocaleString()}{p.countSuffix}</p>
          )}
        </div>
      </div>

      {/* Mobile filters bar */}
      <div className="md:hidden mb-3">
        <div className="flex items-center justify-between gap-2">
          {total !== undefined && (
            <p className="text-sm font-medium text-muted-foreground">{total.toLocaleString()}{p.countSuffix}</p>
          )}
          <div className="flex gap-2 ml-auto">
            <select
              defaultValue={searchParams.get('sort') ?? 'newest'}
              className="border border-border bg-card rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground"
              onChange={e => updateParam('sort', e.target.value)}
            >
              <option value="newest">{p.sortNewest}</option>
              <option value="popular">{p.sortPopular}</option>
              <option value="price_asc">{p.sortPriceAsc}</option>
              <option value="price_desc">{p.sortPriceDesc}</option>
            </select>
            <button
              onClick={() => setMobileOpen(true)}
              className="flex items-center gap-1.5 border border-border bg-card rounded-xl px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {p.filterTitle}
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-full max-w-sm bg-card rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.4rem' }}>{p.filterTitle}</h3>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-muted-foreground">{p.searchLabel}</label>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={p.searchPlaceholder}
                defaultValue={searchParams.get('search') ?? ''}
                className="border border-border bg-background rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                onKeyDown={e => { if (e.key === 'Enter') { updateParam('search', (e.target as HTMLInputElement).value); setMobileOpen(false) } }}
              />
              <label className="text-sm font-medium text-muted-foreground mt-1">{p.categoryLabel}</label>
              <select
                defaultValue={searchParams.get('category') ?? ''}
                className="border border-border bg-background rounded-xl px-4 py-3 text-sm text-foreground"
                onChange={e => updateParam('category', e.target.value)}
              >
                <option value="">{p.allCategories}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{t.categoryNames[cat.slug] ?? cat.name}</option>
                ))}
              </select>
              <div className="flex gap-3 mt-2">
                <a href={pathname} className="flex-1 py-3 rounded-xl border border-border text-center text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  {p.clearFilters}
                </a>
                <button onClick={() => setMobileOpen(false)} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm active:scale-95 transition-transform">
                  {p.applyFilters}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
