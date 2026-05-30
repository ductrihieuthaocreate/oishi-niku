'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, CheckCircle, ShoppingBag, Loader2,
  MapPin, CreditCard, Truck, Search, User, Mail, Phone,
  Building2, Clock, Calendar,
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLang } from '@/lib/lang-context'
import { placeOrder, getSessionCustomer } from './actions'

const COD_FEE                 = 390
const SHIPPING_FEE            = 1000
const SHIPPING_FEE_REMOTE     = 1500
const FREE_SHIPPING_THRESHOLD = 15000
const TAX_RATE                = 0.1
const REMOTE_PREFECTURES      = ['北海道', '沖縄県']
const LS_KEY                  = 'oishiCheckoutDraft'

const DIAL_CODES = [
  { code: '+81',  flag: '🇯🇵', label: 'JP' },
  { code: '+1',   flag: '🇺🇸', label: 'US' },
  { code: '+44',  flag: '🇬🇧', label: 'GB' },
  { code: '+61',  flag: '🇦🇺', label: 'AU' },
  { code: '+86',  flag: '🇨🇳', label: 'CN' },
  { code: '+82',  flag: '🇰🇷', label: 'KR' },
  { code: '+886', flag: '🇹🇼', label: 'TW' },
  { code: '+84',  flag: '🇻🇳', label: 'VN' },
  { code: '+65',  flag: '🇸🇬', label: 'SG' },
  { code: '+60',  flag: '🇲🇾', label: 'MY' },
  { code: '+66',  flag: '🇹🇭', label: 'TH' },
  { code: '+63',  flag: '🇵🇭', label: 'PH' },
  { code: '+62',  flag: '🇮🇩', label: 'ID' },
  { code: '+91',  flag: '🇮🇳', label: 'IN' },
  { code: '+49',  flag: '🇩🇪', label: 'DE' },
  { code: '+33',  flag: '🇫🇷', label: 'FR' },
]

interface ShippingForm {
  name: string; email: string; phone: string; postal: string
  prefecture: string; city: string; address1: string; address2: string
}

