'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { useLang } from '@/lib/lang-context'
import type { Product } from '@/lib/types'

export function BestSellers({ products }: { products: Product[] }) {
  const { t } = useLang()
  if (!products.length) return null

  return (
    <div className="bg-muted/50 backdrop-blur-sm rounded-3xl p-4 overflow-hidden">
      <h2 className="font-bold text-primary text-base mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem' }}>
        {t.home.bestSellersTitle}
      </h2>
      <ol className="space-y-1">
        {products.map((p, i) => (
          <li key={p.id}>
            <Link
              href={`/products/${p.id}`}
              className="group flex items-center gap-2 hover:bg-background/60 rounded-xl p-1.5 transition-all duration-200"
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                i === 0 ? 'bg-yellow-400 text-white' :
                i === 1 ? 'bg-gray-300 text-gray-700' :
                i === 2 ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </span>
              {p.image_url && (
                <div className="relative w-7 h-7 flex-shrink-0 rounded-md overflow-hidden">
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                </div>
              )}
              <span
                className="text-xs text-foreground leading-snug flex-1 min-w-0 truncate group-hover:text-primary transition-colors"
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.9rem' }}
              >
                {p.name}
              </span>
              <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
