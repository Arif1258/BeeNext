"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  User,
  Mail,
  Calendar,
  CheckCircle2,
  Bookmark,
  ShoppingBag,
  TrendingUp,
  Shield,
  CreditCard,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const [allProblems, setAllProblems] = useState<any[]>([]);

  useEffect(() => {
    async function loadProblems() {
      try {
        const res = await fetch("/api/problems");
        if (res.ok) {
          const data = await res.json();
          setAllProblems(data.problems || []);
        }
      } catch (err) {
        console.error("Failed to load problems", err);
      }
    }
    loadProblems();
  }, []);

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
          <User className="h-12 w-12 text-brand-red mx-auto" />
          <h2 className="text-2xl font-bold">Please Log In</h2>
          <p className="text-xs text-brand-muted">
            Sign in to track your learning journey, view solved problems, and manage account details.
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

  const completedCount = user.progress?.filter((p) => p.status === "COMPLETED").length || 0;
  const totalCount = allProblems.length || 10;
  const progressPercent = Math.min(Math.round((completedCount / totalCount) * 100), 100);

  const bookmarkedProblems = allProblems.filter((prob) =>
    user.bookmarks?.some((b) => b.problemId === prob.id)
  );

  const completedProblems = allProblems.filter((prob) =>
    user.progress?.some((p) => p.problemId === prob.id && p.status === "COMPLETED")
  );

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Profile Header Card */}
        <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`
                }
                alt={user.name}
                className="h-16 w-16 rounded-full bg-brand-black border-2 border-brand-border object-cover"
              />
              {user.role === "ADMIN" && (
                <span className="absolute -bottom-1 -right-1 bg-brand-red text-white p-1 rounded-full shadow-brand" title="Admin">
                  <Shield className="h-3 w-3" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-black border border-brand-border text-white">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-brand-muted font-mono">
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-border text-white text-xs font-mono font-semibold transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 text-brand-red" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Learning Progress Metric Card */}
        <div className="rounded-2xl border border-brand-border bg-brand-card p-6 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-brand-red" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Curriculum Progress
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-white">
              {completedCount} of {totalCount} Problems Solved ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-brand-black border border-brand-border overflow-hidden">
            <div
              className="h-full bg-brand-red transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs font-mono">
            <div className="p-3 rounded-xl bg-brand-black border border-brand-border">
              <span className="text-brand-subtle block text-[10px] uppercase">Solved</span>
              <span className="text-lg font-bold text-white">{completedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-brand-black border border-brand-border">
              <span className="text-brand-subtle block text-[10px] uppercase">Bookmarks</span>
              <span className="text-lg font-bold text-white">{user.bookmarks?.length || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-brand-black border border-brand-border">
              <span className="text-brand-subtle block text-[10px] uppercase">Purchases</span>
              <span className="text-lg font-bold text-white">{user.purchases?.length || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-brand-black border border-brand-border">
              <span className="text-brand-subtle block text-[10px] uppercase">Track Completion</span>
              <span className="text-lg font-bold text-brand-red">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Solved & Bookmarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Solved Problems */}
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Completed Problems ({completedProblems.length})</span>
              </h3>
            </div>

            {completedProblems.length === 0 ? (
              <p className="text-xs text-brand-muted py-6 text-center">
                No problems marked as completed yet. Start with our free Sorting track!
              </p>
            ) : (
              <ul className="space-y-2 text-xs font-mono">
                {completedProblems.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/problem/${p.slug}`}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-brand-black hover:bg-brand-surface border border-brand-border text-white transition-colors"
                    >
                      <span>{p.title}</span>
                      <span className="text-brand-red text-[11px]">Review &rarr;</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bookmarked Problems */}
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-brand-red fill-brand-red" />
                <span>Saved Bookmarks ({bookmarkedProblems.length})</span>
              </h3>
            </div>

            {bookmarkedProblems.length === 0 ? (
              <p className="text-xs text-brand-muted py-6 text-center">
                No bookmarks saved yet. Click the bookmark icon on any problem to save it for revision.
              </p>
            ) : (
              <ul className="space-y-2 text-xs font-mono">
                {bookmarkedProblems.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/problem/${p.slug}`}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-brand-black hover:bg-brand-surface border border-brand-border text-white transition-colors"
                    >
                      <span>{p.title}</span>
                      <span className="text-brand-red text-[11px]">Solve &rarr;</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl border border-brand-border bg-brand-card p-6 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-brand-red" />
              <h3 className="text-sm font-bold text-white">
                Payment &amp; Transaction Receipts
              </h3>
            </div>
            <span className="text-xs font-mono text-brand-muted">
              {user.purchases?.length || 0} Transactions
            </span>
          </div>

          {!user.purchases || user.purchases.length === 0 ? (
            <p className="text-xs text-brand-muted py-6 text-center">
              No transactions recorded. All your future purchase receipts will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-brand-border text-brand-subtle">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {user.purchases.map((p) => (
                    <tr key={p.id} className="text-white hover:bg-brand-surface/40">
                      <td className="py-3 px-3 font-semibold">{p.purchaseType}</td>
                      <td className="py-3 px-3 text-brand-muted">{formatDate(p.createdAt)}</td>
                      <td className="py-3 px-3 font-bold">{formatCurrency(p.amount)}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 border border-emerald-900 text-emerald-400">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
