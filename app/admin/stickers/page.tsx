"use client"

import { useState, useEffect } from "react"
import type { Sticker } from "@/types/sticker"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminStickersPage() {
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchStickers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/stickers")
      if (!res.ok) throw new Error("Failed to fetch stickers")
      const data = await res.json()
      setStickers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (sid: string) => {
    if (!confirm("Are you sure you want to delete this sticker?")) return

    try {
      const res = await fetch(`/api/admin/stickers/${sid}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete sticker")
      fetchStickers() // refresh list
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchStickers()
  }, [])

  if (loading) return <p className="p-8">Loading stickers...</p>

  return (
    <>
        <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Stickers</h1>
                <Link
                href="/admin/stickers/new"
                className="inline-block bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
                >
                Add Sticker
                </Link>
            </div>
            
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Image</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Title</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Collection</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Price</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Stock</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Available</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {stickers.map((sticker) => (
                    <tr key={sticker.sid} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                        <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded border">
                            <img 
                            src={sticker.image_path} 
                            alt={sticker.title} 
                            className="h-14 w-14 object-contain"
                            />
                        </div>
                        </td>
                        <td className="py-4 px-4 font-medium">{sticker.title}</td>
                        <td className="py-4 px-4 text-gray-600">{sticker.collection_name}</td>
                        <td className="py-4 px-4 text-gray-900">${(sticker.price / 100).toFixed(2)}</td>
                        <td className="py-4 px-4 text-gray-900">{sticker.stock}</td>
                        <td className="py-4 px-4 text-gray-900">{sticker.is_available ? 'Yes' : 'No'}</td>
                        <td className="py-4 px-4">
                        <button
                            onClick={() => handleDelete(sticker.sid)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                        <Link
                          href={`/admin/stickers/${sticker.sid}/edit`}
                          className="bg-blue-600 text-white px-4 py-[10px] rounded hover:bg-blue-700 transition-colors ml-1"
                        >
                          Edit
                        </Link>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
    </>
  )
}
