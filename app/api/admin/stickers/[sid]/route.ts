import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface Params {
  params: Promise<{ sid: string }>
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const supabase = await createClient()
    const { sid } = await params

    // 1. Authenticate user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        )
    }

    // 2. Verify admin role
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

    if (profileError || !profile?.is_admin) {
        return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
        )
    }

      // 3. Fetch sticker to get image path
    const { data: sticker, error: fetchError } = await supabase
        .from("stickers")
        .select("image_path")
        .eq("sid", sid)
        .single()

    if (fetchError || !sticker) {
        return NextResponse.json(
            { error: "Sticker not found" },
            { status: 404 }
        )
    }

    // 4. Delete file from storage
    const { error: storageError } = await supabase.storage
        .from("stickers")
        .remove([sticker.image_path])

    if (storageError) {
        return NextResponse.json(
            { error: "Failed to delete image from storage" },
            { status: 500 }
        )
    }

    // 3. Delete sticker
    const { error: deleteError } = await supabase
        .from("stickers")
        .delete()
        .eq("sid", sid)

    if (deleteError) {
        return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
}


