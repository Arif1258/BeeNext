import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BeeNext — Handwritten DSA Notes & Code Marketplace",
  description:
    "Master Data Structures and Algorithms with high-resolution handwritten diagrams, dry-run traces, LeetCode references, and production-grade Java solutions. Free Sorting track included.",
  keywords: [
    "DSA Notes",
    "Handwritten DSA",
    "Data Structures",
    "Algorithms",
    "Java DSA",
    "LeetCode Solutions",
    "Sorting Algorithms",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-brand-black text-white min-h-screen flex flex-col selection:bg-brand-red selection:text-white`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
