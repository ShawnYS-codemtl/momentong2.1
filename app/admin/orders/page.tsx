// app/admin/orders/page.tsx
import { createClient } from "@/lib/supabase/server"

function getNextSortOrder(currentSortBy: string, currentSortOrder: string, column: string) {
  if (currentSortBy === column) {
    return currentSortOrder === "asc" ? "desc" : "asc"
  }
  return "asc"
}

export default async function AdminOrdersPage({ searchParams: rawSearchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const searchParams = await rawSearchParams
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

    // Sorting
    const allowedSortColumns = ["id", "created_at", "customer_name", "customer_email", "amount_total", "status"]
    const sortBy = allowedSortColumns.includes(searchParams?.sortBy || "") ? searchParams.sortBy! : "created_at"
    const sortOrder = searchParams?.sortOrder === "asc" ? "asc" : "desc"
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data: orders, error } = await query
    if (error) throw new Error(error.message)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
        <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse border border-gray-200">
                <thead>
                <tr className="border-b bg-gray-50">
                  <th className="w-24 text-left py-2 px-2 truncate">
                    <a href={`?sortBy=id&sortOrder=${getNextSortOrder(sortBy, sortOrder, "id")}`}>
                      Id {sortBy === "id" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                    </a>
                  </th>
                  <th className="w-48 text-left py-2 px-2 truncate">
                    <a href={`?sortBy=created_at&sortOrder=${getNextSortOrder(sortBy, sortOrder, "created_at")}`}>
                      Date {sortBy === "created_at" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                    </a>
                  </th>
                  <th className="w-48 text-left py-2 px-2 truncate">
                    <a href={`?sortBy=customer_name&sortOrder=${getNextSortOrder(sortBy, sortOrder, "customer_name")}`}>
                      Name {sortBy === "customer_name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                    </a>
                  </th>
                  <th className="w-48 text-left py-2 px-2 truncate">
                    <a href={`?sortBy=customer_email&sortOrder=${getNextSortOrder(sortBy, sortOrder, "customer_email")}`}>
                      Email {sortBy === "customer_email" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                    </a>
                  </th>
                  <th className="w-24 text-left py-2 px-2 truncate">
                    <a href={`?sortBy=amount_total&sortOrder=${getNextSortOrder(sortBy, sortOrder, "amount_total")}`}>
                      Total {sortBy === "amount_total" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                    </a>
                  </th>
                  <th className="w-32 text-left py-2 px-2 truncate">
                    <a href={`?sortBy=status&sortOrder=${getNextSortOrder(sortBy, sortOrder, "status")}`}>
                      Status {sortBy === "status" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                    </a>
                  </th>
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

