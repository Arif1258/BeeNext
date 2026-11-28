import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  BookOpen,
  Code2,
  Terminal,
  PlayCircle,
  Video,
  Flame,
  Activity,
  FileText,
  Briefcase,
  Crown,
  Zap,
  Award,
  Mail,
  Share2,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { CUSTOMER_SUPPORT_EMAIL } from "@/components/Footer";

interface SocialMediaChannel {
  platform: string;
  channelName: string;
  url: string;
  subtitle: string;
  buttonLabel: string;
  description?: string;
  iconBoxClasses: string;
  buttonHoverClasses: string;
  icon: React.ReactNode;
}

const SOCIAL_MEDIA_CHANNELS: SocialMediaChannel[] = [
  {
    platform: "YouTube",
    channelName: "BeeNext",
    url: "https://youtube.com/@beenext-y8d?si=1CQNPDjxOsF5u_1C",
    subtitle: "Official YouTube Channel",
    buttonLabel: "Visit Channel",
    description: "Official tutorials, algorithmic pattern analysis, and DSA problem walkthroughs.",
    iconBoxClasses: "bg-[#FF0000]/10 border-[#FF0000]/25 text-[#FF0000] group-hover:bg-[#FF0000] group-hover:text-white",
    buttonHoverClasses: "hover:bg-[#FF0000] hover:border-[#FF0000]",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    platform: "LinkedIn",
    channelName: "BeeNext",
    url: "https://www.linkedin.com/company/beenext1/",
    subtitle: "Official LinkedIn Page",
    buttonLabel: "Visit Page",
    description: "Official company updates, technical interview insights, and engineering opportunities.",
    iconBoxClasses: "bg-[#0A66C2]/10 border-[#0A66C2]/25 text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white",
    buttonHoverClasses: "hover:bg-[#0A66C2] hover:border-[#0A66C2]",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
        aria-hidden="true"
      >
        <path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0zM7.119 20.452H3.555V9h3.564v11.452zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm15.11 13.019h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z" />
      </svg>
    ),
  },
];

