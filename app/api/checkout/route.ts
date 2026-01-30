import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStickerById } from "@/lib/data/stickers";

type CartItem = {
    id: string;        // the unique sticker id
    quantity: number;  // how many the user wants
  }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { items } = await req.json(); // [{ id, quantity, stock, is_available }]

    // Fetch stickers and validate stock
    const stickersData = await Promise.all(
      items.map(async (item: CartItem) => {
        const sticker = await getStickerById(item.id);
        if (!sticker.is_available || sticker.stock < item.quantity) {
          throw new Error(`Item "${sticker.title}" is unavailable or out of stock.`);
        }
        return { ...sticker, quantity: item.quantity };
      })
    );
  
    // Total quantity of stickers in the cart
    const totalQuantity = stickersData.reduce((sum, s) => sum + s.quantity, 0);
  
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  
    if (totalQuantity >= 5) {
      // Apply 5-for-20 deal
      line_items.push({
        price_data: {
          currency: "cad",
          product_data: { name: "5-Sticker Bundle Deal", description: "Any 5 stickers for $20" },
          unit_amount: 2000, // $20 for the bundle
        },
        quantity: 1,
        metadata: {
          deal_applied: "true",
          stickers_in_bundle: JSON.stringify(
            stickersData
              .map(s => ({ id: s.sid, quantity: s.quantity }))
              .slice(0, 5)
          ),
        },
      });
  
      // Add remaining stickers beyond first 5 at normal price
      let remaining = totalQuantity - 5;
      for (const s of stickersData) {
        if (remaining <= 0) break;
        const qty = Math.min(s.quantity, remaining);
        line_items.push({
          price_data: {
            currency: "cad",
            product_data: { name: s.title },
            unit_amount: s.price,
          },
          quantity: qty,
          metadata: { sticker_id: s.sid, deal_applied: "false" },
        });
        remaining -= qty;
      }
    } else {
      // Fewer than 5 stickers → normal price
      for (const s of stickersData) {
        line_items.push({
          price_data: {
            currency: "cad",
            product_data: { name: s.title },
            unit_amount: s.price,
          },
          quantity: s.quantity,
          metadata: { sticker_id: s.sid, deal_applied: "false" },
        });
      }
    }

  // // Compute subtotal safely on server
  // const line_items = await Promise.all(
  //   items.map(async (item: CartItem) => {
  //     const sticker = await getStickerById(item.id)

  //     if (!sticker.is_available || sticker.stock < item.quantity) {
  //       throw new Error(`Item "${sticker.title}" is unavailable or does not have enough stock.`)
  //     }
  
  //     return {
  //       price_data: {
  //         currency: "cad",
  //         product_data: { name: sticker.title },
  //         unit_amount: sticker.price, // from server
  //       },
  //       quantity: item.quantity,
  //       metadata: { sticker_id: sticker.sid }
  //     }
  //   })
  // )

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    line_items,
    payment_method_types: ["card"],
    shipping_address_collection: {
        allowed_countries: ["CA", "US"], // adjust to your target countries
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 199, currency: "cad" }, // $1.99 flat
          display_name: "Canada Post Lettermail (No tracking)",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      }
    ],
    billing_address_collection: "auto",
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-complete?session_id={CHECKOUT_SESSION_ID}`,
  });

  return NextResponse.json({
    clientSecret: session.client_secret,
  });
}
