'use server'

import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/session'

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const session = await getAdminSession()
    session.isAdmin = true
    await session.save()
    redirect('/admin')
  }

  return { error: 'Invalid credentials' }
}
