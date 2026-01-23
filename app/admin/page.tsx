export default function AdminDashboardPage() {
    return (
      <main className="p-8 space-y-6">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
  
        <nav className="space-y-2">
          <a
            href="/admin/orders"
            className="block text-blue-600 hover:underline"
          >
            View Orders
          </a>
  
          <a
            href="/admin/stickers"
            className="block text-blue-600 hover:underline"
          >
            Manage Stickers
          </a>
  
          <a
            href="/admin/collections"
            className="block text-blue-600 hover:underline"
          >
            Manage Collections
          </a>
        </nav>
      </main>
    )
  }
  