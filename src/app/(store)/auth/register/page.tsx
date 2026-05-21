'use client'

import { useState } from 'react'
import Link from 'next/link'
import { customerRegister } from './actions'
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

const inputCls = 'w-full border border-border bg-background rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60 transition-shadow'

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
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-heading text-4xl tracking-wider text-foreground mb-1">{t.auth.registerTitle}</h1>
          <p className="text-muted-foreground text-sm">{t.auth.registerSubtitle}</p>
        </div>

        <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                {t.auth.nameLabel} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="name" type="text" required placeholder={t.auth.namePlaceholder} autoComplete="name" className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                {t.auth.emailLabel} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="email" type="email" required placeholder="you@example.com" autoComplete="email" className={`${inputCls} pl-9`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                {t.auth.pwLabel} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="password" type={showPw ? 'text' : 'password'} required placeholder={t.auth.pwPlaceholder} autoComplete="new-password" className={`${inputCls} pl-9 pr-11`} />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                {t.auth.confirmPwLabel} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="confirm" type={showConfirm ? 'text' : 'password'} required placeholder={t.auth.confirmPwPlaceholder} autoComplete="new-password" className={`${inputCls} pl-9 pr-11`} />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-2xl px-4 py-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:bg-primary/90 disabled:opacity-60 transition-all active:scale-[0.98] font-heading tracking-wider mt-2">
              <UserPlus className="w-5 h-5" />
              {loading ? t.auth.registering : t.auth.registerBtn}
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
