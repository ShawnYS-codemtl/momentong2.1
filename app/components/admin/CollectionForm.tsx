"use client"

import { createCollection, updateCollection } from "@/app/admin/collections/actions"
import { useTransition, useEffect, useState } from "react"
import { slugify } from "@/lib/utils/slugify"

type Props = {
  mode: "create" | "edit"
  initialData?: {
    cid: string
    slug: string
    location: string
    theme?: string
    favorite_label?: string
    description?: string
  }
}

export default function CollectionForm({ mode, initialData }: Props) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(initialData?.location ?? "")
  const [slug, setSlug] = useState(initialData?.slug ?? "")

  function onSubmit(formData: FormData) {
    startTransition(() => {
      if (mode === "create") {
        createCollection(formData)
      } else {
        updateCollection(initialData!.cid, formData)
      }
    })
  }

  useEffect(() => {
    if (mode === "create") {
      setSlug(slugify(name))
    }
  }, [name, mode])

  return (
    <form action={onSubmit} className="space-y-4 max-w-lg">
        <div>
            <label className="block font-medium">Collection Name</label>
            <input
                name="name"
                placeholder="ex: Toronto"
                defaultValue={initialData?.location}
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="border w-full p-2"
            />
        </div>

        {/* Slug preview */}
        <div>
            <label className="block font-medium mb-1">
                Slug
            </label>
 
            <input
            value={slug}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            />

            <p className="text-xs text-gray-500 mt-1">
            URL: /collections/{slug || "your-collection"}
            </p>
        </div>

        <div>
            <label className="block font-medium">Theme</label>
            <input
                name="theme"
                placeholder="ex: PhD"
                defaultValue={initialData?.theme}
                className="border w-full p-2"
            />
      </div>

      <div>
              <label className="block font-medium">Description</label>
              <textarea
                name="description"
                defaultValue={initialData?.description}
                className="border w-full p-2"
              />
            </div>

        <div>
            <label className="block font-medium">Favourite Sticker</label>
            <input
                name="favorite_label"
                placeholder="ex: Dance Club"
                defaultValue={initialData?.favorite_label}
                className="border w-full p-2"
            />
        </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white px-4 py-2 mt-4"
      >
        {mode === "create" ? "Create Collection" : "Save Changes"}
      </button>
    </form>
  )
}
