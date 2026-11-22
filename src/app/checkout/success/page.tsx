import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams?: { orderNumber?: string };
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const orderNumber = searchParams?.orderNumber;
  const currentUser = await getCurrentUser();

  const order = orderNumber
    ? await prisma.printedOrder.findUnique({
        where: { orderNumber },
      })
    : null;

  // Privacy Protection: If order belongs to an authenticated user and current session is a different user, deny access
  if (order && order.userId && currentUser && currentUser.id !== order.userId && currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-brand-black text-white py-16 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <h1 className="text-xl font-bold text-red-400">Access Restricted</h1>
          <p className="text-xs text-neutral-400 font-mono">
            You do not have permission to view this customer order.
          </p>
          <Link
            href="/orders"
            className="inline-block px-4 py-2 rounded-xl bg-brand-red text-white text-xs font-mono font-bold"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const maskedPhone = order?.customerPhone && order.customerPhone.length >= 10
    ? `${order.customerPhone.slice(0, 2)}******${order.customerPhone.slice(-2)}`
    : order?.customerPhone || "";
  const maskedEmail = order?.customerEmail
    ? order.customerEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`)
    : "";

  const items = Array.isArray(order?.items)
    ? (order.items as Array<{
        title: string;
        language?: string;
        quantity: number;
        unitPrice: number;
        totalItemPrice: number;
      }>)
    : null;

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Success Header Card */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Payment Verified &amp; Confirmed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Thank You! Your Order is Confirmed
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
              We have received your payment and our printing team is preparing your DSA books for doorstep courier dispatch.
            </p>
          </div>

          {orderNumber && (
            <div className="pt-2">
              <div className="inline-block px-4 py-2 rounded-xl bg-brand-black border border-brand-border text-xs sm:text-sm font-mono text-neutral-200">
                Order ID: <span className="font-bold text-white">{orderNumber}</span>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Card */}
        {order && (
          <div className="rounded-2xl border border-brand-border bg-brand-card p-5 sm:p-6 space-y-5 shadow-xl">
            {/* Delivery Timeline Banner */}
            <div className="rounded-xl border border-brand-border bg-brand-black/60 p-3.5 flex items-center gap-3 text-xs font-mono">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red/10 border border-brand-red/30 text-brand-red shrink-0">
                <Truck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">Estimated Doorstep Delivery</div>
                <div className="text-neutral-400 text-[11px]">
                  3 to 5 business days across India with tracking updates
                </div>
              </div>
            </div>

            {/* Items Ordered */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                Purchased Books
              </h3>

              <div className="divide-y divide-brand-border/60 rounded-xl border border-brand-border bg-brand-black/40 overflow-hidden">
                {items && items.length > 0 ? (
                  items.map((it, idx) => (
                    <div key={idx} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1 flex-1">
                        <div className="font-bold text-white">{it.title}</div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                          {it.language && (
                            <span className="px-1.5 py-0.5 rounded bg-brand-red/15 text-brand-red border border-brand-red/30 text-[10px] font-bold">
                              {it.language}
                            </span>
                          )}
                          <span>Quantity: {it.quantity}</span>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        {formatCurrency(it.totalItemPrice || it.unitPrice * it.quantity)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 flex-1">
                      <div className="font-bold text-white">{order.productTitle}</div>
                      <div className="text-[11px] font-mono text-neutral-400">
                        Quantity: {order.quantity}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(order.totalAmount)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-red" />
                <span>Delivery Address</span>
              </h3>
              <div className="rounded-xl border border-brand-border bg-brand-black/40 p-3.5 text-xs text-neutral-300 space-y-1 font-mono">
                <div className="font-bold text-white">{order.customerName}</div>
                <div>{order.addressLine1}</div>
                {order.addressLine2 && <div>{order.addressLine2}</div>}
                <div>
                  {order.city}, {order.state} - {order.postalCode}
                </div>
                <div>{order.country}</div>
                <div className="text-neutral-400 text-[11px] pt-1">
                  Mobile: {maskedPhone} &bull; Email: {maskedEmail}
                </div>
              </div>
            </div>

            {/* Total Paid */}
            <div className="border-t border-brand-border pt-4 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Shipping &amp; Doorstep Delivery:</span>
                <span className="text-emerald-400 font-bold">FREE (₹0)</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Payment Method:</span>
                <span className="text-white font-bold">{order.paymentMethod}</span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between text-neutral-400">
                  <span>Transaction Reference:</span>
                  <span className="text-neutral-300">{order.razorpayPaymentId}</span>
                </div>
              )}
              <div className="border-t border-brand-border/60 pt-2 flex justify-between text-base font-bold text-white">
                <span>Total Paid:</span>
                <span className="text-emerald-400 font-mono text-lg font-extrabold">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all cursor-pointer"
          >
            <Package className="h-4 w-4" />
            <span>View in My Orders</span>
          </Link>

          <Link
            href="/topics"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>Continue to DSA Topics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
