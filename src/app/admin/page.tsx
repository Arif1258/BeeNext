"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Shield,
  Users,
  DollarSign,
  ShoppingBag,
  BookOpen,
  FileCode,
  Upload,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "CATEGORIES" | "PROBLEMS" | "NOTES" | "ORDERS" | "USERS"
  >("OVERVIEW");

  const [metrics, setMetrics] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Forms states
  const [newCategory, setNewCategory] = useState({
    title: "",
    slug: "",
    description: "",
    isFree: false,
    price: 299,
    order: 0,
  });

  const [newProblem, setNewProblem] = useState({
    title: "",
    slug: "",
    categoryId: "",
    difficulty: "MEDIUM",
    description: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    leetcodeUrl: "",
    isFree: false,
    price: 49,
    order: 0,
    bruteForce: {
      title: "Brute Force Approach",
      explanation: "",
      javaCode: "",
      timeComplexity: "O(N^2)",
      spaceComplexity: "O(1)",
    },
    optimal: {
      title: "Optimal Approach",
      explanation: "",
      javaCode: "",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
    },
  });

  const [uploadNote, setUploadNote] = useState({
    problemId: "",
    title: "",
    isProtected: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadAllAdminData = async () => {
    try {
      const [metricsRes, catRes, probRes, ordRes, usersRes] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/categories"),
        fetch("/api/problems"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/users"),
      ]);

      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m);
      }
      if (catRes.ok) {
        const c = await catRes.json();
        setCategories(c.categories || []);
      }
      if (probRes.ok) {
        const p = await probRes.json();
        setProblems(p.problems || []);
      }
      if (ordRes.ok) {
        const o = await ordRes.json();
        setOrders(o.purchases || []);
      }
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsersList(u.users || []);
      }
    } catch (err) {
      console.error("Admin data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
      return;
    }
    if (user?.role === "ADMIN") {
      loadAllAdminData();
    }
  }, [user, authLoading, router]);

  // Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionSuccess(`Category "${newCategory.title}" created successfully.`);
      setNewCategory({
        title: "",
        slug: "",
        description: "",
        isFree: false,
        price: 299,
        order: 0,
      });
      await loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionSuccess("Category deleted successfully.");
      await loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete category");
    }
  };

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProblem),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionSuccess(`Problem "${newProblem.title}" created successfully with Java solutions.`);
      setNewProblem({
        title: "",
        slug: "",
        categoryId: "",
        difficulty: "MEDIUM",
        description: "",
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        leetcodeUrl: "",
        isFree: false,
        price: 49,
        order: 0,
        bruteForce: {
          title: "Brute Force Approach",
          explanation: "",
          javaCode: "",
          timeComplexity: "O(N^2)",
          spaceComplexity: "O(1)",
        },
        optimal: {
          title: "Optimal Approach",
          explanation: "",
          javaCode: "",
          timeComplexity: "O(N)",
          spaceComplexity: "O(1)",
        },
      });
      await loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || "Failed to create problem");
    }
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;
    try {
      const res = await fetch(`/api/problems/id/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionSuccess("Problem deleted successfully.");
      await loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete problem");
    }
  };

  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadNote.problemId || !uploadNote.title) {
      setActionError("Please choose a problem, title, and file.");
      return;
    }

    setUploading(true);
    setActionError(null);
    setActionSuccess(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("problemId", uploadNote.problemId);
    formData.append("title", uploadNote.title);
    formData.append("isProtected", uploadNote.isProtected.toString());

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionSuccess(`Handwritten note "${uploadNote.title}" uploaded successfully.`);
      setSelectedFile(null);
      setUploadNote({ problemId: "", title: "", isProtected: true });
      await loadAllAdminData();
    } catch (err: any) {
      setActionError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white">
        <div className="h-8 w-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return null;
  }

  const m = metrics?.metrics || {
    totalUsers: 0,
    totalRevenue: 0,
    totalPurchases: 0,
    freeTopics: 1,
    premiumTopics: 17,
    totalProblems: 0,
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header */}
        <div className="rounded-2xl border border-brand-border bg-brand-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-card">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-brand">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  BeeNext Admin Control Center
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-red text-white">
                  ROOT
                </span>
              </div>
              <p className="text-xs text-brand-muted font-mono mt-0.5">
                Authenticated as {user.name} ({user.email})
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-mono text-brand-muted hover:text-white transition-colors"
          >
            &larr; Return to Public Platform
          </Link>
        </div>

        {/* Global Notifications */}
        {actionSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-brand-redMuted border border-brand-red text-xs font-mono text-white">
            <AlertCircle className="h-4 w-4 text-brand-red flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-brand-border pb-2 overflow-x-auto">
          {[
            { key: "OVERVIEW", label: "Overview & Metrics", icon: Sparkles },
            { key: "CATEGORIES", label: "Categories (18)", icon: BookOpen },
            { key: "PROBLEMS", label: "Problems & Java Code", icon: FileCode },
            { key: "NOTES", label: "Upload Notes / PDFs", icon: Upload },
            { key: "ORDERS", label: "Orders & Revenue", icon: CreditCard },
            { key: "USERS", label: "User Access", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setActionSuccess(null);
                  setActionError(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-brand-red text-white shadow-brand"
                    : "text-brand-muted hover:text-white hover:bg-brand-card"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                <span className="text-[10px] uppercase font-mono text-brand-subtle block">
                  Total Users
                </span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {m.totalUsers}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                <span className="text-[10px] uppercase font-mono text-brand-subtle block">
                  Total Revenue
                </span>
                <span className="text-2xl font-bold font-mono text-brand-red mt-1 block">
                  {formatCurrency(m.totalRevenue)}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                <span className="text-[10px] uppercase font-mono text-brand-subtle block">
                  Total Purchases
                </span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {m.totalPurchases}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                <span className="text-[10px] uppercase font-mono text-brand-subtle block">
                  Free Topics
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                  {m.freeTopics}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                <span className="text-[10px] uppercase font-mono text-brand-subtle block">
                  Premium Topics
                </span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {m.premiumTopics}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-brand-card border border-brand-border">
                <span className="text-[10px] uppercase font-mono text-brand-subtle block">
                  Total Problems
                </span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {m.totalProblems}
                </span>
              </div>
            </div>

            {/* Recent Purchases & Users */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="rounded-2xl border border-brand-border bg-brand-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-brand-red" />
                    <span>Recent Completed Orders</span>
                  </h3>
                </div>
                {!metrics?.recentPurchases || metrics.recentPurchases.length === 0 ? (
                  <p className="text-xs text-brand-muted py-4 text-center">No transactions yet.</p>
                ) : (
                  <ul className="space-y-2 text-xs font-mono">
                    {metrics.recentPurchases.map((p: any) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-brand-black border border-brand-border"
                      >
                        <div>
                          <span className="text-white font-semibold">{p.user?.name}</span>
                          <span className="text-brand-subtle text-[11px] block">
                            {p.purchaseType} • {formatDate(p.createdAt)}
                          </span>
                        </div>
                        <span className="text-emerald-400 font-bold">
                          +{formatCurrency(p.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Recent Registered Users */}
              <div className="rounded-2xl border border-brand-border bg-brand-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-red" />
                    <span>Recent Users</span>
                  </h3>
                </div>
                {!metrics?.recentUsers || metrics.recentUsers.length === 0 ? (
                  <p className="text-xs text-brand-muted py-4 text-center">No users registered yet.</p>
                ) : (
                  <ul className="space-y-2 text-xs font-mono">
                    {metrics.recentUsers.map((u: any) => (
                      <li
                        key={u.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-brand-black border border-brand-border"
                      >
                        <div>
                          <span className="text-white font-semibold">{u.name}</span>
                          <span className="text-brand-subtle text-[11px] block">{u.email}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-brand-card border border-brand-border text-brand-muted uppercase">
                          {u.role}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. CATEGORIES TAB */}
        {activeTab === "CATEGORIES" && (
          <div className="space-y-6">
            {/* Create Category Card */}
            <div className="rounded-2xl border border-brand-border bg-brand-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-brand-red" />
                <span>Add New DSA Category</span>
              </h3>
              <form onSubmit={handleCreateCategory} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                    Category Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategory.title}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        title: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                      })
                    }
                    placeholder="e.g. Disjoint Set Union"
                    className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    value={newCategory.price}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, price: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, description: e.target.value })
                    }
                    placeholder="Curriculum summary..."
                    className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <label className="flex items-center space-x-2 text-xs font-mono text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCategory.isFree}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, isFree: e.target.checked })
                      }
                      className="rounded accent-brand-red"
                    />
                    <span>100% Free Category</span>
                  </label>

                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Categories Table */}
            <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="p-4 bg-brand-black border-b border-brand-border flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Current Categories ({categories.length})
                </span>
                <span className="text-[11px] text-brand-muted font-mono">
                  Sorting is permanently free by business rule
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-subtle bg-brand-black/40">
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Slug</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Problems</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-brand-surface/30 text-white">
                        <td className="py-3 px-3 font-bold">{cat.title}</td>
                        <td className="py-3 px-3 text-brand-muted">{cat.slug}</td>
                        <td className="py-3 px-3">
                          {cat.isFree ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-brand-red text-white font-bold">
                              FREE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-brand-black border border-brand-border text-brand-muted">
                              PREMIUM
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold">
                          {cat.isFree ? "₹0" : formatCurrency(cat.price)}
                        </td>
                        <td className="py-3 px-3 text-brand-muted">
                          {cat._count?.problems || 0}
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            disabled={cat.slug === "sorting"}
                            className="p-1 text-brand-muted hover:text-brand-red disabled:opacity-30"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. PROBLEMS TAB */}
        {activeTab === "PROBLEMS" && (
          <div className="space-y-6">
            {/* Create Problem Form */}
            <div className="rounded-2xl border border-brand-border bg-brand-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-brand-red" />
                <span>Add New DSA Problem with Java Code</span>
              </h3>
              <form onSubmit={handleCreateProblem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                      Problem Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newProblem.title}
                      onChange={(e) =>
                        setNewProblem({
                          ...newProblem,
                          title: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                        })
                      }
                      placeholder="e.g. Invert Binary Tree"
                      className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      required
                      value={newProblem.slug}
                      onChange={(e) => setNewProblem({ ...newProblem, slug: e.target.value })}
                      className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                      Category
                    </label>
                    <select
                      required
                      value={newProblem.categoryId}
                      onChange={(e) =>
                        setNewProblem({ ...newProblem, categoryId: e.target.value })
                      }
                      className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                      Difficulty
                    </label>
                    <select
                      value={newProblem.difficulty}
                      onChange={(e) =>
                        setNewProblem({ ...newProblem, difficulty: e.target.value })
                      }
                      className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                      LeetCode URL
                    </label>
                    <input
                      type="url"
                      value={newProblem.leetcodeUrl}
                      onChange={(e) =>
                        setNewProblem({ ...newProblem, leetcodeUrl: e.target.value })
                      }
                      placeholder="https://leetcode.com/problems/..."
                      className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                      Individual Price (INR)
                    </label>
                    <input
                      type="number"
                      value={newProblem.price}
                      onChange={(e) =>
                        setNewProblem({ ...newProblem, price: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-2 text-xs font-mono text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProblem.isFree}
                        onChange={(e) =>
                          setNewProblem({ ...newProblem, isFree: e.target.checked })
                        }
                        className="rounded accent-brand-red"
                      />
                      <span>Mark Individual Problem Free</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                    Problem Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newProblem.description}
                    onChange={(e) =>
                      setNewProblem({ ...newProblem, description: e.target.value })
                    }
                    placeholder="Enter complete algorithmic problem statement..."
                    className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                {/* Optimal Java Code Block */}
                <div className="p-4 rounded-xl bg-brand-black border border-brand-border space-y-3">
                  <span className="text-xs font-mono font-bold text-brand-red uppercase block">
                    Optimal Solution (Java)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newProblem.optimal.timeComplexity}
                      onChange={(e) =>
                        setNewProblem({
                          ...newProblem,
                          optimal: { ...newProblem.optimal, timeComplexity: e.target.value },
                        })
                      }
                      placeholder="Time Complexity (e.g. O(N))"
                      className="bg-brand-card border border-brand-border rounded px-3 py-1.5 text-xs font-mono text-white"
                    />
                    <input
                      type="text"
                      value={newProblem.optimal.spaceComplexity}
                      onChange={(e) =>
                        setNewProblem({
                          ...newProblem,
                          optimal: { ...newProblem.optimal, spaceComplexity: e.target.value },
                        })
                      }
                      placeholder="Space Complexity (e.g. O(1))"
                      className="bg-brand-card border border-brand-border rounded px-3 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <textarea
                    rows={4}
                    value={newProblem.optimal.explanation}
                    onChange={(e) =>
                      setNewProblem({
                        ...newProblem,
                        optimal: { ...newProblem.optimal, explanation: e.target.value },
                      })
                    }
                    placeholder="Architectural explanation of optimal approach..."
                    className="w-full bg-brand-card border border-brand-border rounded px-3 py-2 text-xs font-mono text-white"
                  />
                  <textarea
                    rows={6}
                    value={newProblem.optimal.javaCode}
                    onChange={(e) =>
                      setNewProblem({
                        ...newProblem,
                        optimal: { ...newProblem.optimal, javaCode: e.target.value },
                      })
                    }
                    placeholder="public class Solution { ... }"
                    className="w-full bg-brand-blackDeep border border-brand-border rounded px-3 py-2 text-xs font-mono text-gray-200"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all"
                >
                  Publish Problem &amp; Code
                </button>
              </form>
            </div>

            {/* Existing Problems List */}
            <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden">
              <div className="p-4 bg-brand-black border-b border-brand-border">
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Published Problems ({problems.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-subtle bg-brand-black/40">
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Difficulty</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">LeetCode</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {problems.map((p) => (
                      <tr key={p.id} className="hover:bg-brand-surface/30 text-white">
                        <td className="py-3 px-3 font-bold">
                          <Link href={`/problem/${p.slug}`} className="hover:text-brand-red">
                            {p.title}
                          </Link>
                        </td>
                        <td className="py-3 px-3 text-brand-muted">{p.category?.title}</td>
                        <td className="py-3 px-3 font-semibold">{p.difficulty}</td>
                        <td className="py-3 px-3">
                          {p.isFree || p.category?.isFree ? "Free" : formatCurrency(p.price)}
                        </td>
                        <td className="py-3 px-3">
                          {p.leetcodeUrl ? (
                            <a
                              href={p.leetcodeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-red hover:underline"
                            >
                              Link &rarr;
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteProblem(p.id)}
                            className="p-1 text-brand-muted hover:text-brand-red"
                            title="Delete Problem"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. NOTES & PDF UPLOADS TAB */}
        {activeTab === "NOTES" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-brand-border bg-brand-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="h-4 w-4 text-brand-red" />
                <span>Upload Handwritten Notes Image or PDF</span>
              </h3>
              <form onSubmit={handleUploadNote} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                    Select Target Problem
                  </label>
                  <select
                    required
                    value={uploadNote.problemId}
                    onChange={(e) =>
                      setUploadNote({ ...uploadNote, problemId: e.target.value })
                    }
                    className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="">Choose Problem...</option>
                    {problems.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.category?.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadNote.title}
                    onChange={(e) => setUploadNote({ ...uploadNote, title: e.target.value })}
                    placeholder="e.g. Recursion Tree & Invariant Proof"
                    className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-brand-subtle uppercase mb-1">
                    Select File (PNG, JPG, SVG, PDF)
                  </label>
                  <input
                    type="file"
                    required
                    accept=".png,.jpg,.jpeg,.svg,.webp,.pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full bg-brand-black border border-brand-border rounded-lg px-3 py-1.5 text-xs font-mono text-white file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand-red file:text-white file:text-[11px] file:font-mono"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-2 md:col-span-3">
                  <label className="flex items-center space-x-2 text-xs font-mono text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadNote.isProtected}
                      onChange={(e) =>
                        setUploadNote({ ...uploadNote, isProtected: e.target.checked })
                      }
                      className="rounded accent-brand-red"
                    />
                    <span>Protect content (requires verified purchase)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="ml-auto px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Upload &amp; Attach Note</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 5. ORDERS & TRANSACTIONS TAB */}
        {activeTab === "ORDERS" && (
          <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden">
            <div className="p-4 bg-brand-black border-b border-brand-border flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">
                All Transactions &amp; Orders ({orders.length})
              </span>
              <span className="text-xs font-mono font-bold text-brand-red">
                Total Revenue: {formatCurrency(m.totalRevenue)}
              </span>
            </div>
            {orders.length === 0 ? (
              <p className="text-xs text-brand-muted py-8 text-center">No orders recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-subtle bg-brand-black/40">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Razorpay Payment ID</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-brand-surface/30 text-white">
                        <td className="py-3 px-3 font-mono text-[11px] text-brand-muted">
                          {o.razorpayOrderId || o.id.slice(0, 10)}
                        </td>
                        <td className="py-3 px-3 font-semibold">{o.user?.name}</td>
                        <td className="py-3 px-3">{o.purchaseType}</td>
                        <td className="py-3 px-3 font-bold">{formatCurrency(o.amount)}</td>
                        <td className="py-3 px-3 text-brand-muted">
                          {o.razorpayPaymentId || "—"}
                        </td>
                        <td className="py-3 px-3 text-brand-subtle">{formatDate(o.createdAt)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              o.status === "COMPLETED"
                                ? "bg-emerald-950/60 border border-emerald-900 text-emerald-400"
                                : "bg-brand-redMuted text-brand-red"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 6. USERS TAB */}
        {activeTab === "USERS" && (
          <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden">
            <div className="p-4 bg-brand-black border-b border-brand-border">
              <span className="text-xs font-mono font-bold text-white uppercase">
                Registered Users &amp; Access Controls ({usersList.length})
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-brand-border text-brand-subtle bg-brand-black/40">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Completed Purchases</th>
                    <th className="py-2.5 px-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-brand-surface/30 text-white">
                      <td className="py-3 px-3 font-bold">{u.name}</td>
                      <td className="py-3 px-3 text-brand-muted">{u.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            u.role === "ADMIN"
                              ? "bg-brand-red text-white"
                              : "bg-brand-black border border-brand-border text-brand-muted"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">{u._count?.purchases || 0} items</td>
                      <td className="py-3 px-3 text-brand-subtle">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
