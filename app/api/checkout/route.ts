import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStickerById } from "@/lib/data/stickers";

type CartItem = {
    id: string;        // the unique sticker id
    quantity: number;  // how many the user wants
  }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { items } = await req.json(); // [{ id, quantity }]

  // Compute subtotal safely on server
  const line_items = await Promise.all(
    items.map(async (item: CartItem) => {
      const sticker = await getStickerById(item.id)
  
      return {
        price_data: {
          currency: "cad",
          product_data: { name: sticker.title },
          unit_amount: sticker.price, // from server
        },
        quantity: item.quantity,
      }
    })
  )

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    line_items,
    payment_method_types: ["card"],
    shipping_address_collection: {
        allowed_countries: ["CA", "US"], // adjust to your target countries
    },
    billing_address_collection: "auto",
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-complete?session_id={CHECKOUT_SESSION_ID}`,
  });

  return NextResponse.json({
    clientSecret: session.client_secret,
  });
}
