"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, ArrowRight, Award, Package, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface CertificateStatusData {
  isLoggedIn: boolean;
  totalProblems: number;
  completedProblems: number;
  completionPercentage: number;
  is85Completed: boolean;
  dsaQualifiedAt: string | null;
  hasQualifyingOrder: boolean;
  qualifyingOrder: {
    id: string;
    orderNumber: string;
    productTitle: string;
    quantity: number;
    totalAmount: number;
    orderStatus: string;
    paymentStatus: string;
    requiresCertificate?: boolean;
    certificateStatus?: string | null;
    createdAt: string;
  } | null;
  certificateClaimedAt: string | null;
  hasOrderedCertificate?: boolean;
  certificateOrder?: {
    id: string;
    orderNumber: string;
    deliveryStatus: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    isReplacement?: boolean;
    createdAt: string;
  } | null;
  isEligible: boolean;
}

export default function CertificatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { openCheckout } = useCart();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CertificateStatusData>({
    isLoggedIn: false,
    totalProblems: 495,
    completedProblems: 0,
    completionPercentage: 0,
    is85Completed: false,
    dsaQualifiedAt: null,
    hasQualifyingOrder: false,
    qualifyingOrder: null,
    certificateClaimedAt: null,
    hasOrderedCertificate: false,
    certificateOrder: null,
    isEligible: false,
  });

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/certificate/status", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch certificate status", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  const {
    completedProblems,
    totalProblems,
    completionPercentage,
    is85Completed,
    hasQualifyingOrder,
  } = data;

  // Criteria statuses
  const criteria1Fulfilled = is85Completed;
  const criteria2Fulfilled = is85Completed && hasQualifyingOrder;

  // One-Time Physical Certificate Status
  const hasAlreadyOrdered = Boolean(data.hasOrderedCertificate || data.certificateClaimedAt);

  // Ordering button state logic:
  let buttonDisabled = false;
  let buttonHelperText = "";

  if (hasAlreadyOrdered) {
    buttonDisabled = true;
    buttonHelperText =
      "You have already ordered your physical certificate. This option is available only once per customer.";
  } else if (!user) {
    buttonDisabled = false;
    buttonHelperText = "Please log in to your account to order your physical certificate.";
  } else {
    buttonDisabled = false;
    buttonHelperText =
      "Click to order your authentic physical Certificate of Achievement delivered to your doorstep.";
  }

  const handleOrderCertificate = () => {
    if (hasAlreadyOrdered) return;
    if (!user) {
      router.push("/login?redirect=/certificate");
      return;
    }
    openCheckout({
      id: "physical-certificate",
      slug: "physical-certificate",
      productType: "CERTIFICATE" as any,
      title: "BeeNext Physical Certificate of Achievement",
      price: 99,
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        {/* ========================================================= */}
        {/* CERTIFICATE HEADING                                       */}
        {/* ========================================================= */}
        <header className="border-b border-neutral-800 pb-6 space-y-2.5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase md:whitespace-nowrap">
            BEENEXT CERTIFICATE OF ACHIEVEMENT
          </h1>
          <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-3xl lg:max-w-4xl">
            Earn your BeeNext Certificate of Achievement by completing the required DSA preparation milestones and ordering a BeeNext physical book.
          </p>
        </header>

        {/* ========================================================= */}
        {/* TWO SEPARATE, CLEAN CRITERIA BOXES                        */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CRITERIA 1 BOX */}
          <div
            className={`p-4 sm:p-5 rounded-xl border transition shadow-sm ${
              criteria1Fulfilled
                ? "bg-neutral-900/90 border-emerald-500/30"
                : "bg-neutral-900 border-neutral-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                CRITERIA 1 – COMPLETE 85% OF THE DSA SHEET
              </h2>
              {criteria1Fulfilled ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Completed ({completionPercentage}%)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700 self-start sm:self-auto shrink-0">
                  <Lock className="h-3 w-3" />
                  <span>Pending ({completionPercentage}% / 85%)</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Complete at least 85% of the BeeNext DSA Sheet to qualify for the certificate.
            </p>
          </div>

          {/* CRITERIA 2 BOX */}
          <div
            className={`p-4 sm:p-5 rounded-xl border transition shadow-sm ${
              criteria2Fulfilled
                ? "bg-neutral-900/90 border-emerald-500/30"
                : "bg-neutral-900 border-neutral-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                CRITERIA 2 – ORDER ANY BEENEXT PHYSICAL BOOK
              </h2>
              {criteria2Fulfilled ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700 self-start sm:self-auto shrink-0">
                  <Lock className="h-3 w-3" />
                  <span>Pending</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              After achieving 85% DSA completion, place an order for any physical book from BeeNext.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CERTIFICATE ORDERING BUTTON                               */}
        {/* ========================================================= */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 sm:p-6 space-y-3.5 text-center shadow-md">
          {hasAlreadyOrdered ? (
            <button
              type="button"
              disabled
              className="w-full py-3.5 px-6 rounded-xl font-mono font-bold text-xs sm:text-sm uppercase tracking-wider bg-neutral-800/80 text-neutral-500 border border-neutral-700/60 cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Already Ordered</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOrderCertificate}
              className="w-full py-3.5 px-6 rounded-xl font-mono font-bold text-xs sm:text-sm uppercase tracking-wider bg-brand-red hover:bg-brand-red/90 text-white border border-brand-red transition shadow-glow flex items-center justify-center gap-2"
            >
              <Award className="h-4 w-4" />
              <span>Order Physical Certificate</span>
            </button>
          )}

          {/* Helper Text */}
          <p
            className={`text-xs font-mono leading-relaxed max-w-xl mx-auto ${
              hasAlreadyOrdered ? "text-neutral-300 font-medium" : "text-neutral-400"
            }`}
          >
            {buttonHelperText}
          </p>

          {/* If already ordered, show order confirmation details & delivery status */}
          {hasAlreadyOrdered && data.certificateOrder && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
              <span className="text-neutral-400">Order: #{data.certificateOrder.orderNumber}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400">Delivery:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-brand-red/20 text-brand-red border border-brand-red/30">
                {data.certificateOrder.deliveryStatus || "PENDING"}
              </span>
              {data.certificateOrder.trackingNumber && (
                <>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-400">
                    Carrier: {data.certificateOrder.carrier || "Courier"} ({data.certificateOrder.trackingNumber})
                  </span>
                </>
              )}
            </div>
          )}

          {/* Quick action to order book if Criteria 1 is met but Criteria 2 is pending */}
          {!hasAlreadyOrdered && criteria1Fulfilled && !criteria2Fulfilled && (
            <div className="pt-1">
              <Link
                href="/purchase"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-red text-white text-xs font-mono font-bold hover:bg-brand-red/90 transition shadow-sm"
              >
                <Package className="h-3.5 w-3.5" />
                <span>Browse &amp; Order BeeNext Physical Books</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* HORIZONTALLY WIDE INFORMATION BOX DIRECTLY BELOW BUTTON   */}
        {/* ========================================================= */}
        <div className="w-full px-4 py-4 sm:px-6 sm:py-4.5 rounded-xl border border-brand-red bg-neutral-900/80 shadow-sm text-center">
          <p className="text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed max-w-5xl mx-auto">
            Complete 85% of the DSA Sheet, and the next time you order a BeeNext book, your physical certificate will be delivered along with it.
          </p>
        </div>
      </div>
    </div>
  );
}
