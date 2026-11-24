"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar?: string | null;
  createdAt?: string;
  purchases?: Array<{
    id: string;
    purchaseType: "BUNDLE" | "CATEGORY" | "PROBLEM";
    categoryId?: string | null;
    problemId?: string | null;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  bookmarks?: Array<{ problemId: string }>;
  progress?: Array<{ problemId: string; status: "IN_PROGRESS" | "COMPLETED" }>;
  dsaQualifiedAt?: string | null;
  certificateClaimedAt?: string | null;
  membershipType?: "NORMAL" | "PLUS";
  membershipPlan?: "MONTHLY" | "YEARLY" | null;
  membershipStartedAt?: string | null;
  membershipExpiresAt?: string | null;
  isActivePlus?: boolean;
  printedOrders?: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    productTitle: string;
    totalAmount: number;
    orderStatus: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED";
    paymentStatus: string;
    requiresCertificate?: boolean;
    certificateStatus?: string | null;
    trackingNumber?: string | null;
    carrier?: string | null;
    createdAt: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isPlusMember: boolean;
  hasBundleAccess: boolean;
  hasPdfAccess: boolean;
  hasCategoryAccess: (categoryId: string, isFree?: boolean) => boolean;
  hasProblemAccess: (problemId: string, categoryId: string, isProblemFree?: boolean, isCategoryFree?: boolean) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user session", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }
      setUser(data.user);
      router.refresh();
      return { success: true };
    } catch {
      return { success: false, error: "Network error during login" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }
      setUser(data.user);
      router.refresh();
      return { success: true };
    } catch {
      return { success: false, error: "Network error during registration" };
    }
  };

  const logout = async () => {
    try {
      // Optimistically clear user state immediately for 0ms perceived latency
      setUser(null);

      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      const isProtectedRoute =
        currentPath.startsWith("/profile") ||
        currentPath.startsWith("/admin") ||
        currentPath.startsWith("/orders") ||
        currentPath.startsWith("/my-orders");

      const logoutPromise = fetch("/api/auth/logout", { method: "POST" });

      if (isProtectedRoute) {
        router.push("/topics");
      }

      await logoutPromise;
      router.refresh();
    } catch (err) {
      console.error("Logout error", err);
      setUser(null);
    }
  };

  // Permission helpers
  const isPlusMember =
    user?.role === "ADMIN" ||
    Boolean(
      user?.isActivePlus ??
        (user?.membershipType === "PLUS" &&
          (!user?.membershipExpiresAt ||
            new Date(user.membershipExpiresAt).getTime() > Date.now()))
    );

  const hasBundleAccess =
    user?.role === "ADMIN" ||
    isPlusMember ||
    Boolean(user?.purchases?.some((p) => p.purchaseType === "BUNDLE" && p.status === "COMPLETED"));

  const hasPdfAccess = hasBundleAccess;

  // All DSA topics and problems are 100% free under the new business model
  const hasCategoryAccess = (): boolean => true;
  const hasProblemAccess = (): boolean => true;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isPlusMember,
        hasBundleAccess,
        hasPdfAccess,
        hasCategoryAccess,
        hasProblemAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
