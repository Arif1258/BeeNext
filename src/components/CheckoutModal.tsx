"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Truck,
  ShieldCheck,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  CreditCard,
  Lock,
} from "lucide-react";

const EMPTY_FORM = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  notes: "",
};

export default function CheckoutModal() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items: cartItems,
    isCheckoutOpen,
    closeCheckout,
    directCheckoutItem,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test mode simulation state
  const [testOrderState, setTestOrderState] = useState<{
    isOpen: boolean;
    orderData: any;
  } | null>(null);

  // Determine items being checked out
  const checkoutItems: CartItem[] = directCheckoutItem
    ? [directCheckoutItem]
    : cartItems;

  const totalQuantity = checkoutItems.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const subtotal = checkoutItems.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0);
  const deliveryCharge = 0; // Free doorstep delivery across India
  const totalAmount = subtotal + deliveryCharge;

  // Initialize form to clean, empty fields when modal opens
  useEffect(() => {
    if (isCheckoutOpen) {
      setError(null);
      setLoading(false);
      setTestOrderState(null);
      setFormData(EMPTY_FORM);
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (checkoutItems.length === 0) {
      setError("Please add at least one book to your cart before proceeding.");
      return;
    }

    if (
      !formData.customerName.trim() ||
      !formData.customerEmail.trim() ||
      !formData.customerPhone.trim() ||
      !formData.addressLine1.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      setError("Please fill in all required shipping address and contact fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail.trim())) {
      setError("Please provide a valid email address for order notifications.");
      return;
    }

    const cleanPhone = formData.customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number for courier delivery.");
      return;
    }

    const cleanPin = formData.postalCode.replace(/\D/g, "");
    if (cleanPin.length < 6) {
      setError("Please enter a valid 6-digit postal PIN code.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend (calculates verified prices securely)
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: checkoutItems.map((it) => ({
            id: it.id,
            slug: it.slug,
            productType: it.productType,
            title: it.title,
            language: it.language,
            quantity: it.quantity,
            categoryId: it.categoryId,
          })),
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create order on server.");
      }

      // Check if standard Razorpay checkout is available with non-mock credentials
      const hasRazorpay = typeof window !== "undefined" && Boolean((window as any).Razorpay);

      if (orderData.isMock || !hasRazorpay) {
        // Show the interactive Test Mode Simulator
        setTestOrderState({
          isOpen: true,
          orderData,
        });
        setLoading(false);
      } else {
        // Official Razorpay Standard Checkout Popup
        const options = {
          key: orderData.keyId,
          amount: orderData.amount, // in paise
          currency: orderData.currency || "INR",
          name: "BeeNext",
          description: `Order ${orderData.orderNumber} - ${orderData.productTitle || "Books"}`,
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: formData.customerName,
            email: formData.customerEmail,
            contact: formData.customerPhone,
          },
          theme: {
            color: "#E50914",
          },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch("/api/checkout/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  printedOrderId: orderData.printedOrderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || "Payment signature verification failed.");

              clearCart();
              closeCheckout();
              router.push(`/checkout/success?orderNumber=${orderData.orderNumber}`);
            } catch (vErr: any) {
              closeCheckout();
              router.push(
                `/checkout/failed?orderNumber=${orderData.orderNumber}&error=${encodeURIComponent(
                  vErr.message || "Payment verification failed"
                )}`
              );
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              closeCheckout();
              router.push(`/checkout/cancelled?orderNumber=${orderData.orderNumber}`);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          setLoading(false);
          closeCheckout();
          router.push(
            `/checkout/failed?orderNumber=${orderData.orderNumber}&error=${encodeURIComponent(
              response.error?.description || "Payment was declined by payment gateway."
            )}`
          );
        });
        rzp.open();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while initiating payment.");
      setLoading(false);
    }
  };

  // Handler for Test Mode Simulator actions
  const handleSimulatePayment = async (status: "SUCCESS" | "FAILED" | "CANCEL") => {
    if (!testOrderState?.orderData) return;
    const { orderData } = testOrderState;

    if (status === "CANCEL") {
      setTestOrderState(null);
      closeCheckout();
      router.push(`/checkout/cancelled?orderNumber=${orderData.orderNumber}`);
      return;
    }

    if (status === "FAILED") {
      setTestOrderState(null);
      closeCheckout();
      router.push(
        `/checkout/failed?orderNumber=${orderData.orderNumber}&error=${encodeURIComponent(
          "Test Mode: Payment simulation declined by user."
        )}`
      );
      return;
    }

    // Success simulation -> verify on backend with mock signature
    setLoading(true);
    try {
      const mockPaymentId = `pay_test_${Date.now()}`;
      const mockSignature = `mock_sig_${Date.now()}_verified`;

      const verifyRes = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printedOrderId: orderData.printedOrderId,
          razorpayOrderId: orderData.razorpayOrderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Payment verification failed in test mode.");
      }

      clearCart();
      setTestOrderState(null);
      closeCheckout();
      router.push(`/checkout/success?orderNumber=${orderData.orderNumber}`);
    } catch (err: any) {
      setError(err.message || "Failed to complete test verification.");
      setLoading(false);
      setTestOrderState(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-brand-border bg-brand-card p-5 sm:p-7 text-white shadow-2xl my-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeCheckout}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-neutral-900"
          aria-label="Close checkout"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Test Mode Simulator Modal Overlay */}
        {testOrderState?.isOpen && (
          <div className="rounded-2xl border border-amber-500/40 bg-brand-black p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-amber-400">
              <CreditCard className="h-5 w-5" />
              <h3 className="text-base font-bold">Razorpay Test Mode Simulator</h3>
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs font-mono text-amber-300 space-y-1.5 leading-relaxed">
              <p>
                <strong>Testing Environment Active:</strong> Razorpay credentials are currently running in Test Mode. You can test complete end-to-end checkout, backend cryptographic verification, and order confirmation below.
              </p>
              <div className="pt-1 text-[11px] text-neutral-300">
                Order: <span className="font-bold text-white">{testOrderState.orderData.orderNumber}</span> &bull; Total: <span className="font-bold text-emerald-400">{formatCurrency(testOrderState.orderData.totalAmount)}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSimulatePayment("SUCCESS")}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:scale-[0.99]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Simulate Successful Payment (Test Mode)</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSimulatePayment("FAILED")}
                className="w-full py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Simulate Payment Failure</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSimulatePayment("CANCEL")}
                className="w-full py-2 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono text-xs font-medium flex items-center justify-center transition cursor-pointer"
              >
                <span>Cancel Payment (User Dismissed)</span>
              </button>
            </div>
          </div>
        )}

        {/* Regular Checkout Form */}
        {!testOrderState?.isOpen && (
          <form onSubmit={handleStartPayment} className="space-y-5">
            {/* Modal Header */}
            <div className="border-b border-brand-border pb-4">
              <div className="flex items-center gap-2 text-brand-red text-xs font-mono font-bold uppercase tracking-wider">
                <Truck className="h-3.5 w-3.5" />
                <span>Doorstep Delivery Across India</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                Checkout &amp; Delivery Details
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Enter your courier delivery address to receive your printed books.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-800 bg-red-950/50 p-3 text-xs text-red-300 flex items-center gap-2 font-mono">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Order Items Preview */}
            <div className="rounded-xl border border-brand-border bg-brand-black/50 p-3.5 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                <span>Selected Items ({totalQuantity})</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(totalAmount)}</span>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {checkoutItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-xs border-b border-neutral-800/80 pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="truncate flex-1">
                      <span className="font-semibold text-white truncate block">{item.title}</span>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                        {item.language && <span className="text-brand-red font-bold">{item.language}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Shipping Form */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-brand-red" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-border bg-brand-black px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-brand-red" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    required
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-border bg-brand-black px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-brand-red" />
                  <span>Mobile Number *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    value={formData.customerPhone}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full rounded-xl border border-brand-border bg-brand-black pl-11 pr-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-red" />
                  <span>Address Line 1 *</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-brand-border bg-brand-black px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-brand-border bg-brand-black px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              {/* City, State, PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-border bg-brand-black px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-border bg-brand-black px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    maxLength={6}
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-border bg-brand-black px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Summary & Submit */}
            <div className="pt-3 border-t border-brand-border space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Doorstep Delivery Charge:</span>
                <span className="text-emerald-400 font-bold">FREE (₹0)</span>
              </div>

              <div className="flex items-center justify-between text-sm sm:text-base font-bold">
                <span>Total Payable:</span>
                <span className="text-emerald-400 font-mono text-lg font-extrabold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-red hover:bg-brand-redHover active:scale-[0.98] text-white font-mono text-xs sm:text-sm font-bold shadow-brand flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Preparing Secure Checkout...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay {formatCurrency(totalAmount)} via Razorpay</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-mono text-center">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-red" />
                <span>256-Bit SSL Encrypted &bull; Razorpay Standard Checkout &bull; Test Mode Enabled</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
