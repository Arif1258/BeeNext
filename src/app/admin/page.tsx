"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Shield,
  Users,
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
} from "lucide-react";

type TabKey = "OVERVIEW" | "USERS" | "ORDERS";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
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
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes?: string | null;
  language?: string | null;
  productTitle: string;
  quantity?: number;
  totalAmount: number;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  orderStatus: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentMethod?: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  items?: any;
  carrier?: string | null;
  trackingNumber?: string | null;
  requiresCertificate?: boolean;
  certificateStatus?: string | null;
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
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>("ALL");

  // Order editing states
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [editingOrders, setEditingOrders] = useState<{
    [id: string]: {
      orderStatus: string;
      carrier: string;
      trackingNumber: string;
      certificateStatus?: string;
    };
  }>({});

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
        const orders = o.orders || [];
        setOrdersList(orders);

        const initialEditing: any = {};
        orders.forEach((ord: OrderItem) => {
          initialEditing[ord.id] = {
            orderStatus: ord.orderStatus,
            carrier: ord.carrier || "",
            trackingNumber: ord.trackingNumber || "",
          };
        });
        setEditingOrders(initialEditing);
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

  // Copy full delivery address to clipboard
  const handleCopyAddress = (ord: OrderItem) => {
    const fullAddress = [
      ord.customerName,
      `Phone: ${ord.customerPhone}`,
      ord.addressLine1,
      ord.addressLine2,
      `${ord.city}, ${ord.state} - ${ord.postalCode}`,
      ord.country || "India",
      ord.notes ? `Note: ${ord.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(fullAddress);
    setCopiedId(ord.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === ord.id ? null : prev));
    }, 2000);
  };

  // Update order delivery status & tracking
  const handleUpdateOrderStatus = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const details = editingOrders[orderId] || {};
      const res = await fetch(`/api/admin/printed-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      setActionSuccess(`Order ${data.order?.orderNumber} status updated to: ${data.order?.orderStatus}`);
      await loadDashboardData();
    } catch (err: any) {
      setActionError(err.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
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
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.includes(orderSearch) ||
        o.city.toLowerCase().includes(q) ||
        o.state.toLowerCase().includes(q) ||
        o.postalCode.includes(q) ||
        o.productTitle.toLowerCase().includes(q);

      const matchesStatus = orderStatusFilter === "ALL" || o.orderStatus === orderStatusFilter;
      const matchesPayment = orderPaymentFilter === "ALL" || o.paymentStatus === orderPaymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [ordersList, orderSearch, orderStatusFilter, orderPaymentFilter]);

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
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stat 1: Registered Users */}
              <div className="p-5 rounded-2xl bg-brand-card border border-brand-border flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-brand-subtle block">
                    Registered Users
                  </span>
                  <span className="text-2xl font-bold font-mono text-white mt-0.5 block">
                    {metrics?.totalUsers ?? usersList.length}
                  </span>
                  <span className="text-[11px] text-brand-muted block mt-0.5">
                    1 Admin &bull; 1 Customer
                  </span>
                </div>
              </div>

              {/* Stat 2: Customer Orders */}
              <div className="p-5 rounded-2xl bg-brand-card border border-brand-border flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-6 w-6 text-brand-red" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-brand-subtle block">
                    Customer Orders
                  </span>
                  <span className="text-2xl font-bold font-mono text-white mt-0.5 block">
                    {metrics?.actualOrdersCount ?? 0}
                  </span>
                  <span className="text-[11px] text-brand-muted block mt-0.5">
                    {metrics?.actualOrdersCount === 0
                      ? "0 Customer Orders"
                      : `${metrics?.actualOrdersCount} Customer Orders`}
                  </span>
                </div>
              </div>

              {/* Stat 3: Total Revenue */}
              <div className="p-5 rounded-2xl bg-brand-card border border-brand-border flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-brand-subtle block">
                    Total Revenue
                  </span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">
                    {formatCurrency(metrics?.totalRevenue ?? 0)}
                  </span>
                  <span className="text-[11px] text-brand-subtle font-mono block mt-0.5">
                    Real paid revenue
                  </span>
                </div>
              </div>
            </div>

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
                      const isTest = ord.orderNumber.includes("TEST");
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
                              {isTest ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  TEST ORDER
                                </span>
                              ) : (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                    ord.paymentStatus === "COMPLETED"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-amber-500/20 text-amber-400"
                                  }`}
                                >
                                  {ord.paymentStatus}
                                </span>
                              )}
                              {ord.requiresCertificate && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/20 text-brand-red border border-brand-red/40 flex items-center gap-1">
                                  <Award className="h-2.5 w-2.5" />
                                  <span>Cert Req</span>
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-brand-text block truncate">
                              {ord.customerName} &bull; {ord.customerPhone}
                            </span>
                            <span className="text-[11px] text-brand-subtle block truncate">
                              {ord.city}, {ord.state} &bull; {formatDate(ord.createdAt)}
                            </span>
                          </div>
                          <div className="sm:text-right flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-border/40">
                            <span className={`font-mono font-bold text-sm ${isTest ? "text-amber-400" : "text-emerald-400"}`}>
                              ₹{ord.totalAmount}
                            </span>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-card border border-brand-border text-brand-subtle mt-1">
                              {ord.orderStatus}
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
        {/* 3. ORDERS TAB (Clean Card-Based Customer Order Management)     */}
        {/* ============================================================== */}
        {activeTab === "ORDERS" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-brand-card border border-brand-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-subtle" />
                <input
                  type="text"
                  placeholder="Search by order #, customer, phone, city, state..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-black border border-brand-border text-xs text-white placeholder-brand-subtle focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {["ALL", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "PENDING", "CANCELLED"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase whitespace-nowrap transition ${
                        orderStatusFilter === st
                          ? "bg-brand-red text-white font-semibold"
                          : "bg-brand-black border border-brand-border text-brand-muted hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-brand-black border border-brand-border text-xs text-white font-mono focus:outline-none focus:border-brand-red"
                >
                  <option value="ALL">Payment: All</option>
                  <option value="COMPLETED">Paid / Completed</option>
                  <option value="PENDING">Payment Pending / Test</option>
                  <option value="FAILED">Payment Failed</option>
                </select>
              </div>
            </div>

            {/* Orders List / Cards */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 rounded-2xl border border-brand-border bg-brand-card text-center text-xs text-brand-muted space-y-2">
                <Package className="h-10 w-10 text-brand-border mx-auto" />
                <p className="text-sm font-semibold text-white">
                  {ordersList.length === 0 ? "No customer orders yet" : "No orders match your filter"}
                </p>
                <p className="text-brand-subtle">
                  {ordersList.length === 0
                    ? "The orders section is currently empty. Genuine customer orders will appear here automatically with complete details."
                    : "No actual orders match your current filter criteria."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const editState = editingOrders[ord.id] || {
                    orderStatus: ord.orderStatus,
                    carrier: ord.carrier || "",
                    trackingNumber: ord.trackingNumber || "",
                    certificateStatus: ord.certificateStatus || "PENDING",
                  };
                  const isUpdating = updatingOrderId === ord.id;
                  const isCopied = copiedId === ord.id;
                  const isTestOrder =
                    ord.orderNumber.includes("TEST") || ord.customerName.includes("[TEST]");

                  return (
                    <div
                      key={ord.id}
                      className={`rounded-2xl border bg-brand-card overflow-hidden transition shadow-sm ${
                        isTestOrder
                          ? "border-amber-500/40 hover:border-amber-500/60"
                          : "border-brand-border hover:border-brand-border/90"
                      }`}
                    >
                      {/* Test Order Notification Banner */}
                      {isTestOrder && (
                        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-amber-400 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                            <span className="font-bold tracking-wide">
                              TEST ORDER &mdash; FOR TESTING DASHBOARD FEATURES ONLY
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-300/80 bg-amber-500/20 px-2 py-0.5 rounded font-mono">
                            Excluded from revenue &bull; Unpaid Test
                          </span>
                        </div>
                      )}

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
                          {isTestOrder ? (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              TEST ORDER &bull; PENDING
                            </span>
                          ) : (
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase ${
                                ord.paymentStatus === "COMPLETED"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : ord.paymentStatus === "FAILED"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              Payment: {ord.paymentStatus}
                            </span>
                          )}

                          {/* Current Delivery Status Badge */}
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase ${
                              ord.orderStatus === "DELIVERED"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : ord.orderStatus === "SHIPPED"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : ord.orderStatus === "CANCELLED"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-brand-red/20 text-brand-red border border-brand-red/30"
                            }`}
                          >
                            {ord.orderStatus}
                          </span>

                          {/* Certificate Required Status Badge */}
                          {ord.requiresCertificate && (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase bg-brand-red/20 text-brand-red border border-brand-red/40 flex items-center gap-1.5 shadow-sm">
                                <Award className="h-3.5 w-3.5 text-brand-red" />
                                <span>Physical Certificate Required</span>
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                                  (editState.certificateStatus || ord.certificateStatus) === "DELIVERED"
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : (editState.certificateStatus || ord.certificateStatus) === "PACKED" ||
                                      (editState.certificateStatus || ord.certificateStatus) === "SHIPPED"
                                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                    : (editState.certificateStatus || ord.certificateStatus) === "PRINTED"
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                }`}
                              >
                                Cert: {editState.certificateStatus || ord.certificateStatus || "PENDING"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Card Main Content */}
                      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Column 1 (5 cols): Customer Name & Complete Delivery Address */}
                        <div className="lg:col-span-5 space-y-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-subtle block mb-1">
                              Customer Information
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                              <span>{ord.customerName}</span>
                              {isTestOrder && (
                                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-normal">
                                  Test Persona
                                </span>
                              )}
                            </h3>
                            <div className="mt-1.5 space-y-1 text-xs font-mono">
                              <a
                                href={`tel:${ord.customerPhone}`}
                                className="flex items-center gap-2 text-brand-text hover:text-white transition"
                              >
                                <Phone className="h-3.5 w-3.5 text-brand-red flex-shrink-0" />
                                <span className="font-semibold text-white">{ord.customerPhone}</span>
                              </a>
                              <a
                                href={`mailto:${ord.customerEmail}`}
                                className="flex items-center gap-2 text-brand-subtle hover:text-white transition truncate"
                              >
                                <Mail className="h-3.5 w-3.5 text-brand-subtle flex-shrink-0" />
                                <span className="truncate">{ord.customerEmail}</span>
                              </a>
                            </div>
                          </div>

                          {/* Complete Delivery Address Box */}
                          <div className="p-4 rounded-xl bg-brand-black/90 border border-brand-border space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-subtle flex items-center gap-1.5 font-bold">
                                <MapPin className="h-3.5 w-3.5 text-brand-red" />
                                <span>Complete Delivery Address</span>
                              </span>
                              <button
                                onClick={() => handleCopyAddress(ord)}
                                className="text-[11px] text-brand-subtle hover:text-brand-red flex items-center gap-1 font-mono transition bg-brand-card px-2 py-0.5 rounded border border-brand-border/60"
                                title="Copy full address"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="text-xs text-white leading-relaxed font-sans space-y-0.5 pt-1">
                              <p className="font-medium text-white">{ord.addressLine1}</p>
                              {ord.addressLine2 && (
                                <p className="text-brand-muted">{ord.addressLine2}</p>
                              )}
                              <p className="font-mono text-brand-text">
                                {ord.city}, {ord.state} &ndash;{" "}
                                <strong className="text-white font-bold">{ord.postalCode}</strong>
                              </p>
                              <p className="text-[11px] text-brand-subtle font-mono uppercase">
                                {ord.country || "India"}
                              </p>
                            </div>

                            {ord.notes && (
                              <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 mt-2">
                                <strong className="font-semibold block">Order Notes:</strong>
                                <span>{ord.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Column 2 (3 cols): Ordered Product / Topic & Amount Paid */}
                        <div className="lg:col-span-3 space-y-4 lg:border-l lg:border-brand-border/70 lg:pl-6 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-subtle block mb-1">
                                Ordered Product / Topic
                              </span>
                              <div className="flex items-start gap-2">
                                <Package className="h-4 w-4 text-brand-red flex-shrink-0 mt-0.5" />
                                <span className="text-xs font-semibold text-white leading-snug">
                                  {ord.productTitle}
                                </span>
                              </div>
                              {ord.language && (
                                <div className="mt-1.5 flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-brand-subtle uppercase">Language:</span>
                                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold uppercase rounded bg-brand-red/10 border border-brand-red/30 text-brand-red">
                                    {ord.language}
                                  </span>
                                </div>
                              )}
                              <span className="text-[11px] text-brand-subtle font-mono block mt-1">
                                Quantity: {ord.quantity || 1} {ord.quantity === 1 ? "book" : "books"}
                              </span>

                              {/* Itemized Cart Items Breakdown */}
                              {Array.isArray(ord.items) && ord.items.length > 0 && (
                                <div className="mt-2 space-y-1.5 border border-brand-border/60 rounded-lg bg-brand-black/70 p-2.5 max-h-36 overflow-y-auto">
                                  <div className="text-[10px] font-mono text-brand-subtle uppercase font-bold">
                                    Itemized Books ({ord.items.length}):
                                  </div>
                                  {ord.items.map((it: any, i: number) => (
                                    <div key={i} className="text-[11px] flex justify-between items-start gap-1.5 border-b border-brand-border/30 pb-1 last:border-b-0 last:pb-0 font-mono">
                                      <span className="text-white truncate">
                                        {it.title} {it.language ? `(${it.language})` : ""} &times; {it.quantity || 1}
                                      </span>
                                      <span className="text-emerald-400 font-bold shrink-0">
                                        ₹{it.totalItemPrice || it.unitPrice * (it.quantity || 1)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-subtle block mb-1">
                                Amount
                              </span>
                              <div className="flex items-baseline gap-2">
                                <span
                                  className={`text-2xl font-bold font-mono block ${
                                    isTestOrder ? "text-amber-400" : "text-emerald-400"
                                  }`}
                                >
                                  ₹{ord.totalAmount}
                                </span>
                                {isTestOrder && (
                                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    Test
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-brand-subtle font-mono block mt-0.5">
                                {isTestOrder
                                  ? "Excluded from revenue (Test Mode)"
                                  : `Payment Method: ${ord.paymentMethod || "Razorpay"}`}
                              </span>
                              {ord.razorpayPaymentId && (
                                <span className="text-[10px] text-neutral-400 font-mono block truncate mt-0.5" title={ord.razorpayPaymentId}>
                                  Payment ID: {ord.razorpayPaymentId}
                                </span>
                              )}
                              {ord.razorpayOrderId && (
                                <span className="text-[10px] text-neutral-500 font-mono block truncate" title={ord.razorpayOrderId}>
                                  Razorpay Order: {ord.razorpayOrderId}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-[10px] text-brand-subtle font-mono pt-2 border-t border-brand-border/50">
                            Order Date: {formatDate(ord.createdAt)}
                          </div>
                        </div>

                        {/* Column 3 (4 cols): Update Delivery Status & Tracking */}
                        <div className="lg:col-span-4 space-y-3 lg:border-l lg:border-brand-border/70 lg:pl-6 bg-brand-black/40 p-4 rounded-xl border border-brand-border/60">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-subtle flex items-center gap-1.5 font-bold">
                            <Truck className="h-3.5 w-3.5 text-brand-red" />
                            <span>Update Delivery Status</span>
                          </span>

                          <div className="space-y-2.5">
                            <div>
                              <label className="text-[11px] text-brand-muted block mb-1 font-mono">
                                Delivery Status
                              </label>
                              <select
                                value={editState.orderStatus}
                                onChange={(e) =>
                                  setEditingOrders((prev) => ({
                                    ...prev,
                                    [ord.id]: { ...editState, orderStatus: e.target.value },
                                  }))
                                }
                                className="w-full px-3 py-1.5 rounded-lg bg-brand-black border border-brand-border text-xs text-white font-mono focus:outline-none focus:border-brand-red"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-brand-subtle block mb-0.5 font-mono">
                                  Courier / Carrier
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. DTDC"
                                  value={editState.carrier}
                                  onChange={(e) =>
                                    setEditingOrders((prev) => ({
                                      ...prev,
                                      [ord.id]: { ...editState, carrier: e.target.value },
                                    }))
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-brand-black border border-brand-border text-xs text-white placeholder-brand-subtle focus:outline-none focus:border-brand-red"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-brand-subtle block mb-0.5 font-mono">
                                  Tracking Number
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. TRK12345"
                                  value={editState.trackingNumber}
                                  onChange={(e) =>
                                    setEditingOrders((prev) => ({
                                      ...prev,
                                      [ord.id]: { ...editState, trackingNumber: e.target.value },
                                    }))
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-brand-black border border-brand-border text-xs text-white placeholder-brand-subtle font-mono focus:outline-none focus:border-brand-red"
                                />
                              </div>
                            </div>

                            {/* Certificate Tracking Status if order requires certificate */}
                            {ord.requiresCertificate && (
                              <div className="pt-2 border-t border-brand-border/60">
                                <label className="text-[11px] text-brand-red block mb-1 font-mono flex items-center gap-1.5 font-bold">
                                  <Award className="h-3.5 w-3.5" />
                                  <span>Physical Certificate Status</span>
                                </label>
                                <select
                                  value={editState.certificateStatus || ord.certificateStatus || "PENDING"}
                                  onChange={(e) =>
                                    setEditingOrders((prev) => ({
                                      ...prev,
                                      [ord.id]: { ...editState, certificateStatus: e.target.value },
                                    }))
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg bg-brand-black border border-brand-border text-xs text-white font-mono focus:outline-none focus:border-brand-red"
                                >
                                  <option value="PENDING">PENDING &mdash; Not Printed</option>
                                  <option value="PRINTED">PRINTED &mdash; Printed, Ready to Pack</option>
                                  <option value="PACKED">PACKED &mdash; Included in Parcel</option>
                                  <option value="SHIPPED">SHIPPED &mdash; Dispatched</option>
                                  <option value="DELIVERED">DELIVERED &mdash; Delivered to Customer</option>
                                </select>
                              </div>
                            )}

                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id)}
                              disabled={isUpdating}
                              className="w-full mt-2 py-2 px-3 rounded-lg bg-brand-red hover:bg-red-600 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Saving Status...</span>
                                </>
                              ) : (
                                <span>Save Order Status</span>
                              )}
                            </button>
                          </div>
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
