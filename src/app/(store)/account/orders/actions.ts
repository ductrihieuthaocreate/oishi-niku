'use server'

import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'

export async function cancelOrder(orderId: number) {
  const orders = await sql`SELECT id, status FROM orders WHERE id = ${orderId}`
  const order = orders[0] as any

  if (!order) return { error: 'Order not found' }
  if (order.status !== 'pending') return { error: 'Only pending orders can be cancelled' }

  try {
    await sql`UPDATE orders SET status = 'cancelled' WHERE id = ${orderId}`
  } catch (e: any) {
    return { error: e.message }
  }

  revalidatePath('/account/orders')
  return { success: true }
}
