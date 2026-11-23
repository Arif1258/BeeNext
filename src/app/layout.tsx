import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";

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
  title: "BeeNext - DSA Sheet",
  description:
    "Master Data Structures and Algorithms with clean computer-written Java solutions, Brute Force and Optimal approaches, time and space complexity analysis, and LeetCode references. Free Sorting track included.",
  keywords: [
    "BeeNext",
    "DSA Sheet",
    "DSA Notes",
    "Computer-Written DSA",
    "Data Structures",
    "Algorithms",
    "Java DSA",
    "LeetCode Solutions",
    "Sorting Algorithms",
  ],
  openGraph: {
    title: "BeeNext - DSA Sheet",
    description:
      "Master Data Structures and Algorithms with clean computer-written Java solutions, Brute Force and Optimal approaches, time and space complexity analysis, and LeetCode references.",
    siteName: "BeeNext - DSA Sheet",
  },
  twitter: {
    title: "BeeNext - DSA Sheet",
    description:
      "Master Data Structures and Algorithms with clean computer-written Java solutions, Brute Force and Optimal approaches, time and space complexity analysis, and LeetCode references.",
  },
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
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <CheckoutModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
