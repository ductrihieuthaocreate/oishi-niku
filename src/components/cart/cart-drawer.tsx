'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLang } from '@/lib/lang-context'

const FREE_SHIPPING_THRESHOLD = 10000

export function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, removeItem, setQty } = useCart()
  const { t } = useLang()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeCart])

  if (!isOpen) return null

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)
  const pct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={closeCart} />

      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-card shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.35rem', letterSpacing: '0.05em' }}>
              {t.cart.title}
            </h2>
            {count > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t.cart.empty}</p>
                <p className="text-sm text-muted-foreground mt-1">{t.cart.addItemsPrompt}</p>
              </div>
              <button onClick={closeCart} className="text-sm text-primary font-medium hover:underline">
                {t.cart.continueShopping}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 bg-muted/40 rounded-2xl p-3">
                  <div className="w-16 h-16 rounded-xl bg-background overflow-hidden flex-shrink-0 relative">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug truncate" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem' }}>
                      {item.name}
                    </p>
                    {item.weight_grams && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.weight_grams}g</p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-background rounded-xl border border-border/60">
                        <button
                          onClick={() => setQty(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => setQty(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">¥{(item.price * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/60 px-5 py-5 space-y-3">
            {/* Free shipping progress */}
            {remaining > 0 ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
                <p className="text-xs font-semibold text-primary mb-2">
                  {t.cart.freeShippingBefore}¥{remaining.toLocaleString()}{t.cart.freeShippingAfter}
                </p>
                <div className="w-full h-1.5 bg-primary/15 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ) : (
              <div className="bg-accent/10 border border-accent/30 rounded-2xl px-4 py-2.5 text-xs font-semibold text-accent-foreground text-center">
                {t.cart.freeShippingReached}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t.cart.subtotalExclTax}</span>
                <span className="text-sm font-semibold">¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t.cart.taxLine}</span>
                <span className="text-sm font-semibold">¥{Math.round(subtotal * 0.1).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-sm text-muted-foreground font-medium">{t.cart.totalInclTax}</span>
                <span className="text-lg font-black text-foreground">¥{Math.round(subtotal * 1.1).toLocaleString()}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm active:scale-[0.98]"
            >
              {t.cart.checkout} <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={closeCart}
              className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.cart.continueShopping}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
