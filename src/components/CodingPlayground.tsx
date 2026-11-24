"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LANGUAGE_CONFIG, SupportedLanguage } from "@/lib/judge0";
import { getProblemTemplateForLanguage } from "@/lib/problemTemplates";
import {
  Play,
  Send,
  RotateCcw,
  Sparkles,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  Terminal,
  FileCode,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Dynamically import Monaco Editor to avoid SSR window issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center bg-neutral-950 font-mono text-xs text-neutral-500">
      Loading Monaco Code Editor...
    </div>
  ),
});

interface TestCaseResult {
  testIndex: number;
  passed: boolean;
  status: string;
  time?: string | null;
  memory?: number | null;
  input?: string | null;
  expectedOutput?: string | null;
  actualOutput?: string | null;
}

interface ExecutionResult {
  isSubmission?: boolean;
  isCustomInput?: boolean;
  status?: string;
  verdict?: string;
  passedTests?: number;
  totalTests?: number;
  executionTime?: string | null;
  memoryUsage?: number | null;
  errorOutput?: string | null;
  testResults?: TestCaseResult[];
  error?: string | null;
}

interface CodingPlaygroundProps {
  problemId?: string;
  problemTitle?: string;
  problemSlug?: string;
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  onSuccess?: () => void;
}

export default function CodingPlayground({
  problemId,
  problemTitle,
  problemSlug,
  initialCode,
  initialLanguage = "java",
  onSuccess,
}: CodingPlaygroundProps) {
  const router = useRouter();
  const { user, isPlusMember } = useAuth();

  const getTemplateFor = (lang: SupportedLanguage) => {
    if (initialCode && lang === initialLanguage) return initialCode;
    if (problemSlug) {
      const t = getProblemTemplateForLanguage(problemSlug, lang);
      if (t) return t;
    }
    return LANGUAGE_CONFIG[lang]?.defaultCode || "";
  };

  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(() => getTemplateFor(initialLanguage));
  const [stdin, setStdin] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  useEffect(() => {
    if (problemSlug) {
      setCode(getTemplateFor(language));
    }
  }, [problemSlug]);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [selectedTestIndex, setSelectedTestIndex] = useState<number>(0);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to results when execution completes
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [result]);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setCode(getTemplateFor(newLang));
  };

  const handleReset = () => {
    if (confirm("Reset editor to default template? Your current edits will be cleared.")) {
      setCode(getTemplateFor(language));
    }
  };

  const handleRun = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!isPlusMember) {
      setShowUpgradeModal(true);
      return;
    }

    setRunning(true);
    setResult(null);

    try {
      const res = await fetch("/api/playground/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          language,
          sourceCode: code,
          stdin: showCustomInput ? stdin : undefined,
        }),
      });

      const data = await res.json();
      if (res.status === 403 || data.code === "PLUS_REQUIRED") {
        setShowUpgradeModal(true);
        setRunning(false);
        return;
      }

      if (!res.ok) {
        setResult({
          error: data.error || "Failed to execute code.",
          verdict: "Compilation Error",
        });
      } else {
        setResult(data);
        setSelectedTestIndex(0);
      }
    } catch {
      setResult({
        error: "Network error executing code.",
        verdict: "Runtime Error",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!isPlusMember) {
      setShowUpgradeModal(true);
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/playground/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          language,
          sourceCode: code,
        }),
      });

      const data = await res.json();
      if (res.status === 403 || data.code === "PLUS_REQUIRED") {
        setShowUpgradeModal(true);
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setResult({
          error: data.error || "Submission processing failed.",
          verdict: "Compilation Error",
        });
      } else {
        setResult(data);
        setSelectedTestIndex(0);

        if ((data.status === "ACCEPTED" || data.verdict === "Accepted") && onSuccess) {
          onSuccess();
        }
      }
    } catch {
      setResult({
        error: "Network error submitting solution.",
        verdict: "Runtime Error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCase =
    result?.testResults && result.testResults.length > selectedTestIndex
      ? result.testResults[selectedTestIndex]
      : result?.testResults?.[0];

  const overallVerdict = result?.verdict || result?.status || "Accepted";
  const isAccepted = overallVerdict === "Accepted" || overallVerdict === "ACCEPTED";
  const isWrongAnswer = overallVerdict === "Wrong Answer" || overallVerdict === "WRONG_ANSWER";
  const isCompileError =
    overallVerdict === "Compilation Error" || overallVerdict === "COMPILATION_ERROR";
  const isRuntimeError =
    overallVerdict === "Runtime Error" || overallVerdict === "RUNTIME_ERROR";
  const isTLE =
    overallVerdict === "Time Limit Exceeded" || overallVerdict === "TIME_LIMIT_EXCEEDED";

  return (
    <div className="flex flex-col h-full w-full rounded-2xl border border-brand-border bg-neutral-950 overflow-y-auto shadow-2xl">
      {/* Top Action Bar: Language Selection & Options */}
      <div className="flex flex-wrap items-center justify-between border-b border-brand-border/70 bg-neutral-900/80 px-4 py-2 gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-neutral-300 font-mono text-xs font-semibold">
            <FileCode className="h-4 w-4 text-brand-red" />
            <span>Code</span>
          </div>

          {/* Language Selector: Exact 4 options in exact order: C++, Java, Python, JavaScript */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-1 text-xs font-mono font-medium text-neutral-200 hover:border-neutral-500 focus:border-brand-red focus:outline-none transition-colors cursor-pointer"
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
              <option key={key} value={key} className="bg-neutral-900 text-white">
                {config.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Input Toggle */}
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${showCustomInput
              ? "bg-neutral-800 border-neutral-600 text-white"
              : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700"
              }`}
          >
            <Terminal className="h-3 w-3" />
            <span>Custom Input</span>
            {showCustomInput ? (
              <ChevronUp className="h-3 w-3 ml-0.5" />
            ) : (
              <ChevronDown className="h-3 w-3 ml-0.5" />
            )}
          </button>

          {/* Reset Template */}
          <button
            onClick={handleReset}
            title="Reset code template"
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs font-mono text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Custom Input Expandable Drawer */}
      {showCustomInput && (
        <div className="border-b border-brand-border/60 bg-neutral-900/90 p-3.5 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-brand-red" />
              <span>Standard Input (stdin passed to program):</span>
            </label>
            <button
              onClick={() => setShowCustomInput(false)}
              className="text-neutral-500 hover:text-neutral-300 text-xs font-mono"
            >
              Close
            </button>
          </div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter custom test inputs here..."
            rows={3}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-neutral-200 focus:border-brand-red focus:outline-none resize-none"
          />
        </div>
      )}

      {/* Monaco Code Editor: Full Playground Width */}
      <div className="w-full relative min-h-[340px] flex-1">
        <Editor
          height="100%"
          language={LANGUAGE_CONFIG[language].monacoLanguage}
          value={code}
          onChange={(val) => setCode(val || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13.5,
            tabSize: 4,
            lineNumbers: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            fontFamily: "var(--font-geist-mono), monospace",
          }}
        />
      </div>

      {/* Bottom Action Bar: Run and Submit Controls (LeetCode-Style) */}
      <div className="flex items-center justify-between border-t border-brand-border/60 bg-neutral-900/95 px-4 py-2 shrink-0 h-11">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400 font-medium">
            Runtime: {LANGUAGE_CONFIG[language].name}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Run Code Button */}
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-mono font-bold transition-all shadow-sm ${isPlusMember
              ? "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 hover:border-neutral-600"
              : "bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700"
              }`}
          >
            <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
            <span>{running ? "Running..." : "Run"}</span>
            {!isPlusMember && <Lock className="h-3 w-3 text-neutral-500 ml-0.5" />}
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={running || submitting}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-mono font-bold bg-brand-red hover:bg-brand-redHover text-white shadow-brand transition-all"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{submitting ? "Submitting..." : "Submit"}</span>
            {!isPlusMember && <Lock className="h-3 w-3 text-white/70 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Small Loading Indicator Below Action Bar (Only while executing) */}
      {(running || submitting) && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-neutral-900/90 border-t border-brand-border/60 text-xs font-mono text-neutral-300 shrink-0 animate-pulse">
          <div className="h-3.5 w-3.5 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
          <span>
            {running
              ? "Executing code across test cases..."
              : "Evaluating submission against hidden test suite..."}
          </span>
        </div>
      )}

      {/* Execution Results Section — Horizontal Across Available Width (Show Only After Execution) */}
      {result && !running && !submitting && (
        <div
          ref={resultsRef}
          className="border-t border-brand-border bg-neutral-950 flex flex-col shrink-0 animate-fadeIn"
        >
          {/* Verdict Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-brand-border/60 bg-neutral-900/80 px-4 py-2.5 gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Overall Verdict Badge */}
              <div className="flex items-center gap-1.5">
                {isAccepted ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs font-mono">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Accepted</span>
                  </span>
                ) : isWrongAnswer ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-xs font-mono">
                    <XCircle className="h-4 w-4 text-rose-400" />
                    <span>Wrong Answer</span>
                  </span>
                ) : isCompileError ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs font-mono">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Compilation Error</span>
                  </span>
                ) : isTLE ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold text-xs font-mono">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <span>Time Limit Exceeded</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-xs font-mono">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>Runtime Error</span>
                  </span>
                )}
              </div>

              {/* Test Case Count */}
              {result.totalTests !== undefined && (
                <span className="text-xs font-mono font-semibold text-neutral-300">
                  {result.passedTests} / {result.totalTests} Cases Passed
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
              {/* Runtime & Memory Metrics */}
              {result.executionTime && (
                <div className="flex items-center gap-1 text-neutral-300">
                  <Clock className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{result.executionTime}s</span>
                </div>
              )}
              {result.memoryUsage && (
                <div className="flex items-center gap-1 text-neutral-300">
                  <Cpu className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{(result.memoryUsage / 1024).toFixed(1)} MB</span>
                </div>
              )}

              {/* Close Button to Dismiss Results */}
              <button
                onClick={() => setResult(null)}
                title="Close results"
                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Compilation / Runtime Error Banner */}
          {(isCompileError || isRuntimeError || result.errorOutput || result.error) && (
            <div className="p-4 bg-rose-950/20 border-b border-rose-500/20 space-y-1.5 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {isCompileError
                    ? "Compilation Error Details:"
                    : "Execution Error Details:"}
                </span>
              </div>
              <pre className="p-3 rounded-xl bg-black/60 border border-rose-500/30 text-rose-300 overflow-x-auto whitespace-pre-wrap max-h-44 text-[12px] leading-relaxed">
                {result.errorOutput || result.error || "An error occurred during execution."}
              </pre>
            </div>
          )}

          {/* Horizontal Test Cases Row (LeetCode-Style Green & Red Status Boxes) */}
          {result.testResults && result.testResults.length > 0 && !isCompileError && (
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-brand-border/60 bg-neutral-900/40">
                {result.testResults.map((tc, idx) => {
                  const isSelected = idx === selectedTestIndex;
                  return (
                    <button
                      key={tc.testIndex}
                      onClick={() => setSelectedTestIndex(idx)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${tc.passed
                        ? isSelected
                          ? "bg-emerald-500/25 border-2 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/40 shadow-sm"
                          : "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60"
                        : isSelected
                          ? "bg-rose-500/25 border-2 border-rose-400 text-rose-200 ring-2 ring-rose-500/40 shadow-sm"
                          : "bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:border-rose-500/60"
                        }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${tc.passed ? "bg-emerald-400 shadow-emerald-400/50" : "bg-rose-500 shadow-rose-500/50"
                          }`}
                      />
                      <span>Case {tc.testIndex}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Test Case Content Area */}
              {selectedCase && (
                <div className="p-4 space-y-3 font-mono text-xs">
                  {/* Case Status Banner */}
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400">Selected:</span>
                      <strong className="text-white">Case {selectedCase.testIndex}</strong>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${selectedCase.passed
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                      >
                        {selectedCase.passed ? "Passed" : selectedCase.status || "Failed"}
                      </span>
                    </div>

                    {selectedCase.time && (
                      <span className="text-neutral-400 text-[11px]">
                        Execution: {selectedCase.time}s
                      </span>
                    )}
                  </div>

                  {/* Submission Notice for Protected Hidden Cases */}
                  {result.isSubmission ? (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-1.5">
                      <div className="flex items-center gap-2 text-neutral-300 font-semibold text-xs">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>Protected Test Case Evaluation</span>
                      </div>
                      <p className="text-neutral-400 text-[11px] font-sans leading-relaxed">
                        Test inputs and expected outputs are hidden to verify your solution against unseen edge cases and prevent hardcoded answers.
                      </p>
                      {!selectedCase.passed && (
                        <div className="pt-2 text-rose-400 font-semibold text-xs flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Output differed from expected answer on this test case.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Sample Test Case Detailed View (Input, Expected Output, Actual Output) */
                    <div className="space-y-2.5">
                      {/* Input */}
                      {selectedCase.input && (
                        <div className="space-y-1">
                          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-bold">
                            Input:
                          </span>
                          <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 text-neutral-200 whitespace-pre-wrap leading-relaxed">
                            {selectedCase.input}
                          </div>
                        </div>
                      )}

                      {/* Expected Output */}
                      {selectedCase.expectedOutput && (
                        <div className="space-y-1">
                          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-bold">
                            Expected Output:
                          </span>
                          <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 text-emerald-400 font-bold whitespace-pre-wrap leading-relaxed">
                            {selectedCase.expectedOutput}
                          </div>
                        </div>
                      )}

                      {/* Actual Output */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-bold">
                          Actual Output:
                        </span>
                        <div
                          className={`rounded-lg border p-2.5 whitespace-pre-wrap leading-relaxed ${selectedCase.passed
                            ? "bg-neutral-900 border-emerald-500/30 text-emerald-300"
                            : "bg-rose-950/20 border-rose-500/40 text-rose-300"
                            }`}
                        >
                          {selectedCase.actualOutput || "(no stdout)"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Plus Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-red/20 border border-brand-red/40 flex items-center justify-center text-brand-red">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upgrade to BeeNext Plus</h3>
                <p className="text-xs text-neutral-400">Unlock Cloud Execution &amp; Submissions</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Normal members can write and edit code freely in our Monaco editor. To execute programs in the cloud, test submissions against hidden test cases, and see instant verdicts, upgrade to <strong className="text-white">BeeNext Plus</strong>.
            </p>

            <div className="space-y-2 rounded-xl bg-neutral-900 border border-neutral-800 p-3 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                <span>Unlimited Judge0 cloud execution</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                <span>Submit against hidden test cases with verdicts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                <span>Unlock Brute Force &amp; Optimal solutions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-red shrink-0" />
                <span>Full access to all 5 Premium PDF Notes</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-medium transition-colors"
              >
                Close
              </button>
              <Link
                href="/membership"
                className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold transition-all shadow-brand flex items-center justify-center gap-2 text-center"
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
