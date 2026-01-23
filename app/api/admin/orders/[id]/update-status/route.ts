import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {

    const supabase = await createClient()
    const { id } = await params
    const form = await req.formData()
    const status = form.get("status") as string

    // Authenticate admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

    if (!profile?.is_admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Update the order
    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.redirect(
        new URL(`/admin/orders/${id}`, req.url)
    )
}
