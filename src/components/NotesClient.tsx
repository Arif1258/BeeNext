"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  Sparkles,
  BookOpen,
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface NoteItem {
  id: string;
  title: string;
  pdfFile?: string;
}

const DSA_TOPICS_NOTES: NoteItem[] = [
  { id: "beginner", title: "1. Beginner Problems", pdfFile: "sorting-mastery.pdf" },
  { id: "sorting", title: "2. Sorting Techniques", pdfFile: "sorting-mastery.pdf" },
  { id: "arrays", title: "3. Arrays", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "hashing", title: "4. Hashing", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "binary-search", title: "5. Binary Search", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "strings-basic", title: "6. Strings (Basic)", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "recursion", title: "7. Recursion", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "linked-list", title: "8. Linked-List", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "bit-manipulation", title: "9. Bit Manipulation", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "greedy", title: "10. Greedy Algorithms", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "sliding-window", title: "11. Sliding Window", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "stack-queues", title: "12. Stack / Queues", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "binary-trees", title: "13. Binary Trees", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "bst", title: "14. Binary Search Trees", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "heaps", title: "15. Heaps", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "graphs", title: "16. Graphs", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "dp", title: "17. Dynamic Programming", pdfFile: "dp-mastery.pdf" },
  { id: "tries", title: "18. Tries", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "strings-advanced", title: "19. Strings (Advanced)", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "maths", title: "20. Maths", pdfFile: "strivers-a2z-dsa-notes.pdf" },
];

const CS_FUNDAMENTALS_NOTES: NoteItem[] = [
  { id: "os", title: "Operating Systems", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "cn", title: "Computer Networks", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "dbms", title: "DBMS", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "oop", title: "OOP", pdfFile: "strivers-a2z-dsa-notes.pdf" },
];

const DATABASE_NOTES: NoteItem[] = [
  { id: "sql", title: "SQL", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "nosql", title: "NoSQL", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "mongodb", title: "MongoDB", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "postgres", title: "PostgreSQL", pdfFile: "strivers-a2z-dsa-notes.pdf" },
];

const PROGRAMMING_LANG_NOTES: NoteItem[] = [
  { id: "c-lang", title: "C", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "cpp-lang", title: "C++", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "java-lang", title: "Java", pdfFile: "sorting-mastery.pdf" },
  { id: "python-lang", title: "Python", pdfFile: "strivers-a2z-dsa-notes.pdf" },
];

const ADVANCED_DEV_NOTES: NoteItem[] = [
  { id: "js", title: "JavaScript", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "react", title: "React", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "system-design", title: "System Design", pdfFile: "strivers-a2z-dsa-notes.pdf" },
  { id: "spring-boot", title: "Spring Boot", pdfFile: "strivers-a2z-dsa-notes.pdf" },
];

// Authentic macOS Finder Style Subtle Dull Red Folder SVG
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
        fill="url(#macFolderGradDullRed)"
      />
      {/* Subtle top edge highlight */}
      <path
        d="M7 23C7 20.2386 9.23858 18 12 18H88C90.7614 18 93 20.2386 93 23V24H7V23Z"
        fill="white"
        fillOpacity="0.2"
      />
      <defs>
        <linearGradient
          id="macFolderGradDullRed"
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

