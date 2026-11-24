import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CUSTOMER_SUPPORT_EMAIL } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About BeeNext - Modern DSA Learning Platform",
  description:
    "BeeNext is a modern Data Structures & Algorithms learning platform featuring 495 curated problems, interactive Monaco coding playground, Striver video solutions, and comprehensive computer science notes.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-4xl space-y-10 sm:space-y-12">
        {/* ========================================================= */}
        {/* 1. ABOUT BEENEXT                                          */}
        {/* ========================================================= */}
        <section className="space-y-3">
          <h2 className="text-brand-red font-mono font-bold text-base sm:text-lg uppercase tracking-wider">
            ABOUT BEENEXT
          </h2>
          <div className="rounded-2xl border border-neutral-800 bg-brand-card p-6 sm:p-7 space-y-3 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Master DSA &amp; Ace Technical Interviews
            </h3>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              BeeNext is a dedicated Data Structures and Algorithms learning platform designed to help computer science students, aspiring software engineers, and working professionals build real problem-solving confidence. Our curriculum is structured around Striver&apos;s renowned A to Z DSA Sheet, stripping away unnecessary theory to focus strictly on what is evaluated in technical interviews.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. THE CURRICULUM                                         */}
        {/* ========================================================= */}
        <section className="space-y-3">
          <h2 className="text-brand-red font-mono font-bold text-base sm:text-lg uppercase tracking-wider">
            THE CURRICULUM
          </h2>
          <div className="rounded-2xl border border-neutral-800 bg-brand-card p-6 sm:p-7 space-y-4 shadow-sm">
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              The platform organizes 495 carefully curated problems across 20 core topics, taking learners from foundational arrays and strings to advanced dynamic programming, graphs, trees, tries, and bit manipulation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="font-semibold text-white text-xs sm:text-sm block">Striver Video Solutions</span>
                <span className="text-neutral-400 text-xs">Curated step-by-step video explanations with dry runs and intuition.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="font-semibold text-white text-xs sm:text-sm block">LeetCode Integration</span>
                <span className="text-neutral-400 text-xs">Direct problem links for comprehensive external practice and testing.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="font-semibold text-white text-xs sm:text-sm block">Progress Tracking</span>
                <span className="text-neutral-400 text-xs">Difficulty breakdown (Easy, Medium, Hard) with real-time sheet completion metrics.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="font-semibold text-white text-xs sm:text-sm block">Complete Solutions</span>
                <span className="text-neutral-400 text-xs">Syntax-highlighted Brute Force and Optimal implementations with Time &amp; Space complexity.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. MEMBERSHIP TIERS                                       */}
        {/* ========================================================= */}
        <section className="space-y-3">
          <h2 className="text-brand-red font-mono font-bold text-base sm:text-lg uppercase tracking-wider">
            MEMBERSHIP TIERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Normal Tier Box */}
            <div className="rounded-2xl border border-neutral-800 bg-brand-card p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <h3 className="font-bold text-white text-base">Normal (Free)</h3>
                <span className="font-mono text-xs text-neutral-400">FREE FOREVER</span>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <span className="text-white font-bold">&bull;</span>
                  <span>Full access to all 495 DSA sheet problems</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white font-bold">&bull;</span>
                  <span>Curated Striver YouTube video walkthroughs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white font-bold">&bull;</span>
                  <span>Personal progress tracking &amp; difficulty breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white font-bold">&bull;</span>
                  <span>Open Monaco editor and write solution code</span>
                </li>
              </ul>
            </div>

            {/* Plus Tier Box */}
            <div className="rounded-2xl border border-neutral-800 bg-brand-card p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <h3 className="font-bold text-white text-base">BeeNext Plus</h3>
                <span className="font-mono text-xs text-neutral-300">₹79/mo or ₹599/yr</span>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <span className="text-white font-bold">&bull;</span>
                  <span>Everything included in the Normal tier</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white font-bold">&bull;</span>
                  <span>Instant cloud code execution with Judge0</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white font-bold">&bull;</span>
                  <span>Submit code against hidden test cases &amp; verdicts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white font-bold">&bull;</span>
                  <span>Unlocked Brute Force &amp; Optimal solutions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white font-bold">&bull;</span>
                  <span>Unrestricted access to all 5 Premium Notes libraries</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white font-bold">&bull;</span>
                  <span>Completion Certificate download (at &ge;85% sheet solved)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. COMPLETION CERTIFICATE                                 */}
        {/* ========================================================= */}
        <section className="space-y-3">
          <h2 className="text-brand-red font-mono font-bold text-base sm:text-lg uppercase tracking-wider">
            COMPLETION CERTIFICATE
          </h2>
          <div className="rounded-2xl border border-neutral-800 bg-brand-card p-6 sm:p-7 space-y-3.5 shadow-sm">
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              BeeNext issues an official Certificate of Achievement to recognize exceptional dedication in mastering DSA. To maintain credential value, issuance requires satisfying two strict conditions with zero additional fees:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="font-semibold text-white block mb-1">Requirement 1</span>
                <span className="text-neutral-400">Solve at least 85% of the 495 problems (421+ questions) across the sheet.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="font-semibold text-white block mb-1">Requirement 2</span>
                <span className="text-neutral-400">Hold an active BeeNext Plus membership at the time of certificate issuance.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. CUSTOMER SUPPORT                                       */}
        {/* ========================================================= */}
        <section className="space-y-3">
          <h2 className="text-brand-red font-mono font-bold text-base sm:text-lg uppercase tracking-wider">
            CUSTOMER SUPPORT
          </h2>
          <div className="rounded-2xl border border-neutral-800 bg-brand-card p-6 sm:p-7 space-y-3 shadow-sm">
            <p className="text-neutral-300 text-sm leading-relaxed">
              For any platform questions, membership inquiries, or technical support, reach out to our dedicated assistance team:
            </p>
            <div className="pt-1">
              <a
                href={`mailto:${CUSTOMER_SUPPORT_EMAIL}`}
                className="font-mono text-sm text-white underline underline-offset-4 hover:text-neutral-300 transition-colors"
              >
                {CUSTOMER_SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </section>

        {/* Navigation CTA */}
        <div className="pt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/topics"
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs sm:text-sm font-mono font-medium transition-colors"
          >
            DSA Topics
          </Link>
          <Link
            href="/membership"
            className="px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs sm:text-sm font-mono font-bold transition-all shadow-brand flex items-center gap-1.5"
          >
            <span>Explore Plus</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
