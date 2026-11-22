import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  RefreshCcw,
  ShoppingBag,
  Mail,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface FailedPageProps {
  searchParams?: { orderNumber?: string; error?: string };
}

export default function CheckoutFailedPage({ searchParams }: FailedPageProps) {
  const orderNumber = searchParams?.orderNumber;
  const errorMessage = searchParams?.error || "Your transaction could not be processed by your bank or the payment gateway.";

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Failure Header Card */}
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
            <AlertCircle className="h-9 w-9" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
              <span>Transaction Incomplete</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Payment Could Not Be Completed
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
              {errorMessage}
            </p>
          </div>

          {orderNumber && (
            <div className="pt-2">
              <div className="inline-block px-4 py-2 rounded-xl bg-brand-black border border-brand-border text-xs sm:text-sm font-mono text-neutral-300">
                Order Reference: <span className="font-bold text-white">{orderNumber}</span>
              </div>
            </div>
          )}
        </div>

        {/* Helpful Tips Card */}
        <div className="rounded-2xl border border-brand-border bg-brand-card p-5 sm:p-6 space-y-3.5 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-brand-red" />
            <span>Common Reasons &amp; Solutions</span>
          </h3>

          <ul className="text-xs text-neutral-400 space-y-2 list-disc list-inside font-mono">
            <li>Bank server timeout or daily transaction limit exceeded.</li>
            <li>Incorrect card expiry date, CVV, or OTP entered.</li>
            <li>UPI app was closed before completing payment authorization.</li>
            <li>No funds have been permanently deducted. If debited, your bank will auto-refund within 2-4 business days.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/purchase"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all cursor-pointer"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Try Again / View Books</span>
          </Link>

          <a
            href="mailto:supportbeenext@gmail.com?subject=Payment%20Assistance"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            <span>Contact Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
