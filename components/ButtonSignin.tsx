/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import config from "@/config";
import { createClient } from "@/libs/supabase";
import type { User } from "@supabase/supabase-js";

// A simple button to sign in with Supabase Auth.
// It redirects to /sign-in page. If logged in, shows user info and redirects to dashboard.
const ButtonSignin = ({
  text = "Get started",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    // Get initial session
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (isMounted && !error) {
          setUser(user);
        }
      } catch {
        // Ignore errors - user stays null
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (user) {
    return (
      <Link
        href={config.auth.callbackUrl}
        className={`btn ${extraStyle ? extraStyle : ""}`}
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata?.full_name || "Account"}
            className="w-6 h-6 rounded-full shrink-0"
            referrerPolicy="no-referrer"
            width={24}
            height={24}
          />
        ) : (
          <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0 text-sm">
            {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
          </span>
        )}
        {user.user_metadata?.full_name || user.email?.split("@")[0] || "Account"}
      </Link>
    );
  }

  return (
    <Link
      href="/sign-in"
      className={`btn ${extraStyle ? extraStyle : ""}`}
    >
      {text}
    </Link>
  );
};

export default ButtonSignin;
