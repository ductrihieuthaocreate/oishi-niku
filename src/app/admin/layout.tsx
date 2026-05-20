import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { AdminShell } from '@/components/admin/admin-shell'

export const runtime = 'edge'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session.isAdmin) redirect('/auth/login?redirect=/admin')
  return <AdminShell>{children}</AdminShell>
}
