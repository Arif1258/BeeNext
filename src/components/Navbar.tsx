"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Code2,
  BookOpen,
  ShoppingBag,
  User,
  Shield,
  Menu,
  X,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-black/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red text-white font-mono font-bold shadow-brand group-hover:scale-105 transition-transform">
            B&gt;
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
              Bee<span className="text-brand-red">Next</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
            </span>
            <span className="text-[10px] uppercase tracking-widest text-brand-muted font-mono -mt-1">
              Handwritten DSA
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            href="/"
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive("/") && pathname === "/"
                ? "text-brand-red bg-brand-redMuted"
                : "text-brand-muted hover:text-white hover:bg-brand-card"
            }`}
          >
            Home
          </Link>
          <Link
            href="/topics"
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive("/topics") || isActive("/problem")
                ? "text-brand-red bg-brand-redMuted"
                : "text-brand-muted hover:text-white hover:bg-brand-card"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>DSA Topics</span>
          </Link>
          <Link
            href="/purchases"
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive("/purchases")
                ? "text-brand-red bg-brand-redMuted"
                : "text-brand-muted hover:text-white hover:bg-brand-card"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>My Purchases</span>
          </Link>
          <Link
            href="/profile"
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive("/profile")
                ? "text-brand-red bg-brand-redMuted"
                : "text-brand-muted hover:text-white hover:bg-brand-card"
            }`}
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </Link>

          {/* Admin Dashboard Pill - Strictly for ADMIN */}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-md border transition-all ${
                isActive("/admin")
                  ? "bg-brand-red text-white border-brand-red"
                  : "bg-brand-card text-brand-red border-brand-red/50 hover:bg-brand-red hover:text-white"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </nav>

        {/* User Auth Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 pl-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-card border border-brand-border text-white text-xs font-bold uppercase font-mono">
                  {user.name.slice(0, 2)}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-brand-muted capitalize">
                    {user.role.toLowerCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-md text-brand-muted hover:text-brand-red hover:bg-brand-card transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-white hover:text-brand-red transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-red hover:bg-brand-redHover rounded-lg shadow-brand transition-all active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="p-1.5 text-xs font-mono font-bold bg-brand-card border border-brand-red text-brand-red rounded"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-brand-muted hover:text-white hover:bg-brand-card focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border bg-brand-black px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 text-base font-medium rounded-md ${
              pathname === "/" ? "bg-brand-red text-white" : "text-brand-muted hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/topics"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 text-base font-medium rounded-md ${
              pathname.startsWith("/topics")
                ? "bg-brand-red text-white"
                : "text-brand-muted hover:text-white"
            }`}
          >
            DSA Topics
          </Link>
          <Link
            href="/purchases"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 text-base font-medium rounded-md ${
              pathname.startsWith("/purchases")
                ? "bg-brand-red text-white"
                : "text-brand-muted hover:text-white"
            }`}
          >
            My Purchases
          </Link>
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 text-base font-medium rounded-md ${
              pathname.startsWith("/profile")
                ? "bg-brand-red text-white"
                : "text-brand-muted hover:text-white"
            }`}
          >
            My Profile
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-mono font-bold text-white bg-brand-card border border-brand-red rounded-md"
            >
              🛡️ Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-brand-border mt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-brand-muted">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-brand-red bg-brand-card border border-brand-border rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium border border-brand-border rounded text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium bg-brand-red text-white rounded font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
