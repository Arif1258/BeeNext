"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  ShoppingBag,
  Package,
  Info,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown and mobile menu on pathname change
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/topics") {
      return (
        pathname === "/topics" ||
        pathname?.startsWith("/topics/") ||
        pathname?.startsWith("/problem/")
      );
    }
    if (path === "/purchase") {
      return (
        pathname === "/purchase" ||
        pathname?.startsWith("/purchase/") ||
        pathname === "/order-printed" ||
        pathname === "/notes"
      );
    }
    if (path === "/orders") {
      return pathname === "/orders" || pathname === "/my-orders";
    }
    if (path === "/about") {
      return pathname === "/about";
    }
    if (path === "/profile") {
      return pathname === "/profile";
    }
    return pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 w-full border-b border-brand-border bg-brand-black/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Side: Brand Logo + Primary Navigation */}
          <div className="flex items-center space-x-6 lg:space-x-8">
            {/* Brand Logo - Redirects to /topics */}
            <Link href="/topics" className="flex items-center space-x-3 group flex-shrink-0 min-[1344px]:-translate-x-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red text-white font-mono font-bold shadow-brand group-hover:scale-105 transition-transform">
                B&gt;
              </div>
              <div className="flex flex-col justify-center items-start">
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center leading-none">
                  <span>BEE<span className="text-brand-red">NEXT</span></span>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse ml-1" />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-brand-muted font-mono leading-none mt-1">
                  DSA Sheet
                </span>
              </div>
            </Link>

            {/* Left Navigation: 1. DSA Topics, 2. Purchase, 3. My Orders, 4. About */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {/* 1. DSA Topics */}
              <Link
                href="/topics"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/topics")
                  ? "text-brand-red bg-brand-redMuted font-semibold"
                  : "text-brand-muted hover:text-white hover:bg-brand-card"
                  }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>DSA Topics</span>
              </Link>

              {/* 2. Purchase */}
              <Link
                href="/purchase"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/purchase")
                  ? "text-brand-red bg-brand-redMuted font-semibold"
                  : "text-brand-muted hover:text-white hover:bg-brand-card"
                  }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Purchase</span>
              </Link>

              {/* 3. My Orders */}
              <Link
                href="/orders"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/orders")
                  ? "text-brand-red bg-brand-redMuted font-semibold"
                  : "text-brand-muted hover:text-white hover:bg-brand-card"
                  }`}
              >
                <Package className="h-4 w-4" />
                <span>My Orders</span>
              </Link>

              {/* 4. About */}
              <Link
                href="/about"
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive("/about")
                  ? "text-brand-red bg-brand-redMuted font-semibold"
                  : "text-brand-muted hover:text-white hover:bg-brand-card"
                  }`}
              >
                <Info className="h-4 w-4" />
                <span>About</span>
              </Link>
            </nav>
          </div>

          {/* Far Right: Single Profile / User Icon with Dropdown Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all focus:outline-none ${profileDropdownOpen || isActive("/profile")
                  ? "bg-brand-card border-brand-red text-white shadow-sm ring-1 ring-brand-red/30"
                  : "bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white"
                  }`}
                title={user ? `Account (${user.name})` : "Account / Login"}
                aria-label="Profile and Account Menu"
                aria-expanded={profileDropdownOpen}
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Compact Dropdown Menu directly below icon */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-52 rounded-xl border border-brand-border bg-brand-card p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 font-mono text-xs">
                  {user ? (
                    <>
                      {/* User Info Header */}
                      <div className="px-3 py-2 border-b border-brand-border/60 mb-1">
                        <span className="text-white font-bold block truncate font-sans text-xs">
                          {user.name}
                        </span>
                        <span className="text-neutral-400 text-[10px] block truncate">
                          {user.email}
                        </span>
                      </div>

                      {/* 1. My Profile */}
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive("/profile")
                          ? "bg-brand-redMuted text-brand-red font-semibold"
                          : "text-neutral-200 hover:text-white hover:bg-neutral-900"
                          }`}
                      >
                        <User className="h-3.5 w-3.5 text-brand-red" />
                        <span>My Profile</span>
                      </Link>

                      {/* Admin Dashboard (if admin) */}
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-brand-red hover:bg-neutral-900 transition-colors"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      {/* 2. Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-brand-red hover:bg-neutral-900 transition-colors text-left"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* 1. Login */}
                      <Link
                        href="/login"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-neutral-900 transition-colors"
                      >
                        <LogIn className="h-3.5 w-3.5 text-brand-red" />
                        <span className="font-bold">Login</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger Toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-brand-muted hover:text-white hover:bg-brand-card focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer (Topics, Purchase, My Orders, About) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-border bg-brand-black px-4 pt-3 pb-6 space-y-2">
            {/* 1. DSA Topics */}
            <Link
              href="/topics"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive("/topics")
                ? "bg-brand-redMuted text-brand-red font-semibold"
                : "text-brand-muted hover:text-white hover:bg-brand-card"
                }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>DSA Topics</span>
            </Link>

            {/* 2. Purchase */}
            <Link
              href="/purchase"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive("/purchase")
                ? "bg-brand-redMuted text-brand-red font-semibold"
                : "text-brand-muted hover:text-white hover:bg-brand-card"
                }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Purchase</span>
            </Link>

            {/* 3. My Orders */}
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive("/orders")
                ? "bg-brand-redMuted text-brand-red font-semibold"
                : "text-brand-muted hover:text-white hover:bg-brand-card"
                }`}
            >
              <Package className="h-4 w-4" />
              <span>My Orders</span>
            </Link>

            {/* 4. About */}
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive("/about")
                ? "bg-brand-redMuted text-brand-red font-semibold"
                : "text-brand-muted hover:text-white hover:bg-brand-card"
                }`}
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
          </div>
        )}
      </header>
      {/* Fixed Navbar Spacer so page content is never hidden behind the fixed navbar */}
      <div className="h-16 w-full shrink-0" aria-hidden="true" />
    </>
  );
}
