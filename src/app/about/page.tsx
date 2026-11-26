import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  BookOpen,
  Layers,
  Award,
  Mail,
  Share2,
  Video,
  Code2,
  TrendingUp,
  CheckCircle2,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { CUSTOMER_SUPPORT_EMAIL } from "@/components/Footer";

interface SocialMediaChannel {
  platform: string;
  channelName: string;
  url: string;
  description?: string;
}

const SOCIAL_MEDIA_CHANNELS: SocialMediaChannel[] = [
  {
    platform: "YouTube",
    channelName: "BeeNext",
    url: "https://youtube.com/@beenext-y8d?si=1CQNPDjxOsF5u_1C",
    description: "Official tutorials, algorithmic pattern analysis, and DSA problem walkthroughs.",
  },
];

export const metadata: Metadata = {
  title: "About BeeNext - Modern DSA Learning Platform",
  description:
    "BeeNext is a modern Data Structures & Algorithms learning platform featuring 495 curated problems, interactive Monaco coding playground, Striver video solutions, and comprehensive computer science notes.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-4xl space-y-12 sm:space-y-14">
        {/* ========================================================= */}
        {/* HERO HEADER                                               */}
        {/* ========================================================= */}
        <div className="space-y-4 text-center sm:text-left border-b border-brand-border/80 pb-8 sm:pb-10">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            <span className="text-brand-red">BEENEXT</span>
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Engineered to bridge the gap between algorithmic theory and real technical hiring rigor. Master 495 curated problems with clean code solutions, structured notes, and live execution.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 1. ABOUT BEENEXT                                          */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red/15 border border-brand-red/30 text-brand-red shrink-0">
              <Compass className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-mono">
                About BEENEXT
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent" />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-gradient-to-b from-brand-card to-brand-blackDeep p-6 sm:p-8 space-y-4 shadow-card relative overflow-hidden group hover:border-brand-borderHover transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Master DSA &amp; Ace Technical Interviews
            </h3>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              BeeNext is a comprehensive Data Structures and Algorithms learning platform designed to empower computer science students, aspiring software engineers, and working professionals to build strong technical foundations and develop real-world problem-solving skills. Our carefully structured curriculum follows Striver&apos;s renowned A to Z DSA Sheet, providing a systematic learning journey from fundamental concepts to advanced algorithms. With curated coding problems, video explanations, an interactive coding playground, detailed solutions, premium study notes, and company-specific placement preparation, BeeNext brings essential learning resources together in one place. Our mission is to make quality technical education accessible, simplify interview preparation, and help learners confidently take the next step in their software engineering careers.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. THE CURRICULUM                                         */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red/15 border border-brand-red/30 text-brand-red shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-mono">
                The Curriculum
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent" />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-gradient-to-b from-brand-card to-brand-blackDeep p-6 sm:p-8 space-y-5 shadow-card hover:border-brand-borderHover transition-colors">
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              The platform organizes 495 carefully curated problems across 20 core topics, taking learners from foundational arrays and strings to advanced dynamic programming, graphs, trees, tries, and bit manipulation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Feature 1: Striver Video Solutions */}
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-1.5 shadow-sm group">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10 border border-red-500/20 text-brand-red shrink-0">
                    <Video className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-white text-sm group-hover:text-brand-red transition-colors">
                    Striver Video Solutions
                  </span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed pl-9">
                  Curated step-by-step video explanations with dry runs and intuition.
                </p>
              </div>

              {/* Feature 2: LeetCode Integration */}
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-1.5 shadow-sm group">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <Code2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">
                    LeetCode Integration
                  </span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed pl-9">
                  Direct problem links for comprehensive external practice and testing.
                </p>
              </div>

              {/* Feature 3: Progress Tracking */}
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-1.5 shadow-sm group">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">
                    Progress Tracking
                  </span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed pl-9">
                  Difficulty breakdown (Easy, Medium, Hard) with real-time sheet completion metrics.
                </p>
              </div>

              {/* Feature 4: Complete Solutions */}
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-1.5 shadow-sm group">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-white text-sm group-hover:text-sky-400 transition-colors">
                    Complete Solutions
                  </span>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed pl-9">
                  Syntax-highlighted Brute Force and Optimal implementations with Time &amp; Space complexity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. MEMBERSHIP TIERS                                       */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red/15 border border-brand-red/30 text-brand-red shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-mono">
                Membership Tiers
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Normal Tier Box */}
            <div className="rounded-2xl border border-brand-border bg-gradient-to-b from-brand-card to-brand-blackDeep p-6 sm:p-7 space-y-5 shadow-card hover:border-neutral-700 transition-colors flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">Normal (Free)</h3>
                    <p className="text-xs text-neutral-400">Essential DSA Foundation</p>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 font-semibold border border-neutral-700">
                    FREE FOREVER
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                    <span>Full access to all 495 DSA sheet problems</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                    <span>Curated Striver YouTube video walkthroughs</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                    <span>Personal progress tracking &amp; difficulty breakdown</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                    <span>Open Monaco editor and write solution code</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href="/topics"
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 hover:text-white font-mono text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Start Free Practice</span>
                </Link>
              </div>
            </div>

            {/* Plus Tier Box (Highlighted) */}
            <div className="rounded-2xl border border-brand-red/40 bg-gradient-to-b from-brand-card via-brand-card to-brand-blackDeep p-6 sm:p-7 space-y-5 shadow-brand relative overflow-hidden flex flex-col justify-between group hover:border-brand-red/60 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-red/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4 relative">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-lg">BeeNext Plus</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red text-white shadow-sm">
                        Pro
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">Complete Cloud Sandbox &amp; Notes</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-brand-red bg-brand-red/10 border border-brand-red/25 px-2.5 py-1 rounded-full">
                    ₹79/mo or ₹599/yr
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                    <span className="font-medium text-white">Everything included in the Normal tier</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                    <span>Instant cloud code execution with Judge0</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                    <span>Submit code against hidden test cases &amp; verdicts</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                    <span>Unlocked Brute Force &amp; Optimal solutions</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                    <span>Unrestricted access to all 5 Premium Notes libraries</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                    <span>Completion Certificate download (at &ge;85% sheet solved)</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href="/membership"
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-mono text-xs font-bold transition-all shadow-brand flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Upgrade to Plus</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. COMPLETION CERTIFICATE                                 */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red/15 border border-brand-red/30 text-brand-red shrink-0">
              <Award className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-mono">
                Completion Certificate
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent" />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-gradient-to-b from-brand-card to-brand-blackDeep p-6 sm:p-8 space-y-4 shadow-card hover:border-brand-borderHover transition-colors">
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              BeeNext issues an official Certificate of Achievement to recognize exceptional dedication in mastering DSA. To maintain credential value, issuance requires satisfying two strict conditions with zero additional fees:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-red/15 border border-brand-red/30 text-brand-red font-mono font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div className="space-y-1">
                  <span className="font-semibold text-white text-sm block">Requirement 1</span>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Solve at least 85% of the 495 problems (421+ questions) across the sheet.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-red/15 border border-brand-red/30 text-brand-red font-mono font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-1">
                  <span className="font-semibold text-white text-sm block">Requirement 2</span>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Hold an active BeeNext Plus membership at the time of certificate issuance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. CUSTOMER SUPPORT                                       */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red/15 border border-brand-red/30 text-brand-red shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-mono">
                Customer Support
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent" />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-gradient-to-b from-brand-card to-brand-blackDeep p-6 sm:p-8 space-y-4 shadow-card hover:border-brand-borderHover transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <h3 className="font-bold text-white text-base">Direct Assistance</h3>
              <p className="text-neutral-300 text-sm leading-relaxed">
                For any platform questions, membership inquiries, or technical support, reach out to our dedicated assistance team:
              </p>
            </div>

            <a
              href={`mailto:${CUSTOMER_SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-500 text-white font-mono text-xs sm:text-sm font-semibold transition-all shadow-sm shrink-0"
            >
              <Mail className="h-4 w-4 text-brand-red" />
              <span>{CUSTOMER_SUPPORT_EMAIL}</span>
            </a>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 6. SOCIAL MEDIA                                           */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red/15 border border-brand-red/30 text-brand-red shrink-0">
              <Share2 className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-mono">
                Social Media
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent" />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-gradient-to-b from-brand-card to-brand-blackDeep p-6 sm:p-8 space-y-4 shadow-card hover:border-brand-borderHover transition-colors">
            <p className="text-neutral-300 text-sm leading-relaxed">
              Connect with our community, watch step-by-step problem walkthroughs, and stay updated with the latest DSA resources:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
              {SOCIAL_MEDIA_CHANNELS.map((channel) => (
                <div
                  key={channel.platform}
                  className="flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all shadow-sm group space-y-4"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Official Red YouTube Icon */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF0000]/10 border border-[#FF0000]/25 text-[#FF0000] group-hover:scale-105 group-hover:bg-[#FF0000] group-hover:text-white transition-all shrink-0 shadow-sm">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 fill-current"
                        aria-hidden="true"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white text-base tracking-tight group-hover:text-white transition-colors truncate">
                        {channel.channelName}
                      </span>
                      <span className="text-neutral-400 text-xs font-mono">
                        Official {channel.platform} Channel
                      </span>
                    </div>
                  </div>

                  {channel.description && (
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                      {channel.description}
                    </p>
                  )}

                  <div className="pt-1">
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-[#FF0000] hover:border-[#FF0000] text-neutral-200 hover:text-white text-xs font-mono font-semibold transition-all shadow-sm group-hover:border-neutral-600"
                    >
                      <span>Visit Channel</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* NAVIGATION CTA                                            */}
        {/* ========================================================= */}
        <div className="pt-6 border-t border-brand-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-white">Ready to elevate your engineering skills?</h4>
            <p className="text-xs text-neutral-400">Jump right into the 495 problems or unlock cloud sandbox access.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/topics"
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white text-xs sm:text-sm font-mono font-semibold transition-colors"
            >
              DSA Topics
            </Link>
            <Link
              href="/membership"
              className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs sm:text-sm font-mono font-bold transition-all shadow-brand flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>Explore Plus</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
