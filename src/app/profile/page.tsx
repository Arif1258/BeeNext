"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white">
        <div className="h-8 w-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white p-4">
        <div className="max-w-md w-full rounded-2xl bg-brand-card border border-brand-border p-8 text-center space-y-4">
          <UserIcon className="h-12 w-12 text-brand-red mx-auto" />
          <h2 className="text-2xl font-bold">Please Log In</h2>
          <p className="text-xs text-brand-muted">
            Sign in to view your profile and manage account details.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Could not update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Profile Details Header Card */}
        <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-brand-black border-2 border-brand-border flex items-center justify-center text-white text-xl font-bold font-mono">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              {user.role === "ADMIN" && (
                <span
                  className="absolute -bottom-1 -right-1 bg-brand-red text-white p-1 rounded-full shadow-brand"
                  title="Admin"
                >
                  <Shield className="h-3 w-3" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-black border border-brand-border text-white">
                  {user.role}
                </span>
                {user.membershipType === "PLUS" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase bg-brand-red/15 text-brand-red border border-brand-red/40 shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    <span>Plus Member {user.membershipPlan ? `(${user.membershipPlan})` : ""}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-neutral-900 text-neutral-400 border border-neutral-800">
                    <span>Normal Member</span>
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-brand-muted font-mono flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-brand-red" />
                  <span>{user.email}</span>
                </span>
                {user.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-brand-red" />
                    <span>Member since {formatDate(user.createdAt)}</span>
                  </span>
                )}
                {user.membershipType === "PLUS" && user.membershipExpiresAt && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    <span>Plus active until {formatDate(user.membershipExpiresAt)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-brand-card hover:bg-brand-surface border border-brand-red text-brand-red text-xs font-mono font-bold transition-all"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold transition-colors shadow-brand"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 space-y-6 shadow-card">
          <div className="border-b border-brand-border pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-brand-red" />
              <h2 className="text-base font-bold text-white">
                Account Settings &amp; Security
              </h2>
            </div>
            <span className="text-xs font-mono text-brand-muted">
              Password &amp; Credentials
            </span>
          </div>

          {passwordMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{passwordMessage}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-brand-redMuted border border-brand-red text-xs font-mono text-white flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-brand-red shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg text-xs font-mono">
            <div>
              <label className="block text-brand-muted mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-black border border-brand-border text-white focus:outline-none focus:border-brand-red"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-brand-muted mb-1">
                New Password (minimum 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-black border border-brand-border text-white focus:outline-none focus:border-brand-red"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-brand-muted mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-black border border-brand-border text-white focus:outline-none focus:border-brand-red"
                placeholder="Repeat new password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all disabled:opacity-50"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
