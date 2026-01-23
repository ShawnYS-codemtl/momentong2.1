import { notFound } from "next/navigation"
import type { OrderDetail } from "@/types/order-detail"
import { createClient } from "@/lib/supabase/server"

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {

    const supabase = await createClient()
    const {id} = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

    if (!profile?.is_admin) throw new Error("Unauthorized")

    const { data, error } = await supabase
        .from("orders")
        .select(`
        id,
        stripe_session_id,
        customer_email,
        customer_name,
        amount_total,
        status,
        items,
        shipping_address,
        created_at
        `)
        .eq("id", id)
        .single()

    if (error || !data) {
        notFound()
    }

    const order: OrderDetail = {
        ...data,
        items: data.items as OrderDetail["items"],
        shipping_address: data.shipping_address as OrderDetail["shipping_address"],
    }

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Order #{order.id.slice(0, 8)}
          </h1>
          <span>
            {new Date(order.created_at).toLocaleString()}
          </span>
        </header>
    
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
            {/* Order details */}
            <section className="border rounded-lg p-6">
              <h2 className="font-semibold mb-4">Order Details</h2>
              <p>
                <strong>Status:</strong>{" "}
                <span className="capitalize">{order.status}</span>
              </p>
              <p>
                <strong>Total:</strong>{" "}
                ${(order.amount_total / 100).toFixed(2)}
              </p>
            </section>
    
            {/* Items */}
            <section className="border rounded-lg p-6">
              <h2 className="font-semibold mb-4">Items</h2>
              <ul className="space-y-2">
                {order.items.map((item: any, idx: number) => (
                  <li
                    key={idx}
                    className="flex justify-between py-2"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>
                      ${(item.price / 100).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <hr />
              <div className="flex justify-between">
                <strong>Total:</strong>
                <strong>${(order.amount_total / 100).toFixed(2)}</strong>
              </div>
            </section>
          </div>
    
          {/* Right column */}
          <div className="space-y-6">
            {/* Customer */}
            <section className="border rounded-lg p-6">
              <h2 className="font-semibold mb-4">Customer</h2>
              <p>
                <strong>Name:</strong>{" "}
                {order.customer_name ?? "Not provided"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {order.customer_email ?? "Not provided"}
              </p>
            </section>
    
            {/* Shipping */}
            <section className="border rounded-lg p-6">
              <h2 className="font-semibold mb-4">Shipping Address</h2>
              {order.shipping_address ? (
                <address className="not-italic text-sm leading-relaxed">
                  {order.shipping_address.line1}
                  <br />
                  {order.shipping_address.city},{" "}
                  {order.shipping_address.country}
                </address>
              ) : (
                <p className="text-sm text-gray-500">
                  No shipping address
                </p>
              )}
            </section>
    
            {/* Status update */}
            <section className="border rounded-lg p-6">
              <h2 className="font-semibold mb-4">Update Status</h2>
              <form
                action={`/api/admin/orders/${order.id}/update-status`}
                method="POST"
                className="flex gap-2"
              >
                <select
                  name="status"
                  defaultValue={order.status}
                  className="border rounded px-2 py-1 flex-1"
                >
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-1 rounded"
                >
                  Update
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    )
}
