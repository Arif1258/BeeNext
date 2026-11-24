"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Award,
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Download,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";

interface CertificateStatusData {
  isLoggedIn: boolean;
  totalProblems: number;
  completedProblems: number;
  completionPercentage: number;
  is85Completed: boolean;
  isActivePlus: boolean;
  dsaQualifiedAt: string | null;
  certificateClaimedAt: string | null;
  hasOrderedCertificate?: boolean;
  certificateOrder?: {
    id: string;
    orderNumber: string;
    deliveryStatus: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    isReplacement?: boolean;
    createdAt: string;
  } | null;
  isEligible: boolean;
}

export default function CertificatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const [data, setData] = useState<CertificateStatusData>({
    isLoggedIn: false,
    totalProblems: 495,
    completedProblems: 0,
    completionPercentage: 0,
    is85Completed: false,
    isActivePlus: false,
    dsaQualifiedAt: null,
    certificateClaimedAt: null,
    hasOrderedCertificate: false,
    certificateOrder: null,
    isEligible: false,
  });

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/certificate/status", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch certificate status", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  const {
    completedProblems,
    totalProblems,
    completionPercentage,
    is85Completed,
    isActivePlus,
    hasOrderedCertificate,
    isEligible,
  } = data;

  const handleDownload = async () => {
    setClaimError(null);
    setDownloading(true);

    try {
      const res = await fetch("/api/certificate/download");
      if (!res.ok) {
        const resData = await res.json().catch(() => ({}));
        throw new Error(resData.error || "Failed to download certificate.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BeeNext-Certificate-${(user?.name || "achievement")
        .replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setClaimSuccess("🎉 Your official certificate PDF has been generated and downloaded!");
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
      await fetchStatus();
    } catch (err: unknown) {
      setClaimError(err instanceof Error ? err.message : "Error downloading certificate.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* CERTIFICATE HEADING */}
        <header className="border-b border-neutral-800 pb-6 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-brand-border text-xs font-mono text-neutral-300">
            <Award className="h-3.5 w-3.5 text-brand-red" />
            <span>Official Credential</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
            BEENEXT CERTIFICATE OF ACHIEVEMENT
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Recognizing software engineers who master the comprehensive 495-problem Striver-aligned DSA curriculum with dedicated perseverance.
          </p>
        </header>

        {/* Success or Error Banner */}
        {claimSuccess && (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-emerald-300 text-sm">
            {claimSuccess}
          </div>
        )}
        {claimError && (
          <div className="rounded-xl border border-brand-red/50 bg-brand-red/10 p-4 text-brand-red text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{claimError}</span>
          </div>
        )}

        {/* TWO STRICT ELIGIBILITY REQUIREMENTS */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-mono font-bold text-neutral-300 uppercase tracking-wider">
              Eligibility Requirements (Both Required • No Additional Fee)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CRITERION 1: 85% SOLVED */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                is85Completed
                  ? "bg-neutral-900/90 border-emerald-500/40 shadow-sm"
                  : "bg-neutral-900 border-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-red">
                  Requirement 1
                </span>
                {is85Completed ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Completed ({completionPercentage}%)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                    <Lock className="h-3 w-3" />
                    <span>Pending ({completionPercentage}% / 85%)</span>
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                Complete &ge;85% of DSA Sheet
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Solve and mark at least 421 of the 495 problems across all 20 categories.
              </p>
              <div className="mt-3 pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400">
                Current progress: <strong className="text-white">{completedProblems}</strong> / {totalProblems} questions solved.
              </div>
            </div>

            {/* CRITERION 2: ACTIVE PLUS MEMBERSHIP */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isActivePlus
                  ? "bg-neutral-900/90 border-emerald-500/40 shadow-sm"
                  : "bg-neutral-900 border-neutral-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-red">
                  Requirement 2
                </span>
                {isActivePlus ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Active Plus Member</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                    <Lock className="h-3 w-3" />
                    <span>Plus Required</span>
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                Active BeeNext Plus Membership
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Hold an active Monthly or Yearly BeeNext Plus membership at the time of certificate issuance.
              </p>
              <div className="mt-3 pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400">
                {isActivePlus ? (
                  <span className="text-emerald-400">Active Plus subscription verified.</span>
                ) : (
                  <Link href="/membership" className="text-brand-red hover:underline font-semibold">
                    Upgrade to Plus (from ₹79) &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* DOWNLOAD CERTIFICATE ACTION SECTION */}
        <section className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 space-y-5 text-center shadow-card">
          {!user ? (
            <div className="space-y-4">
              <button
                type="button"
                disabled
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-mono font-bold text-xs sm:text-sm uppercase tracking-wider bg-neutral-800 text-neutral-500 border border-neutral-700/80 cursor-not-allowed opacity-60"
              >
                <Lock className="h-4 w-4" />
                <span>Download Certificate (Disabled)</span>
              </button>
              <div className="space-y-2">
                <p className="text-xs text-neutral-400 font-mono">
                  Please log in to your account to verify qualification and download your certificate.
                </p>
                <Link
                  href="/login?redirect=/certificate"
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-mono font-bold text-xs uppercase tracking-wider bg-brand-red hover:bg-brand-redHover text-white shadow-brand transition-all"
                >
                  <span>Log In to Account</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : is85Completed && isActivePlus ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400">
                <Award className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  🎉 You are Fully Qualified!
                </h3>
                <p className="text-xs text-neutral-300 max-w-xl mx-auto">
                  Both requirements satisfied: &ge;85% of DSA sheet solved and active Plus membership. Download your official verified certificate PDF below.
                </p>
              </div>

              {data.certificateOrder && (
                <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
                  <span>Serial: #{data.certificateOrder.orderNumber}</span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-emerald-400 font-semibold uppercase">
                    {data.certificateOrder.deliveryStatus}
                  </span>
                </div>
              )}

              <div>
                <button
                  type="button"
                  disabled={downloading}
                  onClick={handleDownload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-mono font-bold text-xs sm:text-sm uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-brand transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? "Generating PDF..." : "Download Certificate (PDF)"}</span>
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">
                Official credential verified with unique serial number • 100% Free
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-mono font-bold text-xs sm:text-sm uppercase tracking-wider bg-neutral-800 text-neutral-500 border border-neutral-700/80 cursor-not-allowed opacity-60"
                >
                  <Lock className="h-4 w-4" />
                  <span>Download Certificate (Disabled)</span>
                </button>
              </div>

              {/* Requirement Missing indicator */}
              {!is85Completed && !isActivePlus ? (
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-brand-red/10 border border-brand-red/30 text-xs font-mono text-brand-red">
                    Missing: 85% DSA sheet completion ({completedProblems}/{totalProblems} solved) AND Active Plus membership
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">
                    Solve problems in DSA Topics and activate Plus membership to unlock your certificate.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/topics"
                      className="py-2.5 px-5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono text-xs font-semibold"
                    >
                      Solve DSA Topics
                    </Link>
                    <Link
                      href="/membership"
                      className="py-2.5 px-5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-mono text-xs font-bold shadow-brand"
                    >
                      Upgrade to Plus
                    </Link>
                  </div>
                </div>
              ) : !is85Completed ? (
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400">
                    Missing: Complete at least 85% of DSA sheet ({completedProblems}/{totalProblems} solved, {Math.max(0, Math.ceil(totalProblems * 0.85) - completedProblems)} more needed)
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">
                    You have active Plus! Complete the remaining questions to reach 85% and unlock download.
                  </p>
                  <div>
                    <Link
                      href="/topics"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono text-xs font-semibold"
                    >
                      <span>Continue Solving Problems</span>
                      <ArrowRight className="h-4 w-4 text-brand-red" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400">
                    Missing: Active BeeNext Plus membership required
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">
                    You have solved 85% of the DSA sheet! Activate Plus membership to unlock certificate download.
                  </p>
                  <div>
                    <Link
                      href="/membership"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-mono text-xs sm:text-sm font-bold shadow-brand"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Activate Plus Membership (from ₹79)</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
