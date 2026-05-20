import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/session'

export async function POST() {
  const session = await getAdminSession()
  session.destroy()
  return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
