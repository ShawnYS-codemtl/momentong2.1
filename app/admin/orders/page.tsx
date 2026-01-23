// app/admin/orders/page.tsx
import { createClient } from "@/lib/supabase/server"

interface Props {
  searchParams?: { search?: string }
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) throw new Error("Unauthorized")

  // Query orders
  let query = supabase
    .from("orders")
    .select(` id,
        stripe_session_id,
        customer_email,
        amount_total,
        status,
        created_at,
        customer_name
    `)
    .order("created_at", { ascending: false })

//   if (searchParams?.search) {
//     query = query.ilike("customer_name", `%${searchParams.search}%`)
//   }

  const { data: orders, error } = await query
  if (error) throw new Error(error.message)
  console.log("orders", orders, error)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
        <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse border border-gray-200">
                <thead>
                <tr className="border-b bg-gray-50">
                    <th className="w-24 text-left py-2 px-2 truncate">Id</th>
                    <th className="w-48 text-left py-2 px-2 truncate">Date</th>
                    <th className="w-48 text-left py-2 px-2 truncate">Name</th>
                    <th className="w-48 text-left py-2 px-2 truncate">Email</th>
                    <th className="w-24 text-left py-2 px-2 truncate">Total</th>
                    <th className="w-32 text-left py-2 px-2 truncate">Status</th>
                    <th className="w-32 text-left py-2 px-2 truncate">Session</th>
                    <th className="w-24 text-left py-2 px-2">Action</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order.id} className="border-b">
                    <td className="py-2 px-2 break-words">{order.id.slice(0, 8)}</td>
                    <td className="py-2 px-2 break-words">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="py-2 px-2 break-words">{order.customer_name}</td>
                    <td className="py-2 px-2 break-words">{order.customer_email}</td>
                    <td className="py-2 px-2 break-words">${(order.amount_total / 100).toFixed(2)}</td>
                    <td className="py-2 px-2 break-words">{order.status}</td>
                    <td className="py-2 px-2 truncate" title={order.stripe_session_id}>{order.stripe_session_id}</td>
                    <td className="py-2 px-2">
                        <a
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:underline"
                        >
                        Edit
                        </a>
                    </td>
                                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

