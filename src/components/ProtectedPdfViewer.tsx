"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Expand,
  FileText,
  Lock,
} from "lucide-react";

interface ProtectedPdfViewerProps {
  file: string;
  title: string;
  userEmail?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
}

export default function ProtectedPdfViewer({
  file,
  title,
  userEmail,
  onClose,
}: ProtectedPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");
  const [scale, setScale] = useState<number>(1.1);
  const [loading, setLoading] = useState<boolean>(true);
  const [rendering, setRendering] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const basePageSizeRef = useRef<{ width: number; height: number }>({ width: 600, height: 800 });

  // 1. Prevent Browser Printing & Save Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "s" || e.key === "u")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. Fetch PDF Binary & Initialize PDF.js Document
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      try {
        setLoading(true);
        setErrorMessage(null);
        setCurrentPage(1);
        setPageInput("1");

        // Dynamically import pdfjs-dist on client side
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

        // Fetch securely through protected streaming API
        const streamUrl = `/api/notes/stream?file=${encodeURIComponent(file)}`;
        const res = await fetch(streamUrl, {
          credentials: "include",
          headers: {
            "Accept": "application/pdf",
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Please log in to your BeeNext account to access premium notes.");
          }
          if (res.status === 403) {
            throw new Error("Active BeeNext Plus membership is required to access this note guide.");
          }
          if (res.status === 404) {
            throw new Error("This note guide is currently being prepared and will be available soon.");
          }
          throw new Error("Failed to load note document. Please try again later.");
        }

        const arrayBuffer = await res.arrayBuffer();
        if (isCancelled) return;

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
          cMapPacked: true,
        });

        const pdfDoc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = pdfDoc;
        setNumPages(pdfDoc.numPages);
        setLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PDF loading error:", err);
          setErrorMessage(err.message || "Unable to load PDF document.");
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore cancel error
        }
      }
      if (pdfDocRef.current) {
        try {
          pdfDocRef.current.destroy();
        } catch {
          // ignore destroy error
        }
      }
    };
  }, [file]);

  // 3. Render Current Page on HTML5 Canvas (One page at a time)
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDocRef.current || !canvasRef.current || currentPage < 1) return;

    try {
      setRendering(true);

      // Cancel previous ongoing render task if still active
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore cancel error
        }
      }

      const page = await pdfDocRef.current.getPage(currentPage);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const unscaledViewport = page.getViewport({ scale: 1.0 });
      basePageSizeRef.current = {
        width: unscaledViewport.width,
        height: unscaledViewport.height,
      };

      // Support HiDPI / Retina screens
      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * pixelRatio });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${Math.floor(viewport.width / pixelRatio)}px`;
      canvas.style.height = `${Math.floor(viewport.height / pixelRatio)}px`;

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      setRendering(false);
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("Page render error:", err);
      }
      setRendering(false);
    }
  }, [currentPage, scale]);

  useEffect(() => {
    if (!loading && pdfDocRef.current) {
      renderCurrentPage();
    }
  }, [loading, currentPage, scale, renderCurrentPage]);

  // 4. Navigation Handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      setPageInput(String(prev));
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      setPageInput(String(next));
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const pageNum = parseInt(pageInput, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
        setCurrentPage(pageNum);
      } else {
        setPageInput(String(currentPage));
      }
    }
  };

  const handlePageInputBlur = () => {
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // 5. Zoom & Fit Handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleFitWidth = () => {
    if (!containerRef.current || !basePageSizeRef.current.width) return;
    const containerWidth = containerRef.current.clientWidth - 24;
    if (containerWidth > 0) {
      const newScale = containerWidth / basePageSizeRef.current.width;
      setScale(Math.max(0.6, Math.min(newScale, 2.2)));
    }
  };

  const handleFitPage = () => {
    if (!containerRef.current || !basePageSizeRef.current.height) return;
    const containerHeight = containerRef.current.clientHeight - 20;
    if (containerHeight > 0) {
      const newScale = containerHeight / basePageSizeRef.current.height;
      setScale(Math.max(0.5, Math.min(newScale, 1.9)));
    }
  };

  return (
    <div
      className="flex flex-col w-full h-full bg-neutral-950 text-white select-none relative"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <style>{`
        @media print {
          body {
            display: none !important;
          }
        }
      `}</style>

      {/* Reader Toolbar Controls - Compact & Aligned */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 bg-neutral-900 border-b border-neutral-800 text-xs shrink-0 z-20">
        {/* Left: Page Navigation Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="p-1 sm:p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-1 font-mono text-neutral-300 text-xs">
            <span className="hidden sm:inline text-neutral-400">Page</span>
            <input
              type="text"
              inputMode="numeric"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputSubmit}
              onBlur={handlePageInputBlur}
              disabled={loading || numPages === 0}
              className="w-9 sm:w-11 text-center py-0.5 rounded bg-neutral-950 border border-neutral-700 text-white font-mono text-xs focus:outline-none focus:border-brand-red disabled:opacity-50"
              title="Enter page number and press Enter"
              aria-label="Current Page Number"
            />
            <span className="text-neutral-400">/ {numPages || "–"}</span>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= numPages || loading}
            className="p-1 sm:p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {rendering && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-neutral-400 pl-1">
              <Loader2 className="h-3 w-3 animate-spin text-brand-red" />
              <span>Rendering...</span>
            </div>
          )}
        </div>

        {/* Center/Right: Zoom and Fit Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.6 || loading}
            className="p-1 sm:p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <span className="font-mono text-[11px] text-neutral-300 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 2.5 || loading}
            className="p-1 sm:p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <div className="h-3.5 w-px bg-neutral-700 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={handleFitWidth}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 text-[11px] font-mono transition-colors"
            title="Fit to Container Width"
          >
            <span>Fit Width</span>
          </button>

          <button
            type="button"
            onClick={handleFitPage}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 text-[11px] font-mono transition-colors"
            title="Fit to Page Height"
          >
            <span>Fit Page</span>
          </button>

          <div className="h-3.5 w-px bg-neutral-700 mx-1 hidden md:block" />

          {/* View Only Security Indicator (No duplicate fullscreen button) */}
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/60">
            <Lock className="h-3 w-3 text-brand-red" />
            <span>View Only</span>
          </span>
        </div>
      </div>

      {/* Main Canvas Scroll Viewport - Maximized Height */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto bg-neutral-900/90 flex items-start justify-center p-1.5 sm:p-2.5"
      >
        {/* Loading State Indicator */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/90 z-30">
            <Loader2 className="h-9 w-9 text-brand-red animate-spin mb-3" />
            <h4 className="text-sm font-bold text-white tracking-wide">Loading Protected Note Document</h4>
            <p className="text-xs text-neutral-400 font-mono mt-1">Decrypting &amp; preparing pages for {userEmail || "member"}...</p>
          </div>
        )}

        {/* Error State Indicator */}
        {errorMessage && !loading && (
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center my-auto shadow-xl">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 text-brand-red flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1.5">Note Unavailable</h4>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">{errorMessage}</p>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono font-medium text-white transition-colors"
              >
                Close Viewer
              </button>
            )}
          </div>
        )}

        {/* Canvas & Subtle Personalized Diagonal Watermark Container */}
        {!errorMessage && (
          <div
            className={`relative transition-all shadow-2xl rounded-sm overflow-hidden bg-white ${
              loading ? "opacity-0" : "opacity-100"
            }`}
            style={{
              boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.7)",
            }}
          >
            {/* The Actual Rendered PDF Page Canvas */}
            <canvas ref={canvasRef} className="block pointer-events-none" />

            {/* Subtle Diagonal Repeated Watermark Grid Overlay */}
            <div
              className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden flex items-center justify-center"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-16 sm:gap-24 opacity-[0.09] transform -rotate-[28deg] select-none pointer-events-none scale-125"
                style={{ userSelect: "none" }}
              >
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="text-center font-mono leading-tight whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-black text-neutral-950 tracking-wider">
                      BEENEXT PLUS
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-neutral-900 truncate max-w-[200px]">
                      {userEmail || "Licensed Member"}
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-semibold text-neutral-700 uppercase tracking-widest">
                      DO NOT DISTRIBUTE
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
