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

    // Delete is RLS-scoped; an admin DELETE policy on orders authorizes this.
    // .select() lets us detect a no-op (zero rows) and report it instead of a
    // false success.
    const { data: deleted, error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id)
        .select("id")

    if (error) return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    if (!deleted?.length) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    return NextResponse.json({ success: true })
}
