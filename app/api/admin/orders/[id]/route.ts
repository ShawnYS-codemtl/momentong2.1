import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

    if (profileError || !profile?.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id)

    if (error) return NextResponse.json({ error: "Internal server error" }, { status: 500 })

    return NextResponse.json({ success: true })
}
