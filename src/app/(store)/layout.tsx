import { CartProvider } from '@/lib/cart-context'
import { LangProvider } from '@/lib/lang-context'
import { getLang, dict } from '@/lib/lang'
import { getCustomerSession } from '@/lib/session'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { Logo } from '@/components/logo'
import { LanguageSwitcher } from '@/components/language-switcher'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()
  const t = dict[lang]
  const session = await getCustomerSession()
  const customer = session.customerId ? { name: session.customerName ?? '' } : null

  return (
    <LangProvider lang={lang}>
      <CartProvider>
        {/* Desktop navbar */}
        <div className="hidden md:block">
          <Navbar customer={customer} />
        </div>

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 bg-[rgba(255,255,255,0.6)] backdrop-blur-md border-b border-border/40 shadow-sm">
          <div className="flex items-center justify-between px-5 h-14">
            <a href="/">
              <Logo size="sm" />
            </a>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-0 md:pt-[88px]">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-card mt-20">
          <div className="max-w-7xl mx-auto px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <a href="/" className="inline-block mb-4">
                <Logo size="lg" />
              </a>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
                {t.footer.tagline}
              </p>
              <div className="flex gap-2 flex-wrap">
                {t.footer.tags.map(tag => (
                  <span key={tag} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Shopping */}
            <div>
              <h4
                className="font-serif text-lg tracking-wide text-foreground mb-4"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                {t.footer.shop}
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/products" className="hover:text-foreground go2go-transition">{t.footer.allProducts}</a></li>
                <li><a href="/products?sort=popular" className="hover:text-foreground go2go-transition">{t.footer.wagyu}</a></li>
                <li><a href="/products?category=pork" className="hover:text-foreground go2go-transition">{t.footer.pork}</a></li>
                <li><a href="/account/orders" className="hover:text-foreground go2go-transition">{t.account.orderHistory}</a></li>
              </ul>
            </div>

            {/* Account + support */}
            <div>
              <h4
                className="font-serif text-lg tracking-wide text-foreground mb-4"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                {t.footer.support}
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground mb-6">
                <li><a href="/auth/login" className="hover:text-foreground go2go-transition">{t.auth.login}</a></li>
                <li><a href="/account" className="hover:text-foreground go2go-transition">{t.account.orderHistory}</a></li>
              </ul>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground go2go-transition">{t.footer.shipping}</a></li>
                <li><a href="#" className="hover:text-foreground go2go-transition">{t.footer.returns}</a></li>
                <li><a href="#" className="hover:text-foreground go2go-transition">{t.footer.privacy}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50">
            <div className="max-w-7xl mx-auto px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Oishi Niku. All rights reserved.</p>
              <p className="text-xs text-muted-foreground">{t.footer.tagline2}</p>
            </div>
          </div>
        </footer>

        <CartDrawer />
        <MobileNav />
      </CartProvider>
    </LangProvider>
  )
}
