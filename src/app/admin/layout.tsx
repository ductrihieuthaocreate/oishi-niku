import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  if (!session.isAdmin) redirect('/admin/login')
  return <AdminShell>{children}</AdminShell>
}
