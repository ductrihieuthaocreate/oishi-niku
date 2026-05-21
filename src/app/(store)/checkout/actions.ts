'use server'

import { sql } from '@/lib/db'
import { sendOrderNotification, sendCustomerConfirmation } from '@/lib/email'
import type { CartItem } from '@/lib/cart-context'

export interface ShippingDetails {
  name: string
  email: string
  phone: string
  postal: string
  prefecture: string
  city: string
  address1: string
  address2: string
  paymentMethod: 'cod' | 'bank'
  deliveryTime?: string
}

const COD_FEE                 = 390
const SHIPPING_FEE            = 1000
const SHIPPING_FEE_REMOTE     = 1500
const FREE_SHIPPING_THRESHOLD = 15000
const TAX_RATE                = 0.1
const REMOTE_PREFECTURES      = ['北海道', '沖縄県']

export async function placeOrder(items: CartItem[], shipping: ShippingDetails) {
  if (!items.length) return { error: 'カートが空です。' }

  const subtotal    = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax         = Math.round(subtotal * TAX_RATE)
  const isRemote    = REMOTE_PREFECTURES.includes(shipping.prefecture)
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (isRemote ? SHIPPING_FEE_REMOTE : SHIPPING_FEE)
  const codFee      = shipping.paymentMethod === 'cod' ? COD_FEE : 0
  const total       = subtotal + tax + shippingFee + codFee

  const fullAddress = [shipping.address1, shipping.address2].filter(Boolean).join(' ')

  try {
    const [order] = await sql`
      INSERT INTO orders (
        total, subtotal, shipping_fee, tax, status,
        shipping_name, shipping_email, shipping_phone,
        shipping_address, shipping_city, shipping_state,
        shipping_postal, shipping_country, payment_method, notes
      ) VALUES (
        ${total}, ${subtotal}, ${shippingFee + codFee}, ${tax}, 'pending',
        ${shipping.name}, ${shipping.email}, ${shipping.phone || null},
        ${fullAddress}, ${shipping.city}, ${shipping.prefecture},
        ${shipping.postal}, 'JP', ${shipping.paymentMethod},
        ${shipping.deliveryTime ?? null}
      )
      RETURNING id
    `

    if (!order) return { error: '注文の作成に失敗しました。' }

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
        shipping_name:    shipping.name,
        shipping_email:   shipping.email,
        shipping_phone:   shipping.phone,
        shipping_address: fullAddress,
        shipping_city:    shipping.city,
        shipping_state:   shipping.prefecture,
        shipping_postal:  shipping.postal,
        payment_method:   shipping.paymentMethod,
        items: emailItems,
      }),
      sendCustomerConfirmation({
        id: orderId,
        total,
        shipping_name:  shipping.name,
        shipping_email: shipping.email,
        payment_method: shipping.paymentMethod,
        items: emailItems,
      }),
    ])

    return { success: true, orderId }
  } catch (e: any) {
    return { error: e.message ?? '注文処理中にエラーが発生しました。' }
  }
}
