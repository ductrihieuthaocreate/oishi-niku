'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLang } from '@/lib/lang-context'

export function HeroSection() {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const marquee2Ref = useRef<HTMLDivElement>(null)
  const { t } = useLang()
  const words = [...t.hero.marquee, ...t.hero.marquee]

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          xPercent: -50,
          ease: 'none',
          duration: 20,
          repeat: -1,
        })
      }
      if (marquee2Ref.current) {
        gsap.fromTo(
          marquee2Ref.current,
          { xPercent: -50 },
          { xPercent: 0, ease: 'none', duration: 20, repeat: -1 }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative min-h-[55vh] lg:min-h-[85vh] flex flex-col justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-60" style={{
        backgroundImage: 'linear-gradient(#E5E3DC 1px, transparent 1px), linear-gradient(90deg, #E5E3DC 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-24 relative z-10">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary font-medium tracking-widest uppercase mb-4 text-xs sm:text-sm"
          >
            {t.hero.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-[2rem] sm:text-6xl lg:text-9xl tracking-wider text-foreground mb-3 lg:mb-8 leading-none"
          >
            {t.hero.title1}
            <br />
            <span className="text-primary">{t.hero.title2}</span>
            <br />
            {t.hero.title3}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm sm:text-lg text-muted-foreground max-w-xl mb-5 lg:mb-8"
          >
            {t.hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-lg tracking-wider gap-2">
              <Link href="/products">
                {t.hero.cta}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll velocity marquee */}
      <div className="border-y border-border py-3 overflow-hidden mt-4 lg:mt-8">
        <div ref={marqueeRef} className="flex whitespace-nowrap will-change-transform" style={{ width: '200%' }}>
          {words.map((word, i) => (
            <span key={i} className="font-heading text-xl tracking-wider text-muted-foreground/40 mx-6 flex-shrink-0">
              {word}
              <span className="text-primary mx-6">•</span>
            </span>
          ))}
        </div>
      </div>
      <div className="border-b border-border py-4 overflow-hidden">
        <div ref={marquee2Ref} className="flex whitespace-nowrap will-change-transform" style={{ width: '200%' }}>
          {[...words].reverse().map((word, i) => (
            <span key={i} className="font-heading text-xl tracking-wider text-muted-foreground/20 mx-6 flex-shrink-0">
              {word}
              <span className="text-primary/50 mx-6">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
