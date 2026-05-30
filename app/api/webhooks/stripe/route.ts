// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/supabaseServer"
import Stripe from "stripe"
import { sendOrderEmails } from "@/lib/email/sendOrderEmails"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function decrementStock(stickerId: string, qty: number) {
  // Atomic update via RPC to avoid read-modify-write race conditions.
  // Requires this function in Supabase:
  //   CREATE OR REPLACE FUNCTION decrement_stock(p_sticker_id text, p_qty int)
  //   RETURNS void LANGUAGE sql AS $$
  //     UPDATE stickers SET stock = GREATEST(0, stock - p_qty) WHERE sid = p_sticker_id;
  //   $$;
  const { error } = await supabaseServer.rpc("decrement_stock", {
    p_sticker_id: stickerId,
    p_qty: qty,
  })
  if (error) {
    console.error(`Failed to decrement stock for ${stickerId}`, error.code)
  }
}


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
    console.error("Webhook signature verification failed.", err.message)
    return new NextResponse("Invalid webhook", { status: 400 })
  }

  // Only fulfill checkout sessions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price.product"],
      })

      const lineItems = checkoutSession.line_items?.data || []

      const { data: existing } = await supabaseServer
        .from("orders")
        .select("id")
        .eq("stripe_session_id", session.id)
        .single()

      if (existing) {
        console.log("⚠️ Order already fulfilled:", session.id)
        return NextResponse.json({ received: true })
      }

      // Save order in your database
      const { data: order, error } = await supabaseServer.from("orders").insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        items:
          lineItems.map(item => {
            let bundle_stickers = null
            if (item.metadata?.stickers_in_bundle) {
              try {
                const parsed = JSON.parse(item.metadata.stickers_in_bundle)
                if (Array.isArray(parsed)) bundle_stickers = parsed
              } catch {
                console.error("Malformed bundle_stickers JSON in Stripe metadata")
              }
            }
            return {
              name: item.description ?? "Unknown item",
              quantity: item.quantity,
              price: item.price?.unit_amount ?? 0,
              sticker_id: item.metadata?.sticker_id ?? null,
              is_bundle: item.metadata?.deal_applied === "true",
              bundle_stickers,
            }
          }),
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

      // update stock
      for (const item of order.items) {

        if (item.is_bundle && !item.bundle_stickers) {
          console.error("Bundle item missing bundle_stickers", item)
          continue
        }
        // Skip bundle line item
        if (item.is_bundle) {
          for (const s of item.bundle_stickers ?? []) {
            await decrementStock(s.id, s.quantity)
          }
          continue
        }

        // Normal sticker
        if (!item.sticker_id) continue

        await decrementStock(item.sticker_id, item.quantity)
      }


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
