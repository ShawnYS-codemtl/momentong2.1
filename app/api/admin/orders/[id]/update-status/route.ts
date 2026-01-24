import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderShippedEmail } from "@/lib/email/sendOrderShippedEmail"

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

    // Fetch current order
    const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

    if (!order) {
        return new NextResponse("Order not found", { status: 404 })
    }

    // Update the order
    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Send shipped email exactly once
    if (
        status === "shipped" &&
        !order.shipped_email_sent_at &&
        order.customer_email
    ) {
        await sendOrderShippedEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        order_id: order.id,
        })

        await supabase
        .from("orders")
        .update({ shipped_email_sent_at: new Date().toISOString() })
        .eq("id", order.id)
    }

    return NextResponse.redirect(
        new URL(`/admin/orders/${id}`, req.url)
    )
}
