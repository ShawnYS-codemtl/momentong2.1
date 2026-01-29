import { Suspense } from "react"
import CheckoutClient from "./CheckoutClient"

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="text-center mt-24">Loading checkout…</p>}>
      <CheckoutClient />
    </Suspense>
  )
}
