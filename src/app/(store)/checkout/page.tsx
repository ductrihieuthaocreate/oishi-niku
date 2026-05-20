'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, CreditCard, Truck, CheckCircle, ArrowLeft, Lock } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLang } from '@/lib/lang-context'
import { placeOrder, type ShippingDetails } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'

const SHIPPING_FEE = 1500
const FREE_SHIPPING_THRESHOLD = 10000
const TAX_RATE = 0.10

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { t } = useLang()
  const c = t.checkout
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'bank'>('card')

  const [form, setForm] = useState<Omit<ShippingDetails, 'paymentMethod'>>({
    name: '', email: '', phone: '', address: '', city: '', state: 'CA', postal: '', country: 'US', notes: '',
  })

  const tax = subtotal * TAX_RATE
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + tax + shippingFee

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.address || !form.city || !form.postal) {
      setError(c.errorRequired)
      return
    }
    setIsLoading(true)
    try {
      const result = await placeOrder(items, { ...form, paymentMethod })
      if (result.error) {
        setError(result.error)
      } else if (result.orderId) {
        setOrderId(result.orderId)
        clearCart()
      }
    } catch {
      setError(c.errorGeneral)
    } finally {
      setIsLoading(false)
    }
  }

  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="font-heading text-4xl tracking-wider text-foreground mb-4">{c.orderComplete}</h1>
          <p className="text-muted-foreground mb-2">{c.orderNumberPrefix}{orderId}</p>
          <p className="text-muted-foreground mb-8">
            {c.thankYou1}{form.email}{c.thankYou2}
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading tracking-wider">
              <Link href="/products">{c.continueShopping}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="font-heading text-3xl tracking-wider mb-4">{c.emptyCart}</h1>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/products">{t.cart.shopNow}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> {c.backToShopping}
      </Link>

      <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-wider text-foreground mb-6 lg:mb-10">{c.title}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Left — Form */}
          <div className="lg:col-span-2 space-y-5 lg:space-y-8 order-2 lg:order-1">
            {/* Contact */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading text-xl tracking-wider text-foreground mb-6">{c.customerInfo}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">{c.name}</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} required className="mt-1.5" placeholder={c.namePlaceholder} />
                </div>
                <div>
                  <Label htmlFor="email">{c.email}</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="mt-1.5" placeholder={c.emailPlaceholder} />
                </div>
                <div>
                  <Label htmlFor="phone">{c.phone}</Label>
                  <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className="mt-1.5" placeholder={c.phonePlaceholder} />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading text-xl tracking-wider text-foreground mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> {c.shippingAddress}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="address">{c.address}</Label>
                  <Input id="address" name="address" value={form.address} onChange={handleChange} required className="mt-1.5" placeholder={c.addressPlaceholder} />
                </div>
                <div>
                  <Label htmlFor="city">{c.city}</Label>
                  <Input id="city" name="city" value={form.city} onChange={handleChange} required className="mt-1.5" placeholder={c.cityPlaceholder} />
                </div>
                <div>
                  <Label htmlFor="state">{c.state}</Label>
                  <select
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="postal">{c.postal}</Label>
                  <Input id="postal" name="postal" value={form.postal} onChange={handleChange} required className="mt-1.5" placeholder={c.postalPlaceholder} />
                </div>
                <div>
                  <Label htmlFor="country">{c.country}</Label>
                  <Input id="country" name="country" value={form.country} onChange={handleChange} className="mt-1.5" disabled />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">{c.notes}</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder={c.notesPlaceholder}
                    className="mt-1.5 flex min-h-[80px] w-full rounded-md border border-border bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading text-xl tracking-wider text-foreground mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> {c.payment}
              </h2>
              <div className="space-y-3">
                {([
                  { value: 'card', label: c.payCard, desc: c.payCardDesc },
                  { value: 'bank', label: c.payBank, desc: c.payBankDesc },
                  { value: 'cod', label: c.payCod, desc: c.payCodDesc },
                ] as const).map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="accent-primary"
                    />
                    <div>
                      <p className="font-medium text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-dashed border-border">
                  <p className="text-sm text-muted-foreground text-center">{c.cardPlaceholder}</p>
                </div>
              )}
              {paymentMethod === 'bank' && (
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
                  <p className="text-sm font-medium mb-2">{c.bankDetailsTitle}</p>
                  <p className="text-sm text-muted-foreground">{c.bankName}</p>
                  <p className="text-sm text-muted-foreground">{c.bankAccount}</p>
                  <p className="text-sm text-muted-foreground">{c.bankRef}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right — Order Summary */}
          <div className="space-y-4 order-1 lg:order-2">
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-heading text-xl tracking-wider text-foreground mb-6">{c.orderSummary}</h2>

              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{c.quantityLabel}{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-primary">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.subtotal}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.shipping}</span>
                  <span>{shippingFee === 0 ? <span className="text-primary">{c.free}</span> : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.tax}</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>

              <Separator className="mb-4" />

              <div className="flex justify-between mb-6">
                <span className="font-heading tracking-wider text-foreground">{c.total}</span>
                <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-lg tracking-wider gap-2"
                size="lg"
              >
                <Lock className="w-5 h-5" />
                {isLoading ? c.placing : c.placeOrder}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> {c.secureBadge}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
