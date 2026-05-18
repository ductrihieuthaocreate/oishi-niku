import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice, formatDate } from '@/lib/utils'
import { updateOrderStatus } from './actions'
import type { Order } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_OPTS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params

  const orders = await sql`
    SELECT o.*,
      o.total::float8 AS total,
      o.subtotal::float8 AS subtotal,
      o.shipping_fee::float8 AS shipping_fee,
      o.tax::float8 AS tax,
      COALESCE(
        json_agg(json_build_object(
          'id', oi.id,
          'order_id', oi.order_id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price::float8
        )) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS order_items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ${parseInt(id)}
    GROUP BY o.id
  `

  if (!orders[0]) notFound()

  const o = orders[0] as unknown as Order
  const updateAction = updateOrderStatus.bind(null, o.id)

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl tracking-wider text-foreground mb-8">ORDER #{o.id}</h1>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading tracking-wider text-foreground mb-4 text-sm uppercase">Customer</h3>
          <p className="text-foreground font-medium">{o.shipping_name}</p>
          <p className="text-muted-foreground text-sm">{o.shipping_email}</p>
          <p className="text-muted-foreground text-sm">{o.shipping_phone}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading tracking-wider text-foreground mb-4 text-sm uppercase">Shipping Address</h3>
          <p className="text-muted-foreground text-sm">{o.shipping_address}</p>
          <p className="text-muted-foreground text-sm">{o.shipping_city}, {o.shipping_state} {o.shipping_postal}</p>
          <p className="text-muted-foreground text-sm">{o.shipping_country}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading tracking-wider text-foreground mb-4 text-sm uppercase">Payment</h3>
          <p className="text-foreground capitalize">{o.payment_method}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatDate(o.created_at)}</p>
        </div>

        {o.notes && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-heading tracking-wider text-foreground mb-4 text-sm uppercase">Notes</h3>
            <p className="text-muted-foreground text-sm">{o.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h3 className="font-heading tracking-wider text-foreground mb-4 text-sm uppercase">Items</h3>
        <div className="space-y-3">
          {(o.order_items ?? []).map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="font-medium text-sm">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-medium text-primary">{formatPrice(item.unit_price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(o.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{o.shipping_fee === 0 ? 'FREE' : formatPrice(o.shipping_fee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatPrice(o.tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">{formatPrice(o.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading tracking-wider text-foreground mb-4 text-sm uppercase">Update Order Status</h3>
        <form action={updateAction} className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={o.status}
              className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STATUS_OPTS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="tracking_number">Tracking Number</Label>
            <Input
              id="tracking_number"
              name="tracking_number"
              defaultValue={o.tracking_number ?? ''}
              className="mt-1.5"
              placeholder="e.g. 1Z999AA10123456784"
            />
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Update Order
          </Button>
        </form>
      </div>
    </div>
  )
}
