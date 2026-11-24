"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";
import CodingPlayground from "@/components/CodingPlayground";
import { useAuth } from "@/context/AuthContext";

interface ProblemCodeClientProps {
  problem: any;
}

export default function ProblemCodeClient({ problem }: ProblemCodeClientProps) {
  const { refreshUser } = useAuth();

  // Parse examples if array or string
  let examplesList: Array<{ input?: string; output?: string; explanation?: string }> = [];
  if (problem?.examples) {
    if (Array.isArray(problem.examples)) {
      examplesList = problem.examples;
    } else if (typeof problem.examples === "string") {
      try {
        const parsed = JSON.parse(problem.examples);
        if (Array.isArray(parsed)) examplesList = parsed;
      } catch {
        // Raw text example
      }
    }
  }

  // Format constraints into bullet points
  const constraintsList = problem?.constraints
    ? String(problem.constraints)
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] overflow-hidden bg-brand-black text-white flex flex-col p-2.5 sm:p-3 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-[1750px] w-full flex-1 flex flex-col min-h-0">
        {/* Top Header Bar: Clean & Minimal - Only Back to DSA Topics */}
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-1.5 shrink-0">
          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-mono font-semibold text-neutral-300 hover:text-white transition-all shadow-sm group"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-brand-red group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to DSA Topics</span>
          </Link>
          {problem?.category?.title && (
            <span className="text-[11px] font-mono font-medium text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded">
              {problem.category.title}
            </span>
          )}
        </div>

        {/* LeetCode-Inspired Two-Column Layout (Desktop Viewport Optimized) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 pt-2 items-stretch">
          {/* Left Column: Problem Details (5 Cols on large screens, independently scrollable) */}
          <div className="lg:col-span-5 rounded-xl border border-brand-border bg-brand-card p-3.5 sm:p-4 overflow-y-auto h-full space-y-4 shadow-card scrollbar-thin">
            {/* Title Header */}
            <div className="space-y-1.5 border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <DifficultyBadge difficulty={problem?.difficulty} size="sm" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {problem?.title}
              </h1>
            </div>

            {/* Problem Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                Description
              </h3>
              <div className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line space-y-2">
                {problem?.description || "Master this core interview problem by implementing an efficient solution below."}
              </div>
            </div>

            {/* Input Format */}
            {problem?.inputFormat && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Input Format
                </h3>
                <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-3.5 font-mono text-xs text-neutral-300 leading-relaxed">
                  {problem.inputFormat}
                </div>
              </div>
            )}

            {/* Output Format */}
            {problem?.outputFormat && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Output Format
                </h3>
                <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-3.5 font-mono text-xs text-neutral-300 leading-relaxed">
                  {problem.outputFormat}
                </div>
              </div>
            )}

            {/* Examples */}
            {examplesList.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Examples
                </h3>
                <div className="space-y-3">
                  {examplesList.map((ex, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-neutral-900 border border-neutral-800 p-3.5 space-y-2 font-mono text-xs"
                    >
                      <div className="font-bold text-neutral-200">Example {idx + 1}:</div>
                      {ex.input && (
                        <div>
                          <span className="text-neutral-400">Input: </span>
                          <span className="text-white">{ex.input}</span>
                        </div>
                      )}
                      {ex.output && (
                        <div>
                          <span className="text-neutral-400">Output: </span>
                          <span className="text-emerald-400 font-semibold">{ex.output}</span>
                        </div>
                      )}
                      {ex.explanation && (
                        <div className="text-neutral-400 text-[11px] pt-1 border-t border-neutral-800/80 font-sans">
                          <strong className="font-mono text-neutral-300">Explanation: </strong>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Sample Test Case
                </h3>
                <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-3.5 space-y-1.5 font-mono text-xs">
                  <div className="text-neutral-400">Input: <span className="text-white">Sample problem inputs</span></div>
                  <div className="text-neutral-400">Output: <span className="text-emerald-400">Computed return value</span></div>
                </div>
              </div>
            )}

            {/* Constraints */}
            {constraintsList.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  Constraints
                </h3>
                <ul className="rounded-xl bg-neutral-900 border border-neutral-800 p-3.5 space-y-1.5 text-xs font-mono text-neutral-300 list-disc list-inside">
                  {constraintsList.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Monaco Editor Workspace (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-0">
            <CodingPlayground
              problemId={problem?.id}
              problemTitle={problem?.title}
              problemSlug={problem?.slug}
              onSuccess={refreshUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
