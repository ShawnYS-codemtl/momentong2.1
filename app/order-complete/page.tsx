"use client"

import { useBag } from "../context/BagContext"
import { useEffect } from "react";


export default function SuccessPage() {
    const { clearBag } = useBag();

    useEffect(() => {
      // Only clear cart after successful payment
      clearBag();
    }, []);

    return (
      <main className="px-8 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-4">Payment successful</h1>
        <p>Thank you for your order! 🎉</p>
      </main>
    )
  }
  