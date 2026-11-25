"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import GoogleSignInButton, { GoogleOrDivider } from "@/components/GoogleSignInButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = searchParams.get("from") || "/";
  const urlError = searchParams.get("error");

  useEffect(() => {
    if (urlError) {
      if (urlError === "google_not_configured") {
        setError("Google Sign-In is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
      } else if (urlError === "cancelled") {
        setError("Google sign-in was cancelled.");
      } else if (urlError === "invalid_state") {
        setError("Authentication session expired or invalid. Please try again.");
      } else if (urlError === "email_not_verified") {
        setError("Your Google account email is not verified by Google.");
      } else {
        setError("Google authentication failed. Please try again.");
      }
    }
  }, [urlError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.push(from && from.startsWith("/") && !from.startsWith("//") ? from : "/");
    } else {
      setError(result.error || "Failed to sign in. Please verify your credentials.");
    }
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card p-8 shadow-card space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-redMuted border border-brand-red text-xs text-white">
          <AlertCircle className="h-4 w-4 text-brand-red flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-brand-subtle uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              className="w-full bg-brand-black border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-brand-subtle focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-brand-subtle uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-brand-black border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-brand-subtle focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-bold text-xs font-mono shadow-brand transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* OR Divider */}
      <GoogleOrDivider />

      {/* Continue with Google Button */}
      <GoogleSignInButton text="Continue with Google" from={from} />

      <div className="pt-2 text-center text-xs text-brand-muted">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="text-brand-red font-bold hover:underline">
          Sign up here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 graph-paper-bg">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red text-white font-mono font-bold text-xl shadow-brand">
            B&gt;
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome to Bee<span className="text-brand-red">Next</span>
          </h2>
          <p className="text-xs text-brand-muted font-mono">
            Sign in to access your DSA notes &amp; solutions
          </p>
        </div>

        {/* Login Card inside Suspense */}
        <Suspense
          fallback={
            <div className="rounded-2xl border border-brand-border bg-brand-card p-8 shadow-card flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
