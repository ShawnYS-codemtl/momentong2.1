// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/supabaseServer"
import Stripe from "stripe"
import { sendOrderEmails } from "@/lib/email/sendOrderEmails"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function decrementStock(stickerId: string, qty: number) {
    const { data: sticker, error} = await supabaseServer
    .from("stickers")
    .select("stock")
    .eq("sid", stickerId)
    .single()

    if (error || !sticker) {
      console.error(`Failed to fetch sticker stock for ${stickerId}`, error)
      return
    }

    await supabaseServer
      .from("stickers")
      .update({ stock: Math.max(0, sticker.stock - qty) })
      .eq("sid", stickerId)
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
    console.error("⚠️ Webhook signature verification failed.", err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
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
          lineItems.map(item => ({
            name: item.description ?? "Unknown item",
            quantity: item.quantity,
            price: item.price?.unit_amount ?? 0,
            sticker_id: item.metadata?.sticker_id ?? null,
            is_bundle: item.metadata?.deal_applied === "true",
            bundle_stickers: item.metadata?.stickers_in_bundle
              ? JSON.parse(item.metadata.stickers_in_bundle)
              : null,
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
        // Use the item name to find the sticker, or ideally store the sticker ID in your items
        // const { data: sticker, error: fetchError } = await supabaseServer
        //   .from("stickers")
        //   .select("stock")
        //   .eq("sid", item.sticker_id)
        //   .single()
        
        // if (fetchError || !sticker) {
        //   console.error(`Failed to fetch stock for ${item.name}`, fetchError)
        //   continue
        // }
        
        // const newStock = Math.max(0, sticker.stock - item.quantity) // prevent negative
        
        // const { error: stockError } = await supabaseServer
        //   .from("stickers")
        //   .update({ stock: newStock })
        //   .eq("sid", item.sticker_id)
        
        // if (stockError) {
        //   console.error(`Failed to update stock for ${item.name}:`, stockError)
        // }
      

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
