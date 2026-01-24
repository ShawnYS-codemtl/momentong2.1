import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

interface OrderShippedEmailInput {
  customer_email: string
  customer_name?: string | null
  order_id: string
}

export async function sendOrderShippedEmail({
  customer_email,
  customer_name,
  order_id,
}: OrderShippedEmailInput) {
  await resend.emails.send({
    from: "Momento <orders@momento.ng>",
    to: customer_email,
    subject: "Your order has shipped 🎉",
    html: `
      <p>Hi ${customer_name ?? "there"},</p>
      <p>Your order <strong>#${order_id.slice(0, 8)}</strong> has been shipped.</p>
      <p>You should receive it soon.</p>
      <p>Thank you for supporting Momentong.</p>
    `,
  })
}

