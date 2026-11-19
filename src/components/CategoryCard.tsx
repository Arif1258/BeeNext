"use client";

import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, Sparkles, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

interface CategoryCardProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  isFree: boolean;
  price: number;
  problemCount: number;
  hasAccess: boolean;
}

export default function CategoryCard({
  id,
  title,
  slug,
  description,
  isFree,
  price,
  problemCount,
  hasAccess,
}: CategoryCardProps) {
  return (
    <Link
      href={`/topics/${slug}`}
      className="group relative flex flex-col justify-between rounded-xl bg-brand-card border border-brand-border p-5 hover:border-brand-red/60 hover:bg-brand-cardHover transition-all duration-200 shadow-card"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-black border border-brand-border text-xs font-mono font-bold text-white group-hover:border-brand-red transition-colors">
              <BookOpen className="h-3.5 w-3.5 text-brand-red" />
            </span>
            <span className="text-xs font-mono text-brand-muted">
              {problemCount} {problemCount === 1 ? "problem" : "problems"}
            </span>
          </div>

          {/* Pricing or Free Indicator */}
          {isFree ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-extrabold bg-brand-red text-white shadow-brand">
              <Sparkles className="h-3 w-3" />
              100% FREE
            </span>
          ) : hasAccess ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/10 text-white border border-white/20">
              <CheckCircle2 className="h-3 w-3 text-brand-red" />
              UNLOCKED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-brand-black border border-brand-border text-white">
              <Lock className="h-3 w-3 text-brand-red" />
              {formatCurrency(price)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-brand-red transition-colors flex items-center justify-between">
          <span>{title}</span>
          <ArrowRight className="h-4 w-4 text-brand-muted group-hover:text-brand-red group-hover:translate-x-1 transition-all" />
        </h3>

        {/* Description */}
        <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Card Footer status */}
      <div className="pt-4 mt-4 border-t border-brand-border/60 flex items-center justify-between text-[11px] font-mono text-brand-subtle">
        <span>Curated Handwritten Notes</span>
        <span className="text-white group-hover:text-brand-red transition-colors font-medium">
          Explore Problems &rarr;
        </span>
      </div>
    </Link>
  );
}
