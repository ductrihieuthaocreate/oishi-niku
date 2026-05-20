import { sql } from '@/lib/db'
import {
  Settings, Database, Mail, Globe, ShieldCheck,
  CheckCircle, XCircle, ImageIcon,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

async function checkConnections() {
  let dbOk = false
  let productCount = 0
  let orderCount = 0
  let categoryCount = 0

  try {
    const [p, o, c] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM products`,
      sql`SELECT COUNT(*)::int AS count FROM orders`,
      sql`SELECT COUNT(*)::int AS count FROM categories`,
    ])
    dbOk = true
    productCount = (p[0] as any).count
    orderCount = (o[0] as any).count
    categoryCount = (c[0] as any).count
  } catch {}

  const cloudinaryOk = !!process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder'
  const resendOk = !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder'

  return { dbOk, productCount, orderCount, categoryCount, cloudinaryOk, resendOk }
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${ok ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
      {ok
        ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
        : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
      }
      <span className={`text-sm font-medium ${ok ? 'text-green-400' : 'text-red-400'}`}>{label}</span>
    </div>
  )
}

export default async function AdminSettingsPage() {
  const { dbOk, productCount, orderCount, categoryCount, cloudinaryOk, resendOk } = await checkConnections()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-3xl tracking-wider text-foreground">SETTINGS</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System status and configuration</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h2 className="font-heading tracking-wider text-foreground">SERVICE STATUS</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <StatusBadge ok={dbOk} label="Neon Database" />
          <StatusBadge ok={cloudinaryOk} label="Cloudinary Images" />
          <StatusBadge ok={resendOk} label="Resend Emails" />
        </div>
        {(!cloudinaryOk || !resendOk) && (
          <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
            Some services show placeholder keys. Edit <code className="text-primary">.env.local</code> to activate them.
          </p>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-primary" />
          <h2 className="font-heading tracking-wider text-foreground">DATABASE</h2>
        </div>
        {dbOk ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Products', count: productCount },
              { label: 'Orders', count: orderCount },
              { label: 'Categories', count: categoryCount },
            ].map(s => (
              <div key={s.label} className="text-center bg-secondary/40 rounded-lg py-3">
                <p className="text-2xl font-bold text-primary">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-red-400">Cannot reach database. Check DATABASE_URL in .env.local</p>
        )}
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>Provider: <span className="text-foreground font-mono">Neon (PostgreSQL)</span></p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-primary" />
          <h2 className="font-heading tracking-wider text-foreground">EMAIL NOTIFICATIONS</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Order confirmation and shipping notifications sent via Resend.
        </p>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>Admin email: <span className="text-foreground font-mono">{process.env.ADMIN_EMAIL || 'â€"'}</span></p>
          <p>Status: <span className={resendOk ? 'text-green-400' : 'text-yellow-400'}>{resendOk ? 'Configured' : 'Needs RESEND_API_KEY in .env.local'}</span></p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="font-heading tracking-wider text-foreground">SITE CONFIG</h2>
        </div>
        <div className="space-y-2">
          {[
            { key: 'ADMIN_EMAIL', value: process.env.ADMIN_EMAIL },
            { key: 'NEXT_PUBLIC_SITE_URL', value: process.env.NEXT_PUBLIC_SITE_URL },
            { key: 'CLOUDINARY_CLOUD_NAME', value: process.env.CLOUDINARY_CLOUD_NAME },
          ].map(v => (
            <div key={v.key} className="flex items-center justify-between text-xs py-2 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground font-mono">{v.key}</span>
              <span className="text-foreground font-mono truncate max-w-[260px] text-right">{v.value || 'â€"'}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          Edit <code className="text-primary">.env.local</code> and restart the dev server to apply changes.
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h2 className="font-heading tracking-wider text-primary">SETUP CHECKLIST</h2>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className={`flex items-start gap-2 ${dbOk ? 'text-green-400' : ''}`}>
            {dbOk ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />}
            <span>Neon â€" run <code className="text-primary">database/schema.sql</code> in the Neon SQL editor and set <code className="text-primary">DATABASE_URL</code></span>
          </li>
          <li className={`flex items-start gap-2 ${cloudinaryOk ? 'text-green-400' : ''}`}>
            {cloudinaryOk ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-400" />}
            <span>Cloudinary â€" create account, copy credentials into <code className="text-primary">.env.local</code></span>
          </li>
          <li className={`flex items-start gap-2 ${resendOk ? 'text-green-400' : ''}`}>
            {resendOk ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-400" />}
            <span>Resend â€" create account at resend.com, copy API key into <code className="text-primary">.env.local</code></span>
          </li>
        </ul>
      </div>
    </div>
  )
}
