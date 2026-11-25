"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MEMBERSHIP_PLANS, PlanType, CurrentMembershipPlan, determineUserCurrentPlan } from "@/lib/membership";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  AlertCircle,
  Award,
  Code2,
  BookOpen,
  Calendar,
} from "lucide-react";
import confetti from "canvas-confetti";

const NORMAL_ACCOUNT_FEATURES = [
  "Access to all 495 Striver DSA Sheet Problems",
  "Curated Striver YouTube Video Walkthroughs",
  "Interactive Monaco Code Editor (View & Type Code)",
  "Personal Progress Tracking & Problem Status",
];

interface MembershipClientProps {
  initialCurrentPlan?: CurrentMembershipPlan | null;
}

export default function MembershipClient({ initialCurrentPlan = null }: MembershipClientProps) {
  const router = useRouter();
  const { user, loading: authLoading, isPlusMember, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("YEARLY");
  const [loading, setLoading] = useState(false);

  // Determine current plan using server-side prop or live auth user
  const currentPlan: CurrentMembershipPlan | null = authLoading
    ? (initialCurrentPlan ?? (user ? determineUserCurrentPlan(user) : null))
    : (user ? (user.currentPlan ?? determineUserCurrentPlan(user)) : null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<{
    orderId: string;
    membershipOrderId: string;
    amount: number;
    plan: PlanType;
  } | null>(null);

  const calculateDaysLeft = () => {
    if (!user?.membershipExpiresAt) return null;
    const diff = new Date(user.membershipExpiresAt).getTime() - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysLeft();

  const handleCheckout = async (plan: PlanType) => {
    setError(null);
    setSuccessMessage(null);

    if (!user) {
      router.push(`/login?redirect=/membership`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/membership/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize membership checkout.");
      }

      const hasRazorpay = typeof window !== "undefined" && Boolean((window as unknown as { Razorpay?: unknown }).Razorpay);

      if (data.isMock || !hasRazorpay) {
        // Open mock simulation modal for local development & automated testing
        setPendingOrderData({
          orderId: data.orderId,
          membershipOrderId: data.membershipOrderId,
          amount: data.amount,
          plan,
        });
        setShowSimModal(true);
        setLoading(false);
        return;
      }

      // Live / Sandbox Razorpay Standard Modal
      const RazorpayConstructor = (window as unknown as {
        Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
      }).Razorpay;

      const options = {
        key: data.keyId,
        amount: data.amount * 100,
        currency: data.currency || "INR",
        name: "BeeNext",
        description: `BeeNext Plus - ${plan === "MONTHLY" ? "Monthly" : "Yearly"} Plan`,
        order_id: data.orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#E50914",
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          await verifyPayment({
            membershipOrderId: data.membershipOrderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            plan,
          });
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new RazorpayConstructor(options);
      rzp.open();
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout error occurred.");
      setLoading(false);
    }
  };

  const verifyPayment = async ({
    membershipOrderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    plan,
  }: {
    membershipOrderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    plan: PlanType;
  }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/membership/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipOrderId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed.");
      }

      await refreshUser();
      setShowSimModal(false);
      setPendingOrderData(null);
      setSuccessMessage(
        `🎉 Congratulations! Your BeeNext Plus ${
          plan === "MONTHLY" ? "Monthly" : "Yearly"
        } membership is now active!`
      );

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti is optional
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!pendingOrderData) return;
    const simPaymentId = `pay_mock_${Date.now()}`;
    const simSignature = `mock_sig_${Date.now()}_verified`;

    await verifyPayment({
      membershipOrderId: pendingOrderData.membershipOrderId,
      razorpayOrderId: pendingOrderData.orderId,
      razorpayPaymentId: simPaymentId,
      razorpaySignature: simSignature,
      plan: pendingOrderData.plan,
    });
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Active Plus Status Alert */}
        {isPlusMember && (
          <div className="rounded-2xl border border-brand-red/50 bg-brand-red/10 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-red text-white flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">Active Plus Membership</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-brand-red text-white">
                    {user?.membershipPlan || "ACTIVE"}
                  </span>
                </div>
                <p className="text-xs text-neutral-300">
                  {user?.membershipExpiresAt ? (
                    <>
                      Valid until{" "}
                      <strong className="text-white">
                        {new Date(user.membershipExpiresAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>{" "}
                      ({daysLeft !== null ? `${daysLeft} days remaining` : ""}).
                    </>
                  ) : (
                    "Lifetime access active."
                  )}
                </p>
              </div>
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              Renewing now extends your expiration date automatically.
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Choose Your <span className="text-brand-red">BeeNext</span> Plan
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Free forever for viewing problems and videos. Upgrade to <strong className="text-white">BeeNext Plus</strong> for cloud code execution, submission verdicts, complete solutions, and 5 collections of premium notes.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-emerald-300 text-sm flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-neutral-400 hover:text-white text-xs underline font-mono"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-brand-red/50 bg-brand-red/10 p-4 text-brand-red text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Three Plan Boxes Container */}
        <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
          {/* First Box: Normal Account (First row, full width, yellow outline) */}
          <div className="rounded-2xl border-2 border-yellow-500 bg-brand-card p-6 sm:p-8 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl font-bold text-white">Normal Account</h3>
                  {currentPlan === "NORMAL" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-yellow-400 text-black shadow-sm">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      CURRENT PLAN
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 font-mono">Standard Free Access</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">₹0</span>
                <span className="text-neutral-400 text-sm font-mono">/ free forever</span>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NORMAL_ACCOUNT_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-300">
                  <Check className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Second & Third Boxes: Monthly Plus & Yearly Plus (Side by side on desktop, stacked on mobile, green outline) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {/* Second Box: Monthly Plus (Left, green outline) */}
            <div
              onClick={() => setSelectedPlan("MONTHLY")}
              className={`rounded-2xl border-2 border-green-500 bg-brand-card p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all ${
                selectedPlan === "MONTHLY"
                  ? "ring-2 ring-green-500/30 shadow-lg"
                  : "hover:border-green-400"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-xl font-bold text-white">Monthly Plan</h3>
                      {currentPlan === "MONTHLY" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-green-500 text-neutral-950 shadow-sm">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                          CURRENT PLAN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-mono">30 Days Full Access</p>
                  </div>
                  <div className="h-5 w-5 rounded-full border border-neutral-600 flex items-center justify-center">
                    {selectedPlan === "MONTHLY" && <div className="h-2.5 w-2.5 rounded-full bg-brand-red" />}
                  </div>
                </div>

                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">₹79</span>
                  <span className="text-neutral-400 text-sm font-mono">/ month</span>
                </div>

                <p className="text-xs text-neutral-400">
                  {MEMBERSHIP_PLANS.MONTHLY.tagline}
                </p>

                <div className="pt-4 border-t border-brand-border/60 space-y-2.5">
                  {MEMBERSHIP_PLANS.MONTHLY.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-300">
                      <Check className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckout("MONTHLY");
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-brand-border text-white font-mono font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading && selectedPlan === "MONTHLY" ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>
                        {isPlusMember
                          ? currentPlan === "MONTHLY"
                            ? "Extend for ₹79"
                            : "Switch to Monthly (₹79)"
                          : "Get Monthly Access"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-brand-red" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Third Box: Yearly Plus (Right, green outline) */}
            <div
              onClick={() => setSelectedPlan("YEARLY")}
              className={`rounded-2xl border-2 border-green-500 bg-brand-card p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden ${
                selectedPlan === "YEARLY"
                  ? "ring-2 ring-green-500/30 shadow-lg"
                  : "hover:border-green-400"
              }`}
            >
              <div className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow">
                Best Value • Save 37%
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap pr-16 sm:pr-0">
                      <h3 className="text-xl font-bold text-white">Yearly Plan</h3>
                      <Sparkles className="h-4 w-4 text-brand-red shrink-0" />
                      {currentPlan === "YEARLY" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-green-500 text-neutral-950 shadow-sm">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                          CURRENT PLAN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-mono">365 Days Full Access</p>
                  </div>
                  <div className="h-5 w-5 rounded-full border border-neutral-600 flex items-center justify-center">
                    {selectedPlan === "YEARLY" && <div className="h-2.5 w-2.5 rounded-full bg-brand-red" />}
                  </div>
                </div>

                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">₹599</span>
                  <span className="text-neutral-400 text-sm font-mono">/ year</span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    ≈ ₹50 / month
                  </span>
                </div>

                <p className="text-xs text-neutral-300">
                  {MEMBERSHIP_PLANS.YEARLY.tagline}
                </p>

                <div className="pt-4 border-t border-brand-border/60 space-y-2.5">
                  {MEMBERSHIP_PLANS.YEARLY.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-200">
                      <Check className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckout("YEARLY");
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-mono font-bold text-xs sm:text-sm transition-all shadow-brand flex items-center justify-center gap-2"
                >
                  {loading && selectedPlan === "YEARLY" ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>
                        {isPlusMember
                          ? currentPlan === "YEARLY"
                            ? "Extend for ₹599 (Yearly)"
                            : "Upgrade to Plus Yearly"
                          : "Upgrade to Plus Yearly"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="space-y-4 pt-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Compare Normal vs. Plus
            </h2>
            <p className="text-xs text-neutral-400">
              Clear breakdown of features and capabilities across each tier.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-brand-border bg-neutral-900/60 font-mono text-neutral-400">
                    <th className="py-4 px-6 font-semibold">Features &amp; Capabilities</th>
                    <th className="py-4 px-6 font-semibold text-center w-36">Normal (Free)</th>
                    <th className="py-4 px-6 font-semibold text-center w-40 text-emerald-400">
                      Plus (Paid)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-white flex items-center gap-2.5">
                      <Code2 className="h-4 w-4 text-neutral-400" />
                      <span>All 495 Striver DSA Sheet Problems</span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-emerald-400">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-6 font-medium text-white flex items-center gap-2.5">
                      <Zap className="h-4 w-4 text-neutral-400" />
                      <span>Striver YouTube Video Walkthroughs</span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-emerald-400">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-6 font-medium text-white flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      <span>Interactive Monaco Code Editor</span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-neutral-300">
                      <span>View &amp; Type Code</span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">
                      <span>Full Access</span>
                    </td>
                  </tr>

                  <tr className="bg-brand-red/5">
                    <td className="py-3.5 px-6 font-semibold text-white flex items-center gap-2.5">
                      <Zap className="h-4 w-4 text-brand-red" />
                      <span>Cloud Code Execution (Java, C++, Python, JS)</span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-neutral-500">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>

                  <tr className="bg-brand-red/5">
                    <td className="py-3.5 px-6 font-semibold text-white flex items-center gap-2.5">
                      <Code2 className="h-4 w-4 text-brand-red" />
                      <span>Submit Against Hidden Test Cases &amp; Verdicts</span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-neutral-500">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>

                  <tr className="bg-brand-red/5">
                    <td className="py-3.5 px-6 font-semibold text-white flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 text-brand-red" />
                      <span>Brute Force &amp; Optimal Written Code</span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-neutral-500">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>

                  <tr className="bg-brand-red/5">
                    <td className="py-3.5 px-6 font-semibold text-white flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 text-brand-red" />
                      <span>5 Premium PDF Notes Libraries</span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-neutral-500">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>

                  <tr className="bg-brand-red/5">
                    <td className="py-3.5 px-6 font-semibold text-white flex items-center gap-2.5">
                      <Award className="h-4 w-4 text-brand-red" />
                      <span>DSA Completion Certificate Eligibility (≥85%)</span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-neutral-500">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-6 text-center text-emerald-400 font-bold">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security & Guarantee Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs text-neutral-400">
          <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border flex items-start gap-3">
            <Shield className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-mono">Secure Payment</strong>
              <span>Encrypted checkout processed through Razorpay Standard.</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border flex items-start gap-3">
            <Calendar className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-mono">Extend Anytime</strong>
              <span>Renewing while active extends directly from your current expiry.</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900 border border-brand-border flex items-start gap-3">
            <Award className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-mono">No Certificate Fee</strong>
              <span>Eligible Plus members receive their completion certificate free of charge.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Mode Simulation Modal */}
      {showSimModal && pendingOrderData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-white font-mono">
                  Razorpay Checkout Simulator
                </h3>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs space-y-2 text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Plan:</span>
                <span className="font-bold text-white">{pendingOrderData.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Amount:</span>
                <span className="font-bold text-white">₹{pendingOrderData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Order ID:</span>
                <span className="font-mono text-neutral-300">{pendingOrderData.orderId}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              In test mode, clicking below verifies the payment cryptographically on the backend, creates a completed order, and activates your Plus membership.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSimulatePayment}
                className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold transition-all shadow-brand flex items-center justify-center gap-2"
              >
                {loading ? "Activating..." : "Simulate Success"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
