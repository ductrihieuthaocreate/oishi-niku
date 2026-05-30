'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

const BKGS = [
  'from-amber-700 to-amber-900',
  'from-stone-700 to-stone-900',
  'from-amber-800 to-stone-900',
]

export function AnnouncementCarousel() {
  const { t } = useLang()
  const slides = t.home.carouselSlides as readonly { icon: string; title: string; sub: string; badge: string }[]
  const [index, setIndex] = useState(0)
  const [direction, setDir] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => { setDir(1); setIndex(i => (i + 1) % slides.length) }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  function go(d: number) {
    setDir(d)
    setIndex(i => (i + d + slides.length) % slides.length)
  }

  const slide = slides[index]
  const bg = BKGS[index % BKGS.length]

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-r ${bg} mb-4 transition-all duration-700`}>
      <div className="flex items-stretch">
        <button
          onClick={() => go(-1)}
          className="flex-shrink-0 w-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/20 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ x: direction * 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col items-center text-center px-4 py-5 gap-1.5"
            >
              <span className="text-2xl mb-0.5">{slide.icon}</span>
              <p className="font-black text-white text-sm leading-snug">{slide.title}</p>
              <p className="text-white/75 text-xs leading-snug max-w-xs">{slide.sub}</p>
              <span className="mt-1 text-white text-[10px] font-bold px-3 py-0.5 rounded-full border border-white/30 bg-white/20">
                {slide.badge}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => go(1)}
          className="flex-shrink-0 w-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/20 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDir(i > index ? 1 : -1); setIndex(i) }}
            className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  )
}
