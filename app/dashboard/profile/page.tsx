"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/libs/supabase";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    setIsLoading(true);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || "");
      }
      setIsLoading(false);
    });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Profile updated successfully!");
        // Update local user state
        setUser(prev => prev ? {
          ...prev,
          user_metadata: { ...prev.user_metadata, full_name: fullName }
        } : null);
      }
    } catch (err) {
      toast.error("Failed to update profile");
    }

    setIsSaving(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <main className="min-h-screen p-8 pb-24">
        <section className="max-w-xl mx-auto">
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-sm text-base-content/60 hover:text-base-content">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-2">Profile Settings</h1>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
              {fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <div>
              <p className="font-medium text-lg">
                {fullName || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-sm text-base-content/60">{user?.email}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="divider"></div>

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                value={user?.email || ""}
                className="input input-bordered w-full bg-base-200"
                disabled
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Email cannot be changed
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Account Created</span>
              </label>
              <input
                type="text"
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ""}
                className="input input-bordered w-full bg-base-200"
                disabled
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${isSaving ? "loading" : ""}`}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6 border border-error/20">
          <h2 className="text-lg font-bold text-error mb-4">Danger Zone</h2>
          <p className="text-sm text-base-content/60 mb-4">
            Once you sign out, you will need to sign in again to access your account.
          </p>
          <button
            onClick={handleSignOut}
            className="btn btn-error btn-outline"
          >
            Sign Out
          </button>
        </div>
      </section>
    </main>
  );
}
