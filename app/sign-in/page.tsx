"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/libs/supabase";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import config from "@/config";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup" | "magic">("signin");

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  // Check if user is already logged in (runs once on mount)
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        window.location.href = config.auth.callbackUrl;
      }
    });
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // Redirect to dashboard on success
      window.location.href = config.auth.callbackUrl;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // User already exists
      setError("An account with this email already exists. Please sign in instead.");
      setIsLoading(false);
    } else {
      setMessage("Check your email for the confirmation link!");
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setMessage("Check your email for the magic link!");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-bold text-2xl">{config.appName}</span>
          </Link>
          <h2 className="text-3xl font-bold">
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "magic" && "Sign in with magic link"}
          </h2>
          <p className="mt-2 text-base-content/70">
            {mode === "signin" && "Sign in to access your books"}
            {mode === "signup" && "Start creating amazing books today"}
            {mode === "magic" && "We'll send you a link to sign in"}
          </p>
        </div>

        {/* Auth form card */}
        <div className="bg-base-100 rounded-lg shadow-lg p-8">
          {/* Mode tabs */}
          <div className="tabs tabs-boxed mb-6">
            <button
              className={`tab flex-1 ${mode === "signin" ? "tab-active" : ""}`}
              onClick={() => { setMode("signin"); setError(null); setMessage(null); }}
            >
              Sign In
            </button>
            <button
              className={`tab flex-1 ${mode === "signup" ? "tab-active" : ""}`}
              onClick={() => { setMode("signup"); setError(null); setMessage(null); }}
            >
              Sign Up
            </button>
            <button
              className={`tab flex-1 ${mode === "magic" ? "tab-active" : ""}`}
              onClick={() => { setMode("magic"); setError(null); setMessage(null); }}
            >
              Magic Link
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert-error mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {message && (
            <div className="alert alert-success mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === "signin" ? handleSignIn : mode === "signup" ? handleSignUp : handleMagicLink}>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {(mode === "signin" || mode === "signup") && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full"
                    required
                    minLength={6}
                  />
                  {mode === "signup" && (
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">Minimum 6 characters</span>
                    </label>
                  )}
                </div>
              )}

              <button
                type="submit"
                className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    {mode === "signin" && "Sign In"}
                    {mode === "signup" && "Create Account"}
                    {mode === "magic" && "Send Magic Link"}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info about email confirmation */}
          {mode === "signup" && (
            <p className="text-sm text-base-content/60 mt-4 text-center">
              You'll receive an email to confirm your account.
            </p>
          )}
        </div>

        {/* Back to home */}
        <p className="text-center text-sm text-base-content/60">
          <Link href="/" className="link link-primary">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
