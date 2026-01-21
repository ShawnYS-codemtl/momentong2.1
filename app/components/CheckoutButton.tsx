"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"
import { useBag } from "../context/BagContext";

export default function CheckoutButton() {
  const { items, clearBag } = useBag();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (items.length === 0) return
    setLoading(true);
    setError(null);

    const cartItems = items.map(item => ({
        id: item.productId,
        quantity: item.quantity
    }))

    try {
        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: cartItems }),
        })

        if (!res.ok) {
            throw new Error("Failed to create checkout session");
        }

      const data = await res.json();
      const clientSecret = data.clientSecret

      clearBag()

      router.push(`/checkout?cs=${clientSecret}`)

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold mb-3 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Preparing checkout…" : "Checkout"}
      </button>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </>
  );
}
