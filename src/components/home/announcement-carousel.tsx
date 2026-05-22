'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    bg: 'from-amber-700 to-amber-900',
    icon: '🚚',
    title: '¥10,000以上で送料無料',
    sub: '全国一律配送対応',
    badge: '自動適用',
  },
  {
    id: 2,
    bg: 'from-stone-700 to-stone-900',
    icon: '🥩',
    title: '厳選和牛・プレミアム精肉',
    sub: 'HACCP認証の高品質商品が揃っています',
    badge: '品質保証',
  },
  {
    id: 3,
    bg: 'from-amber-800 to-stone-900',
    icon: '📦',
    title: '翌日発送対応',
    sub: '平日14時までのご注文は当日出荷',
    badge: '迅速対応',
  },
  {
    id: 4,
    bg: 'from-stone-800 to-amber-900',
    icon: '❄️',
    title: 'コールドチェーン完備',
    sub: '鮮度を保ったままお届けします',
    badge: '冷凍配送',
  },
]

export function AnnouncementCarousel() {
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

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-r ${slide.bg} mb-4 transition-all duration-700`}>
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
              key={slide.id}
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
