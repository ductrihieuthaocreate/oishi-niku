'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import { sendShippingNotification, sendPaymentConfirmation } from '@/lib/email'

export async function updateOrderStatus(orderId: number, formData: FormData) {
  const status = formData.get('status') as string
  const trackingNumber = (formData.get('tracking_number') as string) || null

  try {
    await sql`
      UPDATE orders SET status = ${status}, tracking_number = ${trackingNumber}
      WHERE id = ${orderId}
    `
  } catch (e: any) {
    return { error: e.message }
  }

  if (status === 'shipped' && trackingNumber) {
    const orders = await sql`SELECT shipping_email, shipping_name FROM orders WHERE id = ${orderId}`
    const order = orders[0] as any
    if (order?.shipping_email) {
      await sendShippingNotification({
        orderId,
        customerEmail: order.shipping_email,
        customerName: order.shipping_name ?? 'Customer',
        trackingNumber,
      }).catch(() => {})
    }
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
  redirect(`/admin/orders/${orderId}`)
}

export async function confirmPayment(orderId: number) {
  const orders = await sql`
    SELECT shipping_email, shipping_name, total::float8 AS total
    FROM orders WHERE id = ${orderId}
  `
  const o = orders[0] as any
  if (!o) return { error: 'Order not found' }

  await sql`UPDATE orders SET status = 'confirmed' WHERE id = ${orderId}`

  await sendPaymentConfirmation({
    orderId,
    customerEmail: o.shipping_email,
    customerName: o.shipping_name ?? 'Customer',
    total: o.total,
  }).catch(() => {})

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
  redirect(`/admin/orders/${orderId}`)
}

export async function deleteOrder(orderId: number) {
  try {
    await sql`DELETE FROM order_items WHERE order_id = ${orderId}`
    await sql`DELETE FROM orders WHERE id = ${orderId}`
  } catch (e: any) {
    return { error: e.message }
  }
  revalidatePath('/admin/orders')
  redirect('/admin/orders')
}
