'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { getCustomerSession } from '@/lib/session'

export async function customerLogin(formData: FormData) {
  const email    = (formData.get('email') as string).toLowerCase().trim()
  const password = formData.get('password') as string
  const to       = (formData.get('redirect') as string) || '/account'

  const rows = await sql`SELECT id, name, email, password_hash FROM customers WHERE email = ${email} LIMIT 1`
  const customer = rows[0] as any

  if (!customer || !await bcrypt.compare(password, customer.password_hash)) {
    return { error: 'メールアドレスまたはパスワードが正しくありません。' }
  }

  const session = await getCustomerSession()
  session.customerId    = customer.id
  session.customerName  = customer.name
  session.customerEmail = customer.email
  await session.save()

  redirect(to)
}
