'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingBag, ClipboardList, X, User, Menu } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLang } from '@/lib/lang-context'
import { LanguageSwitcher } from '@/components/language-switcher'

interface NavbarProps {
  customer?: { name: string } | null
}

export function Navbar({ customer }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const { count, openCart } = useCart()
  const { t } = useLang()
  const router = useRouter()

  const navigation = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.shop, href: '/products' },
  ]

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQ.trim()
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
    setSearchOpen(false)
    setSearchQ('')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav
        className="max-w-7xl mx-auto px-6 lg:px-8 backdrop-blur-md rounded-xl animate-scale-fade-in bg-[rgba(255,255,255,0.5)] border border-[rgba(255,255,255,0.4)]"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.08) 0px 8px 40px' }}
      >
        <div className="flex items-center justify-between h-[68px]">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="lg:hidden p-2 text-foreground/70 hover:text-foreground go2go-transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop navigation - left */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm tracking-wide text-foreground/70 hover:text-foreground go2go-transition"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Logo — centered */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span
              className="font-serif text-3xl tracking-wider text-foreground"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Oishi Niku
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search - desktop */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="商品を検索…"
                  className="w-48 border border-border bg-background/80 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQ('') }}
                  className="p-2 text-foreground/70 hover:text-foreground go2go-transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden lg:block p-2 text-foreground/70 hover:text-foreground go2go-transition"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Account */}
            <Link
              href={customer ? '/account' : '/auth/login'}
              className="hidden lg:flex p-2 text-foreground/70 hover:text-foreground go2go-transition items-center"
              aria-label={customer ? 'My Account' : 'Login'}
            >
              {customer
                ? <span className="text-sm font-semibold">{customer.name.charAt(0).toUpperCase()}</span>
                : <User className="w-5 h-5" />
              }
            </Link>

            <LanguageSwitcher />

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-foreground/70 hover:text-foreground go2go-transition"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0 -right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-0 rounded-2xl bg-[rgba(255,255,255,0.95)] backdrop-blur-md border border-border/50 shadow-lg overflow-hidden">
          <nav className="flex flex-col p-3 gap-1">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-foreground/70 hover:text-foreground rounded-xl hover:bg-muted go2go-transition"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href={customer ? '/account' : '/auth/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium text-foreground/70 hover:text-foreground rounded-xl hover:bg-muted go2go-transition flex items-center gap-2"
            >
              {customer
                ? <><ClipboardList className="w-4 h-4" />{customer.name}</>
                : <><User className="w-4 h-4" />{t.auth.login}</>
              }
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
