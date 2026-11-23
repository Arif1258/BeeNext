import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  Award,
  Activity,
  Truck,
  Video,
  ExternalLink,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { CUSTOMER_SUPPORT_EMAIL } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About BeeNext - DSA Sheet & Interview Books",
  description:
    "BeeNext publishes interview-focused physical books for Data Structures & Algorithms, Computer Science fundamentals, databases, and HR interview preparation.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-black text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-5xl space-y-10 sm:space-y-12">
        {/* ========================================================= */}
        {/* 1. ABOUT BEENEXT (HERO SECTION)                           */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-red animate-pulse" />
            <h1 className="text-brand-red text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              About
            </h1>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 md:p-10 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 shadow-card relative overflow-hidden">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Learn What Matters. <span className="text-brand-red">Skip What Doesn&apos;t.</span>
              </h2>
            </div>
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed max-w-4xl">
              BeeNext publishes interview-focused physical books designed for students, aspiring engineers, and working professionals. Inspired by Striver&apos;s A to Z DSA sheet, our curriculum strips away unnecessary theory to focus strictly on what is asked in technical interviews.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. WHO WE ARE                                             */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>Who We Are</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 shadow-card">
            <p>
              Preparing for coding interviews often forces learners to navigate hundreds of disorganized questions, overly verbose textbooks, and outdated theory. BeeNext was created to provide a structured, distraction-free alternative.
            </p>
            <p>
              We publish physical books covering Data Structures &amp; Algorithms, core Computer Science fundamentals, databases, and HR interviews. Every book is crafted with a single objective: <strong className="text-white font-semibold">help learners master problem-solving efficiently and build real interview confidence</strong> with curated problems, computer-written solutions in C, C++, Java, and Python, and rigorous complexity analysis.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. OUR DSA SHEET                                          */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>Our DSA Sheet</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-5 shadow-card">
            <p>
              BeeNext provides a structured DSA Sheet containing 495 carefully organised questions across 20 topics. The sheet is completely based on Striver&apos;s A to Z DSA Sheet, enhanced with additional features to make interview preparation more effective and convenient.
            </p>
            <div className="space-y-3">
              <p className="text-white font-semibold text-sm sm:text-base">Each problem includes:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border space-y-1.5 transition-colors hover:border-neutral-700">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Video className="h-4 w-4 shrink-0" />
                    <span>Video Solution</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    A YouTube video solution.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border space-y-1.5 transition-colors hover:border-neutral-700">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    <span>Practice Link</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    A direct LeetCode problem link.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border space-y-1.5 transition-colors hover:border-neutral-700">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Brute Force</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    A Brute Force solution.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border space-y-1.5 transition-colors hover:border-neutral-700">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Optimal Solution</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    An Optimal solution.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border space-y-1.5 transition-colors hover:border-neutral-700">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Time Complexity</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Time Complexity analysis.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border space-y-1.5 transition-colors hover:border-neutral-700">
                  <div className="text-brand-red font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Space Complexity</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Space Complexity analysis.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 pt-1">
              Our goal is to provide everything learners need to understand, practise, and solve important DSA problems in one organised place.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. PERFORMANCE TRACKING & CERTIFICATE                     */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>Performance Tracking &amp; Certificate</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-neutral-900 border border-brand-border space-y-2">
                <div className="flex items-center gap-2.5 text-brand-red font-mono text-xs font-bold uppercase tracking-wider">
                  <Activity className="h-4 w-4" />
                  <span>Performance Tracker</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Learners can track their DSA preparation progress through the built-in performance tracker, monitor completed problems, and see their overall completion percentage.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-neutral-900 border border-brand-border space-y-2">
                <div className="flex items-center gap-2.5 text-brand-red font-mono text-xs font-bold uppercase tracking-wider">
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

        {/* ========================================================= */}
        {/* 5. OUR BOOK COLLECTION                                    */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>Our Book Collection</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-5 shadow-card">
            <p>
              BeeNext offers carefully prepared physical books for learners who prefer structured preparation through printed materials.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-neutral-900 border border-brand-border space-y-2 transition-colors hover:border-neutral-700">
                <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-red" />
                  <span>DSA Books</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Topic-wise books and the complete DSA Book. Customers can purchase individual topic books or the full DSA collection.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-neutral-900 border border-brand-border space-y-2 transition-colors hover:border-neutral-700">
                <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-red" />
                  <span>CS Fundamentals Books</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  OOPS, Computer Networks, Operating Systems, and other core computer science subjects.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-neutral-900 border border-brand-border space-y-2 transition-colors hover:border-neutral-700">
                <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-red" />
                  <span>Database Books</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Books focused on database concepts and interview preparation.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-neutral-900 border border-brand-border space-y-2 transition-colors hover:border-neutral-700">
                <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-red" />
                  <span>HR Interview Book</span>
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

        {/* ========================================================= */}
        {/* 6. THE BEENEXT ADVANTAGE                                  */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>The BeeNext Advantage</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border transition-colors hover:border-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  <strong className="text-white font-semibold">Focused Learning:</strong> Only interview-relevant questions and concepts, without unnecessary material.
                </span>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border transition-colors hover:border-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  <strong className="text-white font-semibold">Structured DSA Preparation:</strong> 495 questions organised across 20 topics.
                </span>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border transition-colors hover:border-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  <strong className="text-white font-semibold">Complete Solutions:</strong> Brute Force and Optimal solutions with TC and SC analysis.
                </span>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border transition-colors hover:border-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  <strong className="text-white font-semibold">Learning Resources:</strong> YouTube video solutions and direct LeetCode links for DSA problems.
                </span>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border transition-colors hover:border-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  <strong className="text-white font-semibold">Quality Books:</strong> Carefully prepared, computer-written, organised learning materials.
                </span>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border transition-colors hover:border-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  <strong className="text-white font-semibold">Flexible Purchasing:</strong> Buy individual topic-wise books or the complete DSA Book.
                </span>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border transition-colors hover:border-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  <strong className="text-white font-semibold">Progress Monitoring:</strong> Track your DSA preparation through the performance tracker.
                </span>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border transition-colors hover:border-neutral-700">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">
                  <strong className="text-white font-semibold">Certificate:</strong> Receive a certificate after successfully completing the DSA Sheet.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 7. PRINT QUALITY & NATIONWIDE DELIVERY                    */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>Print Quality &amp; Nationwide Delivery</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 shadow-card">
            <p>
              BeeNext is committed to providing well-organised, verified, and good-quality physical books.
            </p>
            <p>
              We focus on clear printing, readable content, and professionally prepared books to provide a comfortable learning experience.
            </p>
            <div className="p-4 sm:p-5 rounded-xl bg-neutral-900 border border-brand-border flex items-start gap-3.5">
              <Truck className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                We use <strong className="text-white font-semibold">Ekart</strong> for delivering books to customers across India, helping keep shipping costs affordable while providing a convenient delivery experience.
              </p>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 pt-1">
              Customers can place orders through our website and track their purchases through the dedicated My Orders section.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 8. ORDER TRACKING & CUSTOMER EXPERIENCE                   */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>Order Tracking &amp; Customer Experience</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 shadow-card">
            <p>
              BeeNext provides a dedicated <strong className="text-white font-semibold">My Orders</strong> section where customers can view their order details and monitor their order status.
            </p>
            <p>
              Customers can check their purchased books, order information, payment details, and delivery updates in one place.
            </p>
            <p className="text-xs sm:text-sm text-neutral-400">
              We aim to make the entire purchasing experience simple, transparent, and convenient.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 9. RETURN POLICY - 100% MONEY REFUND                      */}
        {/* ========================================================= */}
        <section id="return-policy" className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>Return Policy - 100% money refund</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 shadow-card">
            <p>
              We want our customers to be satisfied with their purchases. If you are not satisfied with your book or need assistance with a return or replacement, our policy is simple and transparent:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  The return request must be made within <strong className="text-white font-semibold">3 days</strong> of receiving the book.
                </span>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  The book must be in its original, undamaged condition.
                </span>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border">
                <CheckCircle2 className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  If you receive a <strong className="text-white font-semibold">damaged, defective, incorrect, or missing</strong> book, our Customer Care team will promptly assist you with a replacement or return with 100% money refund.
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border text-xs sm:text-sm text-neutral-400">
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

        {/* ========================================================= */}
        {/* 10. CUSTOMER CARE & SUPPORT                               */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>Customer Care &amp; Support</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 shadow-card">
            <p>
              At BeeNext, customer satisfaction matters to us. If you have questions or need assistance regarding books, orders, payments, delivery, returns, or replacements, our support team is available to help.
            </p>
            <div className="p-5 rounded-xl bg-neutral-900 border border-brand-border space-y-2 max-w-md">
              <div className="flex items-center gap-2 text-brand-red font-mono text-xs font-bold uppercase tracking-wider">
                <Mail className="h-4 w-4" />
                <span>Email Support</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                For any queries or assistance, contact us through:
              </p>
              <a
                href={`mailto:${CUSTOMER_SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-2 font-mono text-sm sm:text-base font-bold text-white hover:text-brand-red transition-colors pt-1"
                title="Send an email to BeeNext customer support"
              >
                <span>{CUSTOMER_SUPPORT_EMAIL}</span>
                <ArrowRight className="h-4 w-4 text-brand-red" />
              </a>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 pt-1">
              We value customer feedback and continuously work to improve our services.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 11. WHAT'S COMING NEXT                                    */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>What&apos;s Coming Next</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-neutral-300 text-sm sm:text-base leading-relaxed space-y-5 shadow-card">
            <p>
              BeeNext is continuously working to improve its learning platform and expand its collection of books.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border">
                <Sparkles className="h-4 w-4 text-brand-red mt-0.5 shrink-0" />
                <span className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  More books will be introduced based on customer demand.
                </span>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border">
                <Sparkles className="h-4 w-4 text-brand-red mt-0.5 shrink-0" />
                <span className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  Additional learning and platform features will be added in the future.
                </span>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border">
                <Sparkles className="h-4 w-4 text-brand-red mt-0.5 shrink-0" />
                <span className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  We plan to launch and share our official YouTube channel, where we will showcase our books and provide useful content.
                </span>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-900 border border-brand-border">
                <Sparkles className="h-4 w-4 text-brand-red mt-0.5 shrink-0" />
                <span className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                  We will collect customer feedback to understand learners&apos; needs and continuously improve our products and services.
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 pt-1">
              Keep visiting BeeNext to stay updated with upcoming books, features, and improvements.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 12. READY TO PREPARE SMARTER? (FINAL CTA)                 */}
        {/* ========================================================= */}
        <section className="space-y-3.5">
          <h2 className="text-brand-red text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span>Ready to Prepare Smarter?</span>
          </h2>
          <div className="rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-card">
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Start Your Structured Interview Preparation Today
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-mono">
                Learn What Matters. Skip What Doesn&apos;t.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                href="/topics"
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-brand-border text-neutral-200 text-xs sm:text-sm font-mono font-medium transition-colors text-center flex-1 sm:flex-initial"
              >
                DSA Topics
              </Link>
              <Link
                href="/purchase"
                className="px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs sm:text-sm font-mono font-bold transition-all shadow-brand flex items-center justify-center gap-2 text-center flex-1 sm:flex-initial"
              >
                <span>Explore Books</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
