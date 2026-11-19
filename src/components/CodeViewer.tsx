"use client";

import React, { useState } from "react";
import { Check, Copy, Zap, Clock, HardDrive, Lock } from "lucide-react";

interface CodeApproach {
  id: string;
  approachType: "BRUTE_FORCE" | "OPTIMAL";
  title: string;
  explanation: string;
  javaCode: string;
  timeComplexity: string;
  spaceComplexity: string;
  isLocked?: boolean;
}

interface CodeViewerProps {
  codes: CodeApproach[];
  onUnlockClick?: () => void;
}

export default function CodeViewer({ codes, onUnlockClick }: CodeViewerProps) {
  // Default to OPTIMAL approach if present, else first
  const optimalCode = codes.find((c) => c.approachType === "OPTIMAL");
  const bruteCode = codes.find((c) => c.approachType === "BRUTE_FORCE");

  const [activeTab, setActiveTab] = useState<"OPTIMAL" | "BRUTE_FORCE">(
    optimalCode ? "OPTIMAL" : "BRUTE_FORCE"
  );
  const [copied, setCopied] = useState(false);

  const currentApproach = activeTab === "OPTIMAL" ? optimalCode : bruteCode;

  const handleCopy = () => {
    if (!currentApproach?.javaCode || currentApproach.isLocked) return;
    navigator.clipboard.writeText(currentApproach.javaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentApproach) {
    return (
      <div className="p-8 text-center text-brand-muted bg-brand-card rounded-xl border border-brand-border">
        No code solutions provided yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card overflow-hidden">
      {/* Approach Tab Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-brand-border bg-brand-black px-4 py-2.5">
        <div className="flex items-center space-x-2">
          {optimalCode && (
            <button
              onClick={() => setActiveTab("OPTIMAL")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === "OPTIMAL"
                  ? "bg-brand-red text-white shadow-brand"
                  : "text-brand-muted hover:text-white hover:bg-brand-surface"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Optimal Approach</span>
            </button>
          )}

          {bruteCode && (
            <button
              onClick={() => setActiveTab("BRUTE_FORCE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === "BRUTE_FORCE"
                  ? "bg-white text-brand-black font-bold"
                  : "text-brand-muted hover:text-white hover:bg-brand-surface"
              }`}
            >
              <span>Brute Force</span>
            </button>
          )}
        </div>

        {/* Copy Code Button */}
        {!currentApproach.isLocked && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-brand-muted hover:text-white bg-brand-surface hover:bg-brand-border rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-brand-red" />
                <span className="text-white">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Java Code</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Complexity Badges & Approach Title */}
      <div className="p-4 border-b border-brand-border bg-brand-card/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{currentApproach.title}</span>
            {currentApproach.approachType === "OPTIMAL" && (
              <span className="text-[10px] bg-brand-redMuted text-brand-red border border-brand-red/40 px-2 py-0.5 rounded font-mono font-bold uppercase">
                Recommended
              </span>
            )}
          </h4>
          <p className="text-xs text-brand-muted mt-1 leading-relaxed whitespace-pre-line">
            {currentApproach.explanation}
          </p>
        </div>

        {/* Time and Space Complexity Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-black border border-brand-border text-xs font-mono text-white">
            <Clock className="h-3.5 w-3.5 text-brand-red" />
            <span className="text-brand-subtle">Time:</span>
            <span className="font-bold">{currentApproach.timeComplexity}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-black border border-brand-border text-xs font-mono text-white">
            <HardDrive className="h-3.5 w-3.5 text-brand-red" />
            <span className="text-brand-subtle">Space:</span>
            <span className="font-bold">{currentApproach.spaceComplexity}</span>
          </div>
        </div>
      </div>

      {/* Code Body */}
      <div className="relative bg-brand-blackDeep p-4">
        {currentApproach.isLocked ? (
          <div className="py-12 px-4 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10 border border-brand-red text-brand-red">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h5 className="text-base font-bold text-white">Java Solution Locked</h5>
              <p className="text-xs text-brand-muted max-w-md mx-auto mt-1">
                This problem is part of our premium DSA collection. Unlock this problem or the entire category to inspect the complete Java implementation and tests.
              </p>
            </div>
            {onUnlockClick && (
              <button
                onClick={onUnlockClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold transition-all shadow-brand"
              >
                <span>Unlock Solution Code</span>
              </button>
            )}
          </div>
        ) : (
          <pre className="text-xs font-mono leading-relaxed text-gray-200 overflow-x-auto p-2">
            <code>{currentApproach.javaCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
