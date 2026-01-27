'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type StickerFormProps = {
    mode: "create" | "edit"
    initialData?: any   // sticker row from DB
  }

export default function StickerForm({mode, initialData}: StickerFormProps) {
    const supabase = createClient()
    const router = useRouter()
    const currentYear = new Date().getFullYear()

    const [collections, setCollections] = useState<{cid: string; location: string; slug: string}[]>([])
    const [loadingCollections, setLoadingCollections] = useState(true)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [price, setPrice] = useState(0)
    const [stock, setStock] = useState(0)
    const [memoryYear, setMemoryYear] = useState(currentYear)
    const [width, setWidth] = useState(300)
    const [height, setHeight] = useState(300)
    const [description, setDescription] = useState("")
    const [collectionId, setCollectionId] = useState<string | null>(null)
    const [newCollectionName, setNewCollectionName] = useState("")
    const [isAvailable, setIsAvailable] = useState(true)
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // load existing collections
    useEffect(() => {
        async function loadCollections() {
        const { data, error } = await supabase
            .from('collections')
            .select('cid, location, slug')
            .order('slug')

        if (error) {
            console.error(error)
            setError("Failed to load collections")
        } else {
            setCollections(data)
        }
        setLoadingCollections(false)
        }
        loadCollections()
    }, [])

    // Generate SVG preview URL
    useEffect(() => {
        if (!file) {
        setPreviewUrl(null)
        return
        }
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url) // cleanup
    }, [file])

    // initialize existing data when editing
    useEffect(() => {
        if (!initialData) return
      
        setTitle(initialData.title)
        setSlug(initialData.slug)
        setPrice(initialData.price)
        setStock(initialData.stock)
        setMemoryYear(initialData.memory_year)
        setWidth(initialData.width)
        setHeight(initialData.height)
        setDescription(initialData.description)
        setCollectionId(initialData.collection_id)
        setIsAvailable(initialData.is_available)
        setPreviewUrl(initialData.image_preview) // existing svg
      }, [initialData])

    // Generate slug automatically when title changes
    useEffect(() => {
        const generatedSlug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        setSlug(generatedSlug)
    }, [title])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)

        try {
            let chosenCollectionId = collectionId
      
            // If creating a new collection
            if (newCollectionName.trim()) {
              const slug = newCollectionName.toLowerCase().replace(/\s+/g, "-")
              const { data: newCol, error } = await supabase
                .from("collections")
                .insert({ location: newCollectionName, slug })
                .select("cid")
                .single()
      
              if (error) throw error
              chosenCollectionId = newCol.cid
            }
      
            if (!chosenCollectionId) throw new Error("Please select or create a collection")

            if (mode === "create" && (!title || !file)) {
                setError('Sticker name and SVG file are required')
                return
            }

            if (file && file.type !== 'image/svg+xml') {
                setError('Only SVG files are allowed')
                return
            }

            let storagePath = initialData?.imagePath

            // Upload SVG to storage
            if (mode === "create" && file) {
                storagePath = `collections/${collections.find(c => c.cid === chosenCollectionId)?.slug || newCollectionName}/${slug}.svg`
                const { error: uploadError } = await supabase.storage
                    .from("stickers")
                    .upload(storagePath, file, { contentType: 'image/svg+xml', upsert: true })

                if (uploadError) throw uploadError 
            }
            
            // Insert sticker record
            const stickerPayload = {
                title,
                slug,
                price,
                stock,
                memory_year: memoryYear,
                width,
                height,
                description,
                collection_id: chosenCollectionId,
                is_available: isAvailable,
                image_path: storagePath
            }

            if (mode === "create") {
                const { error } = await supabase.from("stickers").insert(stickerPayload)
                if (error) throw error
              } else {
                const { error } = await supabase
                  .from("stickers")
                  .update(stickerPayload)
                  .eq("sid", initialData.sid)
              
                if (error) throw error
              }

            router.push("/admin/stickers")
            } catch (err: any) {
                setError(err.message)
            } finally {
                setSubmitting(false)
            }
        }
            
    return (
        <main className="p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">
            {mode === "create" ? "Add New Sticker" : "Edit Sticker"}
            </h1>
    
          {error && <p className="text-red-600 mb-4">{error}</p>}
    
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="border w-full p-2"
                required
              />
            </div>
    
            <div>
                <div className='flex items-center space-x-4'>
                    <label className="block font-medium">Slug</label>
                    <p className="text-sm text-gray-500">
                        (Slug cannot be changed after creation.)
                    </p>
                </div>
                <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="border w-full p-2"
                    disabled={mode === "edit"}
                />
            </div>
    
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block font-medium">Price (cents)</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="border w-full p-2"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(Number(e.target.value))}
                  className="border w-full p-2"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
                <label className="font-medium">Available for sale</label>
                <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={e => setIsAvailable(e.target.checked)}
                />
            </div>
    
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block font-medium">Memory Year</label>
                <input
                  type="number"
                  value={memoryYear}
                  onChange={e => setMemoryYear(+e.target.value)}
                  className="border w-full p-2"
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                  className="border w-full p-2"
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  className="border w-full p-2"
                />
              </div>
            </div>
    
            <div>
              <label className="block font-medium">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="border w-full p-2"
              />
            </div>
    
            <div>
              <label className="block font-medium">Collection</label>
              {loadingCollections ? (
                <p>Loading...</p>
              ) : (
                <select
                  className="border w-full p-2"
                  value={collectionId ?? ""}
                  onChange={e => setCollectionId(e.target.value)}
                >
                  <option value="">Select a collection</option>
                  {collections.map(c => (
                    <option key={c.cid} value={c.cid}>{c.location}</option>
                  ))}
                </select>
              )}
              <div className="mt-2">
                <label className="block font-medium">Or create new collection</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  className="border w-full p-2"
                  placeholder="New collection name"
                />
              </div>
            </div>
    
            {mode === "create" && <div>
                <label className="block font-medium">SVG File</label>
                <input
                    type="file"
                    accept=".svg"
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                    className="border w-full p-2"
                    required
                />
                {previewUrl && (
                    <div className="mt-2 border p-2">
                    <p className="font-medium mb-1">Preview:</p>
                    <img src={previewUrl} alt="SVG preview" className="max-w-full h-auto" />
                    </div>
                )}
            </div>}

            {mode === "edit" && (
            <div>
                <label className="block font-medium">Sticker Image</label>

                {previewUrl && (
                <div className="mt-2 inline-block border p-2">
                    <img
                        src={previewUrl}
                        alt="Sticker preview"
                        className="w-auto h-auto"
                    />
                </div>
                )}

                <p className="text-sm text-gray-500 mt-2">
                Sticker images cannot be replaced after creation.
                </p>
            </div>
            )}
            
    
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 mt-4"
              disabled={submitting}
            >
              {submitting ? "Uploading..." : mode === "create" ? "Add Sticker" : "Edit Sticker"}
            </button>
          </form>
        </main>
      )
}
