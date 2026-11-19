"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lock,
  Download,
  RotateCcw,
} from "lucide-react";

interface NoteItem {
  id: string;
  title: string;
  fileUrl: string | null;
  fileType: "IMAGE" | "PDF";
  pageCount?: number;
  isProtected?: boolean;
  isLocked?: boolean;
}

interface HandwrittenNoteViewerProps {
  notes: NoteItem[];
  onUnlockClick?: () => void;
  problemTitle: string;
}

export default function HandwrittenNoteViewer({
  notes,
  onUnlockClick,
  problemTitle,
}: HandwrittenNoteViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!notes || notes.length === 0) {
    return (
      <div className="p-8 text-center text-brand-muted bg-brand-card rounded-xl border border-brand-border">
        Handwritten notes are currently being curated for this problem.
      </div>
    );
  }

  const currentNote = notes[currentIndex] || notes[0];
  const isPdf = currentNote.fileType === "PDF";
  const isLocked = currentNote.isLocked;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % notes.length);
    setZoomLevel(1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + notes.length) % notes.length);
    setZoomLevel(1);
  };

  // Safe media URL: route through media access route or fileUrl
  const noteSrc = currentNote.fileUrl
    ? currentNote.fileUrl
    : `/api/media/note/${currentNote.id}`;

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-brand-border bg-brand-black px-4 py-2.5 gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-white bg-brand-card px-2.5 py-1 rounded border border-brand-border flex items-center gap-1.5">
            {isPdf ? <FileText className="h-3.5 w-3.5 text-brand-red" /> : null}
            <span>{currentNote.title}</span>
          </span>
          {notes.length > 1 && (
            <span className="text-xs font-mono text-brand-muted">
              ({currentIndex + 1} of {notes.length})
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {!isLocked && !isPdf && (
            <div className="flex items-center bg-brand-surface rounded-lg p-0.5 border border-brand-border">
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1.5 text-brand-muted hover:text-white rounded transition-colors"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono text-brand-muted px-1.5">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1.5 text-brand-muted hover:text-white rounded transition-colors"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="p-1.5 text-brand-muted hover:text-white rounded transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          )}

          {!isLocked && isPdf && currentNote.fileUrl && (
            <a
              href={noteSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-brand-surface hover:bg-brand-border text-white rounded transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-brand-red" />
              <span>Download PDF</span>
            </a>
          )}

          {!isLocked && !isPdf && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              className="p-1.5 text-brand-muted hover:text-white bg-brand-surface rounded transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        className={`relative flex items-center justify-center bg-brand-blackDeep overflow-hidden transition-all ${
          isFullscreen
            ? "fixed inset-0 z-50 p-6 bg-black/95"
            : "min-h-[460px] max-h-[680px] p-4"
        }`}
      >
        {/* Fullscreen Close button */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-brand-card text-white hover:bg-brand-red transition-colors"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        )}

        {isLocked ? (
          /* Locked Content Overlay */
          <div className="relative w-full py-16 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red/10 border border-brand-red text-brand-red">
              <Lock className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Handwritten Breakdown Locked</h4>
              <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
                Step-by-step recursion diagrams, dry run traces, and handwritten proofs are exclusively available to unlocked members.
              </p>
            </div>
            {onUnlockClick && (
              <button
                onClick={onUnlockClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold shadow-brand transition-all active:scale-95"
              >
                <span>Unlock Handwritten Notes</span>
              </button>
            )}
          </div>
        ) : isPdf ? (
          /* PDF Embed / Preview */
          <div className="w-full h-[600px] rounded-lg overflow-hidden border border-brand-border bg-brand-card">
            <iframe
              src={noteSrc}
              className="w-full h-full"
              title={currentNote.title}
            />
          </div>
        ) : (
          /* SVG / High-Res Image Note Canvas */
          <div className="relative w-full h-full flex items-center justify-center overflow-auto">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
              className="w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden border border-brand-border/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={noteSrc}
                alt={`${problemTitle} Handwritten Notes`}
                className="w-full h-auto object-contain select-none"
                loading="eager"
              />
            </div>
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {notes.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              title="Previous Page"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-black/80 hover:bg-brand-red text-white border border-brand-border shadow-lg transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              title="Next Page"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-brand-black/80 hover:bg-brand-red text-white border border-brand-border shadow-lg transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Multi-image Thumbnail Strip */}
      {notes.length > 1 && (
        <div className="flex items-center space-x-2 p-3 bg-brand-black border-t border-brand-border overflow-x-auto">
          {notes.map((note, idx) => (
            <button
              key={note.id}
              onClick={() => {
                setCurrentIndex(idx);
                setZoomLevel(1);
              }}
              className={`flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                currentIndex === idx
                  ? "bg-brand-red/15 border-brand-red text-white"
                  : "bg-brand-card border-brand-border text-brand-muted hover:text-white"
              }`}
            >
              {note.fileType === "PDF" ? (
                <FileText className="h-3.5 w-3.5 text-brand-red" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-brand-red" />
              )}
              <span className="truncate max-w-[140px]">{note.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
