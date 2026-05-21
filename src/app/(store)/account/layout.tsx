import { redirect } from 'next/navigation'
import { getCustomerSession } from '@/lib/session'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getCustomerSession()
  if (!session.customerId) redirect('/auth/login?redirect=/account')
  return <>{children}</>
}
