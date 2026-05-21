'use server'

import { redirect } from 'next/navigation'
import { getCustomerSession } from '@/lib/session'

export async function customerLogout() {
  const session = await getCustomerSession()
  session.destroy()
  redirect('/')
}
