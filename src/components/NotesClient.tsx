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
import ProtectedPdfViewer from "@/components/ProtectedPdfViewer";

interface NoteItem {
  id: string;
  title: string;
  pdfFile?: string;
}

const DSA_TOPICS_NOTES: NoteItem[] = [
  { id: "beginner", title: "1. Beginner Problems", pdfFile: "sorting-mastery.pdf" },
  { id: "sorting", title: "2. Sorting Techniques", pdfFile: "Sorting_Algorithms.pdf" },
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
  { id: "dbms", title: "DBMS", pdfFile: "DBMS.pdf" },
  { id: "os", title: "Operating System", pdfFile: "Operating_Systems.pdf" },
  { id: "cn", title: "Computer Networks", pdfFile: "Computer_Networks.pdf" },
  { id: "oops", title: "OOPS", pdfFile: "OOPS.pdf" },
];

const PROGRAMMING_LANG_NOTES: NoteItem[] = [
  { id: "c-lang", title: "C", pdfFile: "C_Programming.pdf" },
  { id: "cpp-lang", title: "C++", pdfFile: "C++_Programming.pdf" },
  { id: "java-lang", title: "Java", pdfFile: "Java_Programming.pdf" },
  { id: "python-lang", title: "Python", pdfFile: "Python_Programming.pdf" },
];

const FRONTEND_DEV_NOTES: NoteItem[] = [
  { id: "html", title: "HTML", pdfFile: "HTML.pdf" },
  { id: "css", title: "CSS", pdfFile: "CSS.pdf" },
  { id: "javascript", title: "JavaScript", pdfFile: "JavaScript.pdf" },
  { id: "react", title: "React", pdfFile: "React.pdf" },
];

const BACKEND_DEV_NOTES: NoteItem[] = [
  { id: "nodejs", title: "Node.js", pdfFile: "Node_js.pdf" },
  { id: "expressjs", title: "Express.js", pdfFile: "Express_js.pdf" },
  { id: "springboot", title: "Spring Boot", pdfFile: "Spring_Boot.pdf" },
];

const DATABASE_NOTES: NoteItem[] = [
  { id: "mysql", title: "MySQL", pdfFile: "MySQL.pdf" },
  { id: "mongodb", title: "MongoDB", pdfFile: "MongoDB.pdf" },
];

const DEVOPS_NOTES: NoteItem[] = [
  { id: "docker", title: "Docker", pdfFile: "Docker.pdf" },
  { id: "kubernetes", title: "Kubernetes", pdfFile: "Kubernetes.pdf" },
];

const VERSION_CONTROL_NOTES: NoteItem[] = [
  { id: "git-github", title: "Git & GitHub", pdfFile: "Git_and_GitHub.pdf" },
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
      <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
        {/* Top Security & Copyright Warning Banner */}
        <div className="rounded-xl border border-yellow-600/30 bg-yellow-950/80 px-4 py-2.5 text-center text-xs sm:text-sm font-medium text-yellow-400 shadow-sm">
          <p className="leading-relaxed md:whitespace-nowrap">
            ⚠ Copying, downloading, or taking screenshots of any notes may result in account suspension and permanent access restriction from BeeNext.
          </p>
        </div>

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
            Curated engineering notes across 8 collections. Plus members can access and view all documents.
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
              Section 2: CS Fundamentals
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {CS_FUNDAMENTALS_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* SECTION 3: PROGRAMMING LANGUAGES */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 3: Programming Languages
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {PROGRAMMING_LANG_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* SECTION 4: FRONTEND DEVELOPMENT */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              4
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 4: Frontend Development
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {FRONTEND_DEV_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* SECTION 5: BACKEND DEVELOPMENT */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              5
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 5: Backend Development
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {BACKEND_DEV_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* SECTION 6: DATABASE */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              6
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 6: Database
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {DATABASE_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* SECTION 7: DEVOPS */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              7
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 7: DevOps
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {DEVOPS_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* SECTION 8: VERSION CONTROL */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-[11px]">
              8
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Section 8: Version Control
            </h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 gap-x-2 sm:gap-x-4 gap-y-6 sm:gap-y-8 pt-1">
            {VERSION_CONTROL_NOTES.map(renderMacFolder)}
          </div>
        </section>

        {/* COMING SOON & FEEDBACK FOOTER MESSAGE */}
        <div className="pt-6 sm:pt-8 pb-4 border-t border-neutral-800/80">
            <div className="max-w-2xl mx-auto rounded-2xl border border-emerald-600/30 bg-emerald-950/80 p-4 sm:p-5 text-center shadow-sm">
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Stay tuned! More notes and learning resources are coming soon. Have any suggestions or feedback? Feel free to share them with us at our Support Email.
              </p>
            </div>
          </div>
        </div>

        {/* Protected Embedded PDF Viewer Modal for Plus Users */}
        {selectedNote && isPlusMember && (
          <div
            ref={viewerContainerRef}
            className={
              isFullscreen
                ? "fixed inset-0 z-50 bg-black flex flex-col w-screen h-screen max-w-none rounded-none overflow-hidden"
                : "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-1 sm:p-2 md:p-3"
            }
          >
            <div
              className={
                isFullscreen
                  ? "bg-neutral-950 w-full h-full flex flex-col overflow-hidden relative"
                  : "bg-neutral-950 border border-brand-border rounded-2xl w-full max-w-6xl xl:max-w-7xl h-[97vh] flex flex-col shadow-2xl overflow-hidden relative"
              }
            >
              {/* Viewer Header - Slim & Unified */}
              <div className="flex items-center justify-between border-b border-brand-border px-3 sm:px-4 py-1.5 sm:py-2 bg-neutral-900/95 shrink-0">
                <div className="flex items-center gap-2 truncate mr-2">
                  <BookOpen className="h-4 w-4 text-brand-red shrink-0" />
                  <div className="flex items-center gap-2 truncate">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                      {selectedNote.title}
                    </h3>
                    <span className="hidden sm:inline-block text-[10px] font-mono text-neutral-400 truncate">
                      &bull; BeeNext Plus Protected Viewer
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    <span className="truncate max-w-[180px]">Licensed to {user?.email}</span>
                  </span>

                  {/* Single Fullscreen Control */}
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

                  {/* Close Button */}
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

              {/* Embedded Container */}
              <div className="flex-1 relative bg-neutral-900 w-full h-full overflow-hidden">
                {selectedNote.pdfFile ? (
                  <ProtectedPdfViewer
                    file={selectedNote.pdfFile}
                    title={selectedNote.title}
                    userEmail={user?.email || "Licensed Member"}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    onClose={handleCloseViewer}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12 select-none">
                    <div className="h-16 w-16 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-center text-neutral-400 mb-4 shadow-inner">
                      <BookOpen className="h-8 w-8 text-brand-red" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-2">
                      {selectedNote.title} Notes
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed mb-4">
                      This study guide is currently being prepared and will be available for Plus members soon.
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full">
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
                  <span>CS Fundamentals &amp; Programming Languages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                  <span>Frontend, Backend, Database, DevOps &amp; Version Control</span>
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
