"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  MapPin,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

export type AdminJobStatus = "ALL" | "ACTIVE" | "DRAFT";

export interface AdminJobItem {
  id: string;
  companyName: string;
  role: string;
  batches: string;
  location: string;
  applyUrl: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  companyName: string;
  role: string;
  location: string;
  batches: string;
  applyUrl: string;
  isPublished: boolean;
}

const INITIAL_FORM: FormState = {
  companyName: "",
  role: "",
  location: "",
  batches: "",
  applyUrl: "",
  isPublished: true,
};

export default function AdminJobAlertsTab() {
  const [jobs, setJobs] = useState<AdminJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminJobStatus>("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<AdminJobItem | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal
  const [deletingJob, setDeletingJob] = useState<AdminJobItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle publish loading
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAdminJobs = async () => {
    try {
      const res = await fetch("/api/admin/jobs");
      if (!res.ok) {
        throw new Error("Failed to load admin jobs");
      }
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err: any) {
      console.error("Admin fetch jobs failed:", err);
      setError("Failed to fetch job postings from server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminJobs();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    setSuccess(null);
    await fetchAdminJobs();
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setForm(INITIAL_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (job: AdminJobItem) => {
    setEditingJob(job);
    setForm({
      companyName: job.companyName || "",
      role: job.role || "",
      location: job.location || "",
      batches: job.batches || "",
      applyUrl: job.applyUrl || "",
      isPublished: job.isPublished,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError(null);

    // Client-side quick validation
    if (!form.companyName.trim()) {
      setFormError("Company name is required.");
      setFormSaving(false);
      return;
    }
    if (!form.role.trim()) {
      setFormError("Job position is required.");
      setFormSaving(false);
      return;
    }
    if (!form.location.trim()) {
      setFormError("Job location is required.");
      setFormSaving(false);
      return;
    }
    if (!form.batches.trim()) {
      setFormError("Eligible batches are required (e.g. 2024, 2025, 2026).");
      setFormSaving(false);
      return;
    }
    if (!form.applyUrl.trim() || !/^https?:\/\/.+/i.test(form.applyUrl.trim())) {
      setFormError("Valid application URL starting with http:// or https:// is required.");
      setFormSaving(false);
      return;
    }

    try {
      const endpoint = editingJob
        ? `/api/admin/jobs/${editingJob.id}`
        : "/api/admin/jobs";
      const method = editingJob ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save job posting.");
      }

      setSuccess(
        editingJob
          ? `Updated job posting for "${form.companyName}".`
          : `Created new job posting for "${form.companyName}".`
      );
      setIsModalOpen(false);
      setEditingJob(null);
      await fetchAdminJobs();
    } catch (err: any) {
      console.error("Save job error:", err);
      setFormError(err.message || "Failed to save job posting.");
    } finally {
      setFormSaving(false);
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (job: AdminJobItem) => {
    setTogglingId(job.id);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !job.isPublished }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle status");
      }
      setSuccess(
        `Job is now ${!job.isPublished ? "PUBLISHED (Active)" : "UNPUBLISHED (Draft)"}.`
      );
      await fetchAdminJobs();
    } catch (err: any) {
      console.error("Toggle publish error:", err);
      setError(err.message || "Could not toggle publish state.");
    } finally {
      setTogglingId(null);
    }
  };

  // Confirm delete
  const handleDeleteJob = async () => {
    if (!deletingJob) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/jobs/${deletingJob.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete job posting");
      }
      setSuccess(`Deleted job posting: ${deletingJob.role} at ${deletingJob.companyName}.`);
      setDeletingJob(null);
      await fetchAdminJobs();
    } catch (err: any) {
      console.error("Delete job error:", err);
      setError(err.message || "Failed to delete job posting.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Status Filter
      if (statusFilter === "ACTIVE") {
        if (!job.isPublished) return false;
      } else if (statusFilter === "DRAFT") {
        if (job.isPublished) return false;
      }

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        job.role.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.batches.toLowerCase().includes(q)
      );
    });
  }, [jobs, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-card border border-brand-border p-4 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-brand-red" />
              <span>Job Alerts Management</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 text-brand-red border border-brand-red/30">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-brand-subtle font-mono mt-0.5">
            Post, edit, unpublish, and manage hiring opportunities for BeeNext members.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-neutral-900 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-white transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold uppercase tracking-wider transition shadow-brand"
          >
            <Plus className="h-4 w-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 text-xs font-mono animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-neutral-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/30 bg-red-950/40 text-red-300 text-xs font-mono animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-brand-red shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-neutral-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-brand-card/60 border border-brand-border p-3 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, position, location, batch..."
            className="w-full pl-9 pr-8 py-1.5 bg-neutral-900 border border-brand-border rounded-lg text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-brand-red"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: "ALL", label: `All (${jobs.length})` },
              {
                key: "ACTIVE",
                label: `Active (${jobs.filter((j) => j.isPublished).length})`,
              },
              {
                key: "DRAFT",
                label: `Drafts (${jobs.filter((j) => !j.isPublished).length})`,
              },
            ] as const
          ).map((tab) => {
            const isSelected = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium whitespace-nowrap transition border ${
                  isSelected
                    ? "bg-brand-red text-white border-brand-red shadow-sm"
                    : "bg-neutral-900 text-neutral-300 border-brand-border hover:border-neutral-700 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-2">
          <Loader2 className="h-6 w-6 text-brand-red animate-spin" />
          <p className="text-xs font-mono text-neutral-400">Loading postings...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 space-y-2 rounded-xl border border-brand-border bg-brand-card/40 p-6">
          <Briefcase className="h-8 w-8 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Job Postings Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto font-mono">
            {jobs.length === 0
              ? "You haven't posted any job alerts yet. Click 'Post New Job' to add the first one."
              : "No job postings matched your current search and filter."}
          </p>
          {jobs.length === 0 && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold rounded-lg transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First Job</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredJobs.map((job) => {
            const isDraft = !job.isPublished;
            const isToggling = togglingId === job.id;

            return (
              <div
                key={job.id}
                className="rounded-xl border border-brand-border bg-brand-card p-3.5 sm:p-4 hover:border-neutral-700 transition flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-sm"
              >
                {/* Left: Info (Company Name, Position, Location, Batch) */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status badge */}
                    {isDraft ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-800 text-neutral-400 border border-neutral-700">
                        <EyeOff className="h-3 w-3" />
                        <span>Draft / Hidden</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Active</span>
                      </span>
                    )}

                    {/* Company Name */}
                    <span className="text-xs font-mono font-bold text-brand-red uppercase tracking-wider">
                      {job.companyName}
                    </span>
                  </div>

                  {/* Job Position */}
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                    {job.role}
                  </h3>

                  {/* Location & Eligible Batch */}
                  <div className="flex items-center gap-4 text-xs font-mono text-neutral-300 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span>{job.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span>Batch: {job.batches}</span>
                    </span>
                  </div>

                  {/* Application URL view */}
                  <div className="flex items-center gap-1.5 pt-0.5 text-xs font-mono text-neutral-400">
                    <span className="text-neutral-500">Apply Link:</span>
                    <code className="text-[11px] text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 truncate max-w-xs sm:max-w-md">
                      {job.applyUrl}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(job.applyUrl);
                        setCopiedId(job.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
                      title="Copy application link"
                    >
                      {copiedId === job.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-brand-border/60">
                  {/* Publish / Unpublish Toggle */}
                  <button
                    onClick={() => handleTogglePublish(job)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition ${
                      job.isPublished
                        ? "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-amber-500/50 hover:text-amber-400"
                        : "border-emerald-500/30 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40"
                    }`}
                    title={job.isPublished ? "Hide from public site" : "Publish to public site"}
                  >
                    {isToggling ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : job.isPublished ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    <span>{job.isPublished ? "Unpublish" : "Publish"}</span>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEditModal(job)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand-border bg-neutral-900 hover:border-neutral-700 text-xs font-mono text-white transition"
                    title="Edit job details"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Edit</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeletingJob(job)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-500/30 bg-red-950/40 hover:bg-red-900/40 text-xs font-mono text-red-400 transition"
                    title="Delete job posting"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* SIMPLIFIED ADD / EDIT JOB MODAL                            */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-brand-border bg-brand-card p-5 sm:p-6 shadow-2xl my-6 space-y-4 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-brand-red" />
                  <span>{editingJob ? "Edit Job Posting" : "Post New Job Alert"}</span>
                </h3>
                <span className="text-xs font-mono text-neutral-400">
                  {editingJob ? `ID: ${editingJob.id}` : "Provide position and application details"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Error */}
            {formError && (
              <div className="p-2.5 rounded-lg border border-red-500/30 bg-red-950/40 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-brand-red shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Simplified Form */}
            <form onSubmit={handleSaveJob} className="space-y-3.5 text-xs font-mono">
              {/* 1. Company Name */}
              <div className="space-y-1">
                <label className="text-neutral-300 uppercase tracking-wider block font-semibold">
                  Company Name <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. Google, Microsoft, Atlassian"
                  className="w-full px-3 py-2 bg-neutral-900 border border-brand-border rounded-lg text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              {/* 2. Job Position */}
              <div className="space-y-1">
                <label className="text-neutral-300 uppercase tracking-wider block font-semibold">
                  Job Position <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Software Development Engineer - I"
                  className="w-full px-3 py-2 bg-neutral-900 border border-brand-border rounded-lg text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 3. Location */}
                <div className="space-y-1">
                  <label className="text-neutral-300 uppercase tracking-wider block font-semibold">
                    Location <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Bengaluru / Remote"
                    className="w-full px-3 py-2 bg-neutral-900 border border-brand-border rounded-lg text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                {/* 4. Eligible Batch */}
                <div className="space-y-1">
                  <label className="text-neutral-300 uppercase tracking-wider block font-semibold">
                    Eligible Batch <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.batches}
                    onChange={(e) => setForm({ ...form, batches: e.target.value })}
                    placeholder="e.g. 2024, 2025, 2026"
                    className="w-full px-3 py-2 bg-neutral-900 border border-brand-border rounded-lg text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              {/* 5. Official Application URL */}
              <div className="space-y-1">
                <label className="text-neutral-300 uppercase tracking-wider block font-semibold">
                  Official Application URL <span className="text-brand-red">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={form.applyUrl}
                  onChange={(e) => setForm({ ...form, applyUrl: e.target.value })}
                  placeholder="https://careers.company.com/job/12345"
                  className="w-full px-3 py-2 bg-neutral-900 border border-brand-border rounded-lg text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-brand-border text-brand-red focus:ring-brand-red"
                />
                <label htmlFor="isPublishedCheck" className="text-neutral-300 cursor-pointer select-none">
                  Publish immediately (visible to all users on /job-alerts)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-brand-border bg-neutral-900 text-neutral-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-red hover:bg-brand-redHover text-white font-bold uppercase tracking-wider transition shadow-brand disabled:opacity-60"
                >
                  {formSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingJob ? "Save Changes" : "Post Job Alert"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL                                 */}
      {/* ========================================================= */}
      {deletingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-red-500/40 bg-brand-card p-5 shadow-2xl space-y-3.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/60 border border-red-500/40 text-brand-red shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Job Posting</h3>
                <span className="text-xs font-mono text-neutral-400">Confirmation Required</span>
              </div>
            </div>

            <div className="rounded-xl border border-brand-border bg-neutral-900 p-3 space-y-1 text-xs font-mono">
              <p className="text-neutral-300">
                Are you sure you want to permanently delete this job alert?
              </p>
              <div className="pt-0.5 text-white font-bold truncate">
                {deletingJob.role} &bull; {deletingJob.companyName}
              </div>
              <p className="text-neutral-500 text-[11px]">This action cannot be undone.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingJob(null)}
                className="px-3.5 py-1.5 rounded-lg border border-brand-border bg-neutral-900 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteJob}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
