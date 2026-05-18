'use server'

import { sql } from '@/lib/db'
import { sendOrderNotification, sendCustomerConfirmation } from '@/lib/email'
import type { CartItem } from '@/lib/cart-context'

export interface ShippingDetails {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postal: string
  country: string
  paymentMethod: 'card' | 'cod' | 'bank'
  notes?: string
}

const SHIPPING_FEE = 1500
const FREE_SHIPPING_THRESHOLD = 10000
const TAX_RATE = 0.10

export async function placeOrder(items: CartItem[], shipping: ShippingDetails) {
  if (!items.length) return { error: 'Your cart is empty.' }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2))
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = parseFloat((subtotal + tax + shippingFee).toFixed(2))

  try {
    const [order] = await sql`
      INSERT INTO orders (
        total, subtotal, shipping_fee, tax, status,
        shipping_name, shipping_email, shipping_phone,
        shipping_address, shipping_city, shipping_state,
        shipping_postal, shipping_country, payment_method, notes
      ) VALUES (
        ${total}, ${subtotal}, ${shippingFee}, ${tax}, 'pending',
        ${shipping.name}, ${shipping.email}, ${shipping.phone || null},
        ${shipping.address}, ${shipping.city}, ${shipping.state},
        ${shipping.postal}, ${shipping.country}, ${shipping.paymentMethod},
        ${shipping.notes ?? null}
      )
      RETURNING id
    `

    if (!order) return { error: 'Failed to create order.' }

    const orderId = (order as any).id

    await sql`
      INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
      SELECT
        ${orderId},
        unnest(${items.map(i => i.id)}::int[]),
        unnest(${items.map(i => i.name)}::text[]),
        unnest(${items.map(i => i.quantity)}::int[]),
        unnest(${items.map(i => i.price)}::numeric[])
    `

    for (const item of items) {
      await sql`UPDATE products SET sales_count = sales_count + ${item.quantity} WHERE id = ${item.id}`
    }

    const emailItems = items.map(i => ({ name: i.name, quantity: i.quantity, unit_price: i.price }))

    await Promise.allSettled([
      sendOrderNotification({
        id: orderId,
        total,
        shipping_name: shipping.name,
        shipping_email: shipping.email,
        shipping_phone: shipping.phone,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_postal: shipping.postal,
        payment_method: shipping.paymentMethod,
        items: emailItems,
      }),
      sendCustomerConfirmation({
        id: orderId,
        total,
        shipping_name: shipping.name,
        shipping_email: shipping.email,
        payment_method: shipping.paymentMethod,
        items: emailItems,
      }),
    ])

    return { success: true, orderId }
  } catch (e: any) {
    return { error: e.message ?? 'Something went wrong.' }
  }
}
