"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  Sparkles,
  BookOpen,
  Briefcase,
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";
import ProtectedPdfViewer from "@/components/ProtectedPdfViewer";
import {
  COMPANY_PREPARATION_SECTIONS,
  CompanyPreparationItem,
} from "@/data/companyPreparationData";

// Authentic macOS Finder Style Subtle Dull Red Folder SVG (exact match to Notes)
const MacFolderIcon = ({ isLocked = false }: { isLocked?: boolean }) => (
  <div className="relative inline-block select-none transition-transform duration-150 group-hover:scale-105">
    <svg
      viewBox="0 0 100 82"
      className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back tab */}
      <path
        d="M6 14C6 9.58172 9.58172 6 14 6H38C41.5 6 44.5 8 47 12L51 18H86C90.4183 18 94 21.5817 94 26V68C94 72.4183 90.4183 76 86 76H14C9.58172 76 6 72.4183 6 68V14Z"
        fill="#662626"
      />
      {/* Front body */}
      <path
        d="M6 23C6 19.6863 8.68629 17 12 17H88C91.3137 17 94 19.6863 94 23V68C94 72.4183 90.4183 76 86 76H14C9.58172 76 6 72.4183 6 68V23Z"
        fill="url(#macFolderGradDullRedCompany)"
      />
      {/* Subtle top edge highlight */}
      <path
        d="M7 23C7 20.2386 9.23858 18 12 18H88C90.7614 18 93 20.2386 93 23V24H7V23Z"
        fill="white"
        fillOpacity="0.2"
      />
      <defs>
        <linearGradient
          id="macFolderGradDullRedCompany"
          x1="50"
          y1="17"
          x2="50"
          y2="76"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#964040" />
          <stop offset="1" stopColor="#6E2626" />
        </linearGradient>
      </defs>
    </svg>
    {isLocked && (
      <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900/90 border border-neutral-700 text-neutral-400">
        <Lock className="h-2.5 w-2.5 text-neutral-300" />
      </span>
    )}
  </div>
);

