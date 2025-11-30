import { createServerSupabaseClient } from "@/libs/supabase-server";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch stats
  const [
    { count: totalUsers },
    { count: totalTenants },
    { count: totalBooks },
    { count: totalPurchases }
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("tenants").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("purchases").select("*", { count: "exact", head: true })
  ]);

  // Fetch recent users
  const { data: recentUsers } = await supabase
    .from("users")
    .select("id, email, full_name, platform_role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent purchases
  const { data: recentPurchases } = await supabase
    .from("purchases")
    .select(`
      id,
      amount,
      currency,
      status,
      created_at,
      users:user_id (email, full_name),
      books:book_id (title)
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total Users", value: totalUsers || 0, icon: "users" },
    { label: "Total Tenants", value: totalTenants || 0, icon: "building" },
    { label: "Total Books", value: totalBooks || 0, icon: "book" },
    { label: "Total Purchases", value: totalPurchases || 0, icon: "shopping" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-base-content/60 mt-1">
          Overview of your platform statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-base-100 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {stat.icon === "users" && (
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
                {stat.icon === "building" && (
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
                {stat.icon === "book" && (
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )}
                {stat.icon === "shopping" && (
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-base-100 rounded-lg shadow">
          <div className="p-6 border-b border-base-200">
            <h2 className="text-lg font-semibold">Recent Users</h2>
          </div>
          <div className="p-6">
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-medium text-primary">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || user.email?.split("@")[0]}</p>
                        <p className="text-sm text-base-content/60">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {user.platform_role && (
                        <span className={`badge badge-sm ${
                          user.platform_role === "super_admin" ? "badge-primary" : "badge-secondary"
                        }`}>
                          {user.platform_role}
                        </span>
                      )}
                      <p className="text-xs text-base-content/60 mt-1">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60 text-center py-8">No users yet</p>
            )}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-base-100 rounded-lg shadow">
          <div className="p-6 border-b border-base-200">
            <h2 className="text-lg font-semibold">Recent Purchases</h2>
          </div>
          <div className="p-6">
            {recentPurchases && recentPurchases.length > 0 ? (
              <div className="space-y-4">
                {recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {(purchase.books as { title: string })?.title || "Unknown Book"}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {(purchase.users as { email: string })?.email || "Unknown User"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${(purchase.amount / 100).toFixed(2)} {purchase.currency?.toUpperCase()}
                      </p>
                      <span className={`badge badge-sm ${
                        purchase.status === "completed" ? "badge-success" :
                        purchase.status === "pending" ? "badge-warning" : "badge-error"
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60 text-center py-8">No purchases yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
