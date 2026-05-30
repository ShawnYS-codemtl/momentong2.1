"use client"

import { useEffect, useState } from "react"
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
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const cs = sessionStorage.getItem("stripe_cs")
    if (cs) {
      sessionStorage.removeItem("stripe_cs")
      setClientSecret(cs)
      setLoaded(true)
    }
  }, [])

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
