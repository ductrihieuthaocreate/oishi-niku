import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'

export default function OrdersPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
      <h1 className="font-heading text-4xl tracking-wider text-foreground mb-4">TRACK YOUR ORDER</h1>
      <p className="text-muted-foreground mb-8">
        To check your order status, please contact us with your order number and the email address used at checkout.
      </p>
      <div className="flex flex-col gap-3">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="mailto:nguyenductri.happy@gmail.com">Contact Support</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  )
}
