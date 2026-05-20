'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLang } from '@/lib/lang-context'
import { formatPrice, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const FREE_SHIPPING_THRESHOLD = 10000

export function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, removeItem, setQty } = useCart()
  const { t } = useLang()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeCart])

  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={closeCart}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-card border-l border-border"
            role="dialog"
            aria-modal
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-2xl tracking-wide text-foreground">{t.cart.title}</h2>
                <AnimatePresence mode="wait">
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeCart}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="カートを閉じる"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Free Shipping Progress */}
            {items.length > 0 && (
              <div className="px-6 py-3 bg-secondary/50 border-b border-border">
                {remaining > 0 ? (
                  <p className="text-xs text-muted-foreground mb-1.5">
                    {t.cart.freeShippingBefore}<span className="text-primary font-semibold">{formatPrice(remaining)}</span>{t.cart.freeShippingAfter}
                  </p>
                ) : (
                  <p className="text-xs text-primary font-semibold mb-1.5">{t.cart.freeShippingReached}</p>
                )}
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mb-6" />
                  <p className="text-muted-foreground text-lg mb-6">{t.cart.empty}</p>
                  <Button onClick={closeCart} asChild>
                    <Link href="/products">{t.cart.shopNow}</Link>
                  </Button>
                </motion.div>
              ) : (
                <motion.ul layout className="space-y-4">
                  <AnimatePresence initial={false} mode="popLayout">
                    {items.map(item => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, x: 20 }}
                        transition={{ opacity: { duration: 0.2 }, layout: { duration: 0.25 } }}
                        className="flex gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-border transition-colors"
                      >
                        <Link
                          href={`/products/${item.id}`}
                          onClick={closeCart}
                          className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary hover:scale-105 transition-transform"
                        >
                          {item.image_url ? (
                            <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="80px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link href={`/products/${item.id}`} onClick={closeCart}>
                              <h3 className="font-medium text-foreground text-sm leading-tight hover:text-primary transition-colors line-clamp-2">
                                {item.name}
                              </h3>
                            </Link>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>

                          {item.weight_grams && (
                            <p className="text-xs text-muted-foreground mt-1">{item.weight_grams}g</p>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setQty(item.id, item.quantity - 1)}
                                className="p-1.5 rounded-md bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                                aria-label="Decrease"
                              >
                                <Minus className="w-3 h-3" />
                              </motion.button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setQty(item.id, item.quantity + 1)}
                                className="p-1.5 rounded-md bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                                aria-label="Increase"
                              >
                                <Plus className="w-3 h-3" />
                              </motion.button>
                            </div>
                            <span className="text-sm font-medium text-primary">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>

            {/* Footer */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-6 border-t border-border space-y-4 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.cart.subtotal}</span>
                    <span className="text-xl font-semibold text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.cart.shippingNote}</p>
                  <Button
                    asChild
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-lg tracking-wider gap-2"
                    size="lg"
                  >
                    <Link href="/checkout" onClick={closeCart}>
                      {t.cart.checkout}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <button onClick={closeCart} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    {t.cart.continueShopping}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
