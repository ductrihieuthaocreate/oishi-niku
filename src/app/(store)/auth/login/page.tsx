'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { customerLogin } from './actions'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

const inputCls = 'w-full border border-border bg-background rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60'

function LoginForm() {
  const params   = useSearchParams()
  const redirect = params.get('redirect') ?? '/account'
  const { t } = useLang()

  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const fd = new FormData(e.currentTarget)
    fd.set('redirect', redirect)
    try {
      const result = await customerLogin(fd)
      if (result?.error) setError(result.error)
    } catch {
      // redirect throws — success
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="bg-destructive/10 border border-destructive/25 text-destructive text-sm rounded-2xl px-4 py-3 mb-5">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
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
            {t.auth.passwordLabel}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input name="password" type={showPw ? 'text' : 'password'} required placeholder="••••••••" autoComplete="current-password" className={`${inputCls} pl-9 pr-12`} />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
          {loading
            ? t.auth.loggingIn
            : <><span>{t.auth.loginBtn}</span><ArrowRight className="w-4 h-4" /></>
          }
        </button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-6">
        {t.auth.noAccount}{' '}
        <Link href="/auth/register" className="text-primary font-semibold hover:underline">{t.auth.registerLink}</Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  const { t } = useLang()

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
            "プレミアム精肉を<br />あなたのもとへ。"
          </blockquote>
          <p className="text-white/70 text-sm">農場直送の高品質な冷凍精肉</p>
          <div className="mt-8 flex gap-3 flex-wrap">
            {['100+ 商品', '全国配送', 'HACCP認証'].map(tag => (
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
              {t.auth.loginTitle}
            </h1>
            <p className="text-muted-foreground text-sm">{t.auth.loginSubtitle}</p>
          </div>

          <Suspense fallback={<div className="text-center text-muted-foreground text-sm py-8">読み込み中…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
