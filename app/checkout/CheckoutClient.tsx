"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import Breadcrumb from "../components/Breadcrumb"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function CheckoutClient() {
  const searchParams = useSearchParams()
  const clientSecret = searchParams.get("cs")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (clientSecret) setLoaded(true)
  }, [clientSecret])

  if (!loaded || !clientSecret) {
    return <p className="text-center mt-24">Loading checkout…</p>
  }

  return (
    <main>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shopping Bag", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </main>
  )
}
