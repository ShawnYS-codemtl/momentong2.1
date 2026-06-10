"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeleteOrderButton({ orderId, redirectTo }: { orderId: string; redirectTo?: string }) {
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
            // From the detail page, navigate to the list (the order no longer
            // exists). From the list page, just refresh to drop the deleted row.
            if (redirectTo) router.push(redirectTo)
            else router.refresh()
        } catch {
            setError("Failed to delete order. Please try again.")
        } finally {
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
