import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ReactNode } from "react"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()

  const { data, error} = await supabase.auth.getUser()

  if (error || !data.user) {
    redirect("/login")
  }

  const user = data.user

  // 2️⃣ Authorization check
  const { data: profile} = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (error || !profile?.is_admin) {
    redirect("/")
  }

  // 3️⃣ Render admin UI
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-6">
        <h2 className="font-semibold mb-6">Admin</h2>

        <nav className="space-y-3 flex flex-col">
          <a href="/admin">Dashboard</a>
          <a href="/admin/orders">Orders</a>
          <a href="/admin/stickers">Stickers</a>
          <a href="/admin/collections">Collections</a>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}


