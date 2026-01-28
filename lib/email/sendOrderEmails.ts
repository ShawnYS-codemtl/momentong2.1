import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendOrderEmails(order: {
  id: string
  customer_email: string | null
  customer_name?: string | null
  items: any[]
  amount_total: number
  shipping_address: any
}) {
  const fromEmail = process.env.RESEND_FROM_EMAIL!
  // Customer email
  if (order.customer_email) {
    await resend.emails.send({
      from: `Momento.ng <${fromEmail}>`,
      to: order.customer_email,
      subject: "Your order has been received",
      html: `
        <h2>Thanks for your order!</h2>
        <p>Order ID: ${order.id}</p>
        <p>Total: $${(order.amount_total / 100).toFixed(2)}</p>
        <p>We’ll email you when it ships.</p>
      `,
    })
  }

  // Admin email
  await resend.emails.send({
    from: `Momento.ng <${fromEmail}>`,
    to: fromEmail,
    subject: `New order ${order.id}`,
    html: `
      <h2>New Order</h2>
      <p><strong>ID:</strong> ${order.id}</p>
      <p><strong>Email:</strong> ${order.customer_email}</p>
      <pre>${JSON.stringify(order.shipping_address, null, 2)}</pre>
    `,
  })
}
