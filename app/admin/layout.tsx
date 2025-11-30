import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/libs/supabase-server";
import Link from "next/link";

// Admin layout - only accessible by super_admin users
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is a super_admin
  const { data: userData } = await supabase
    .from("users")
    .select("platform_role")
    .eq("id", user.id)
    .single();

  if (userData?.platform_role !== "super_admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Admin Header */}
      <header className="bg-base-100 shadow-md border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-bold text-xl">Admin Panel</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/tenants"
                  className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition-colors"
                >
                  Tenants
                </Link>
                <Link
                  href="/admin/books"
                  className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition-colors"
                >
                  Books
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to App
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
