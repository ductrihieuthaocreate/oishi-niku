'use client'

import { useState } from 'react'
import Link from 'next/link'
import { customerRegister } from './actions'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

const inputCls = 'w-full border border-border bg-background rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60'

export default function RegisterPage() {
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const { t } = useLang()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const result = await customerRegister(new FormData(e.currentTarget))
      if (result?.error) setError(result.error)
    } catch {
      // redirect throws — success
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[90vh] flex items-stretch">
      {/* Left decorative panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/80 to-accent/70 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-2xl" />
        </div>
        <Link href="/" className="relative">
          <span
            className="text-white font-serif text-4xl tracking-wider"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Oishi Niku
          </span>
        </Link>
        <div className="relative">
          <blockquote
            className="text-white font-serif text-3xl font-semibold leading-snug mb-4 italic"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            "新鮮・高品質な精肉を<br />毎日お届けします。"
          </blockquote>
          <p className="text-white/70 text-sm">会員登録して特別価格でお買い物</p>
          <div className="mt-8 flex gap-3 flex-wrap">
            {['会員限定価格', '注文履歴管理', '簡単再注文'].map(tag => (
              <span key={tag} className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-sm">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center mb-8">
            <span
              className="font-serif text-2xl tracking-wider text-foreground"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Oishi Niku
            </span>
          </Link>

          <div className="mb-8">
            <h1
              className="font-serif text-3xl text-foreground mb-1"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {t.auth.registerTitle}
            </h1>
            <p className="text-muted-foreground text-sm">{t.auth.registerSubtitle}</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/25 text-destructive text-sm rounded-2xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {t.auth.nameLabel}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="name" type="text" required placeholder={t.auth.namePlaceholder} autoComplete="name" className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {t.auth.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="email" type="email" required placeholder="you@example.com" autoComplete="email" className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {t.auth.pwLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="password" type={showPw ? 'text' : 'password'} required placeholder={t.auth.pwPlaceholder} autoComplete="new-password" className={`${inputCls} pl-9 pr-12`} />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {t.auth.confirmPwLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="confirm" type={showConfirm ? 'text' : 'password'} required placeholder={t.auth.confirmPwPlaceholder} autoComplete="new-password" className={`${inputCls} pl-9 pr-12`} />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              {loading
                ? t.auth.registering
                : <><span>{t.auth.registerBtn}</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              {t.auth.hasAccount}{' '}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">{t.auth.loginLink}</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
