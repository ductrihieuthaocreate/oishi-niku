import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import { getLang, dict } from '@/lib/lang'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const lang = await getLang()
  const t = dict[lang].orders

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
      <h1 className="font-heading text-4xl tracking-wider text-foreground mb-4">{t.title}</h1>
      <p className="text-muted-foreground mb-8">{t.desc}</p>
      <div className="flex flex-col gap-3">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="mailto:nguyenductri.happy@gmail.com">{t.contact}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">{t.continueShopping}</Link>
        </Button>
      </div>
    </div>
  )
}
