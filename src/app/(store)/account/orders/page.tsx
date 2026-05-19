import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function OrdersPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
      <h1 className="font-heading text-4xl tracking-wider text-foreground mb-4">注文の追跡</h1>
      <p className="text-muted-foreground mb-8">
        注文状況を確認するには、注文番号とご注文時に使用したメールアドレスをお知らせの上、お問い合わせください。
      </p>
      <div className="flex flex-col gap-3">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="mailto:nguyenductri.happy@gmail.com">サポートに連絡する</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">ショッピングを続ける</Link>
        </Button>
      </div>
    </div>
  )
}