async function lookupPostalCode(zip: string) {
  const cleaned = zip.replace(/[^0-9]/g, '')
  if (cleaned.length !== 7) return null
  const res  = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleaned}`)
  const data = await res.json()
  return data.results?.[0] ?? null
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-border bg-background rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60 transition-shadow'

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { t } = useLang()
  const tc = t.checkout

  const DELIVERY_TIMES = [
    { value: '',      label: tc.deliveryTimeNone },
    { value: '9-12',  label: tc.deliveryTimeMorning },
    { value: '12-14', label: tc.deliveryTimeAfternoon1 },
    { value: '16-18', label: tc.deliveryTimeAfternoon2 },
    { value: '18-20', label: tc.deliveryTimeEvening },
    { value: '19-21', label: tc.deliveryTimeNight },
  ]

  const [shipping, setShipping] = useState<ShippingForm>({
    name: '', email: '', phone: '', postal: '',
    prefecture: '', city: '', address1: '', address2: '',
  })
  const [phoneCode, setPhoneCode]         = useState('+81')
  const [deliveryDate, setDeliveryDate]   = useState('')
  const [deliveryTime, setDeliveryTime]   = useState('')
  const [deliveryDateError, setDeliveryDateError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank'>('cod')
  const [postalLoading, setPostalLoading] = useState(false)
  const [postalError, setPostalError]     = useState('')
  const [emailError, setEmailError]       = useState('')
  const [phoneError, setPhoneError]       = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [orderId, setOrderId]             = useState<number | null>(null)
  const [finalTotal, setFinalTotal]       = useState(0)

  function validateEmail(v: string) {
    if (!v.trim()) return tc.errEmailRequired
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return tc.errEmailInvalid
    return ''
  }
  function validatePhone(v: string) {
    const d = v.replace(/[^0-9]/g, '')
    if (!v.trim()) return ''
    if (d.length < 7)  return tc.errPhoneShort
    if (d.length > 15) return tc.errPhoneLong
    return ''
  }

  useEffect(() => {
    let restored = false
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.phoneCode)    setPhoneCode(d.phoneCode)
        if (d.deliveryTime) setDeliveryTime(d.deliveryTime)
        if (d.deliveryDate) setDeliveryDate(d.deliveryDate)
        setShipping(s => ({
          ...s,
          name:       d.name       ?? '',
          email:      d.email      ?? '',
          phone:      d.phone      ?? '',
          postal:     d.postal     ?? '',
          prefecture: d.prefecture ?? '',
          city:       d.city       ?? '',
          address1:   d.address1   ?? '',
          address2:   d.address2   ?? '',
        }))
        restored = true
      }
    } catch {}

    if (!restored) {
      getSessionCustomer().then(info => {
        if (info) {
          setShipping(s => ({ ...s, name: info.name, email: info.email }))
        }
      })
    }
  }, [])

  function saveDraft(next: Partial<ShippingForm>, nextCode?: string, nextTime?: string, nextDate?: string) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        ...shipping, ...next,
        phoneCode:    nextCode  ?? phoneCode,
        deliveryTime: nextTime  ?? deliveryTime,
        deliveryDate: nextDate  ?? deliveryDate,
      }))
    } catch {}
  }

  function setS(field: keyof ShippingForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setShipping(s => {
        const next = { ...s, [field]: val }
        saveDraft(next)
        return next
      })
    }
  }

  const minDeliveryDays = REMOTE_PREFECTURES.includes(shipping.prefecture) ? 2 : 1
  const minDeliveryDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + minDeliveryDays); return d.toISOString().split('T')[0]
  })()
  const maxDeliveryDate = (() => {
    const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]
  })()

  const tax         = Math.round(subtotal * TAX_RATE)
  const isRemote    = REMOTE_PREFECTURES.includes(shipping.prefecture)
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (isRemote ? SHIPPING_FEE_REMOTE : SHIPPING_FEE)
  const codFee      = paymentMethod === 'cod' ? COD_FEE : 0
  const total       = subtotal + tax + shippingFee + codFee

  async function handlePostalLookup() {
    setPostalLoading(true); setPostalError('')
    const result = await lookupPostalCode(shipping.postal)
    setPostalLoading(false)
    if (result) {
      const next = { ...shipping, prefecture: result.address1 ?? '', city: result.address2 ?? '', address1: result.address3 ?? '' }
      setShipping(next); saveDraft(next)
    } else {
      setPostalError(tc.postalNotFound)
    }
  }

  function validateForm() {
    const eErr = validateEmail(shipping.email)
    const pErr = validatePhone(shipping.phone)
    setEmailError(eErr); setPhoneError(pErr)
    if (!shipping.name.trim())      { setError(tc.errName); return false }
    if (eErr)                        { setError(eErr); return false }
    if (pErr)                        { setError(pErr); return false }
    if (!shipping.postal.trim())     { setError(tc.errPostal); return false }
    if (!shipping.prefecture.trim()) { setError(tc.errPrefecture); return false }
    if (!shipping.address1.trim())   { setError(tc.errAddress1); return false }
    if (deliveryDate && deliveryDate < minDeliveryDate) {
      const isRemotePref = REMOTE_PREFECTURES.includes(shipping.prefecture)
      setError(isRemotePref ? tc.errDateRemote : tc.errDate)
      setDeliveryDateError(isRemotePref ? tc.errDateRemote : tc.errDate)
      return false
    }
    setDeliveryDateError(''); setError(''); return true
  }

  async function submitOrder() {
    if (!validateForm()) return
    setLoading(true)
    const fullPhone  = shipping.phone.trim() ? `${phoneCode} ${shipping.phone.trim()}` : ''
    const combined   = [deliveryDate, deliveryTime].filter(Boolean).join(' ')
    const result     = await placeOrder(items, {
      ...shipping, phone: fullPhone, paymentMethod, deliveryTime: combined || undefined,
    })
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setFinalTotal(total)
      try {
        localStorage.removeItem(LS_KEY)
      } catch {}
      setOrderId(result.orderId!); clearCart()
    }
  }

  /* ── Order complete ── */
  if (orderId) {
    return (
      <div className="min-h-screen px-4 py-12 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-primary/30">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground mb-2">{tc.thankYouTitle}</h1>
          <p className="text-muted-foreground text-sm">
            {tc.orderNumber} <span className="font-bold text-foreground">#{orderId}</span> · {shipping.name}
          </p>
        </div>

        {paymentMethod === 'bank' && (
          <div className="bg-card border border-border rounded-3xl p-6 mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground">{tc.bankTransferTitle}</h2>
            </div>

            {/* From Yucho Bank */}
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">{tc.bankYuchoTitle}</p>
              <div className="bg-background rounded-2xl border border-border overflow-hidden text-sm">
                {[
                  { label: tc.bankRowBankName,   value: 'ゆうちょ銀行' },
                  { label: tc.bankRowHolder,     value: tc.bankHolder },
                  { label: tc.bankRowAccountNum, value: tc.bankYuchoNumber },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between px-4 py-2.5 border-b border-border last:border-0">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="font-bold text-foreground font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* From Other Banks */}
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">{tc.bankOtherTitle}</p>
              <div className="bg-background rounded-2xl border border-border overflow-hidden text-sm">
                {[
                  { label: tc.bankRowBankName,   value: 'ゆうちょ銀行' },
                  { label: tc.bankRowHolder,     value: tc.bankHolder },
                  { label: tc.bankRowAccountNum, value: tc.bankOtherNumber },
                  { label: tc.bankRowBranchCode, value: tc.bankOtherBranch },
                  { label: '預金種別',            value: tc.bankOtherType },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between px-4 py-2.5 border-b border-border last:border-0">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="font-bold text-foreground font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fanpage note */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
              <p className="text-xs text-foreground leading-relaxed">{tc.bankFanpageNote}</p>
            </div>
          </div>
        )}

        {paymentMethod === 'cod' && (
          <div className="bg-card border border-border rounded-3xl p-5 mb-6 text-sm text-center">
            <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-semibold text-foreground">{tc.codPayTitle}</p>
            <p className="text-muted-foreground mt-1">{tc.codPayPre}<strong className="text-foreground">¥{finalTotal.toLocaleString()}</strong>{tc.codPayPost}</p>
            <p className="text-xs text-muted-foreground mt-1">{tc.codFeeIncludedPre}{COD_FEE}{tc.codFeeIncludedPost}</p>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl px-4 py-3 text-xs text-muted-foreground text-center mb-6">
          {tc.deliveryAddrLabel}{shipping.prefecture} {shipping.city}、{shipping.address1}{shipping.address2 ? `、${shipping.address2}` : ''}
          {deliveryDate && <><br />{tc.deliveryDateConfirmLabel}{new Date(deliveryDate + 'T00:00:00').toLocaleDateString(tc.dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}</>}
          {deliveryTime && <> {DELIVERY_TIMES.find(d => d.value === deliveryTime)?.label}</>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm text-center hover:bg-primary/90 transition-colors font-heading tracking-wider">
            {tc.continueShopping}
          </Link>
        </div>
      </div>
    )
  }

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl tracking-wider mb-2">{tc.emptyCart}</h1>
        <p className="text-muted-foreground text-sm mb-6">{tc.emptyCartDesc}</p>
        <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm font-heading tracking-wider hover:bg-primary/90 transition-colors">{tc.shopBtn}</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-36 md:pb-12">
      {/* Mobile header */}
      <div className="md:hidden sticky top-14 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-card border border-border">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-base font-bold font-heading tracking-wider">{tc.title}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-4">
        <Link href="/" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> {tc.backToShop}
        </Link>
        <h1 className="hidden md:block font-heading text-3xl tracking-wider">{tc.title}</h1>

        {/* ── Shipping info ── */}
        <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">{tc.shippingInfoSection}</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={tc.nameLabel} required>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder={tc.namePlaceholder} value={shipping.name} onChange={setS('name')} className={`${inputCls} pl-9`} />
                </div>
              </Field>
              <Field label={tc.emailLabel} required>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email" placeholder="you@example.com" value={shipping.email}
                    onChange={e => { setS('email')(e); setEmailError('') }}
                    onBlur={e => setEmailError(validateEmail(e.target.value))}
                    className={`${inputCls} pl-9 ${emailError ? 'border-destructive' : ''}`}
                  />
                </div>
                {emailError && <p className="text-xs text-destructive mt-1.5">{emailError}</p>}
              </Field>
            </div>

            <Field label={tc.phoneLabel}>
              <div className={`flex rounded-2xl border overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-shadow ${phoneError ? 'border-destructive' : 'border-border'}`}>
                <div className="relative flex-shrink-0">
                  <select value={phoneCode} onChange={e => { setPhoneCode(e.target.value); saveDraft(shipping, e.target.value) }}
                    className="h-full pl-3 pr-7 py-3 bg-muted/50 text-sm font-semibold focus:outline-none appearance-none cursor-pointer border-r border-border">
                    {DIAL_CODES.map(d => <option key={d.code} value={d.code}>{d.flag} {d.code}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel" placeholder={phoneCode === '+81' ? '090-0000-0000' : '000-000-0000'}
                    value={shipping.phone}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9\-\s]/g, '')
                      setShipping(s => { const n = { ...s, phone: raw }; saveDraft(n); return n })
                      setPhoneError('')
                    }}
                    onBlur={e => setPhoneError(validatePhone(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 text-sm bg-background focus:outline-none placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
              {phoneError && <p className="text-xs text-destructive mt-1.5">{phoneError}</p>}
            </Field>

            <Field label={tc.postalLabel} required>
              <div className="flex gap-2">
                <input type="text" placeholder="000-0000" maxLength={8} value={shipping.postal}
                  onChange={e => {
                    let v = e.target.value.replace(/[^0-9]/g, '')
                    if (v.length > 3) v = v.slice(0, 3) + '-' + v.slice(3, 7)
                    setShipping(s => { const n = { ...s, postal: v }; saveDraft(n); return n })
                    setPostalError('')
                  }}
                  className={`${inputCls} flex-1 font-mono tracking-widest`}
                />
                <button type="button" onClick={handlePostalLookup}
                  disabled={postalLoading || shipping.postal.replace(/[^0-9]/g, '').length !== 7}
                  className="flex items-center gap-1.5 px-4 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap">
                  {postalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {tc.autoFill}
                </button>
              </div>
              {postalError && <p className="text-xs text-destructive mt-1.5">{postalError}</p>}
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={tc.prefectureLabel} required>
                <input type="text" placeholder={tc.prefecturePlaceholder} value={shipping.prefecture} onChange={setS('prefecture')} className={inputCls} />
              </Field>
              <Field label={tc.cityLabel}>
                <input type="text" placeholder={tc.cityPlaceholder2} value={shipping.city} onChange={setS('city')} className={inputCls} />
              </Field>
            </div>
            <Field label={tc.address1Label} required>
              <input type="text" placeholder={tc.address1Placeholder} value={shipping.address1} onChange={setS('address1')} className={inputCls} />
            </Field>
            <Field label={tc.address2Label}>
              <input type="text" placeholder={tc.address2Placeholder} value={shipping.address2} onChange={setS('address2')} className={inputCls} />
            </Field>

            {/* Delivery date + timeslot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={tc.deliveryDateLabel}>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <input
                    type="date"
                    value={deliveryDate}
                    min={minDeliveryDate}
                    max={maxDeliveryDate}
                    onChange={e => {
                      const val = e.target.value
                      setDeliveryDate(val)
                      saveDraft(shipping, undefined, undefined, val)
                      if (val && val < minDeliveryDate) {
                        setDeliveryDateError(REMOTE_PREFECTURES.includes(shipping.prefecture)
                          ? tc.errDateRemote
                          : tc.errDate)
                      } else {
                        setDeliveryDateError('')
                      }
                    }}
                    className={`${inputCls} pl-9 cursor-pointer ${deliveryDateError ? 'border-destructive' : ''}`}
                  />
                </div>
                {deliveryDateError && <p className="text-xs text-destructive mt-1.5">{deliveryDateError}</p>}
                {!deliveryDateError && REMOTE_PREFECTURES.includes(shipping.prefecture) && shipping.prefecture && (
                  <p className="text-xs text-primary/80 mt-1.5">{tc.remoteNotePrefix}{shipping.prefecture}{tc.remoteNoteSuffix}</p>
                )}
              </Field>
              <Field label={tc.deliveryTimeLabel}>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <select value={deliveryTime}
                    onChange={e => { setDeliveryTime(e.target.value); saveDraft(shipping, undefined, e.target.value) }}
                    className={`${inputCls} pl-9 appearance-none cursor-pointer`}>
                    {DELIVERY_TIMES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </Field>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">{tc.deliveryNote}</p>
          </div>
        </div>

        {/* ── Payment method ── */}
        <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">{tc.paymentSection}</h2>
          </div>
          <div className="px-5 py-5 space-y-3">
            <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-0.5 accent-primary" />
              <div>
                <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">{tc.codLabel}</span></div>
                <p className="text-xs text-muted-foreground mt-0.5">{tc.codFeeDescPre}{COD_FEE}{tc.codFeeDescPost}</p>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
              <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="mt-0.5 accent-primary" />
              <div>
                <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">{tc.bankLabel}</span></div>
                <p className="text-xs text-muted-foreground mt-0.5">{tc.bankDesc}</p>
              </div>
            </label>
            {paymentMethod === 'bank' && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-primary mb-1">{tc.bankNoteTitle}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tc.bankNoteDesc}<br />
                  {tc.qtyLabel.trim() && ''}<span className="font-mono bg-background px-1 rounded border border-border">ORDER-123</span> {tc.bankNoteExample}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Order summary ── */}
        <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40">
            <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">{tc.orderSummary}</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-background border border-border overflow-hidden flex-shrink-0 relative">
                  {item.image_url
                    ? <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" sizes="48px" />
                    : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-muted-foreground" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tc.qtyLabel}{item.quantity}{tc.qtyTimes}¥{item.price.toLocaleString()}{tc.qtyExclTax}
                  </p>
                </div>
                <p className="text-sm font-bold flex-shrink-0 text-primary">¥{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Totals ── */}
        <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{tc.subtotalExclTax}</span><span className="font-medium">¥{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{tc.taxLabel10}</span><span className="font-medium">¥{tax.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {tc.shippingFeeLabel}
                {isRemote && shipping.prefecture && <span className="ml-1 text-xs text-primary/70">（{shipping.prefecture}）</span>}
              </span>
              {shippingFee === 0 ? <span className="font-medium text-primary">{tc.free}</span> : <span className="font-medium">¥{shippingFee.toLocaleString()}</span>}
            </div>
            {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-primary font-medium">{tc.freeShippingProgressPre}{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}{tc.freeShippingProgressPost}</p>
            )}
            {paymentMethod === 'cod' && (
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{tc.codFeeLabel}</span><span className="font-medium">¥{COD_FEE.toLocaleString()}</span></div>
            )}
            <div className="flex justify-between pt-2 border-t border-border/40">
              <span className="font-bold">{tc.totalInclTax}</span>
              <span className="font-black text-xl text-primary">¥{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-2xl px-4 py-3">{error}</div>
        )}

        {/* Desktop CTA */}
        <button onClick={submitOrder} disabled={loading}
          className="hidden md:flex w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 disabled:opacity-60 transition-all shadow-sm active:scale-[0.98] items-center justify-center gap-2 font-heading tracking-wider">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {tc.processingLabel}</> : `${tc.placeOrderWith}${total.toLocaleString()}`}
        </button>
        <p className="hidden md:block text-xs text-center text-muted-foreground">{tc.termsNote}</p>
      </div>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-16 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-3">
        {error && <p className="text-xs text-destructive mb-2 text-center line-clamp-1">{error}</p>}
        <button onClick={submitOrder} disabled={loading}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base disabled:opacity-60 shadow-lg active:scale-[0.97] transition-transform flex items-center justify-center gap-2 font-heading tracking-wider">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {tc.processingLabel}</> : `${tc.placeOrderWith}${total.toLocaleString()}`}
        </button>
        <p className="text-[10px] text-center text-muted-foreground mt-1.5">{tc.termsNote}</p>
      </div>
    </div>
  )
}
