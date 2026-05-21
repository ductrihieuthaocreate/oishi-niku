'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { getCustomerSession } from '@/lib/session'

export async function customerRegister(formData: FormData) {
  const name     = (formData.get('name') as string).trim()
  const email    = (formData.get('email') as string).toLowerCase().trim()
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm') as string

  if (!name)                  return { error: 'お名前を入力してください。' }
  if (password !== confirm)   return { error: 'パスワードが一致しません。' }
  if (password.length < 8)    return { error: 'パスワードは8文字以上で設定してください。' }

  const existing = await sql`SELECT id FROM customers WHERE email = ${email} LIMIT 1`
  if (existing.length > 0) return { error: 'このメールアドレスは既に登録されています。' }

  const hash = await bcrypt.hash(password, 12)
  const rows = await sql`
    INSERT INTO customers (name, email, password_hash)
    VALUES (${name}, ${email}, ${hash})
    RETURNING id, name, email
  `
  const customer = rows[0] as any

  const session = await getCustomerSession()
  session.customerId    = customer.id
  session.customerName  = customer.name
  session.customerEmail = customer.email
  await session.save()

  redirect('/account')
}