export const metadata: Metadata = {
  title: "About BeeNext - Modern DSA Learning Platform",
  description:
    "BeeNext is a modern Data Structures & Algorithms learning platform featuring 495 curated problems, interactive Monaco coding playground, Striver video solutions, comprehensive notes, company prep, and certification.",
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
            BeeNext is a comprehensive Data Structures and Algorithms learning platform designed to empower computer science students, aspiring software engineers, and working professionals to build strong technical foundations and develop real-world problem-solving skills.

            Our carefully structured curriculum follows Striver's renowned A to Z DSA Sheet, providing a systematic learning journey from fundamental concepts to advanced algorithms. With curated coding problems, video explanations, an interactive coding playground, detailed solutions, premium study notes, and company-specific placement preparation, BeeNext brings essential learning resources together in one place.

            As BeeNext continues to grow, we plan to introduce more coding problems, our own dedicated video explanations, and comprehensive courses designed to take learners from **Zero to Hero**, covering fundamental concepts through advanced technical skills.

            Our mission is to make quality technical education accessible, simplify interview preparation, and help learners confidently take the next step in their software engineering careers.

            Stay connected with our website and follow our official social media handles for upcoming courses, new features, learning resources, and the latest updates.
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. WEBSITE GUIDE                                          */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red/15 border border-brand-red/30 text-brand-red shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-mono">
                Website Guide
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent" />
            </div>
          </div>

          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Explore BeeNext's features and learn how to use them effectively.
          </p>

          <div className="space-y-6">
            {/* Guide Category 1: Curriculum & Problem Solving */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-mono font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
                Curriculum &amp; Solutions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. DSA Sheet and Topic-wise Problems */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-red/10 border border-brand-red/20 text-brand-red shrink-0">
                      <Code2 className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">DSA Sheet &amp; Topic Problems</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Practice 495 interview-relevant questions organized into 20 structured topics (from Arrays to Dynamic Programming). Each problem features Easy, Medium, or Hard difficulty tags, real-time search, and completion checkmarks.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span>{" "}
                    <Link href="/topics" className="text-brand-red hover:underline">
                      DSA Sheet (/topics)
                    </Link>
                  </div>
                </div>

                {/* 2. Brute Force and Optimal Solutions */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Brute Force &amp; Optimal Solutions</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Study tabbed, syntax-highlighted code implementations for both brute force and optimal approaches. Every solution includes comprehensive Time (TC) and Space Complexity (SC) breakdowns.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span> Click the Brute Force or Optimal buttons on any problem.
                  </div>
                </div>

                {/* 3. YouTube Video Explanations */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10 border border-red-500/20 text-[#FF0000] shrink-0">
                      <Video className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">YouTube Video Explanations</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Watch curated video walkthroughs by Striver directly linked to each problem. Master algorithmic intuition, manual dry runs, and edge-case handling before writing code.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span> Click the Video button on any problem card.
                  </div>
                </div>

                {/* 4. Daily Challenge & Streak System */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0">
                      <Flame className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Daily Challenge &amp; Streak System</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    One non-repeating problem is selected daily from 464 coding questions, synchronized for all users and resetting at midnight IST (Asia/Kolkata). Solving it advances your active flame streak in the navbar.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span> Top of{" "}
                    <Link href="/topics" className="text-brand-red hover:underline">
                      /topics
                    </Link>{" "}
                    &amp; flame icon in the top navbar.
                  </div>
                </div>
              </div>
            </div>

            {/* Guide Category 2: Interactive Coding & Sandbox */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-mono font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
                Playground &amp; Execution
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 5. Interactive Coding Playground & Languages */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                      <Terminal className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Coding Playground &amp; Languages</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Write code inside a full-featured Monaco editor with dark theme and syntax highlighting. Choose from 4 supported programming languages: C++ (GCC 9.2), Java (OpenJDK 13), Python (3.8), and JavaScript (Node.js 12).
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span> Click the Code button on any problem or the Daily Challenge.
                  </div>
                </div>

                {/* 6. Run and Submit Functionality */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                      <PlayCircle className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Run &amp; Submit Functionality</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    <strong className="text-neutral-300">Run</strong> tests your code against 3 visible test cases or custom inputs with execution time and memory stats. <strong className="text-neutral-300">Submit</strong> evaluates against all 6 comprehensive test cases (including hidden edge cases) to record completion.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span> Bottom action bar in the interactive Coding Playground.
                  </div>
                </div>

                {/* 7. Free Daily Coding Attempts */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 shrink-0">
                      <Zap className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Free Daily Coding Attempts</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Every logged-in Normal (free) user receives 1 free Run (3 test cases) and 1 free Submit (6 test cases) every day exclusively for the Daily Challenge. Solving it awards full streak increments, modal congratulations, and confetti animations.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span> Automatically available on the Daily Challenge playground.
                  </div>
                </div>

                {/* 8. Heatmap & Difficulty Performance Graph */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                      <Activity className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Activity Heatmap &amp; Difficulty Graph</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Monitor your 53-week coding consistency on a LeetCode-style activity calendar. The circular performance gauge and progress bars track solved problems by difficulty: Easy (Green #22C55E), Medium (Yellow #EAB308), and Hard (Red #EF4444).
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span> Coding Activity section directly on{" "}
                    <Link href="/topics" className="text-brand-red hover:underline">
                      /topics
                    </Link>
                    .
                  </div>
                </div>
              </div>
            </div>

            {/* Guide Category 3: Learning Notes, Placement & Credentials */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-mono font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
                Notes, Placements &amp; Certification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 9. Notes Library & Available Subjects */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Notes Library &amp; Available Subjects</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Access in-depth PDF study notes across 8 computer science tracks: DSA (20 topics), Core CS (DBMS, OS, CN, OOPs), Languages (C, C++, Java, Python), Web Dev (HTML, CSS, JS, React), Backend (Node.js, Express, Spring Boot), Databases (MySQL, MongoDB), DevOps (Docker, Kubernetes), and Git/GitHub.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span>{" "}
                    <Link href="/notes" className="text-brand-red hover:underline">
                      Notes Page (/notes)
                    </Link>
                  </div>
                </div>

                {/* 10. Company-Specific Placement Preparation */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                      <Briefcase className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Company Placement Preparation</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Prepare with company-specific recruitment tracks, syllabus breakdowns, and assessment patterns for 10 major hiring partners: TCS (NQT 2027), Infosys, Accenture, Cognizant, Capgemini, Wipro, HCLTech, Tech Mahindra, LTIMindtree, and IBM.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span> Click &quot;Prepare for Companies&quot; on{" "}
                    <Link href="/notes" className="text-brand-red hover:underline">
                      /notes
                    </Link>{" "}
                    or visit{" "}
                    <Link href="/company-preparation" className="text-brand-red hover:underline">
                      /company-preparation
                    </Link>
                    .
                  </div>
                </div>

                {/* 11. Normal and Plus Membership Benefits */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-red/10 border border-brand-red/20 text-brand-red shrink-0">
                      <Crown className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Normal &amp; Plus Memberships</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    <strong className="text-neutral-300">Normal (Free)</strong> provides access to all 495 problems, Striver videos, progress tracking, and 1 daily challenge attempt. <strong className="text-neutral-300">Plus (₹79/mo or ₹599/yr)</strong> unlocks unlimited cloud code execution, Brute &amp; Optimal solutions, complete Notes libraries, and certification.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span>{" "}
                    <Link href="/membership" className="text-brand-red hover:underline">
                      Membership Plans (/membership)
                    </Link>
                  </div>
                </div>

                {/* 12. Certificate Eligibility & Download Process */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Certificate Eligibility &amp; Download</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Earn an official Certificate of Achievement by meeting two criteria: 1) Solve at least 85% of the DSA sheet (421+ problems), and 2) Hold an active Plus membership. Once eligible, enter your legal name and download your verified high-resolution PDF certificate with unique credential ID.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span> Certificate button on{" "}
                    <Link href="/topics" className="text-brand-red hover:underline">
                      /topics
                    </Link>{" "}
                    or visit{" "}
                    <Link href="/certificate" className="text-brand-red hover:underline">
                      /certificate
                    </Link>
                    .
                  </div>
                </div>

                {/* 13. Job Alerts & Tech Opportunities */}
                <div className="p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                      <Briefcase className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">Job Alerts &amp; Tech Opportunities</h4>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Explore curated software engineering openings, internships, and off-campus recruitment drives from verified tech companies. Features search, job type filters (Full-Time, Internship, Off-Campus), batch eligibility criteria, and direct links to official company careers portals with zero middleman fees. Both Normal and Plus users can apply without restrictions.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-medium">Access:</span>{" "}
                    <Link href="/job-alerts" className="text-brand-red hover:underline">
                      Job Alerts (/job-alerts)
                    </Link>{" "}
                    in the top navigation bar.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. CUSTOMER SUPPORT                                       */}
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
        {/* 4. SOCIAL MEDIA                                           */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {SOCIAL_MEDIA_CHANNELS.map((channel) => (
                <div
                  key={channel.platform}
                  className="flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all shadow-sm group space-y-4"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Platform Icon */}
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border group-hover:scale-105 transition-all shrink-0 shadow-sm ${channel.iconBoxClasses}`}
                    >
                      {channel.icon}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white text-base tracking-tight group-hover:text-white transition-colors truncate">
                        {channel.channelName}
                      </span>
                      <span className="text-neutral-400 text-xs font-mono">
                        {channel.subtitle}
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
                      className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg border border-neutral-700 bg-neutral-800/80 text-neutral-200 hover:text-white text-xs font-mono font-semibold transition-all shadow-sm group-hover:border-neutral-600 ${channel.buttonHoverClasses}`}
                    >
                      <span>{channel.buttonLabel}</span>
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
