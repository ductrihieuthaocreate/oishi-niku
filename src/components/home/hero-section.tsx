'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

interface HeroSectionProps {
  categories?: Array<{ id: number; name: string; slug: string }>
}

export function HeroSection({ categories = [] }: HeroSectionProps) {
  const { t } = useLang()

  const stats = [
    { value: '100+', label: t.hero.marquee[0] ?? '厳選商品' },
    { value: '¥10,000', label: '以上で送料無料' },
    { value: '翌日', label: '最短お届け' },
    { value: 'HACCP', label: '認証取得済み' },
  ]

  return (
    <section className="relative w-full overflow-hidden rounded-3xl mb-2 bg-card">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />

      <div className="relative px-8 pt-16 pb-12">
        {/* Eyebrow */}
        <div className="flex justify-center mb-6">
          <span
            className="text-sm uppercase tracking-[0.3em] text-primary/70 animate-blur-in opacity-0"
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            {t.hero.eyebrow}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-center font-serif leading-[1.1] mb-5 animate-blur-in opacity-0"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            animationDelay: '0.25s',
            animationFillMode: 'forwards',
          }}
        >
          <span className="block font-semibold italic text-foreground">{t.hero.title1}</span>
          <span className="block font-semibold text-primary">{t.hero.title2}</span>
          <span className="block font-semibold text-foreground/70">{t.hero.title3}</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-center text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8 animate-blur-in opacity-0"
          style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
        >
          {t.hero.subtitle}
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap gap-3 justify-center mb-10 animate-blur-in opacity-0"
          style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}
        >
          <Link
            href="/products?sort=popular"
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-sm tracking-wide go2go-transition hover:bg-primary/90 go2go-shadow"
          >
            {t.hero.cta}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 go2go-transition" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-transparent border border-foreground/20 text-foreground px-7 py-3.5 rounded-full text-sm tracking-wide go2go-transition hover:bg-foreground/5"
          >
            {t.nav.shop}
          </Link>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-blur-in opacity-0"
          style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}
        >
          {stats.map((s, i) => (
            <div key={i} className="bg-background/70 backdrop-blur-sm border border-border/40 rounded-2xl px-4 py-4 text-center go2go-shadow">
              <p
                className="font-serif text-2xl font-semibold text-primary leading-none"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div
            className="flex flex-wrap gap-2 justify-center mt-6 animate-blur-in opacity-0"
            style={{ animationDelay: '0.85s', animationFillMode: 'forwards' }}
          >
            {categories.slice(0, 6).map(c => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="text-xs px-4 py-1.5 bg-background/80 border border-border rounded-full hover:border-primary/40 hover:text-primary go2go-transition"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
