"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Truck,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  Sparkles,
  Layers,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";

export interface OrderProductInfo {
  productType?: "COMPLETE_BOOK" | "TOPIC" | "CS_FUNDAMENTAL";
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  topicSlug?: string;
  categoryId?: string;
  deliveryCharge?: number;
  isFreeShipping?: boolean;
  pages?: number;
  sections?: number;
  language?: string;
}

interface PrintedOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: OrderProductInfo;
  currentUser?: {
    name?: string;
    email?: string;
  } | null;
  onOrderSuccess?: (order: any) => void;
}

const EMPTY_FORM_DATA = {
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

export default function PrintedOrderModal({
  isOpen,
  onClose,
  product,
  currentUser,
  onOrderSuccess,
}: PrintedOrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Reset all fields to completely empty every time modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setConfirmedOrder(null);
      setQuantity(1);
      setFormData(EMPTY_FORM_DATA);
    }
  }, [isOpen, product.title]);

  if (!isOpen) return null;

  const unitPrice = product.price;
  const deliveryCharge = product.isFreeShipping === false ? (product.deliveryCharge ?? 0) : 0;
  const totalAmount = unitPrice * quantity + deliveryCharge;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.customerName.trim() ||
      !formData.customerEmail.trim() ||
      !formData.customerPhone.trim() ||
      !formData.addressLine1.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      setError("Please complete all required delivery address and contact fields.");
      return;
    }

    const cleanPhone = formData.customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number for courier delivery.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on server
      const createRes = await fetch("/api/printed-orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productType: product.productType || (product.topicSlug ? "TOPIC" : "COMPLETE_BOOK"),
          productTitle: product.title,
          topicSlug: product.topicSlug,
          categoryId: product.categoryId,
          language: product.language,
          quantity,
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(orderData.error || "Failed to initialize physical notes order");
      }

      // Check if Razorpay script is loaded or mock simulation mode
      const hasRazorpay = typeof window !== "undefined" && Boolean((window as any).Razorpay);

      if (orderData.isMock || !hasRazorpay) {
        // Mock simulation mode
        const simPaymentId = `pay_mock_${Date.now()}`;
        const simSignature = `mock_sig_${Date.now()}_verified`;

        const verifyRes = await fetch("/api/printed-orders/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            printedOrderId: orderData.printedOrderId,
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: simPaymentId,
            razorpaySignature: simSignature,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

        const orderResult = {
          orderNumber: verifyData.orderNumber || orderData.orderNumber,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          totalAmount: orderData.totalAmount,
          quantity: orderData.quantity || quantity,
          productTitle: orderData.productTitle || product.title,
          deliveryAddress: `${formData.addressLine1}, ${formData.city}, ${formData.state} - ${formData.postalCode}`,
        };

        setConfirmedOrder(orderResult);
        if (onOrderSuccess) onOrderSuccess(orderResult);
      } else {
        // Live Razorpay Checkout
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "BeeNext",
          description: orderData.productTitle || product.title,
          order_id: orderData.orderId,
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
              const verifyRes = await fetch("/api/printed-orders/verify", {
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
              if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

              const orderResult = {
                orderNumber: verifyData.orderNumber || orderData.orderNumber,
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                totalAmount: orderData.totalAmount,
                quantity: orderData.quantity || quantity,
                productTitle: orderData.productTitle || product.title,
                deliveryAddress: `${formData.addressLine1}, ${formData.city}, ${formData.state} - ${formData.postalCode}`,
              };

              setConfirmedOrder(orderResult);
              if (onOrderSuccess) onOrderSuccess(orderResult);
            } catch (vErr: any) {
              setError(vErr.message || "Payment verification failed. Please contact support.");
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          setError(response.error?.description || "Payment failed. Please retry.");
          setLoading(false);
        });
        rzp.open();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while creating your order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-brand-border bg-brand-card p-6 sm:p-8 text-white shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg text-brand-muted hover:text-white hover:bg-brand-black transition-colors"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 1. ORDER CONFIRMED VIEW */}
        {confirmedOrder ? (
          <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Physical Order Confirmed!
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Order Number:{" "}
                <span className="text-white font-bold">{confirmedOrder.orderNumber}</span>
              </p>
            </div>

            {/* Order Summary Box */}
            <div className="p-4 rounded-xl bg-brand-black border border-brand-border text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-neutral-400">Product</span>
                <span className="text-white font-bold text-right">
                  {confirmedOrder.productTitle} (Qty: {confirmedOrder.quantity})
                </span>
              </div>
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-neutral-400">Total Paid</span>
                <span className="text-emerald-400 font-bold text-base">
                  {formatCurrency(confirmedOrder.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-neutral-400">Shipping</span>
                <span className="text-emerald-400 font-bold">FREE Doorstep Delivery</span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-neutral-400 block">Delivery Address:</span>
                <span className="text-neutral-200 font-sans text-xs block leading-relaxed">
                  {confirmedOrder.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-mono flex items-center justify-center gap-2">
              <Truck className="h-4 w-4 text-brand-red shrink-0" />
              <span>Dispatch within 24-48 hours • Estimated delivery 3-5 days</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/orders"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-bold text-xs font-mono shadow-brand transition-all flex items-center justify-center gap-2"
              >
                <span>Track in My Orders</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* 2. PHYSICAL ORDER & ADDRESS FORM VIEW */
          <div className="space-y-6">
            {/* Header: Product Selection & Pricing */}
            <div className="space-y-3 border-b border-brand-border pb-4 pr-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red">
                  {product.productType === "TOPIC" || product.topicSlug ? "Printed Topic Sheets" : "Printed Physical Book"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-800 text-emerald-400 flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span>Free Shipping</span>
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {product.title}
                </h2>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {product.description ||
                    "Physical printed DSA notes book with computer-written Java solutions (Brute Force, Optimal, Time & Space Complexity) delivered directly to your doorstep."}
                </p>
              </div>

              {/* Price & Quantity Selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-black border border-brand-border font-mono text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Unit Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-white">
                      {formatCurrency(unitPrice)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-neutral-500 line-through text-xs">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 text-[11px] mr-1">Qty:</span>
                  <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-900">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1.5 hover:text-white text-neutral-400 disabled:opacity-30 transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center font-bold text-white text-xs">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= 10}
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="p-1.5 hover:text-white text-neutral-400 disabled:opacity-30 transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-neutral-400 block text-[11px]">Total</span>
                  <span className="text-xl font-extrabold text-brand-red">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-brand-redMuted border border-brand-red text-xs font-mono text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-brand-red shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Address & Delivery Details Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 pb-1 border-b border-brand-border/60">
                <MapPin className="h-3.5 w-3.5 text-brand-red" />
                <span>Delivery Address (India)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5 font-mono">
                    Student Full Name <span className="text-brand-red font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full h-11 px-3.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm font-sans focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all shadow-sm"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5 font-mono">
                    Mobile Number (10 digits) <span className="text-brand-red font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    maxLength={14}
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full h-11 px-3.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm font-sans focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5 font-mono">
                  Email Address (for order tracking) <span className="text-brand-red font-bold">*</span>
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm font-sans focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all shadow-sm"
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5 font-mono">
                  Street / Flat / House No. / Hostel <span className="text-brand-red font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Enter delivery address"
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm font-sans focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all shadow-sm"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-xs font-semibold text-neutral-200 mb-1.5 font-mono">
                  Area / Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, landmark (optional)"
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm font-sans focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-mono">
                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5 font-mono">
                    City <span className="text-brand-red font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full h-11 px-3.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm font-sans focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all shadow-sm"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5 font-mono">
                    State <span className="text-brand-red font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    className="w-full h-11 px-3.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm font-sans focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all shadow-sm"
                  />
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-200 mb-1.5 font-mono">
                    PIN Code <span className="text-brand-red font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    maxLength={8}
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Enter PIN code"
                    className="w-full h-11 px-3.5 rounded-lg bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm font-sans focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-bold text-xs font-mono shadow-brand transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Processing Secure Payment...</span>
                  ) : (
                    <>
                      <Package className="h-4 w-4" />
                      <span>Proceed to Pay {formatCurrency(totalAmount)}</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-neutral-500 font-mono">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  <span>100% Secure 256-Bit SSL Payment • Free Doorstep Delivery</span>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
