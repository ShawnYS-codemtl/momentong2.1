// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/supabaseServer"
import Stripe from "stripe"
import { sendOrderEmails } from "@/lib/email/sendOrderEmails"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const buf = await req.arrayBuffer()          // raw body
  const payload = Buffer.from(buf) // convert to Node Buffer
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed.", err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Only fulfill checkout sessions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      })

      const lineItems = checkoutSession.line_items?.data || []

      // Save order in your database
      const { data: order, error } = await supabaseServer.from("orders").insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        items: 
          lineItems.map(item => ({
            name: item.description,
            quantity: item.quantity,
            price: item.price?.unit_amount
          })
        ),
        amount_total: session.amount_total,
        shipping_address: session.customer_details?.address,
        status: "paid"
      })
      .select()
      .single()

      if (error || !order) {
        console.error("Failed to save order:", error)
        return new NextResponse("Database error", { status: 500 })
      }

      console.log("✅ Order saved successfully:", order.id)

      // Send emails after successful insert
      if (order.status === "paid") {
        await sendOrderEmails({
          id: order.id,
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          items: order.items,
          amount_total: order.amount_total,
          shipping_address: order.shipping_address,
        })
      }
      
    } catch (err) {
      console.error("Error fulfilling order:", err)
      return new NextResponse("Fulfillment error", { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
