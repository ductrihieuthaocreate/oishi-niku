import Link from 'next/link'
import { sql } from '@/lib/db'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  Package, ShoppingCart, DollarSign, AlertTriangle,
  ArrowRight, TrendingUp, Plus, Eye, BarChart3,
} from 'lucide-react'
import type { Order, Product } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

async function getDashboardData() {
  const [
    totalOrdersRes,
    pendingOrdersRes,
    totalProductsRes,
    lowStockRes,
    revenueData,
    recentOrders,
    lowStockProducts,
    topProducts,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM orders`,
    sql`SELECT COUNT(*)::int AS count FROM orders WHERE status = 'pending'`,
    sql`SELECT COUNT(*)::int AS count FROM products`,
    sql`SELECT COUNT(*)::int AS count FROM products WHERE stock <= 5 AND stock > 0`,
    sql`SELECT total::float8 AS total, created_at FROM orders WHERE status != 'cancelled'`,
    sql`
      SELECT o.id, o.status, o.total::float8 AS total, o.created_at,
        o.shipping_name, o.shipping_email, o.tracking_number,
        COALESCE(json_agg(json_build_object('product_name', oi.product_name, 'quantity', oi.quantity, 'unit_price', oi.unit_price::float8))
          FILTER (WHERE oi.id IS NOT NULL), '[]') AS order_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `,
    sql`SELECT id, name, stock, price::float8 AS price, image_url FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 5`,
    sql`SELECT id, name, price::float8 AS price, sales_count, image_url, stock FROM products ORDER BY sales_count DESC LIMIT 5`,
  ])

  const totalRevenue = (revenueData as any[]).reduce((s, o) => s + (o.total ?? 0), 0)

  const now = new Date()
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dayStr = d.toISOString().split('T')[0]
    const amount = (revenueData as any[])
      .filter(o => o.created_at?.toString().startsWith(dayStr))
      .reduce((s, o) => s + (o.total ?? 0), 0)
    return { label, amount }
  })

  const weekMax = Math.max(...weekData.map(d => d.amount), 1)

  return {
    totalOrders: totalOrdersRes[0].count as number,
    pendingOrders: pendingOrdersRes[0].count as number,
    totalProducts: totalProductsRes[0].count as number,
    lowStockCount: lowStockRes[0].count as number,
    totalRevenue,
    recentOrders: recentOrders as unknown as Order[],
    lowStockProducts: lowStockProducts as unknown as Product[],
    topProducts: topProducts as unknown as Product[],
    weekData,
    weekMax,
  }
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  shipped: 'bg-primary/10 text-primary border-primary/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(data.totalRevenue),
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      sub: 'All time',
    },
    {
      label: 'Total Orders',
      value: data.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      sub: `${data.pendingOrders} pending`,
    },
    {
      label: 'Products',
      value: data.totalProducts,
      icon: Package,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      sub: 'In catalog',
    },
    {
      label: 'Low Stock',
      value: data.lowStockCount,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      sub: 'â‰¤ 5 units left',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">DASHBOARD</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:text-foreground hover:bg-secondary transition-all"
          >
            <Eye className="w-4 h-4" /> Preview Store
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> New Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`bg-card border ${s.border} rounded-xl p-4 lg:p-5`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className={`text-2xl lg:text-3xl font-bold ${s.color} mb-0.5`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h2 className="font-heading tracking-wider text-foreground">REVENUE â€" LAST 7 DAYS</h2>
            </div>
            <span className="text-xs text-muted-foreground">Daily totals</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {data.weekData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full relative flex items-end" style={{ height: '96px' }}>
                  <div
                    className="w-full rounded-t-md bg-primary/20 hover:bg-primary/40 transition-colors relative group"
                    style={{ height: `${Math.max((d.amount / data.weekMax) * 96, d.amount > 0 ? 4 : 2)}px` }}
                  >
                    {d.amount > 0 && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border border-border rounded px-1.5 py-0.5 text-[10px] text-foreground whitespace-nowrap z-10">
                        {formatPrice(d.amount)}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-heading tracking-wider text-foreground">TOP SELLERS</h2>
          </div>
          <div className="space-y-3">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No sales yet</p>
            ) : (
              data.topProducts.map((p, i) => (
                <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center gap-3 group">
                  <span className="text-xs font-bold text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                  <div className="w-8 h-8 rounded-md bg-secondary flex-shrink-0 overflow-hidden">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">IMG</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sales_count} sold</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-heading tracking-wider text-foreground">RECENT ORDERS</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-primary hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.recentOrders.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No orders yet</div>
            ) : (
              data.recentOrders.map(order => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-muted-foreground">#{order.id}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.shipping_name || 'Customer'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${STATUS_COLORS[order.status] ?? 'bg-secondary text-muted-foreground border-border'}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold text-primary">{formatPrice(order.total)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <h2 className="font-heading tracking-wider text-foreground">LOW STOCK</h2>
            </div>
            <Link href="/admin/products" className="text-xs text-primary hover:underline">Manage</Link>
          </div>
          <div className="divide-y divide-border">
            {data.lowStockProducts.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">All stocked up</div>
            ) : (
              data.lowStockProducts.map(p => (
                <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors">
                  <p className="text-sm text-foreground truncate flex-1 mr-3">{p.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
