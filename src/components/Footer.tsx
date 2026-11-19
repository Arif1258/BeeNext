import React from "react";
import Link from "next/link";
import { ShieldCheck, Zap, Lock, CreditCard, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-brand-border bg-brand-blackDeep text-brand-muted text-sm mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-red text-white font-mono font-bold text-xs">
                B&gt;
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Bee<span className="text-brand-red">Next</span>
              </span>
            </div>
            <p className="text-xs text-brand-subtle leading-relaxed">
              Premium handwritten Data Structures &amp; Algorithms notes designed for competitive programmers, interview preparation, and software engineers aiming for top-tier tech firms.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-white">
              <ShieldCheck className="h-4 w-4 text-brand-red" />
              <span>Razorpay Verified 256-Bit SSL Encrypted</span>
            </div>
          </div>

          {/* Core Categories Quick Index */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <span>Core Foundations</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/topics/sorting" className="hover:text-brand-red transition-colors flex items-center justify-between">
                  <span>Sorting Algorithms</span>
                  <span className="text-[10px] bg-brand-red text-white px-1.5 py-0.5 rounded font-mono font-bold">FREE</span>
                </Link>
              </li>
              <li>
                <Link href="/topics/arrays" className="hover:text-white transition-colors">Arrays &amp; Two Pointers</Link>
              </li>
              <li>
                <Link href="/topics/strings" className="hover:text-white transition-colors">Strings &amp; Pattern Matching</Link>
              </li>
              <li>
                <Link href="/topics/linked-list" className="hover:text-white transition-colors">Linked Lists</Link>
              </li>
              <li>
                <Link href="/topics/stack" className="hover:text-white transition-colors">Stack &amp; Monotonic Queues</Link>
              </li>
            </ul>
          </div>

          {/* Advanced Topics */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
              Advanced Mastery
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/topics/dynamic-programming" className="hover:text-white transition-colors">Dynamic Programming</Link>
              </li>
              <li>
                <Link href="/topics/graphs" className="hover:text-white transition-colors">Graph Theory &amp; Shortest Path</Link>
              </li>
              <li>
                <Link href="/topics/binary-trees" className="hover:text-white transition-colors">Binary Trees &amp; BST</Link>
              </li>
              <li>
                <Link href="/topics/heaps" className="hover:text-white transition-colors">Heaps &amp; Priority Queues</Link>
              </li>
              <li>
                <Link href="/topics/tries" className="hover:text-white transition-colors">Tries &amp; Bit Manipulation</Link>
              </li>
            </ul>
          </div>

          {/* Guarantees & Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
              Developer Guarantee
            </h4>
            <div className="p-3 rounded-lg bg-brand-card border border-brand-border space-y-2">
              <div className="flex items-center gap-2 text-xs text-white font-medium">
                <Zap className="h-3.5 w-3.5 text-brand-red" />
                <span>Zero Filler Explanations</span>
              </div>
              <p className="text-[11px] text-brand-muted">
                Each note features pure visual recursion traces, memory pointer diagrams, and verified Java solutions.
              </p>
            </div>
            <div className="text-[11px] text-brand-subtle flex items-center gap-1.5 pt-1">
              <Lock className="h-3 w-3 text-brand-red" />
              <span>Lifetime access on all purchases</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between text-xs text-brand-subtle gap-4">
          <p>© {new Date().getFullYear()} BeeNext. All rights reserved. Built for developers.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-white transition-colors">Strict Color Palette: #E52532 / #FFFFFF / #111111</span>
            <span className="hover:text-white transition-colors">Razorpay Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
