import { CartProvider } from '@/lib/cart-context'
import { PillNav } from '@/components/layout/pill-nav'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'

const navItems = [
  { label: 'ホーム', href: '/' },
  { label: 'ショップ', href: '/products' },
]

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <PillNav items={navItems} />
      <main className="min-h-screen pt-20 bg-background">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  )
}
