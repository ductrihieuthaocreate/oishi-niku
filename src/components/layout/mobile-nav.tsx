'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingBag, User } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLang } from '@/lib/lang-context'

export function MobileNav() {
  const pathname = usePathname()
  const { count, openCart } = useCart()
  const { t } = useLang()

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/60 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4 h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <div className={`w-10 h-6 flex items-center justify-center rounded-full transition-all ${pathname === '/' ? 'bg-primary/10' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">{t.nav.home}</span>
        </Link>

        <Link
          href="/products"
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${pathname === '/products' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <div className={`w-10 h-6 flex items-center justify-center rounded-full transition-all ${pathname === '/products' ? 'bg-primary/10' : ''}`}>
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">{t.nav.shop}</span>
        </Link>

        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 text-muted-foreground hover:text-foreground relative"
        >
          <div className="w-10 h-6 flex items-center justify-center rounded-full relative">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">{t.nav.cartLabel}</span>
        </button>

        <Link
          href="/account"
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${pathname.startsWith('/account') || pathname.startsWith('/auth') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <div className={`w-10 h-6 flex items-center justify-center rounded-full transition-all ${(pathname.startsWith('/account') || pathname.startsWith('/auth')) ? 'bg-primary/10' : ''}`}>
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">{t.nav.accountLabel}</span>
        </Link>
      </div>
    </nav>
  )
}
