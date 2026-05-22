'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

const BKGS = [
  'from-amber-700 to-amber-900',
  'from-stone-700 to-stone-900',
  'from-amber-800 to-stone-900',
  'from-stone-800 to-amber-900',
]

export function AnnouncementCarousel() {
  const { t } = useLang()
  const slides = t.home.carouselSlides as readonly { icon: string; title: string; sub: string; badge: string }[]
  const [index, setIndex] = useState(0)
  const [direction, setDir] = useState(1)

  useEffect(() => {
    const t = setInterval(() => { setDir(1); setIndex(i => (i + 1) % slides.length) }, 4000)
    return () => clearInterval(t)
  }, [])

  function go(d: number) {
    setDir(d)
    setIndex(i => (i + d + slides.length) % slides.length)
  }

  const slide = slides[index]
  const bg = BKGS[index % BKGS.length]

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-r ${bg} mb-4 transition-all duration-700`}>
      <div className="flex items-center">
        <button
          onClick={() => go(-1)}
          className="flex-shrink-0 w-8 h-full min-h-[56px] flex items-center justify-center text-white/70 hover:text-white hover:bg-black/20 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0 overflow-hidden pb-5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ x: direction * 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -60, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex items-center justify-between py-4 gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{slide.icon}</span>
                <div className="min-w-0">
                  <p className="font-black text-white text-sm leading-tight">{slide.title}</p>
                  <p className="text-white/75 text-xs mt-0.5 leading-tight truncate">{slide.sub}</p>
                </div>
              </div>
              <span className="flex-shrink-0 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30 bg-white/20 whitespace-nowrap">
                {slide.badge}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => go(1)}
          className="flex-shrink-0 w-8 h-full min-h-[56px] flex items-center justify-center text-white/70 hover:text-white hover:bg-black/20 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
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
