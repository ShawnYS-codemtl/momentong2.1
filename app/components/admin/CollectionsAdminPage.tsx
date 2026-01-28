'use client'

import Link from "next/link"
import { deleteCollection } from "@/app/admin/collections/actions"

type Collection = {
  cid: string
  location: string
  theme: string
  favorite_label: string
  description: string
}

type Props = {
  collections: Collection[]
}

export default function CollectionsAdminPage({ collections }: Props) {
  return (
    <div className="p-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold mb-6">Collections</h1>
            <Link
                href="/admin/collections/new"
                className="mb-4 inline-block bg-green-600 text-white px-4 py-2 hover:bg-green-700 rounded-md"
                >
                New Collection
            </Link>
        </div>

        {/* Header */}
        <div className="
            grid grid-cols-5
            gap-4
            px-4 py-2
            text-sm font-semibold text-gray-500
            border-b
        ">
            <div>Name</div>
            <div>Theme</div>
            <div>Favourite</div>
            <div>Description</div>
            <div className="">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y">
            {collections.map((collection) => (
            <div
                key={collection.cid}
                className="
                grid grid-cols-5
                gap-4
                px-4 py-3
                items-center
                hover:bg-gray-50
                transition
                "
            >
                {/* Name */}
                <div className="font-medium">
                    {collection.location}
                </div>

                {/* Theme */}
                <div className="text-gray-700">
                    {collection.theme}
                </div>

                {/* Favourite label */}
                <div className="text-gray-700">
                    {collection.favorite_label}
                </div>

                {/* Description */}
                <div className="text-gray-700">
                    {collection.description}
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-2">
                <Link
                    href={`/admin/collections/${collection.cid}/edit`}
                    className="
                    px-3 py-1.5
                    text-sm
                    rounded-md
                    bg-blue-600 text-white
                    hover:bg-blue-700
                    "
                >
                    Edit
                </Link>

                <button
                    onClick={async () => {
                        if (!confirm("Delete this collection?")) return
                        await deleteCollection(collection.cid)}}
                    className="
                    px-3 py-1.5
                    text-sm
                    rounded-md
                    bg-red-600 text-white
                    hover:bg-red-700
                    "
                >
                    Delete
                </button>
                </div>
            </div>
            ))}
        </div>
    </div>
  )
}