import Link from 'next/link'
import { Package, LogOut, ChevronRight, Mail } from 'lucide-react'
import { getCustomerSession } from '@/lib/session'
import { getLang, dict } from '@/lib/lang'
import { sql } from '@/lib/db'
import { customerLogout } from './actions'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await getCustomerSession()
  const lang = await getLang()
  const t = dict[lang].account

  const orderRows = await sql`
    SELECT id, total, status, created_at, payment_method
    FROM orders
    WHERE shipping_email = ${session.customerEmail}
    ORDER BY created_at DESC
    LIMIT 5
  `

  const initials = (session.customerName ?? '?')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const statusColor: Record<string, string> = {
    pending:    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmed:  'bg-blue-500/10 text-blue-400 border-blue-400/20',
    processing: 'bg-primary/10 text-primary border-primary/20',
    shipped:    'bg-green-500/10 text-green-500 border-green-500/20',
    delivered:  'bg-green-600/10 text-green-600 border-green-600/20',
    cancelled:  'bg-muted text-muted-foreground border-border',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      {/* Profile card */}
      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="font-heading text-xl text-primary font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-2xl tracking-wider text-foreground truncate">{session.customerName}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {session.customerEmail}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-border/40 flex gap-3">
          <Link href="/account/orders"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-sm font-semibold hover:bg-primary/20 transition-colors">
            <Package className="w-4 h-4" />
            {t.orderHistory}
          </Link>
          <form action={customerLogout} className="flex-1">
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-muted text-muted-foreground border border-border rounded-2xl text-sm font-semibold hover:bg-accent hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
          </form>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            {t.recentOrders}
          </h2>
          <Link href="/account/orders" className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
            {t.viewAll} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orderRows.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t.noOrders}</p>
            <Link href="/products" className="inline-block mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl text-sm font-bold hover:bg-primary/90 transition-colors">
              {t.shopNow}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {(orderRows as any[]).map(order => (
              <div key={order.id} className="px-5 py-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-foreground">{t.orderPrefix}{order.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor[order.status] ?? statusColor.pending}`}>
                      {t.statusLabels[order.status as keyof typeof t.statusLabels] ?? order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString(t.dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className="font-bold text-primary text-sm flex-shrink-0">¥{Number(order.total).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
