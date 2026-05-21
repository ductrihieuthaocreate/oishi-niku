import Link from 'next/link'
import { Package, ArrowLeft } from 'lucide-react'
import { getCustomerSession } from '@/lib/session'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const statusLabel: Record<string, string> = {
  pending:    '受付中',
  confirmed:  '確認済み',
  processing: '準備中',
  shipped:    '発送済み',
  delivered:  '配達完了',
  cancelled:  'キャンセル',
}
const statusColor: Record<string, string> = {
  pending:    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  confirmed:  'bg-blue-500/10 text-blue-400 border-blue-400/20',
  processing: 'bg-primary/10 text-primary border-primary/20',
  shipped:    'bg-green-500/10 text-green-500 border-green-500/20',
  delivered:  'bg-green-600/10 text-green-600 border-green-600/20',
  cancelled:  'bg-muted text-muted-foreground border-border',
}
const payLabel: Record<string, string> = {
  cod:  '代金引換',
  bank: '銀行振込',
  card: 'カード',
}

export default async function OrdersPage() {
  const session = await getCustomerSession()

  const orders = await sql`
    SELECT
      o.id, o.total, o.status, o.created_at, o.payment_method,
      o.shipping_state, o.shipping_city, o.shipping_address,
      COUNT(oi.id)::int AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.shipping_email = ${session.customerEmail}
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT 50
  `

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account" className="w-9 h-9 flex items-center justify-center rounded-full bg-card border border-border hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-heading text-2xl tracking-wider text-foreground">注文履歴</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-3xl px-5 py-16 text-center shadow-sm">
          <Package className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">まだ注文がありません</p>
          <Link href="/products"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors font-heading tracking-wider">
            商品を見る
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm divide-y divide-border/40">
          {(orders as any[]).map(order => (
            <div key={order.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground">注文 #{order.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor[order.status] ?? statusColor.pending}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {new Date(order.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {' · '}
                    {order.item_count}点
                    {' · '}
                    {payLabel[order.payment_method] ?? order.payment_method}
                  </p>
                  {order.shipping_state && (
                    <p className="text-xs text-muted-foreground/70">
                      お届け先: {order.shipping_state} {order.shipping_city}
                    </p>
                  )}
                </div>
                <span className="font-black text-primary text-lg flex-shrink-0">
                  ¥{Number(order.total).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
