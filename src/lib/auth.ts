import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "beenext_super_secure_jwt_secret_production_ready_2026_xyz";
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "beenext_token";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = verifyToken(token);
    if (!session?.id) return null;

    // Verify user exists in DB and wasn't deleted or role changed
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return null;
    return user;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Robust backend access verification
 * Checks whether user has permission to view full problem code, handwritten notes, and solution.
 */
export async function checkProblemAccess(
  userId: string | null | undefined,
  problemId: string
): Promise<{ hasAccess: boolean; reason: "FREE" | "PURCHASED" | "ADMIN" | "LOCKED" }> {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    select: {
      id: true,
      isFree: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          isFree: true,
          slug: true,
        },
      },
    },
  });

  if (!problem) {
    return { hasAccess: false, reason: "LOCKED" };
  }

  // 1. Free category (like Sorting) or free problem is accessible to all
  if (problem.isFree || problem.category.isFree || problem.category.slug === "sorting") {
    return { hasAccess: true, reason: "FREE" };
  }

  // If not logged in, premium problem is locked
  if (!userId) {
    return { hasAccess: false, reason: "LOCKED" };
  }

  // 2. Check if user is an ADMIN
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "ADMIN") {
    return { hasAccess: true, reason: "ADMIN" };
  }

  // 3. Check purchases:
  // - BUNDLE purchase (gives access to everything)
  // - CATEGORY purchase (gives access to this problem's category)
  // - PROBLEM purchase (gives access to this specific problem)
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      status: "COMPLETED",
      OR: [
        { purchaseType: "BUNDLE" },
        { purchaseType: "CATEGORY", categoryId: problem.categoryId },
        { purchaseType: "PROBLEM", problemId: problem.id },
      ],
    },
  });

  if (purchase) {
    return { hasAccess: true, reason: "PURCHASED" };
  }

  return { hasAccess: false, reason: "LOCKED" };
}

/**
 * Backend category access verification
 */
export async function checkCategoryAccess(
  userId: string | null | undefined,
  categoryId: string
): Promise<{ hasAccess: boolean; reason: "FREE" | "PURCHASED" | "ADMIN" | "LOCKED" }> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, isFree: true, slug: true },
  });

  if (!category) {
    return { hasAccess: false, reason: "LOCKED" };
  }

  if (category.isFree || category.slug === "sorting") {
    return { hasAccess: true, reason: "FREE" };
  }

  if (!userId) {
    return { hasAccess: false, reason: "LOCKED" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "ADMIN") {
    return { hasAccess: true, reason: "ADMIN" };
  }

  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      status: "COMPLETED",
      OR: [
        { purchaseType: "BUNDLE" },
        { purchaseType: "CATEGORY", categoryId: category.id },
      ],
    },
  });

  if (purchase) {
    return { hasAccess: true, reason: "PURCHASED" };
  }

  return { hasAccess: false, reason: "LOCKED" };
}
