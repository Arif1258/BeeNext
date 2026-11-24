import React from "react";
import type { Metadata } from "next";
import CodingPlayground from "@/components/CodingPlayground";
import Link from "next/link";
import { Sparkles, ArrowLeft, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "Coding Playground - BeeNext DSA",
  description:
    "Interactive coding playground supporting Java, C++, Python, and JavaScript with instant test execution and submission verdicts.",
};

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-brand-black text-white py-8 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white flex flex-col">
      <div className="mx-auto max-w-7xl w-full flex-1 flex flex-col space-y-6">
        {/* Header Breadcrumb & Info */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/topics"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>DSA Topics</span>
              </Link>
              <span className="text-neutral-600">/</span>
              <span className="text-xs font-mono text-brand-red">Playground</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Terminal className="h-7 w-7 text-brand-red" />
              <span>BeeNext Coding Playground</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/membership"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-brand-red/50 bg-brand-red/10 hover:bg-brand-red/20 text-brand-red text-xs font-mono font-bold transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Plus Membership</span>
            </Link>
          </div>
        </div>

        {/* Playground Main Container */}
        <div className="flex-1 min-h-[580px] flex flex-col">
          <CodingPlayground />
        </div>
      </div>
    </div>
  );
}
