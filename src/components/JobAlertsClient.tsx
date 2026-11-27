"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Briefcase,
  Search,
  MapPin,
  GraduationCap,
  ExternalLink,
  Lock,
  LogIn,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

export interface PublicJob {
  id: string;
  companyName: string;
  role: string;
  batches: string;
  location: string;
}

export default function JobAlertsClient() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Login Required Modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [targetJobForModal, setTargetJobForModal] = useState<PublicJob | null>(null);

  // Applying state per job
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs");
      if (!res.ok) {
        throw new Error("Failed to retrieve job listings.");
      }
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError("Unable to load job opportunities. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filtered job list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        job.role.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.batches.toLowerCase().includes(q)
      );
    });
  }, [jobs, searchQuery]);

  // Handle Apply Now click
  const handleApplyClick = async (job: PublicJob) => {
    setApplyError(null);

    // 1. Client-side quick check: if logged out, display modal immediately
    if (!user) {
      setTargetJobForModal(job);
      setShowLoginModal(true);
      return;
    }

    // 2. Logged-in user: Call server endpoint to verify authorization and fetch official URL
    setApplyingJobId(job.id);
    try {
      const res = await fetch(`/api/jobs/${job.id}/apply`);
      const data = await res.json();

      if (res.status === 401 || data.requiresAuth) {
        // Server enforced login gate
        setTargetJobForModal(job);
        setShowLoginModal(true);
        return;
      }

      if (!res.ok) {
        setApplyError(data.error || "Unable to proceed with application.");
        return;
      }

      if (data.applyUrl) {
        // Securely open in a new tab without exposing origin or referrer leaks
        window.open(data.applyUrl, "_blank", "noopener,noreferrer");
      } else {
        setApplyError("Application link is currently unavailable.");
      }
    } catch (err) {
      console.error("Apply error:", err);
      setApplyError("Network error. Please try clicking Apply again.");
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* ========================================================= */}
        {/* COMPACT HERO HEADER                                       */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/80 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-brand-red shrink-0" />
              <span>
                Job <span className="text-brand-red">Alerts</span>
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Verified software engineering opportunities and off-campus recruitment drives.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-brand-border self-start sm:self-auto shrink-0">
            <span className="text-xs font-mono text-neutral-400">Openings:</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {jobs.length} Active
            </span>
          </div>
        </div>

        {/* Global Toast for Apply Error */}
        {applyError && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-red-500/30 bg-red-950/40 text-red-200 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-brand-red shrink-0" />
              <span>{applyError}</span>
            </div>
            <button
              onClick={() => setApplyError(null)}
              className="text-neutral-400 hover:text-white"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* SEARCH BAR                                                */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, position, location, batch..."
              className="w-full pl-10 pr-9 py-2 bg-neutral-900 border border-brand-border rounded-lg text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-3 py-2 text-xs font-mono text-neutral-400 hover:text-white shrink-0"
            >
              Reset
            </button>
          )}
        </div>

        {/* Results summary bar */}
        <div className="text-xs font-mono text-neutral-400 px-0.5">
          Showing <strong className="text-white">{filteredJobs.length}</strong> of{" "}
          {jobs.length} opportunities
        </div>

        {/* ========================================================= */}
        {/* SIMPLIFIED JOB CARDS GRID                                 */}
        {/* ========================================================= */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="h-7 w-7 text-brand-red animate-spin" />
            <p className="text-xs font-mono text-neutral-400">Loading opportunities...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 space-y-3 rounded-xl border border-red-500/30 bg-red-950/20 p-6">
            <AlertCircle className="h-8 w-8 text-brand-red mx-auto" />
            <h3 className="text-base font-bold text-white">Failed to Load Opportunities</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchJobs}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold font-mono rounded-lg transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 space-y-3 rounded-xl border border-brand-border bg-brand-card/50 p-6">
            <Briefcase className="h-10 w-10 text-neutral-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Matching Opportunities</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {jobs.length === 0
                ? "There are currently no active job alerts posted."
                : "No job postings matched your current search."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-brand-border hover:border-neutral-700 text-white text-xs font-mono rounded-lg transition-colors"
              >
                <span>Clear Search</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredJobs.map((job) => {
              const isApplying = applyingJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="rounded-xl border border-brand-border bg-brand-card/90 hover:border-neutral-700 transition p-3.5 sm:p-4 flex flex-col justify-between gap-3 shadow-sm group"
                >
                  {/* Job Details (Company Name, Position, Location, Batch) */}
                  <div className="space-y-1.5">
                    {/* 1. Company Name */}
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-red block truncate">
                      {job.companyName}
                    </span>

                    {/* 2. Job Position */}
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug truncate group-hover:text-brand-red transition-colors">
                      {job.role}
                    </h3>

                    {/* 3. Location & 4. Eligible Batch */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-neutral-300 pt-1">
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <GraduationCap className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">Batch: {job.batches}</span>
                      </span>
                    </div>
                  </div>

                  {/* 5. Apply Now Button (Green) */}
                  <div className="pt-2 border-t border-brand-border/60 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleApplyClick(job)}
                      disabled={isApplying}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#22C55E] hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold font-mono tracking-wider uppercase transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <span>Apply Now</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* LOGIN REQUIRED MODAL POPUP                                */}
        {/* ========================================================= */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-md rounded-2xl border border-brand-border bg-brand-card p-6 shadow-2xl space-y-4">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setTargetJobForModal(null);
                }}
                className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon & Heading */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/15 border border-brand-red/30 text-brand-red shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Login Required
                  </h3>
                  <span className="text-xs font-mono text-neutral-400">
                    BeeNext Account Verification
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="rounded-xl border border-brand-border/60 bg-neutral-900/80 p-3.5 space-y-1.5 text-xs">
                <p className="text-neutral-200 font-semibold text-sm">
                  Please log in to apply for this job.
                </p>
                {targetJobForModal && (
                  <p className="text-neutral-400 font-mono">
                    Target: <strong className="text-white">{targetJobForModal.role}</strong> at{" "}
                    <strong className="text-white">{targetJobForModal.companyName}</strong>
                  </p>
                )}
                <p className="text-neutral-400 leading-relaxed pt-1">
                  Both Normal and Plus members can apply for all job alerts for free. Log in to continue directly to the official careers portal.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setTargetJobForModal(null);
                  }}
                  className="px-3.5 py-2 rounded-lg border border-brand-border bg-neutral-900 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <Link
                  href="/login?redirect=/job-alerts"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold font-mono uppercase tracking-wider transition-colors shadow-brand"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login to Apply</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
