import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/libs/supabase-server";
import config from "@/config";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  // Check if user is a super_admin
  const { data: userData } = await supabase
    .from("users")
    .select("platform_role")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = userData?.platform_role === "super_admin";

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader isSuperAdmin={isSuperAdmin} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
