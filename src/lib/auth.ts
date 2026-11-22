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
 * Backend problem access verification
 * Under the new business model, all DSA problems, code, and solutions are 100% FREE!
 */
export async function checkProblemAccess(
  userId: string | null | undefined,
  problemId: string
): Promise<{ hasAccess: boolean; reason: "FREE" | "PURCHASED" | "ADMIN" | "LOCKED" }> {
  return { hasAccess: true, reason: "FREE" };
}

/**
 * Backend category access verification
 * Under the new business model, all DSA topics are 100% FREE!
 */
export async function checkCategoryAccess(
  userId: string | null | undefined,
  categoryId: string
): Promise<{ hasAccess: boolean; reason: "FREE" | "PURCHASED" | "ADMIN" | "LOCKED" }> {
  return { hasAccess: true, reason: "FREE" };
}

/**
 * Digital Notes PDF Access verification
 * Requires COMPLETED BUNDLE purchase (or ADMIN role)
 */
export async function checkPdfAccess(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role === "ADMIN") return true;

  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      purchaseType: "BUNDLE",
      status: "COMPLETED",
    },
  });
  return Boolean(purchase);
}
