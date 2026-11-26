import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { determineUserCurrentPlan, CurrentMembershipPlan } from "@/lib/membership";
import MembershipClient from "@/components/MembershipClient";

export const metadata: Metadata = {
  title: "BeeNext Plus Membership - Unlock Execution, Solutions & Notes",
  description:
    "Upgrade to BeeNext Plus for live code execution in Monaco editor, hidden test case submissions, complete Brute Force and Optimal solutions, and all 5 CS notes libraries.",
};

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  let initialCurrentPlan: CurrentMembershipPlan | null = null;

  try {
    const cookieStore = cookies();
    const token = cookieStore.get(process.env.SESSION_COOKIE_NAME || "beenext_token")?.value;

    if (token) {
      const session = verifyToken(token);
      if (session?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.id },
          select: {
            id: true,
            role: true,
            membershipType: true,
            membershipPlan: true,
            membershipExpiresAt: true,
            membershipOrders: {
              where: { status: "COMPLETED" },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { plan: true },
            },
          },
        });

        if (user) {
          const effectivePlan = user.role === "ADMIN" ? "LIFETIME_PLUS" : (user.membershipPlan || user.membershipOrders?.[0]?.plan || null);
          initialCurrentPlan = determineUserCurrentPlan({
            ...user,
            membershipPlan: effectivePlan,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error determining server-side membership plan:", error);
  }

  return <MembershipClient initialCurrentPlan={initialCurrentPlan} />;
}
