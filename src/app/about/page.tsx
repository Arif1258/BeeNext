import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Award,
  Activity,
  Truck,
  Video,
  ExternalLink,
} from "lucide-react";
import { CUSTOMER_SUPPORT_EMAIL } from "@/components/Footer";

export const metadata: Metadata = {
  title: "BeeNext - DSA Sheet",
  description:
    "BeeNext publishes interview-focused physical books for Data Structures & Algorithms, Computer Science fundamentals, databases, and HR interview preparation.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-black text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-7xl space-y-10 sm:space-y-12">
        {/* ========================================================= */}
        {/* PAGE HEADER                                               */}
        {/* ========================================================= */}
        <header className="border-b border-neutral-800 pb-8 sm:pb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            <span>About BeeNext</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Learn What Matters.{" "}
            <span className="text-brand-red">Skip What Doesn&apos;t.</span>
          </h1>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-3xl lg:max-w-4xl">
            BeeNext publishes interview-focused physical books designed for students, aspiring engineers, and working professionals. Inspired by Striver&apos;s A to Z DSA sheet, our curriculum strips away unnecessary theory to focus strictly on what is asked in technical interviews.
          </p>
        </header>

        {/* ========================================================= */}
        {/* REPEATING HEADING & BOX PATTERN                           */}
        {/* ========================================================= */}
        <main className="space-y-10 sm:space-y-12">
          {/* 1. Who We Are */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-brand-red shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Who We Are
              </h2>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                Preparing for coding interviews often forces learners to navigate hundreds of disorganized questions, overly verbose textbooks, and outdated theory. BeeNext was created to provide a structured, distraction-free alternative.
              </p>
              <p>
                We publish physical books covering Data Structures &amp; Algorithms, core Computer Science fundamentals, databases, and HR interviews. Every book is crafted with a single objective: <strong>help learners master problem-solving efficiently and build real interview confidence</strong> with curated problems, computer-written solutions in C, C++, Java, and Python, and rigorous complexity analysis.
              </p>
            </div>
          </section>

          {/* 2. Our DSA Sheet */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-brand-red shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Our DSA Sheet
              </h2>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed space-y-4">
              <p>
                BeeNext provides a structured DSA Sheet containing 495 carefully organised questions across 20 topics. The sheet is completely based on Striver&apos;s A to Z DSA Sheet, enhanced with additional features to make interview preparation more effective and convenient.
              </p>
              <p className="text-white font-medium">Each problem includes:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5" />
                    <span>Video Solution</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    A YouTube video solution.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Practice Link</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    A direct LeetCode problem link.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Brute Force</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    A Brute Force solution.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Optimal Solution</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    An Optimal solution.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Time Complexity</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Time Complexity analysis.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Space Complexity</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Space Complexity analysis.
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 pt-1">
                Our goal is to provide everything learners need to understand, practise, and solve important DSA problems in one organised place.
              </p>
            </div>
          </section>

          {/* 3. Performance Tracking & Certificate */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-brand-red shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Performance Tracking &amp; Certificate
              </h2>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-brand-red font-mono text-xs font-bold uppercase tracking-wider">
                    <Activity className="h-4 w-4" />
                    <span>Performance Tracker</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Learners can track their DSA preparation progress through the built-in performance tracker, monitor completed problems, and see their overall completion percentage.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-brand-red font-mono text-xs font-bold uppercase tracking-wider">
                    <Award className="h-4 w-4" />
                    <span>Completion Certificate</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    BeeNext issues a certificate to learners upon successful completion of the DSA Sheet.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Our Book Collection */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-brand-red shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Our Book Collection
              </h2>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed space-y-4">
              <p>
                BeeNext offers carefully prepared physical books for learners who prefer structured preparation through printed materials.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="text-white font-bold text-sm">
                    DSA Books
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Topic-wise books and the complete DSA Book. Customers can purchase individual topic books or the full DSA collection.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="text-white font-bold text-sm">
                    CS Fundamentals Books
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    OOPS, Computer Networks, Operating Systems, and other core computer science subjects.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="text-white font-bold text-sm">
                    Database Books
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Books focused on database concepts and interview preparation.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="text-white font-bold text-sm">
                    HR Interview Book
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Preparation material for HR interviews.
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 pt-1">
                All our books are designed to provide useful, interview-focused content with an emphasis on clarity, accuracy, and quality.
              </p>
            </div>
          </section>

          {/* 5. The BeeNext Advantage */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-brand-red shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                The BeeNext Advantage
              </h2>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <li className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">
                    <strong className="text-white">Focused Learning:</strong> Only interview-relevant questions and concepts, without unnecessary material.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">
                    <strong className="text-white">Structured DSA Preparation:</strong> 495 questions organised across 20 topics.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">
                    <strong className="text-white">Complete Solutions:</strong> Brute Force and Optimal solutions with TC and SC analysis.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">
                    <strong className="text-white">Learning Resources:</strong> YouTube video solutions and direct LeetCode links for DSA problems.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">
                    <strong className="text-white">Quality Books:</strong> Carefully prepared, computer-written, organised learning materials.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">
                    <strong className="text-white">Flexible Purchasing:</strong> Buy individual topic-wise books or the complete DSA Book.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">
                    <strong className="text-white">Progress Monitoring:</strong> Track your DSA preparation through the performance tracker.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm">
                    <strong className="text-white">Certificate:</strong> Receive a certificate after successfully completing the DSA Sheet.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 6. Print Quality & Nationwide Delivery */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-brand-red shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Print Quality &amp; Nationwide Delivery
              </h2>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                BeeNext is committed to providing well-organised, verified, and good-quality physical books.
              </p>
              <p>
                We focus on clear printing, readable content, and professionally prepared books to provide a comfortable learning experience.
              </p>
              <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                <Truck className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  We use <strong className="text-white font-semibold">Ekart</strong> for delivering books to customers across India, helping keep shipping costs affordable while providing a convenient delivery experience.
                </p>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 pt-1">
                Customers can place orders through our website and track their purchases through the dedicated My Orders section.
              </p>
            </div>
          </section>

          {/* 7. Order Tracking & Customer Experience */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-brand-red shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Order Tracking &amp; Customer Experience
              </h2>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                BeeNext provides a dedicated <strong className="text-white">My Orders</strong> section where customers can view their order details and monitor their order status.
              </p>
              <p>
                Customers can check their purchased books, order information, payment details, and delivery updates in one place.
              </p>
              <p className="text-xs sm:text-sm text-neutral-400">
                We aim to make the entire purchasing experience simple, transparent, and convenient.
              </p>
            </div>
          </section>

          {/* 8. Return Policy */}
          <section id="return-policy" className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-brand-red shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Return Policy
              </h2>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                We want our customers to be satisfied with their purchases. If you are not satisfied with your book or need assistance with a return or replacement, our policy is simple and transparent:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span>The return request must be made within <strong>3 days</strong> of receiving the book.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span>The book must be in its original, undamaged condition.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <span>If you receive a <strong>damaged, defective, incorrect, or missing</strong> book, our Customer Care team will promptly assist you with a replacement or return.</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-neutral-800 text-xs sm:text-sm text-neutral-400">
                To request a return or replacement, email us at{" "}
                <a
                  href={`mailto:${CUSTOMER_SUPPORT_EMAIL}`}
                  className="font-mono text-brand-red hover:underline font-semibold"
                  title="Email BeeNext Support"
                >
                  {CUSTOMER_SUPPORT_EMAIL}
                </a>
                . Include your order details and reason for requesting assistance in your email.
              </div>
            </div>
          </section>

          {/* 9. Customer Care & Support */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-brand-red shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Customer Care &amp; Support
              </h2>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                At BeeNext, customer satisfaction matters to us. If you have questions or need assistance regarding books, orders, payments, delivery, returns, or replacements, our support team is available to help.
              </p>
              <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1.5 max-w-md">
                <div className="flex items-center gap-2 text-brand-red font-mono text-xs font-bold uppercase tracking-wider">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email Support</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  For any queries or assistance, contact us through:
                </p>
                <a
                  href={`mailto:${CUSTOMER_SUPPORT_EMAIL}`}
                  className="inline-flex items-center gap-2 pt-1 font-mono text-xs sm:text-sm font-bold text-white hover:text-brand-red transition-colors"
                  title="Send an email to BeeNext customer support"
                >
                  <span>{CUSTOMER_SUPPORT_EMAIL}</span>
                  <ArrowRight className="h-3 w-3 text-brand-red" />
                </a>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 pt-1">
                We value customer feedback and continuously work to improve our services.
              </p>
            </div>
          </section>

          {/* 10. What's Coming Next */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-1 rounded-full bg-brand-red shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                What&apos;s Coming Next
              </h2>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                BeeNext is continuously working to improve its learning platform and expand its collection of books.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <span>More books will be introduced based on customer demand.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <span>Additional learning and platform features will be added in the future.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <span>We plan to launch and share our official YouTube channel, where we will showcase our books and provide useful content.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                  <span>We will collect customer feedback to understand learners&apos; needs and continuously improve our products and services.</span>
                </li>
              </ul>
              <p className="text-xs sm:text-sm text-neutral-400 pt-1">
                Keep visiting BeeNext to stay updated with upcoming books, features, and improvements.
              </p>
            </div>
          </section>
        </main>

        {/* ========================================================= */}
        {/* BOTTOM QUICK LINKS / CTA                                  */}
        {/* ========================================================= */}
        <footer className="rounded-xl border border-neutral-800 bg-[#161616] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <h3 className="text-sm font-bold text-white">
              Ready to Prepare Smarter?
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Learn What Matters. Skip What Doesn&apos;t.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/topics"
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-mono transition-colors"
            >
              DSA Topics
            </Link>
            <Link
              href="/purchase"
              className="px-3.5 py-1.5 rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Explore Books</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
