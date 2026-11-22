import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export const CUSTOMER_SUPPORT_EMAIL = "supportbeenext@gmail.com";
export const COMPANY_ADDRESS =
  "C5, 104, 1st Floor, Larica, Barasat, Kolkata, West Bengal – 700126, India.";

export default function Footer() {
  return (
    <footer className="w-full border-t border-brand-border bg-brand-black text-brand-muted text-xs py-10 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Column 1: BeeNext */}
          <div className="space-y-3">
            <Link href="/topics" className="inline-flex items-center space-x-2.5 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-red text-white font-mono font-bold text-xs shadow-brand group-hover:scale-105 transition-transform">
                B&gt;
              </span>
              <span className="text-lg font-extrabold text-white tracking-tight">
                BEE<span className="text-brand-red">NEXT</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Data Structures and Algorithms notes and computer-written Java solution books for students and working professionals.
            </p>
            <div className="pt-1">
              <Link
                href="/about"
                className="text-xs font-mono text-neutral-300 hover:text-brand-red underline underline-offset-4 transition-colors"
              >
                About BEENEXT &rarr;
              </Link>
            </div>
          </div>

          {/* Column 2: Customer Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-brand-red" />
              <span>Customer Support</span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              For order-related queries, complaints, or general assistance, contact us at:
            </p>
            <div>
              <a
                href={`mailto:${CUSTOMER_SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-1.5 text-white hover:text-brand-red font-mono font-medium transition-colors text-xs border border-neutral-800 hover:border-brand-red bg-neutral-900/60 px-3 py-1.5 rounded-lg"
                title="Email Customer Support"
              >
                <Mail className="h-3.5 w-3.5 text-brand-red" />
                <span>{CUSTOMER_SUPPORT_EMAIL}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Navigation */}
        <div className="pt-6 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500 font-mono text-[11px]">
          <p>&copy; {new Date().getFullYear()} BeeNext. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/topics" className="hover:text-neutral-300 transition-colors">
              DSA Topics
            </Link>
            <span>•</span>
            <Link href="/purchase" className="hover:text-neutral-300 transition-colors">
              Purchase
            </Link>
            <span>•</span>
            <Link href="/orders" className="hover:text-neutral-300 transition-colors">
              My Orders
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-neutral-300 transition-colors">
              About
            </Link>
            <span>•</span>
            <Link href="/profile" className="hover:text-neutral-300 transition-colors">
              My Profile
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
