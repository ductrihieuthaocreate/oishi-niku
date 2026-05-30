import Link from 'next/link'
import { sql } from '@/lib/db'
import { formatPrice, formatDate } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'
import type { Order } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>
}

const STATUS_TABS = [
  { label: 'All',        value: '' },
  { label: 'Pending',    value: 'pending' },
  { label: 'Confirmed',  value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped',    value: 'shipped' },
  { label: 'Delivered',  value: 'delivered' },
  { label: 'Cancelled',  value: 'cancelled' },
]

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  shipped:    'bg-primary/10 text-primary border-primary/20',
  delivered:  'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled:  'bg-red-500/10 text-red-400 border-red-500/20',
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams

  const qParams: any[] = []
  const conditions: string[] = []

  if (params.status) {
    qParams.push(params.status)
    conditions.push(`o.status = $${qParams.length}`)
  }
  if (params.q) {
    const search = `%${params.q}%`
    qParams.push(search, search, `%${params.q}%`)
    const n = qParams.length
    conditions.push(`(o.shipping_name ILIKE $${n - 2} OR o.shipping_email ILIKE $${n - 1} OR o.id::text LIKE $${n})`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const ordersQuery = `
    SELECT o.id, o.status, o.total::float8 AS total, o.tracking_number,
      o.shipping_name, o.shipping_email, o.created_at,
      COUNT(oi.id)::int AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ${whereClause}
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `

  const [ordersRes, statusCounts] = await Promise.all([
    sql.query(ordersQuery, qParams),
    sql`SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status`,
  ])
  const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes.rows ?? [])

  const counts: Record<string, number> = {}
  for (const row of statusCounts as any[]) counts[row.status] = row.count
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const mappedOrders = (orders as any[]).map(o => ({
    ...o,
    order_items: Array.from({ length: o.item_count }),
  })) as unknown as Order[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">ORDERS</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{orders.length} results</p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map(tab => {
          const isActive = (params.status ?? '') === tab.value
          const count = tab.value === '' ? total : (counts[tab.value] ?? 0)
          const url = tab.value
            ? `/admin/orders?status=${tab.value}${params.q ? `&q=${params.q}` : ''}`
            : `/admin/orders${params.q ? `?q=${params.q}` : ''}`
          return (
            <Link
              key={tab.value}
              href={url}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isActive
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary/20' : 'bg-secondary'}`}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <form method="GET" className="flex gap-2">
        {params.status && <input type="hidden" name="status" value={params.status} />}
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search by order ID, customer name or email..."
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button type="submit" className="px-4 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground hover:bg-secondary/80 transition-colors">
          Search
        </button>
        {params.q && (
          <Link
            href={params.status ? `/admin/orders?status=${params.status}` : '/admin/orders'}
            className="px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Items</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mappedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No orders found</p>
                  </td>
                </tr>
              ) : (
                mappedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-mono font-semibold text-foreground text-sm">#{order.id}</p>
                      {order.tracking_number && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">Track: {order.tracking_number}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-foreground">{order.shipping_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping_email}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <p className="text-sm text-muted-foreground">{order.order_items?.length ?? 0} item(s)</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${STATUS_COLORS[order.status] ?? 'bg-secondary text-muted-foreground border-border'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-primary text-sm">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium border border-primary/20 px-2.5 py-1 rounded-md hover:bg-primary/5 transition-all"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
