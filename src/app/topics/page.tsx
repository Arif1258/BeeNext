"use client";

import React, { useEffect, useState } from "react";
import CategoryCard from "@/components/CategoryCard";
import { useAuth } from "@/context/AuthContext";
import { Search, Sparkles, Filter, BookOpen } from "lucide-react";

export default function TopicsPage() {
  const { hasCategoryAccess } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "FREE" | "PREMIUM">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.title.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "FREE") return cat.isFree;
    if (filter === "PREMIUM") return !cat.isFree;
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Page Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-card border border-brand-border text-brand-red">
            <BookOpen className="h-3.5 w-3.5" />
            <span>18 CURATED MODULES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            DSA Curriculum &amp; Notes
          </h1>
          <p className="text-sm text-brand-muted max-w-2xl leading-relaxed">
            Browse through complete Data Structures &amp; Algorithms topic tracks. Sorting is 100% free forever for all visitors. Select any category to explore problem breakdowns, Java solutions, and handwritten notes.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-xl bg-brand-card border border-brand-border">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
            <input
              type="text"
              placeholder="Search topic by name (e.g., Sorting, Graphs, Trees, Heaps)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-brand-black border border-brand-border rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-brand-subtle focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 bg-brand-black p-1 rounded-lg border border-brand-border">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                filter === "ALL"
                  ? "bg-brand-red text-white font-bold"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              All (18)
            </button>
            <button
              onClick={() => setFilter("FREE")}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                filter === "FREE"
                  ? "bg-brand-red text-white font-bold"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Free (1)</span>
            </button>
            <button
              onClick={() => setFilter("PREMIUM")}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                filter === "PREMIUM"
                  ? "bg-brand-red text-white font-bold"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              Premium (17)
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-xl bg-brand-card/40 border border-brand-border animate-pulse"
              />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center text-brand-muted bg-brand-card rounded-xl border border-brand-border">
            No categories match your search term &quot;{search}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map((cat) => (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                title={cat.title}
                slug={cat.slug}
                description={cat.description}
                isFree={cat.isFree}
                price={cat.price}
                problemCount={cat._count?.problems || 0}
                hasAccess={hasCategoryAccess(cat.id, cat.isFree)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
