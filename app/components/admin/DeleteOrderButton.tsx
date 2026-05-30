"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (!window.confirm("Delete this order? This cannot be undone.")) return
        setDeleting(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete order")
            router.push("/admin/orders")
            router.refresh()
        } catch {
            setError("Failed to delete order. Please try again.")
            setDeleting(false)
        }
    }

    return (
        <div>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50 text-sm"
            >
                {deleting ? "Deleting…" : "Delete"}
            </button>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    )
}
