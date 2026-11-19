"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CodeViewer from "@/components/CodeViewer";
import HandwrittenNoteViewer from "@/components/HandwrittenNoteViewer";
import PaymentModal from "@/components/PaymentModal";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  ExternalLink,
  ChevronLeft,
  Bookmark,
  CheckCircle2,
  Sparkles,
  Lock,
  FileText,
  Code2,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function ProblemDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user, refreshUser } = useAuth();

  const [problem, setProblem] = useState<any>(null);
  const [access, setAccess] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"ALL" | "PROBLEM" | "CODE" | "NOTES">("ALL");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<"PROBLEM" | "CATEGORY">("PROBLEM");

  const isBookmarked = user?.bookmarks?.some((b) => b.problemId === problem?.id);
  const progressRecord = user?.progress?.find((p) => p.problemId === problem?.id);
  const isCompleted = progressRecord?.status === "COMPLETED";

  const fetchProblemData = async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/problems/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setProblem(data.problem);
        setAccess(data.access);
      }
    } catch (err) {
      console.error("Failed to load problem data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemData();
  }, [slug]);

  const handleBookmarkToggle = async () => {
    if (!user || !problem) return;
    try {
      await fetch("/api/user/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id }),
      });
      await refreshUser();
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  const handleProgressToggle = async () => {
    if (!user || !problem) return;
    const newStatus = isCompleted ? "IN_PROGRESS" : "COMPLETED";
    try {
      await fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, status: newStatus }),
      });
      if (newStatus === "COMPLETED") {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#E52532", "#FFFFFF"],
        });
      }
      await refreshUser();
    } catch (err) {
      console.error("Progress update failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 mx-auto border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-brand-muted">Loading DSA Problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center text-white p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Problem Not Found</h2>
          <p className="text-xs text-brand-muted">The requested DSA problem could not be located.</p>
          <Link
            href="/topics"
            className="inline-flex px-4 py-2 rounded-lg bg-brand-red text-white text-xs font-mono"
          >
            Return to Topics
          </Link>
        </div>
      </div>
    );
  }

  const hasAccess = access?.hasAccess ?? false;

  const difficultyColor =
    problem.difficulty === "EASY"
      ? "text-emerald-400 bg-emerald-950/40 border-emerald-900"
      : problem.difficulty === "MEDIUM"
      ? "text-amber-400 bg-amber-950/40 border-amber-900"
      : "text-brand-red bg-brand-redMuted border-brand-red/40";

  return (
    <div className="min-h-screen bg-brand-black text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/topics/${problem.category?.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-muted hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to {problem.category?.title}</span>
          </Link>

          <div className="flex items-center space-x-2">
            {/* Solved Status Toggle */}
            {user && (
              <button
                onClick={handleProgressToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                  isCompleted
                    ? "bg-emerald-950/60 border-emerald-700 text-emerald-400"
                    : "bg-brand-card border-brand-border text-brand-muted hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{isCompleted ? "Solved" : "Mark Solved"}</span>
              </button>
            )}

            {/* Bookmark button */}
            {user && (
              <button
                onClick={handleBookmarkToggle}
                className={`p-2 rounded-lg border transition-all ${
                  isBookmarked
                    ? "bg-brand-red/10 border-brand-red text-brand-red"
                    : "bg-brand-card border-brand-border text-brand-muted hover:text-white"
                }`}
                title="Bookmark Problem"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-brand-red" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Problem Header Card */}
        <div className="rounded-2xl border border-brand-border bg-brand-card p-6 space-y-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${difficultyColor}`}
              >
                {problem.difficulty}
              </span>
              <span className="text-xs font-mono text-brand-muted">
                Category: {problem.category?.title}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* LeetCode Button (Section B) */}
              {problem.leetcodeUrl && (
                <a
                  href={problem.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-black border border-brand-border text-white hover:border-brand-red text-xs font-mono font-semibold transition-all group"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-brand-red group-hover:scale-110 transition-transform" />
                  <span>Solve on LeetCode</span>
                </a>
              )}

              {/* Free or Unlock badge */}
              {problem.isFree || problem.category?.isFree ? (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-red text-white shadow-brand">
                  100% FREE
                </span>
              ) : hasAccess ? (
                <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>UNLOCKED</span>
                </span>
              ) : (
                <button
                  onClick={() => {
                    setPaymentTarget("PROBLEM");
                    setPaymentModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Unlock Problem ({formatCurrency(problem.price)})</span>
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {problem.title}
          </h1>

          {/* Locked Premium Banner if not unlocked */}
          {!hasAccess && (
            <div className="p-4 rounded-xl bg-brand-black border border-brand-red/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-brand-red flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  <span>PREMIUM PROBLEM CONTENT LOCKED</span>
                </span>
                <p className="text-xs text-brand-muted">
                  The complete Java optimal code and high-resolution handwritten diagrams are protected. Unlock now to view.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setPaymentTarget("PROBLEM");
                    setPaymentModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all"
                >
                  Unlock Problem ({formatCurrency(problem.price)})
                </button>
                <button
                  onClick={() => {
                    setPaymentTarget("CATEGORY");
                    setPaymentModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-border text-white text-xs font-mono font-semibold transition-colors"
                >
                  Category Pass ({formatCurrency(problem.category?.price || 299)})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section Tabs Switcher */}
        <div className="flex items-center space-x-2 border-b border-brand-border pb-2">
          <button
            onClick={() => setActiveSection("ALL")}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              activeSection === "ALL"
                ? "bg-brand-red text-white font-bold"
                : "text-brand-muted hover:text-white"
            }`}
          >
            All Sections
          </button>
          <button
            onClick={() => setActiveSection("PROBLEM")}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              activeSection === "PROBLEM"
                ? "bg-brand-red text-white font-bold"
                : "text-brand-muted hover:text-white"
            }`}
          >
            A. Problem Statement
          </button>
          <button
            onClick={() => setActiveSection("CODE")}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              activeSection === "CODE"
                ? "bg-brand-red text-white font-bold"
                : "text-brand-muted hover:text-white"
            }`}
          >
            B. Java Code Notes
          </button>
          <button
            onClick={() => setActiveSection("NOTES")}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              activeSection === "NOTES"
                ? "bg-brand-red text-white font-bold"
                : "text-brand-muted hover:text-white"
            }`}
          >
            C. Handwritten Notes
          </button>
        </div>

        {/* SECTION A: Problem Statement */}
        {(activeSection === "ALL" || activeSection === "PROBLEM") && (
          <div className="rounded-xl border border-brand-border bg-brand-card p-6 space-y-6 shadow-card">
            <div className="flex items-center space-x-2 border-b border-brand-border pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-xs">
                A
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Problem Description &amp; Specification
              </h2>
            </div>

            <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
              {problem.description}
            </div>

            {/* Input & Output Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problem.inputFormat && (
                <div className="p-4 rounded-xl bg-brand-black border border-brand-border space-y-1">
                  <h4 className="text-xs font-mono font-bold text-brand-red uppercase">
                    Input Format
                  </h4>
                  <p className="text-xs text-brand-muted font-mono whitespace-pre-line">
                    {problem.inputFormat}
                  </p>
                </div>
              )}

              {problem.outputFormat && (
                <div className="p-4 rounded-xl bg-brand-black border border-brand-border space-y-1">
                  <h4 className="text-xs font-mono font-bold text-brand-red uppercase">
                    Output Format
                  </h4>
                  <p className="text-xs text-brand-muted font-mono whitespace-pre-line">
                    {problem.outputFormat}
                  </p>
                </div>
              )}
            </div>

            {/* Constraints */}
            {problem.constraints && (
              <div className="p-4 rounded-xl bg-brand-black border border-brand-border space-y-1">
                <h4 className="text-xs font-mono font-bold text-brand-red uppercase">
                  Constraints
                </h4>
                <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-line">
                  {problem.constraints}
                </pre>
              </div>
            )}

            {/* Examples */}
            {problem.examples && Array.isArray(problem.examples) && problem.examples.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Example Cases
                </h4>
                <div className="space-y-3">
                  {problem.examples.map((ex: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-brand-black border border-brand-border space-y-2 text-xs font-mono"
                    >
                      <div className="text-brand-red font-bold">Example {idx + 1}:</div>
                      <div>
                        <span className="text-brand-subtle">Input: </span>
                        <span className="text-white">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-brand-subtle">Output: </span>
                        <span className="text-emerald-400">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div>
                          <span className="text-brand-subtle">Explanation: </span>
                          <span className="text-brand-muted">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION C: Code Notes (Brute Force + Optimal Java) */}
        {(activeSection === "ALL" || activeSection === "CODE") && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-xs">
                B
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Architectural Code Notes &amp; Complexities
              </h2>
            </div>

            <CodeViewer
              codes={problem.codes || []}
              onUnlockClick={() => {
                setPaymentTarget("PROBLEM");
                setPaymentModalOpen(true);
              }}
            />
          </div>
        )}

        {/* SECTION D: Handwritten Notes */}
        {(activeSection === "ALL" || activeSection === "NOTES") && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-xs">
                C
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Curated Handwritten Notes &amp; Diagrams
              </h2>
            </div>

            <HandwrittenNoteViewer
              notes={problem.notes || []}
              problemTitle={problem.title}
              onUnlockClick={() => {
                setPaymentTarget("PROBLEM");
                setPaymentModalOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Payment Checkout Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        type={paymentTarget}
        id={paymentTarget === "PROBLEM" ? problem.id : problem.category?.id}
        title={
          paymentTarget === "PROBLEM"
            ? `Unlock ${problem.title}`
            : `Unlock ${problem.category?.title} Category`
        }
        price={paymentTarget === "PROBLEM" ? problem.price : problem.category?.price || 299}
        onSuccess={() => {
          fetchProblemData();
        }}
      />
    </div>
  );
}
