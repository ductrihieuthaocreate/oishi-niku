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
        {/* Left arrow */}
        <button
          onClick={() => go(-1)}
          className="flex-shrink-0 w-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/20 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Slide content */}
        <div className="flex-1 min-w-0 overflow-hidden py-5 pb-7">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ x: direction * 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -40, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex items-center gap-3"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl">
                <span className="text-xl">{slide.icon}</span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm leading-tight">{slide.title}</p>
                <p className="text-white/70 text-[11px] mt-0.5 leading-snug">{slide.sub}</p>
              </div>

              {/* Badge */}
              <span className="flex-shrink-0 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30 bg-white/15 whitespace-nowrap">
                {slide.badge}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right arrow */}
        <button
          onClick={() => go(1)}
          className="flex-shrink-0 w-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/20 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots */}
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
