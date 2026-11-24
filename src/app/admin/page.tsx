"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Shield,
  Users,
  User,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Package,
  Truck,
  Search,
  Filter,
  X,
  LayoutDashboard,
  RefreshCw,
  Clock,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  LogOut,
  Copy,
  Check,
  Award,
  Sparkles,
  CreditCard,
  Zap,
} from "lucide-react";

type TabKey = "OVERVIEW" | "USERS" | "ORDERS";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  membershipType?: "NORMAL" | "PLUS";
  membershipPlan?: string | null;
  membershipExpiresAt?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  printedOrders?: any[];
  purchases?: any[];
  _count?: {
    printedOrders?: number;
    purchases?: number;
    progress?: number;
  };
}

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  membershipPlan?: string;
  productTitle: string;
  totalAmount: number;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paymentMethod?: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  isManualGrant?: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

function formatDateTime(date: string | Date): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(date));
  } catch {
    return String(date);
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("OVERVIEW");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Data states (Real DB data only)
  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [ordersList, setOrdersList] = useState<OrderItem[]>([]);

  // Action status toasts
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Users Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");

  // Orders Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>("ALL");
  const [orderPlanFilter, setOrderPlanFilter] = useState<string>("ALL");

  // Load real admin data from DB
  const loadDashboardData = async () => {
    try {
      const [metricsRes, usersRes, ordRes] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/admin/users"),
        fetch("/api/admin/printed-orders"),
      ]);

      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m);
      }

      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsersList(u.users || []);
      }

      if (ordRes.ok) {
        const o = await ordRes.json();
        setOrdersList(o.orders || []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setActionError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
      return;
    }
    if (user?.role === "ADMIN") {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setActionError(null);
    setActionSuccess(null);
    await loadDashboardData();
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };


  // Filtered users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearch, userRoleFilter]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      const q = orderSearch.toLowerCase();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.razorpayPaymentId && o.razorpayPaymentId.toLowerCase().includes(q)) ||
        o.productTitle.toLowerCase().includes(q);

      const matchesPayment =
        orderPaymentFilter === "ALL" || o.paymentStatus === orderPaymentFilter;
      const matchesPlan =
        orderPlanFilter === "ALL" ||
        (orderPlanFilter === "YEARLY" && o.membershipPlan === "YEARLY") ||
        (orderPlanFilter === "MONTHLY" && o.membershipPlan === "MONTHLY");

      return matchesSearch && matchesPayment && matchesPlan;
    });
  }, [ordersList, orderSearch, orderPaymentFilter, orderPlanFilter]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 text-brand-red animate-spin mb-3" />
        <p className="text-sm font-mono text-brand-muted">Loading BeeNext Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-text">
      {/* Top Header */}
      <header className="border-b border-brand-border bg-brand-black/95 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center">
              <Shield className="h-5 w-5 text-brand-red" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">BeeNext Admin</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-brand-red/20 text-brand-red border border-brand-red/30">
                  Designated Admin
                </span>
              </div>
              <p className="text-xs text-brand-subtle font-mono">
                {user?.email} &bull; Live Site Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-card hover:bg-brand-border text-xs text-brand-muted hover:text-white transition"
              title="Refresh Real Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              href="/topics"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-card hover:bg-brand-border text-xs text-brand-muted hover:text-white transition"
            >
              <span>View Site</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs text-red-400 font-semibold transition"
              title="Sign Out of Admin Dashboard"
            >
              {loggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Exactly Overview, Users, Orders & Logout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center justify-between border-t border-brand-border/50 pt-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex space-x-1 sm:space-x-2">
              {[
                { key: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
                { key: "USERS", label: `Users (${usersList.length})`, icon: Users },
                { key: "ORDERS", label: `Orders (${ordersList.length})`, icon: ShoppingBag },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabKey)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition border-b-2 ${
                      isActive
                        ? "border-brand-red text-white bg-brand-card/60"
                        : "border-transparent text-brand-muted hover:text-white hover:bg-brand-card/30"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-brand-red" : "text-brand-subtle"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-subtle hover:text-red-400 transition font-mono whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5 text-red-400" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Toast Alerts */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-400/80 hover:text-emerald-300 ml-3"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-red-400/80 hover:text-red-300 ml-3"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 1. OVERVIEW TAB                                                */}
        {/* ============================================================== */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-8">
            {/* PLATFORM OVERVIEW */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-red" />
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-white">
                  Platform Overview
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <span className="text-[10px] font-mono uppercase text-brand-subtle block">Total Users</span>
                  <span className="text-xl font-bold font-mono text-white block mt-1">
                    {metrics?.totalUsers ?? usersList.length}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <span className="text-[10px] font-mono uppercase text-brand-subtle block">Normal (Free)</span>
                  <span className="text-xl font-bold font-mono text-neutral-300 block mt-1">
                    {metrics?.normalUsersCount ?? 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-brand-card border border-brand-red/30 bg-brand-red/5">
                  <span className="text-[10px] font-mono uppercase text-brand-red block">Active Plus</span>
                  <span className="text-xl font-bold font-mono text-brand-red block mt-1">
                    {metrics?.activePlusCount ?? 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <span className="text-[10px] font-mono uppercase text-brand-subtle block">Expired Plus</span>
                  <span className="text-xl font-bold font-mono text-neutral-400 block mt-1">
                    {metrics?.expiredPlusCount ?? 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <span className="text-[10px] font-mono uppercase text-brand-subtle block">Monthly (₹79)</span>
                  <span className="text-xl font-bold font-mono text-sky-400 block mt-1">
                    {metrics?.monthlyPlansCount ?? 0}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                  <span className="text-[10px] font-mono uppercase text-brand-subtle block">Yearly (₹299)</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">
                    {metrics?.yearlyPlansCount ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* REVENUE OVERVIEW */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-white">
                  Revenue Overview
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-brand-card border border-emerald-500/30 bg-emerald-500/5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block">
                    Total Verified Revenue
                  </span>
                  <span className="text-2xl font-bold font-mono text-white mt-1 block">
                    {formatCurrency(metrics?.totalRevenue ?? 0)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                    Excludes pending &amp; test transactions
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-brand-card border border-brand-border">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-brand-subtle block">
                    Membership Revenue
                  </span>
                  <span className="text-2xl font-bold font-mono text-brand-red mt-1 block">
                    {formatCurrency(metrics?.membershipRevenue ?? 0)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                    From active subscriptions
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-brand-card border border-brand-border">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-brand-subtle block">
                    Monthly Revenue (₹79)
                  </span>
                  <span className="text-2xl font-bold font-mono text-sky-400 mt-1 block">
                    {formatCurrency(metrics?.monthlyRevenue ?? 0)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                    {metrics?.monthlyPlansCount ?? 0} Monthly Subscriptions
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-brand-card border border-brand-border">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-brand-subtle block">
                    Yearly Revenue (₹299)
                  </span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                    {formatCurrency(metrics?.yearlyRevenue ?? 0)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                    {metrics?.yearlyPlansCount ?? 0} Yearly Subscriptions
                  </span>
                </div>
              </div>
            </div>

            {/* RECENT MEMBERSHIP TRANSACTIONS */}
            {metrics?.recentMembershipOrders && metrics.recentMembershipOrders.length > 0 && (
              <div className="rounded-2xl border border-brand-border bg-brand-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-red" />
                    <h3 className="text-sm font-bold text-white font-mono">
                      Recent Membership Transactions
                    </h3>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    Verified Paid Only
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                        <th className="py-2.5 px-3">Subscriber</th>
                        <th className="py-2.5 px-3">Plan</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                      {metrics.recentMembershipOrders.map((ord: any) => (
                        <tr key={ord.id} className="hover:bg-neutral-900/50">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-white block">{ord.user?.name || "Customer"}</span>
                            <span className="text-[10px] text-neutral-400">{ord.user?.email}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-red/20 text-brand-red border border-brand-red/30">
                              {ord.plan}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">
                            ₹{ord.amount}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-emerald-400 font-bold text-[10px]">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-neutral-400 text-[10px]">
                            {formatDate(ord.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders Card */}
              <div className="rounded-2xl border border-brand-border bg-brand-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-brand-red" />
                    <h2 className="text-sm font-bold text-white">Recent Orders</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("ORDERS")}
                    className="text-xs text-brand-red hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>View all orders ({ordersList.length})</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {ordersList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-brand-muted">
                    <Package className="h-8 w-8 text-brand-border mx-auto mb-2" />
                    <p>No customer orders placed yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ordersList.slice(0, 4).map((ord) => {
                      const isPaid = ord.paymentStatus === "COMPLETED";
                      return (
                        <div
                          key={ord.id}
                          className="p-3.5 rounded-xl bg-brand-black border border-brand-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white">
                                {ord.orderNumber}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                  isPaid
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {isPaid ? "Paid" : ord.paymentStatus}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-300 bg-neutral-900 border border-neutral-800">
                                {ord.membershipPlan === "YEARLY" ? "Yearly" : "Monthly"}
                              </span>
                            </div>
                            <span className="font-medium text-brand-text block truncate">
                              {ord.customerName} &bull; {ord.customerEmail}
                            </span>
                            <span className="text-[11px] text-brand-subtle block truncate">
                              {formatDate(ord.createdAt)} &bull; {ord.isManualGrant ? "Admin Granted" : ord.razorpayPaymentId || "Payment ID N/A"}
                            </span>
                          </div>
                          <div className="sm:text-right flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-border/40">
                            <span className="font-mono font-bold text-sm text-emerald-400">
                              ₹{ord.totalAmount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Registered Users Card */}
              <div className="rounded-2xl border border-brand-border bg-brand-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-red" />
                    <h2 className="text-sm font-bold text-white">Designated Accounts</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("USERS")}
                    className="text-xs text-brand-red hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>Manage users</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {usersList.map((u) => (
                    <div
                      key={u.id}
                      className="p-3.5 rounded-xl bg-brand-black border border-brand-border/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-brand-card border border-brand-border flex items-center justify-center font-mono font-bold text-white text-xs flex-shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white block truncate">
                              {u.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-brand-subtle font-mono block truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase inline-block mb-1 ${
                            u.role === "ADMIN"
                              ? "bg-brand-red/20 text-brand-red border border-brand-red/30"
                              : "bg-brand-card border border-brand-border text-brand-muted"
                          }`}
                        >
                          {u.role === "ADMIN" ? "Admin" : "Customer"}
                        </span>
                        <span
                          className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase inline-block mb-1 ${
                            u.membershipType === "PLUS"
                              ? "bg-brand-red text-white font-bold"
                              : "bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {u.membershipType || "NORMAL"}
                        </span>
                        <span className="text-[10px] text-brand-subtle font-mono block">
                          Registered: {formatDate(u.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. USERS TAB                                                   */}
        {/* ============================================================== */}
        {activeTab === "USERS" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-brand-card border border-brand-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-subtle" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-black border border-brand-border text-xs text-white placeholder-brand-subtle focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-brand-subtle" />
                <select
                  value={userRoleFilter}
                  onChange={(e: any) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                >
                  <option value="ALL">All Roles ({usersList.length})</option>
                  <option value="USER">Customer Only</option>
                  <option value="ADMIN">Admin Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-xs text-brand-muted">
                  <Users className="h-8 w-8 text-brand-border mx-auto mb-2" />
                  <p>No registered users found matching your search.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-black/60 border-b border-brand-border text-brand-subtle font-mono uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Registered Date</th>
                        <th className="py-3 px-4">Last Activity / Login</th>
                        <th className="py-3 px-4 text-right">Orders Placed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      {filteredUsers.map((u) => {
                        const totalOrders =
                          (u._count?.printedOrders || 0) + (u._count?.purchases || 0);
                        return (
                          <tr key={u.id} className="hover:bg-brand-black/40 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-brand-black border border-brand-border flex items-center justify-center font-mono font-bold text-white text-xs flex-shrink-0">
                                  {u.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-semibold text-white block truncate">
                                    {u.name}
                                  </span>
                                  <span className="text-[11px] text-brand-subtle font-mono block truncate">
                                    {u.email}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase inline-block ${
                                  u.role === "ADMIN"
                                    ? "bg-brand-red/20 text-brand-red border border-brand-red/30"
                                    : "bg-brand-black border border-brand-border text-brand-muted"
                                }`}
                              >
                                {u.role === "ADMIN" ? "Admin" : "Customer"}
                              </span>
                              <span
                                className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase inline-block ${
                                  u.membershipType === "PLUS"
                                    ? "bg-brand-red text-white font-bold"
                                    : "bg-neutral-800 text-neutral-400"
                                }`}
                              >
                                {u.membershipType || "NORMAL"}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-brand-muted">
                              {formatDate(u.createdAt)}
                            </td>
                            <td className="py-3 px-4 font-mono text-brand-muted">
                              {u.updatedAt ? formatDate(u.updatedAt) : "—"}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-white">
                              {totalOrders > 0 ? (
                                <span className="text-emerald-400">{totalOrders} order(s)</span>
                              ) : (
                                <span className="text-brand-subtle">0</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. ORDERS TAB (Membership & Verified Payment Management)       */}
        {/* ============================================================== */}
        {activeTab === "ORDERS" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-brand-card border border-brand-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-subtle" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, order #, payment ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-black border border-brand-border text-xs text-white placeholder-brand-subtle focus:outline-none focus:border-brand-red font-mono"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Plan Filter */}
                <select
                  value={orderPlanFilter}
                  onChange={(e) => setOrderPlanFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-brand-black border border-brand-border text-xs text-white font-mono focus:outline-none focus:border-brand-red"
                >
                  <option value="ALL">All Membership Plans</option>
                  <option value="YEARLY">Yearly Plan</option>
                  <option value="MONTHLY">Monthly Plan</option>
                </select>

                {/* Payment Status Filter */}
                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-brand-black border border-brand-border text-xs text-white font-mono focus:outline-none focus:border-brand-red"
                >
                  <option value="ALL">Payment: All</option>
                  <option value="COMPLETED">Paid / Completed</option>
                  <option value="PENDING">Payment Pending</option>
                  <option value="FAILED">Payment Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>

            {/* Orders List / Cards */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 rounded-2xl border border-brand-border bg-brand-card text-center text-xs text-brand-muted space-y-2">
                <CreditCard className="h-10 w-10 text-brand-border mx-auto" />
                <p className="text-sm font-semibold text-white">
                  {ordersList.length === 0 ? "No membership orders yet" : "No orders match your filter"}
                </p>
                <p className="text-brand-subtle">
                  {ordersList.length === 0
                    ? "Membership and payment records will appear here automatically with verified details."
                    : "No membership orders match your current filter criteria."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const isCopied = copiedId === ord.id;
                  const isPaid = ord.paymentStatus === "COMPLETED";
                  const isFailed = ord.paymentStatus === "FAILED";
                  const isRefunded = ord.paymentStatus === "REFUNDED";

                  return (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden transition shadow-sm hover:border-brand-border/90"
                    >
                      {/* Order Card Header */}
                      <div className="p-4 sm:p-5 border-b border-brand-border/70 bg-brand-black/50 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-lg bg-brand-black border border-brand-border font-mono font-bold text-white text-xs sm:text-sm">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-brand-subtle flex items-center gap-1.5 font-mono">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDateTime(ord.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Payment Status Badge */}
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase ${
                              isPaid
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isFailed
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : isRefunded
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            Payment: {isPaid ? "Paid" : isFailed ? "Failed" : isRefunded ? "Refunded" : "Pending"}
                          </span>
                        </div>
                      </div>

                      {/* Order Details Body */}
                      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                        {/* 1. User Name & Email */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-subtle block">
                            User / Subscriber
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                            <User className="h-4 w-4 text-brand-red flex-shrink-0" />
                            <span>{ord.customerName}</span>
                          </h3>
                          <a
                            href={`mailto:${ord.customerEmail}`}
                            className="text-xs text-brand-subtle hover:text-white transition font-mono flex items-center gap-1.5 truncate"
                          >
                            <Mail className="h-3.5 w-3.5 text-neutral-500 flex-shrink-0" />
                            <span className="truncate">{ord.customerEmail}</span>
                          </a>
                        </div>

                        {/* 2. Membership Plan Purchased */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-subtle block">
                            Membership Plan
                          </span>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-brand-red flex-shrink-0" />
                            <span className="text-sm font-bold text-white">
                              {ord.membershipPlan === "YEARLY"
                                ? "Yearly Membership"
                                : ord.membershipPlan === "MONTHLY"
                                ? "Monthly Membership"
                                : ord.productTitle}
                            </span>
                          </div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-neutral-900 border border-neutral-800 text-neutral-300">
                            {ord.membershipPlan === "YEARLY" ? "365-Day Access" : "30-Day Access"}
                          </span>
                        </div>

                        {/* 3. Order Amount */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-subtle block">
                            Order Amount
                          </span>
                          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                            ₹{ord.totalAmount}
                          </div>
                          <span className="text-[10px] text-brand-subtle font-mono block">
                            Currency: INR (₹)
                          </span>
                        </div>

                        {/* 4. Razorpay Payment ID */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-subtle block">
                            Razorpay Payment ID
                          </span>
                          {ord.razorpayPaymentId ? (
                            <div className="flex items-center gap-1.5">
                              <code className="text-xs font-mono font-semibold text-neutral-200 bg-neutral-900 px-2 py-1 rounded border border-neutral-800 truncate max-w-[180px]">
                                {ord.razorpayPaymentId}
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(ord.razorpayPaymentId || "");
                                  setCopiedId(ord.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                                title="Copy Payment ID"
                              >
                                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          ) : ord.isManualGrant ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-red/10 border border-brand-red/30 text-brand-red font-mono text-xs font-semibold">
                              <Shield className="h-3 w-3" />
                              <span>Admin Granted</span>
                            </span>
                          ) : (
                            <span className="text-xs font-mono text-neutral-500 italic">
                              Not available
                            </span>
                          )}
                          <span className="text-[10px] text-brand-subtle font-mono block">
                            Method: {ord.isManualGrant ? "Direct Grant" : ord.paymentMethod || "Razorpay"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
