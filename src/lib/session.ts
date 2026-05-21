import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface AdminSession {
  isAdmin?: boolean
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'oishi_admin',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
}

export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), sessionOptions)
}

export interface CustomerSession {
  customerId?: number
  customerName?: string
  customerEmail?: string
}

const customerSessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'oishi_customer',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}

export async function getCustomerSession() {
  return getIronSession<CustomerSession>(await cookies(), customerSessionOptions)
}
