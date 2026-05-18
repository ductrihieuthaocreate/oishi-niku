'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MARQUEE_WORDS = [
  'FROZEN', 'BULK ORDER', 'B2B', 'WHOLESALE', 'BEEF', 'PORK', 'CHICKEN',
  'FROZEN SUPPLY', 'RELIABLE', 'BULK CUTS', 'COLD CHAIN', 'OISHI NIKU',
]

export function HeroSection() {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const marquee2Ref = useRef<HTMLDivElement>(null)

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

  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS]

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-60" style={{
        backgroundImage: 'linear-gradient(#E5E3DC 1px, transparent 1px), linear-gradient(90deg, #E5E3DC 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 relative z-10">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary font-medium tracking-widest uppercase mb-4 text-xs sm:text-sm"
          >
            Wholesale Frozen Meat Supplier
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-[2.8rem] sm:text-6xl lg:text-9xl tracking-wider text-foreground mb-5 lg:mb-8 leading-none"
          >
            FROZEN MEAT
            <br />
            <span className="text-primary">BULK</span>
            <br />
            SUPPLY
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm sm:text-lg text-muted-foreground max-w-xl mb-8"
          >
            Reliable frozen meat supply for restaurants, hotels, and food businesses. Consistent quality, competitive bulk pricing, and cold-chain delivery you can count on.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-lg tracking-wider gap-2">
              <Link href="/products">
                VIEW CATALOG
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll velocity marquee */}
      <div className="border-y border-border py-4 overflow-hidden mt-8">
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