export default function CompanyPreparationClient() {
  const { user, isPlusMember } = useAuth();
  const [selectedItem, setSelectedItem] = useState<CompanyPreparationItem | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen && !document.fullscreenElement) {
      if (viewerContainerRef.current?.requestFullscreen) {
        viewerContainerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
      setIsFullscreen(false);
    }
  };

  const handleCloseViewer = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }
    setIsFullscreen(false);
    setSelectedItem(null);
  };

  const handleOpenFolder = (item: CompanyPreparationItem) => {
    if (!isPlusMember) {
      setSelectedItem(item);
      setShowUpgradeModal(true);
      return;
    }
    setSelectedItem(item);
  };

  const renderMacFolder = (item: CompanyPreparationItem) => {
    return (
      <div
        key={item.id}
        onClick={() => handleOpenFolder(item)}
        className="group flex flex-col items-center justify-start p-2 rounded-xl hover:bg-neutral-800/40 cursor-pointer transition-colors select-none text-center"
        title={item.title}
      >
        <MacFolderIcon isLocked={!isPlusMember} />
        <span className="mt-2 text-[11px] sm:text-xs font-medium text-neutral-200 group-hover:text-white leading-tight line-clamp-2 max-w-[105px] text-center">
          {item.title}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-10 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
        {/* Top Security & Copyright Warning Banner (yellow theme matching Notes) */}
        <div className="rounded-xl border border-yellow-600/30 bg-yellow-950/80 px-4 py-2.5 text-center text-xs sm:text-sm font-medium text-yellow-400 shadow-sm">
          <p className="leading-relaxed md:whitespace-nowrap">
            ⚠ Copying, downloading, or taking screenshots of any notes may result in account suspension and permanent access restriction from BeeNext.
          </p>
        </div>

        {/* Back to Notes Navigation Link */}
        <div className="flex items-center">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 text-brand-red group-hover:-translate-x-1 transition-transform" />
            <span>Back to Notes</span>
          </Link>
        </div>

        {/* Header Hero */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Company <span className="text-brand-red">Preparation</span>
              </h1>
            </div>

            {!isPlusMember && (
              <Link
                href="/membership"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs sm:text-sm font-mono font-bold shadow-brand transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Upgrade to Plus</span>
              </Link>
            )}
          </div>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Curated company-specific interview preparation, technical tracks, and question patterns. Plus members can access all company modules.
          </p>
        </div>

        {/* DYNAMIC COMPANY SECTIONS */}
        {COMPANY_PREPARATION_SECTIONS.map((section) => (
          <section key={section.id} className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
                {section.order}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {section.companyName}
              </h2>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
              {section.items.map(renderMacFolder)}
            </div>
          </section>
        ))}

        {/* COMING SOON & FEEDBACK FOOTER MESSAGE */}
        <div className="pt-6 sm:pt-8 pb-4 border-t border-neutral-800/80">
          <div className="max-w-2xl mx-auto rounded-2xl border border-emerald-600/30 bg-emerald-950/80 p-4 sm:p-5 text-center shadow-sm">
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Stay tuned! More companies, interview experiences, and placement preparation tracks are coming soon. Our notes are regularly updated to reflect the latest hiring patterns, interview trends, and recruitment requirements. Have any specific company requests or suggestions? Feel free to share them with us at our Support Email.
            </p>
          </div>
        </div>

        {/* Protected Modal / Embedded Viewer for Plus Members */}
        {selectedItem && isPlusMember && (
          <div
            ref={viewerContainerRef}
            className={
              isFullscreen
                ? "fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen max-w-none rounded-none overflow-hidden"
                : "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
            }
          >
            <div
              className={
                isFullscreen
                  ? "bg-neutral-950 w-full h-full flex flex-col overflow-hidden relative"
                  : "bg-neutral-950 border border-brand-border rounded-2xl w-full max-w-4xl h-auto min-h-[420px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-fadeIn"
              }
            >
              {/* Viewer Header */}
              <div className="flex items-center justify-between border-b border-brand-border px-3 sm:px-4 py-2 sm:py-2.5 bg-neutral-900/95 shrink-0">
                <div className="flex items-center gap-2 truncate mr-2">
                  <Briefcase className="h-4 w-4 text-brand-red shrink-0" />
                  <div className="flex items-center gap-2 truncate">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                      {selectedItem.title}
                    </h3>
                    <span className="hidden sm:inline-block text-[10px] font-mono text-neutral-400 truncate">
                      &bull; BeeNext Plus Protected Content
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    <span className="truncate max-w-[180px]">Licensed to {user?.email}</span>
                  </span>

                  {selectedItem.pdfFile && (
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-500 font-mono text-xs transition-colors"
                      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? (
                        <>
                          <Minimize2 className="h-3.5 w-3.5 text-brand-red" />
                          <span className="hidden sm:inline text-xs">Exit Fullscreen</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-3.5 w-3.5 text-neutral-300" />
                          <span className="hidden sm:inline text-xs">Fullscreen</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseViewer}
                    className="p-1 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
                    title="Close Viewer"
                    aria-label="Close Viewer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Viewer Body: Protected Viewer (if PDF attached) or Coming Soon Message */}
              <div className="flex-1 relative bg-neutral-900 w-full h-full overflow-hidden flex flex-col justify-center">
                {selectedItem.pdfFile ? (
                  <ProtectedPdfViewer
                    file={selectedItem.pdfFile}
                    title={selectedItem.title}
                    userEmail={user?.email || "Licensed Member"}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    onClose={handleCloseViewer}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center px-4 py-12 sm:py-16 select-none">
                    <div className="h-16 w-16 rounded-2xl bg-neutral-800/70 border border-neutral-700/60 flex items-center justify-center text-neutral-400 mb-4 shadow-inner">
                      <Briefcase className="h-8 w-8 text-brand-red" />
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-brand-red bg-brand-red/10 border border-brand-red/25 px-3 py-1 rounded-full mb-3">
                      Coming Soon
                    </span>

                    <h4 className="text-lg sm:text-xl font-bold text-white mb-2">
                      {selectedItem.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed mb-6">
                      This company preparation module is currently being finalized and will be available for Plus members soon.
                    </p>

                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 bg-neutral-950 border border-neutral-800 px-3.5 py-1.5 rounded-full shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-brand-red" />
                      <span>Included in your Plus Membership</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Prompt Modal in Center of Screen for Normal Users */}
        {showUpgradeModal && selectedItem && !isPlusMember && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => {
              setShowUpgradeModal(false);
              setSelectedItem(null);
            }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-brand-card border border-brand-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-left"
            >
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedItem(null);
                }}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pr-8">
                <div className="h-10 w-10 rounded-xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center text-brand-red shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Plus Membership Required
                  </h3>
                  <p className="text-xs text-brand-red font-mono font-medium">
                    {selectedItem.title}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Access to company-specific preparation guides, interview question patterns, and placement tracks is available exclusively to <strong className="text-white">BeeNext Plus</strong> members.
              </p>

              <div className="space-y-2 rounded-xl bg-neutral-900 border border-neutral-800 p-3.5 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                  <span>TCS &amp; Infosys Technical Tracks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                  <span>Company-wise Coding &amp; Interview Guides</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                  <span>All 20 DSA Topics, CS Fundamentals &amp; Language Notes</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-medium transition-colors text-center"
                >
                  Close
                </button>
                <Link
                  href="/membership"
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold transition-all shadow-brand flex items-center justify-center gap-1.5 text-center"
                >
                  <span>Upgrade to Plus</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
