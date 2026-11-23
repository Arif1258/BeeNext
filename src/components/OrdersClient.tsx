"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Package,
  Truck,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

export interface PrintedOrderItem {
  id: string;
  orderNumber: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  items?: any;
  createdAt: string;
}

interface OrdersClientProps {
  initialOrders: PrintedOrderItem[];
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OrdersClient({ initialOrders, user }: OrdersClientProps) {
  const [orders, setOrders] = useState<PrintedOrderItem[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll or refresh orders if needed
  const refreshOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh orders");
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-950/60 border-emerald-800 text-emerald-400";
      case "SHIPPED":
        return "bg-purple-950/60 border-purple-800 text-purple-400";
      case "DELIVERED":
        return "bg-blue-950/60 border-blue-800 text-blue-400";
      case "PROCESSING":
      case "PENDING":
        return "bg-amber-950/60 border-amber-800 text-amber-400";
      default:
        return "bg-neutral-900 border-neutral-700 text-neutral-300";
    }
  };

  const formatOrderStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "CONFIRMED":
        return "Confirmed";
      case "PROCESSING":
        return "Processing";
      case "SHIPPED":
        return "Shipped";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-950/60 border-emerald-800 text-emerald-400";
      case "FAILED":
        return "bg-red-950/60 border-red-800 text-red-400";
      default:
        return "bg-amber-950/60 border-amber-800 text-amber-400";
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="border-b border-brand-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-red" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Orders
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400">
              Track physical printed notes and book orders from BeeNext for {user.name} ({user.email}).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/purchase"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-brand-red text-neutral-300 hover:text-white text-xs font-mono font-medium transition-all"
            >
              <span>Order New Notes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-brand-redMuted border border-brand-red text-xs font-mono text-white flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-brand-red shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-brand-border bg-brand-card p-12 text-center space-y-4 shadow-card max-w-xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500">
              <Package className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-white">
                You haven&apos;t placed any orders yet.
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Order physical printed DSA notes sheets or the complete solution book.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/purchase"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all"
              >
                <Package className="h-4 w-4" />
                <span>Browse DSA Notes</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Order History List */
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-brand-border bg-brand-card p-5 sm:p-6 space-y-4 shadow-card font-mono text-xs hover:border-neutral-700 transition-colors"
              >
                {/* Order Top Bar: Title, Order ID, Status Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-white font-sans">
                        {order.productTitle}
                      </h2>
                      {order.quantity > 1 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 border border-neutral-700 text-neutral-300">
                          Qty: {order.quantity}
                        </span>
                      )}
                    </div>
                    <span className="text-neutral-400 text-[11px] block">
                      Order ID: <strong className="text-neutral-200">{order.orderNumber}</strong>
                    </span>
                    {Array.isArray(order.items) && order.items.length > 0 && (
                      <div className="pt-1.5 space-y-1">
                        {order.items.map((it: any, i: number) => (
                          <div key={i} className="text-[11px] text-neutral-300 flex items-center gap-1.5">
                            <span className="text-brand-red">&bull;</span>
                            <span className="text-white font-medium">{it.title}</span>
                            {it.language && (
                              <span className="text-[10px] text-brand-red bg-brand-red/10 px-1 rounded border border-brand-red/20 font-bold">
                                {it.language}
                              </span>
                            )}
                            <span className="text-neutral-400">&times; {it.quantity || 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Payment Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getPaymentStatusBadge(
                        order.paymentStatus
                      )}`}
                    >
                      Payment: {order.paymentStatus === "COMPLETED" ? "Successful" : order.paymentStatus}
                    </span>

                    {/* Delivery / Order Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getOrderStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      Delivery: {formatOrderStatus(order.orderStatus)}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[11px] text-neutral-300">
                  {/* Price Paid */}
                  <div className="p-3 rounded-xl bg-brand-black border border-brand-border/80">
                    <span className="text-neutral-500 block text-[10px] uppercase">Price Paid</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="text-neutral-500 text-[10px] block mt-0.5">Free Doorstep Shipping</span>
                  </div>

                  {/* Order Date */}
                  <div className="p-3 rounded-xl bg-brand-black border border-brand-border/80">
                    <span className="text-neutral-500 block text-[10px] uppercase">Order Date</span>
                    <span className="text-white font-bold text-xs flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3.5 w-3.5 text-brand-red" />
                      <span>{formatDate(order.createdAt)}</span>
                    </span>
                  </div>

                  {/* Customer Contact */}
                  <div className="p-3 rounded-xl bg-brand-black border border-brand-border/80 sm:col-span-2 md:col-span-1">
                    <span className="text-neutral-500 block text-[10px] uppercase">Recipient</span>
                    <span className="text-white font-bold block truncate mt-1">
                      {order.customerName}
                    </span>
                    <span className="text-neutral-400 text-[10px] block truncate">
                      {order.customerPhone}
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-3 rounded-xl bg-brand-black border border-brand-border/80 flex items-start gap-2 text-neutral-300 text-[11px]">
                  <MapPin className="h-4 w-4 text-brand-red shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-neutral-500 block text-[10px] uppercase">Delivery Address</span>
                    <span className="text-neutral-200 block font-sans text-xs leading-relaxed">
                      {order.addressLine1}
                      {order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city},{" "}
                      {order.state} - {order.postalCode}, {order.country}
                    </span>
                  </div>
                </div>

                {/* Tracking Information if available */}
                {order.trackingNumber && (
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2 text-neutral-200 text-xs">
                    <Truck className="h-4 w-4 text-brand-red shrink-0" />
                    <span>
                      Courier: <strong className="text-white">{order.carrier || "Standard Courier"}</strong> • Tracking No: <strong className="text-white">{order.trackingNumber}</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
