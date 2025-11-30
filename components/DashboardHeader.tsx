"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/libs/supabase";
import type { User } from "@supabase/supabase-js";
import config from "@/config";

interface DashboardHeaderProps {
  isSuperAdmin?: boolean;
}

export default function DashboardHeader({ isSuperAdmin = false }: DashboardHeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="bg-base-100 shadow-sm border-b border-base-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-bold text-xl">{config.appName}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition-colors"
              >
                Create Book
              </Link>
              <Link
                href="/dashboard/my-books"
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition-colors"
              >
                My Books
              </Link>
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop User Dropdown */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 hover:bg-base-200 px-3 py-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-medium text-primary text-sm">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-medium">
                  {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account"}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="btn btn-ghost btn-sm text-error hover:bg-error/10"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden btn btn-ghost btn-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-base-200 py-4">
            <nav className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Book
              </Link>
              <Link
                href="/dashboard/my-books"
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-base-200 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                My Books
              </Link>
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <div className="border-t border-base-200 mt-2 pt-2">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-base-200 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-medium text-primary text-sm">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-medium">Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
