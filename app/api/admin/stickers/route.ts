import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStickerUrl } from "@/lib/data/stickers"

interface StickerWithCollection {
    sid: string
    title: string
    price: number
    image_path: string
    collection_id: string
    stickers_collection_fk: {location: string}
    stock: number
    is_available: boolean
}

export async function GET(req: NextRequest) {

    const supabase = await createClient()

    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Check if admin
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
    if (!profile?.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Fetch stickers
    const { data: stickers, error } = await supabase
        .from("stickers")
        .select(`
        sid,
        title,
        price,
        image_path,
        collection_id,
        stickers_collection_fk!inner(location),
        stock,
        is_available
        `)
        .order("created_at", { ascending: false })
        .overrideTypes<StickerWithCollection[]>()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Map to include collection name
    const formatted = stickers.map(sticker => ({
        sid: sticker.sid,
        title: sticker.title,
        price: sticker.price,
        image_path: getStickerUrl(sticker.image_path),
        collection_id: sticker.collection_id,
        collection_name: sticker.stickers_collection_fk.location,
        stock: sticker.stock,
        is_available: sticker.is_available
    }))

    return NextResponse.json(formatted)
}
