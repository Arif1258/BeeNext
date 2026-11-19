"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, ArrowRight, Shield, User, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Failed to sign in. Please verify your credentials.");
    }
  };

  const handleAutofill = (type: "admin" | "user") => {
    if (type === "admin") {
      setEmail("admin@beenext.dev");
      setPassword("AdminSecurePassword123!");
    } else {
      setEmail("alex@beenext.dev");
      setPassword("UserSecurePassword123!");
    }
  };

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
            Sign in to access your handwritten notes &amp; DSA solutions
          </p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div className="p-3 rounded-xl bg-brand-card border border-brand-border space-y-2">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-brand-subtle block text-center">
            ⚡ Quick Test Autofill (For Reviewers)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleAutofill("admin")}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-brand-black hover:bg-brand-surface border border-brand-red/50 text-brand-red text-xs font-mono font-bold transition-all"
            >
              <Shield className="h-3 w-3" />
              <span>Login as Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutofill("user")}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-brand-black hover:bg-brand-surface border border-brand-border text-white text-xs font-mono font-bold transition-all"
            >
              <User className="h-3 w-3" />
              <span>Login as User</span>
            </button>
          </div>
        </div>

        {/* Login Card */}
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

          <div className="pt-2 text-center text-xs text-brand-muted">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-brand-red font-bold hover:underline">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
