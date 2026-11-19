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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasBundleAccess: boolean;
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
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  // Permission helpers
  const hasBundleAccess =
    user?.role === "ADMIN" ||
    Boolean(user?.purchases?.some((p) => p.purchaseType === "BUNDLE" && p.status === "COMPLETED"));

  const hasCategoryAccess = (categoryId: string, isFree?: boolean): boolean => {
    if (isFree) return true;
    if (user?.role === "ADMIN") return true;
    if (hasBundleAccess) return true;
    return Boolean(
      user?.purchases?.some(
        (p) => p.status === "COMPLETED" && p.purchaseType === "CATEGORY" && p.categoryId === categoryId
      )
    );
  };

  const hasProblemAccess = (
    problemId: string,
    categoryId: string,
    isProblemFree?: boolean,
    isCategoryFree?: boolean
  ): boolean => {
    if (isProblemFree || isCategoryFree) return true;
    if (user?.role === "ADMIN") return true;
    if (hasBundleAccess) return true;
    if (hasCategoryAccess(categoryId, isCategoryFree)) return true;
    return Boolean(
      user?.purchases?.some(
        (p) => p.status === "COMPLETED" && p.purchaseType === "PROBLEM" && p.problemId === problemId
      )
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        hasBundleAccess,
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
