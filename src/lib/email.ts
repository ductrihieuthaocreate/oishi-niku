import { Resend } from 'resend'

let _resend: Resend | undefined
function getResend() {
  return (_resend ??= new Resend(process.env.RESEND_API_KEY))
}
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@oishi-niku.com'
const FROM_EMAIL = 'Oishi Niku <noreply@oishi-niku.com>'

interface EmailItem {
  name: string
  quantity: number
  unit_price: number
}

interface OrderEmailData {
  id: number
  total: number
  shipping_name: string
  shipping_email: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_state?: string
  shipping_postal?: string
  payment_method: string
  items: EmailItem[]
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function itemsTable(items: EmailItem[]) {
  return items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #222;">${i.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #222;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #222;text-align:right;">${formatPrice(i.unit_price * i.quantity)}</td>
    </tr>`).join('')
}

export async function sendOrderNotification(order: OrderEmailData) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Order #${order.id} — ${order.shipping_name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#F5F5F5;padding:32px;border-radius:12px;">
        <h1 style="color:#FF5C35;font-size:28px;margin-bottom:8px;">New Order #${order.id}</h1>
        <p style="color:#888;">A new order has been placed.</p>
        <hr style="border-color:#222;margin:24px 0;"/>
        <h3 style="color:#FF5C35;">Customer</h3>
        <p>${order.shipping_name}<br/>${order.shipping_email}<br/>${order.shipping_phone ?? ''}</p>
        <h3 style="color:#FF5C35;">Shipping Address</h3>
        <p>${order.shipping_address ?? ''}<br/>${order.shipping_city ?? ''}, ${order.shipping_state ?? ''} ${order.shipping_postal ?? ''}</p>
        <h3 style="color:#FF5C35;">Payment Method</h3>
        <p>${order.payment_method}</p>
        <h3 style="color:#FF5C35;">Items</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="color:#888;font-size:12px;text-transform:uppercase;">
              <th style="text-align:left;padding-bottom:8px;">Product</th>
              <th style="text-align:center;padding-bottom:8px;">Qty</th>
              <th style="text-align:right;padding-bottom:8px;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsTable(order.items)}</tbody>
        </table>
        <div style="margin-top:16px;text-align:right;">
          <strong style="color:#FF5C35;font-size:20px;">Total: ${formatPrice(order.total)}</strong>
        </div>
      </div>`,
  })
}

export async function sendCustomerConfirmation(order: OrderEmailData) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: order.shipping_email,
    subject: `Order Confirmed — #${order.id}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#F5F5F5;padding:32px;border-radius:12px;">
        <h1 style="color:#FF5C35;font-size:28px;margin-bottom:8px;">Thank you, ${order.shipping_name}!</h1>
        <p style="color:#888;">Your order #${order.id} has been received and is being prepared.</p>
        <hr style="border-color:#222;margin:24px 0;"/>
        <h3 style="color:#FF5C35;">Order Summary</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="color:#888;font-size:12px;text-transform:uppercase;">
              <th style="text-align:left;padding-bottom:8px;">Product</th>
              <th style="text-align:center;padding-bottom:8px;">Qty</th>
              <th style="text-align:right;padding-bottom:8px;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsTable(order.items)}</tbody>
        </table>
        <div style="margin-top:16px;text-align:right;">
          <strong style="color:#FF5C35;font-size:20px;">Total: ${formatPrice(order.total)}</strong>
        </div>
        <hr style="border-color:#222;margin:24px 0;"/>
        <p style="color:#888;font-size:14px;">We'll send you another email when your order ships. For questions, reply to this email.</p>
        <p style="color:#FF5C35;font-size:16px;font-weight:bold;">Oishi Niku — Premium Meat</p>
      </div>`,
  })
}

export async function sendShippingNotification(data: {
  orderId: number
  customerEmail: string
  customerName: string
  trackingNumber: string
}) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject: `Your Order #${data.orderId} Has Shipped!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#F5F5F5;padding:32px;border-radius:12px;">
        <h1 style="color:#FF5C35;font-size:28px;margin-bottom:8px;">Your order is on its way!</h1>
        <p>Hi ${data.customerName}, order #${data.orderId} has shipped.</p>
        <div style="background:#1A1A1A;border:1px solid #FF5C35;border-radius:8px;padding:16px;margin:24px 0;text-align:center;">
          <p style="color:#888;margin:0 0 4px;">Tracking Number</p>
          <p style="color:#FF5C35;font-size:20px;font-weight:bold;margin:0;">${data.trackingNumber}</p>
        </div>
        <p style="color:#888;font-size:14px;">Thank you for choosing Oishi Niku!</p>
      </div>`,
  })
}
