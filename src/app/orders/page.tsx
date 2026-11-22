import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import OrdersClient from "@/components/OrdersClient";
import { Package, LogIn } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-black text-white py-16 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
        <div className="mx-auto max-w-xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400">
            <Package className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono">
              Please sign in to your BeeNext account to view your physical notes order history.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login?redirect=/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-brand transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Log In to View Orders</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orders = await prisma.printedOrder.findMany({
    where: {
      OR: [
        { userId: user.id },
        { customerEmail: user.email.toLowerCase() },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <OrdersClient
      initialOrders={JSON.parse(JSON.stringify(orders))}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
      }}
    />
  );
}
