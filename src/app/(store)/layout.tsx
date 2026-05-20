import { CartProvider } from '@/lib/cart-context'
import { LangProvider } from '@/lib/lang-context'
import { getLang, dict } from '@/lib/lang'
import { PillNav } from '@/components/layout/pill-nav'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()
  const t = dict[lang]
  const navItems = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.shop, href: '/products' },
  ]

  return (
    <LangProvider lang={lang}>
      <CartProvider>
        <PillNav items={navItems} />
        <main className="min-h-screen pt-20 bg-background">{children}</main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    </LangProvider>
  )
}