export default function NotesClient() {
  const { user, isPlusMember } = useAuth();
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
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
    if (!document.fullscreenElement) {
      if (viewerContainerRef.current?.requestFullscreen) {
        viewerContainerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen((prev) => !prev);
        });
      } else {
        setIsFullscreen((prev) => !prev);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleCloseViewer = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
    setSelectedNote(null);
  };

  const handleOpenNote = (note: NoteItem) => {
    if (!isPlusMember) {
      setSelectedNote(note);
      setShowUpgradeModal(true);
      return;
    }
    setSelectedNote(note);
  };

  const renderMacFolder = (note: NoteItem) => {
    return (
      <div
        key={note.id}
        onClick={() => handleOpenNote(note)}
        className="group flex flex-col items-center justify-start p-2 rounded-xl hover:bg-neutral-800/40 cursor-pointer transition-colors select-none text-center"
        title={note.title}
      >
        <MacFolderIcon isLocked={!isPlusMember} />
        <span className="mt-2 text-[11px] sm:text-xs font-medium text-neutral-200 group-hover:text-white leading-tight line-clamp-2 max-w-[105px] text-center">
          {note.title}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-10 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header Hero */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                BeeNext <span className="text-brand-red">Notes</span>
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
            Curated engineering notes across 5 collections. Plus members can access and view all documents.
          </p>
        </div>

        {/* SECTION 1: DSA TOPIC NOTES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              1
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 1: DSA Topic Notes
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {DSA_TOPICS_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* SECTION 2: CS FUNDAMENTALS */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              2
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 2: Computer Science Fundamentals
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {CS_FUNDAMENTALS_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* SECTION 3: DATABASE */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 3: Database
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {DATABASE_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* SECTION 4: PROGRAMMING LANGUAGES */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              4
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 4: Programming Languages
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {PROGRAMMING_LANG_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* SECTION 5: ADVANCED DEVELOPMENT */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              5
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 5: Advanced Development
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {ADVANCED_DEV_NOTES.map(renderMacFolder)}
          </div>
        </section>
      </div>

      {/* Protected Embedded PDF Viewer Modal for Plus Users */}
      {selectedNote && isPlusMember && (
        <div
          ref={viewerContainerRef}
          className={
            isFullscreen
              ? "fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen max-w-none rounded-none overflow-hidden"
              : "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
          }
        >
          <div
            className={
              isFullscreen
                ? "bg-neutral-950 w-full h-full flex flex-col overflow-hidden relative"
                : "bg-neutral-950 border border-brand-border rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
            }
          >
            {/* Viewer Header */}
            <div className="flex items-center justify-between border-b border-brand-border px-4 sm:px-5 py-3 bg-neutral-900/90 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 truncate mr-2">
                <BookOpen className="h-5 w-5 text-brand-red shrink-0" />
                <div className="truncate">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {selectedNote.title}
                  </h3>
                  <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 block truncate">
                    BeeNext Plus Protected Viewer • Read-Only
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Licensed to {user?.email}</span>
                </span>

                {/* Full Screen / Exit Full Screen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 font-mono text-xs transition-colors"
                  title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                  aria-label={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5 text-brand-red" />
                      <span className="hidden sm:inline">Exit Full Screen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="hidden sm:inline">Full Screen</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCloseViewer}
                  className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
                  title="Close Viewer"
                  aria-label="Close Viewer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Embedded Iframe Container with Watermark */}
            <div className="flex-1 relative bg-neutral-900 w-full h-full">
              {/* Semi-transparent protective watermark overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-15 select-none">
                <div className="rotate-[-25deg] text-center font-mono font-bold text-white text-xl sm:text-3xl leading-relaxed">
                  <div>BEENEXT PLUS LICENSED COPY</div>
                  <div className="text-base sm:text-xl font-normal text-neutral-300">
                    {user?.email}
                  </div>
                  <div className="text-xs text-neutral-400">
                    UNAUTHORIZED DISTRIBUTION PROHIBITED
                  </div>
                </div>
              </div>

              {/* Secure iframe streaming via protected backend route without native toolbar */}
              <iframe
                src={`/api/notes/stream?file=${encodeURIComponent(
                  selectedNote.pdfFile || "strivers-a2z-dsa-notes.pdf"
                )}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border-none"
                title={selectedNote.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Prompt Modal in Center of Screen for Normal Users */}
      {showUpgradeModal && selectedNote && !isPlusMember && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setShowUpgradeModal(false);
            setSelectedNote(null);
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
                setSelectedNote(null);
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
                  {selectedNote.title}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Access to curated engineering notes, PDF guides, and topic breakdowns is available exclusively to <strong className="text-white">BeeNext Plus</strong> members.
            </p>

            <div className="space-y-2 rounded-xl bg-neutral-900 border border-neutral-800 p-3.5 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                <span>All 20 DSA Topic Guides</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                <span>CS Fundamentals (OS, Networks, DBMS, OOP)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                <span>Database, Programming Languages &amp; Advanced Dev</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedNote(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-medium transition-colors text-center"
              >
                Close
              </button>
              <Link
                href="/membership"
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedNote(null);
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
  );
}
