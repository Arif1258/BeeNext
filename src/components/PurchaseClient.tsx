"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { PRICING, getTopicPrice, getBookPrice } from "@/lib/pricing";
import { getBookImage } from "@/lib/bookImages";
import PrintedOrderModal, { OrderProductInfo } from "@/components/PrintedOrderModal";
import {
  Package,
  BookOpen,
  Layers,
  CheckCircle2,
  Truck,
  ArrowRight,
  ArrowLeft,
  X,
  Image as ImageIcon,
  AlertCircle,
  Check,
  Database,
  ChevronLeft,
  ChevronRight,
  Flame,
  Users,
  ShoppingCart,
  Sparkles,
  Clock,
  Code,
} from "lucide-react";

export interface CategoryCardItem {
  id: string;
  title: string;
  slug: string;
  order: number;
  price: number;
  description?: string | null;
  _count?: {
    problems: number;
  };
}

interface PurchaseClientProps {
  categories: CategoryCardItem[];
  bookConfig?: {
    title?: string;
    description?: string;
    price?: number;
    originalPrice?: number;
  } | null;
  initialOption?: "TOPIC_WISE" | "FULL_BOOK" | null;
  initialTargetTopic?: string;
  initialTotalPurchased?: {
    total: number;
    byLanguage: Record<string, number>;
  };
  initialRatings?: Record<string, { average: number | null; count: number }>;
  initialSalesCounts?: Record<string, number>;
}

/**
 * Prominent Sold Count Badge matching BeeNext red, black, and white design.
 */
function SoldCountBadge({
  count,
  className = "",
  size = "md",
  showIcon = true,
}: {
  count: number | string;
  className?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}) {
  const isSm = size === "sm";
  const label = typeof count === "string" ? count : `${count} Units Sold`;
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold tracking-tight rounded-md bg-neutral-950 border border-neutral-800 text-white select-none whitespace-nowrap shrink-0 ${isSm ? "px-2 py-1 text-[10.5px] sm:text-xs" : "px-2.5 py-1 text-xs"
        } ${className}`}
    >
      {showIcon && (
        <Flame className={`${isSm ? "h-3 w-3" : "h-3.5 w-3.5"} text-brand-red shrink-0`} />
      )}
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}



/**
 * Product sample images mapping.
 * Order for topic-wise:
 * 1: topicwise-1 (Front cover of Sorting booklet)
 * 2: topicwise-2 (Back cover of Sorting booklet)
 * 3: topicwise-3 (Open booklet showing Quick Sort)
 *
 * Order for full-dsa-book:
 * 1: fullDSA1 (Front cover)
 * 2: fullDSA2 (Table of Contents)
 * 3: fullDSA3 (Two Sum problem solution)
 */
const PRODUCT_SAMPLE_IMAGES: Record<string, string[]> = {
  "topic-wise": [
    "/images/purchase/topic-wise/topicwise-1.jpg",
    "/images/purchase/topic-wise/topicwise-2.jpg",
    "/images/purchase/topic-wise/topicwise-3.jpg",
  ],
  "topic-wise-book": [
    "/images/purchase/topic-wise/topicwise-1.jpg",
    "/images/purchase/topic-wise/topicwise-2.jpg",
    "/images/purchase/topic-wise/topicwise-3.jpg",
  ],
  "full-dsa-book": [
    "/images/purchase/full-dsa-book/fullDSA1.jpg",
    "/images/purchase/full-dsa-book/fullDSA2.jpg",
    "/images/purchase/full-dsa-book/fullDSA3.jpg",
  ],
  "oops-book": [
    "/images/purchase/oops/oops1.jpg",
    "/images/purchase/oops/oops2.jpg",
    "/images/purchase/oops/oops3.jpg",
  ],
  "oops": [
    "/images/purchase/oops/oops1.jpg",
    "/images/purchase/oops/oops2.jpg",
    "/images/purchase/oops/oops3.jpg",
  ],
  "computer-networks": [
    "/images/purchase/computer-networks/CN-1.jpg",
    "/images/purchase/computer-networks/CN-2.jpg",
    "/images/purchase/computer-networks/CN-3.jpg",
  ],
  "operating-systems": [
    "/images/purchase/operating-systems/OS-1.jpg",
    "/images/purchase/operating-systems/OS-2.jpg",
    "/images/purchase/operating-systems/OS-3.jpg",
  ],
  "dbms": [
    "/images/purchase/dbms/DBMS-1.jpg",
    "/images/purchase/dbms/DBMS-2.jpg",
    "/images/purchase/dbms/DBMS-3.jpg",
  ],
  "learn-sql": [
    "/images/purchase/sql/sql-1.jpg",
    "/images/purchase/sql/sql-2.jpg",
    "/images/purchase/sql/sql-3.jpg",
  ],
  "sql": [
    "/images/purchase/sql/sql-1.jpg",
    "/images/purchase/sql/sql-2.jpg",
    "/images/purchase/sql/sql-3.jpg",
  ],
  "learn-mongodb": [
    "/images/purchase/mongodb/mongodb1.jpg",
    "/images/purchase/mongodb/mongodb2.jpg",
    "/images/purchase/mongodb/mongodb3.jpg",
  ],
  "mongodb": [
    "/images/purchase/mongodb/mongodb1.jpg",
    "/images/purchase/mongodb/mongodb2.jpg",
    "/images/purchase/mongodb/mongodb3.jpg",
  ],
  "hr-interview": [
    "/images/purchase/hr-interview/hr-1.jpg",
    "/images/purchase/hr-interview/hr-2.jpg",
    "/images/purchase/hr-interview/hr-3.jpg",
  ],
};

const SLIDE_PREVIEWS: Record<
  string,
  { label: string; tag: string; icon: "book" | "database"; title: string; subtitle: string; bullet: string }[]
> = {
  "oops-book": [
    {
      label: "Front Cover & Overview",
      tag: "OOPs-1",
      icon: "book",
      title: "OOPs",
      subtitle: "Front Cover & Paradigm",
      bullet: "4 Pillars • Abstraction & Encapsulation",
    },
    {
      label: "Class Design & Patterns",
      tag: "OOPs-2",
      icon: "book",
      title: "Design Patterns",
      subtitle: "Interior Architecture Notes",
      bullet: "SOLID Principles • Factory & Singleton",
    },
    {
      label: "Interview Q&A & Code",
      tag: "OOPs-3",
      icon: "book",
      title: "Interview Solutions",
      subtitle: "Java Implementation Notes",
      bullet: "Real Interview Q&A • Clean Solutions",
    },
  ],
  "learn-sql": [
    {
      label: "Front Cover & Architecture",
      tag: "SQL-1",
      icon: "database",
      title: "Learn SQL",
      subtitle: "Front Cover & Relational DB",
      bullet: "DDL, DML • Normalization (1NF-BCNF)",
    },
    {
      label: "Advanced Queries & Joins",
      tag: "SQL-2",
      icon: "database",
      title: "Advanced SQL",
      subtitle: "Interior Notes & Queries",
      bullet: "Window Functions • CTEs & Subqueries",
    },
    {
      label: "Performance & Optimization",
      tag: "SQL-3",
      icon: "database",
      title: "Query Optimization",
      subtitle: "Top 50 Interview Solutions",
      bullet: "Indexing Strategies • Execution Plans",
    },
  ],
  "learn-mongodb": [
    {
      label: "Front Cover & Document Model",
      tag: "MONGO-1",
      icon: "database",
      title: "Learn MongoDB",
      subtitle: "Front Cover & NoSQL Architecture",
      bullet: "BSON Schema • Collections & Documents",
    },
    {
      label: "Aggregation Framework",
      tag: "MONGO-2",
      icon: "database",
      title: "Aggregation Pipeline",
      subtitle: "Interior Query Walkthrough",
      bullet: "$match, $group, $lookup • Indexing",
    },
    {
      label: "Interview Q&A & Scaling",
      tag: "MONGO-3",
      icon: "database",
      title: "Interview Solutions",
      subtitle: "Schema Design & Performance",
      bullet: "Embedding vs Referencing • Sharding & ACID",
    },
  ],
  "hr-interview": [
    {
      label: "Front Cover & Overview",
      tag: "HR-1",
      icon: "book",
      title: "HR Interview",
      subtitle: "Front Cover & Core Concepts",
      bullet: "Top 50 Behavioral Questions • STAR Method",
    },
    {
      label: "Situational Q&A & Scenarios",
      tag: "HR-2",
      icon: "book",
      title: "Situational Q&A",
      subtitle: "Scenario-Based Answers",
      bullet: "Conflict Resolution • Leadership • Teamwork",
    },
    {
      label: "Interview Best Practices",
      tag: "HR-3",
      icon: "book",
      title: "Closing & Negotiation",
      subtitle: "Interview Best Practices",
      bullet: "Questions for Interviewer • Salary Tips",
    },
  ],
};

/**
 * Inline Sample Images Carousel with 3 slots and left/right navigation arrows.
 * Clean photos or placeholders are displayed. When photos are present, no text overlay is shown.
 */
function ProductSampleCarousel({
  title,
  slug,
  heightClass = "aspect-[16/11] w-full",
  compact = false,
  onEnlarge,
}: {
  title: string;
  slug: string;
  heightClass?: string;
  compact?: boolean;
  onEnlarge?: (index: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const images = PRODUCT_SAMPLE_IMAGES[slug];
  const hasImages = Boolean(images && images.length > 0);

  const slidePreviews = SLIDE_PREVIEWS[slug];
  const currentSlide = slidePreviews ? slidePreviews[currentIdx] : null;

  const sampleLabels = [
    "Front Cover & Syllabus Overview",
    "Concept & Problem Walkthrough",
    "Optimal Solution & Complexity",
  ];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIdx((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIdx((prev) => (prev === 2 ? 0 : prev + 1));
  };

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between font-mono text-neutral-400 text-[11px]">
        <span className="flex items-center gap-1.5 font-medium text-neutral-300">
          <ImageIcon className="h-3 w-3 text-brand-red" />
          <span>Sample Images</span>
        </span>
        <span className="text-neutral-500 font-mono text-[10px]">
          Slot {currentIdx + 1} of 3
        </span>
      </div>

      <div
        onClick={() => onEnlarge && onEnlarge(currentIdx)}
        className={`relative w-full ${heightClass} rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center group cursor-pointer hover:border-neutral-700 transition-colors shadow-inner`}
        title={`Click to preview sample ${currentIdx + 1} of 3 for ${title}`}
      >
        {/* Photos or Placeholder Display */}
        {hasImages && images ? (
          <img
            src={images[currentIdx]}
            alt={`${title} - photo ${currentIdx + 1}`}
            className="w-full h-full object-contain select-none p-1"
            loading="eager"
            draggable={false}
          />
        ) : currentSlide ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-neutral-950 select-none">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red">
                {currentSlide.tag}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Photo {currentIdx + 1} of 3
              </span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-brand-red my-1 group-hover:border-neutral-700 transition-colors">
              {currentSlide.icon === "database" ? (
                <Database className="h-3.5 w-3.5" />
              ) : (
                <BookOpen className="h-3.5 w-3.5" />
              )}
            </div>
            <span className="font-sans text-xs font-bold text-white line-clamp-1">
              {currentSlide.title}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 mt-0.5 line-clamp-1">
              {currentSlide.subtitle}
            </span>
            <span className="mt-1 px-2 py-0.5 rounded text-[9px] font-mono bg-neutral-900/80 border border-neutral-800/80 text-neutral-400 line-clamp-1 max-w-[85%]">
              {currentSlide.bullet}
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-neutral-950 select-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-brand-red mb-1.5 group-hover:border-neutral-700 transition-colors">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="font-sans text-xs font-bold text-white line-clamp-1">
              {title}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 mt-0.5 line-clamp-1">
              {sampleLabels[currentIdx]}
            </span>
            <span className="mt-1 px-2 py-0.5 rounded text-[9px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-400">
              Preview Slot {currentIdx + 1} of 3
            </span>
          </div>
        )}

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous sample image"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-full bg-black/80 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white flex items-center justify-center transition-all shadow-md z-10 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next sample image"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-full bg-black/80 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white flex items-center justify-center transition-all shadow-md z-10 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* 3 Indicator Dots at Bottom */}
        <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-200 h-1.5 ${i === currentIdx
                ? "w-4 bg-brand-red"
                : "w-1.5 bg-neutral-600/80"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Modal to display an enlarged view of the product box's 3 sample images.
 */
function ProductSampleModal({
  isOpen,
  onClose,
  title,
  slug,
  initialIndex = 0,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  initialIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const images = PRODUCT_SAMPLE_IMAGES[slug];
  const hasImages = Boolean(images && images.length > 0);

  const slidePreviews = SLIDE_PREVIEWS[slug];
  const currentSlide = slidePreviews ? slidePreviews[currentIndex] : null;

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  if (!isOpen) return null;

  const sampleLabels = [
    "Front Cover & Syllabus Overview",
    "Concept & Problem Walkthrough",
    "Optimal Solution & Complexity",
  ];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 2 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-brand-border bg-brand-card p-6 text-white shadow-2xl space-y-4 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg text-brand-muted hover:text-white hover:bg-brand-black transition-colors"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red">
              {hasImages
                ? `Photo ${currentIndex + 1} of 3`
                : currentSlide?.tag ?? "Sample Preview"}
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              Slot {currentIndex + 1} of 3
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          {!hasImages && (
            <p className="text-xs text-neutral-400 font-mono">
              {currentSlide?.label ?? `Sample ${currentIndex + 1}: ${sampleLabels[currentIndex]}`}
            </p>
          )}
        </div>

        {/* Image / Placeholder Display */}
        <div className="relative aspect-[16/10] w-full rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center">
          {hasImages && images ? (
            <img
              src={images[currentIndex]}
              alt={`${title} - photo ${currentIndex + 1}`}
              className="w-full h-full object-contain select-none"
            />
          ) : currentSlide ? (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 select-none">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red">
                  {currentSlide.tag}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Sample Photo {currentIndex + 1} of 3
                </span>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-brand-red shadow-sm">
                {currentSlide.icon === "database" ? (
                  <Database className="h-6 w-6" />
                ) : (
                  <BookOpen className="h-6 w-6" />
                )}
              </div>
              <span className="font-sans text-lg font-bold text-white">
                {currentSlide.title}
              </span>
              <span className="text-sm font-mono text-neutral-300">
                {currentSlide.subtitle}
              </span>
              <span className="px-3 py-1 rounded text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-400">
                {currentSlide.bullet}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Photo Placeholder • Actual high-res pages will be displayed here
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 select-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-brand-red shadow-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="font-sans text-base font-bold text-white">
                {title}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {sampleLabels[currentIndex]}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                {`Placeholder Slot ${currentIndex + 1} of 3 (Ready for actual images)`}
              </span>
            </div>
          )}

          {/* Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/80 hover:bg-brand-red border border-neutral-700 text-white flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/80 hover:bg-brand-red border border-neutral-700 text-white flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-200 ${i === currentIndex ? "w-6 bg-brand-red" : "w-2 bg-neutral-600 hover:bg-neutral-500"
                  }`}
                title={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseClient({
  categories,
  bookConfig,
  initialOption = null,
  initialTargetTopic,
  initialTotalPurchased,
  initialRatings,
  initialSalesCounts,
}: PurchaseClientProps) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { openCheckout, addItem, openCart } = useCart();

  // Add to cart feedback states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addedStatus, setAddedStatus] = useState<Record<string, boolean>>({});

  const triggerAddedFeedback = (key: string, title: string) => {
    setAddedStatus((prev) => ({ ...prev, [key]: true }));
    setToastMessage(`"${title}" added to cart!`);
    setTimeout(() => {
      setAddedStatus((prev) => ({ ...prev, [key]: false }));
    }, 2000);
    setTimeout(() => {
      setToastMessage((prev) => (prev?.includes(title) ? null : prev));
    }, 3500);
  };

  const handleAddCSToCart = (book: { title: string; slug: string; price: number }) => {
    addItem(
      {
        productType: "CS_FUNDAMENTAL",
        slug: book.slug,
        title: book.title,
        description: `Physical printed notes for ${book.title} delivered to your doorstep.`,
        price: book.price,
        image: getBookImage(book.slug, "CS_FUNDAMENTAL"),
      },
      { openDrawer: false }
    );
    triggerAddedFeedback(book.slug, book.title);
  };

  const handleAddTopicToCart = (cat: CategoryCardItem) => {
    const selectedLang = topicLanguages[cat.id];
    if (!selectedLang) {
      setTopicErrors((prev) => ({
        ...prev,
        [cat.id]: "Please select a language before adding to cart.",
      }));
      return;
    }
    setTopicErrors((prev) => {
      const next = { ...prev };
      delete next[cat.id];
      return next;
    });

    const title = `${cat.title} (${selectedLang}) – Book`;
    addItem(
      {
        productType: "TOPIC",
        slug: cat.slug,
        categoryId: cat.id,
        title,
        description: `Physical printed book for ${cat.title} featuring computer-written ${selectedLang} solutions with Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity delivered to your doorstep.`,
        price: getTopicPrice(cat),
        language: selectedLang,
        image: getBookImage(cat.slug, "TOPIC"),
      },
      { openDrawer: false }
    );
    triggerAddedFeedback(`topic-${cat.id}`, title);
  };

  const handleAddFullBookToCart = (lang: string, keySuffix?: string) => {
    const title = `Full DSA Book – ${lang} (All 20 Sections, ~500 Pages)`;
    addItem(
      {
        productType: "COMPLETE_BOOK",
        slug: "full-dsa-book",
        title,
        description: `Physical spiral-bound printed DSA book containing computer-written ${lang} solutions with Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity across all 20 DSA sections (~500 pages) delivered to your doorstep.`,
        language: lang,
        price: bookPrice,
        originalPrice: bookOriginalPrice,
        pages: 500,
        sections: 20,
        image: getBookImage("full-dsa-book", "COMPLETE_BOOK"),
      },
      { openDrawer: false }
    );
    triggerAddedFeedback(keySuffix || `full-book-${lang}`, title);
  };

  // Database-backed and established sold counts
  const topicSoldCount = 67 + (initialSalesCounts?.topicWise ?? 0);
  // Full DSA Book total sold = established base 55 units + any DB fullBook orders
  const fullBookTotalSold = 55 + (initialSalesCounts?.fullBook ?? initialTotalPurchased?.total ?? 0);
  const csSoldCount: Record<string, number> = {
    "oops-book": 112 + (initialSalesCounts?.oops ?? 0),
    "computer-networks": 85 + (initialSalesCounts?.cn ?? 0),
    "dbms": 33 + (initialSalesCounts?.dbms ?? 0),
    "operating-systems": 108 + (initialSalesCounts?.os ?? 0),
  };
  const dbSoldCount: Record<string, number> = {
    "learn-sql": 123 + (initialSalesCounts?.sql ?? 0),
    "learn-mongodb": 11 + (initialSalesCounts?.mongodb ?? 0),
  };

  const targetTopicParam = initialTargetTopic || searchParams.get("topic") || "";
  const paramOption = searchParams.get("option");

  // Determine initial selected view:
  // If targetTopic is provided or option=topics -> "TOPIC_WISE"
  // If option=book -> "FULL_BOOK"
  // Otherwise -> initialOption (null = show only two options)
  const [selectedOption, setSelectedOption] = useState<"TOPIC_WISE" | "FULL_BOOK" | null>(() => {
    if (targetTopicParam) return "TOPIC_WISE";
    if (paramOption === "topics" || paramOption === "topic") return "TOPIC_WISE";
    if (paramOption === "book") return "FULL_BOOK";
    return initialOption;
  });

  // Selected Language State for Full DSA Book (C, C++, Java, Python)
  const [selectedLanguage, setSelectedLanguage] = useState<"C" | "C++" | "Java" | "Python" | null>(null);
  const [languageError, setLanguageError] = useState<string | null>(null);

  // Topic-wise selected language map: { [topicId: string]: "C" | "C++" | "Java" | "Python" }
  const [topicLanguages, setTopicLanguages] = useState<Record<string, string>>({});
  const [topicErrors, setTopicErrors] = useState<Record<string, string>>({});

  // Complete Book Config
  const bookPrice = bookConfig?.price || PRICING.COMPLETE_BOOK.price;
  const bookOriginalPrice = bookConfig?.originalPrice || PRICING.COMPLETE_BOOK.originalPrice;

  // Active Order Modal State
  const [selectedProduct, setSelectedProduct] = useState<OrderProductInfo | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Product Sample Images Modal (Enlarged View for All Product Boxes)
  const [activeSampleModal, setActiveSampleModal] = useState<{
    title: string;
    slug: string;
    index: number;
  } | null>(null);

  const handleOpenProductSample = (title: string, slug: string, index: number = 0) => {
    setActiveSampleModal({ title, slug, index });
  };

  const topicRefs = useRef<{ [slug: string]: HTMLDivElement | null }>({});

  // Auto-scroll if target topic param is passed
  useEffect(() => {
    if (targetTopicParam && selectedOption === "TOPIC_WISE") {
      const slugLower = targetTopicParam.toLowerCase();
      const matched = categories.find(
        (c) => c.slug.toLowerCase() === slugLower || (slugLower === "sorting" && c.slug.includes("sorting"))
      );

      if (matched) {
        const el = topicRefs.current[matched.slug];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [targetTopicParam, selectedOption, categories]);

  const handleOpenBookOrder = () => {
    if (!selectedLanguage) {
      setLanguageError("Please select a programming language (C, C++, Java, or Python) before proceeding with checkout.");
      return;
    }
    setLanguageError(null);
    openCheckout({
      productType: "COMPLETE_BOOK",
      slug: "full-dsa-book",
      title: `Full DSA Book – ${selectedLanguage} (All 20 Sections, ~500 Pages)`,
      description: `Physical spiral-bound printed DSA book containing computer-written ${selectedLanguage} solutions with Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity across all 20 DSA sections (~500 pages) delivered to your doorstep.`,
      language: selectedLanguage,
      price: bookPrice,
      originalPrice: bookOriginalPrice,
      pages: 500,
      sections: 20,
    });
  };

  const handleOpenTopicOrder = (cat: CategoryCardItem) => {
    const selectedLang = topicLanguages[cat.id];
    if (!selectedLang) {
      setTopicErrors((prev) => ({
        ...prev,
        [cat.id]: "Please select a language before clicking Order Now.",
      }));
      return;
    }
    setTopicErrors((prev) => {
      const next = { ...prev };
      delete next[cat.id];
      return next;
    });

    openCheckout({
      productType: "TOPIC",
      slug: cat.slug,
      categoryId: cat.id,
      title: `${cat.title} (${selectedLang}) – Book`,
      description: `Physical printed book for ${cat.title} featuring computer-written ${selectedLang} solutions with Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity delivered to your doorstep.`,
      price: getTopicPrice(cat),
      language: selectedLang,
    });
  };

  const handleOpenCSOrder = (book: { title: string; slug: string; price: number }) => {
    openCheckout({
      productType: "CS_FUNDAMENTAL",
      slug: book.slug,
      title: book.title,
      description: `Physical printed notes for ${book.title} delivered to your doorstep.`,
      price: book.price,
    });
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-red selection:text-white">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* ========================================================================= */}
        {/* SCENARIO 1: INITIAL PURCHASE PAGE — SHOW FIRST & SECOND ROWS             */}
        {/* ========================================================================= */}
        {selectedOption === null && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Clean Minimal Header */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Purchase Affordable Books
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed">
                Prepare smarter with BeeNext. Our books contain only the concepts and solutions that matter for technical interviews. No unnecessary content — just the knowledge you need to prepare effectively and confidently.
              </p>
            </div>

            {/* First Row – DSA Books (2 equal-width boxes side by side in one horizontal row) */}
            <div className="max-w-4xl lg:max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Box 1: Topic-Wise Book */}
              <div className="w-full rounded-2xl border border-brand-border bg-brand-card p-4 sm:p-5 text-left flex flex-col justify-between shadow-card space-y-3.5 hover:border-neutral-700 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red inline-block">
                      Option 1
                    </span>
                    <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-400">
                      Starting at ₹81
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-extrabold text-white">
                    Topic-Wise Book
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-1" title="Browse all 20 DSA topics and order printed notes with computer-written Java solutions. Every problem includes Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity.">
                    Browse all 20 DSA topics and order printed notes with computer-written solutions. Every problem includes Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity.
                  </p>
                </div>

                {/* Sample Images (3 slots with functional navigation arrows) */}
                <ProductSampleCarousel
                  title="Topic-Wise Book"
                  slug="topic-wise"
                  heightClass="aspect-[16/11] w-full"
                  onEnlarge={(idx) => handleOpenProductSample("Topic-Wise Book", "topic-wise", idx)}
                />

                <div className="w-full pt-3 mt-1 border-t border-brand-border/60 flex items-center justify-between gap-1.5 text-xs font-mono">
                  <SoldCountBadge count={`Sold: ${topicSoldCount} units`} size="md" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedOption("TOPIC_WISE")}
                      className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-600 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                      title="Add to Cart"
                      aria-label="Add to Cart"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOption("TOPIC_WISE")}
                      aria-label="Explore Topic-Wise Book topics and options"
                      className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full bg-brand-red/15 border border-brand-red/40 flex items-center gap-1.5 text-white font-mono text-[11px] sm:text-xs font-bold shadow-sm hover:bg-brand-red hover:border-brand-red hover:shadow-brand transition-all duration-200 shrink-0 active:scale-95 cursor-pointer"
                    >
                      <span>Order Now</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Box 2: Full DSA Book */}
              <div className="w-full rounded-2xl border border-brand-border bg-brand-card p-4 sm:p-5 text-left flex flex-col justify-between shadow-card space-y-3.5 hover:border-neutral-700 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red inline-block">
                      Option 2
                    </span>
                    <span className="font-mono text-sm sm:text-lg font-extrabold text-emerald-400">
                      ₹1,499
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-extrabold text-white">
                    Full DSA Book
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-1" title="Complete physical collection covering all 20 DSA sections (~500 pages) available in C, C++, Java, and Python with computer-written solutions including Brute Force, Optimal, Time and Space Complexities for every problem.">
                    Complete physical collection covering all 20 DSA sections (~500 pages) available in C, C++, Java, and Python with computer-written solutions including Brute Force, Optimal, Time and Space Complexities for every problem.
                  </p>
                </div>

                {/* Sample Images (3 slots with functional navigation arrows) */}
                <ProductSampleCarousel
                  title="Full DSA Book"
                  slug="full-dsa-book"
                  heightClass="aspect-[16/11] w-full"
                  onEnlarge={(idx) => handleOpenProductSample("Full DSA Book", "full-dsa-book", idx)}
                />

                <div className="w-full pt-3 mt-1 border-t border-brand-border/60 flex items-center justify-between gap-1.5 text-xs font-mono">
                  <SoldCountBadge count={`Sold: ${fullBookTotalSold} units`} size="md" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAddFullBookToCart("Java", "full-dsa-init")}
                      className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-600 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                      title="Add to Cart"
                      aria-label="Add to Cart"
                    >
                      {addedStatus["full-dsa-init"] ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[2.5]" />
                      ) : (
                        <ShoppingCart className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOption("FULL_BOOK");
                        setLanguageError(null);
                      }}
                      aria-label="View Full DSA Book editions and languages"
                      className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-full bg-brand-red/15 border border-brand-red/40 flex items-center gap-1.5 text-white font-mono text-[11px] sm:text-xs font-bold shadow-sm hover:bg-brand-red hover:border-brand-red hover:shadow-brand transition-all duration-200 shrink-0 active:scale-95 cursor-pointer"
                    >
                      <span>Order Now</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-neutral-800 my-6" />

            {/* Second Row – CS Fundamentals */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-red" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  CS Fundamentals
                </h3>
              </div>

              {/* 4 Boxes in one horizontal row on desktop using same layout style as Full DSA and Topic-Wise Book */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                {[
                  {
                    title: "OOPS (16 Pages)",
                    slug: "oops-book",
                    price: 149,
                    description: "Object-Oriented Programming concepts, patterns & design",
                  },
                  {
                    title: "Computer Networks (16 Pages)",
                    slug: "computer-networks",
                    price: 149,
                    description: "TCP/IP, OSI layers, routing, protocols & architectures",
                  },
                  {
                    title: "DBMS (10 Pages)",
                    slug: "dbms",
                    price: 119,
                    description: "Database management, SQL, normalization & indexing",
                  },
                  {
                    title: "Operating Systems (12 Pages)",
                    slug: "operating-systems",
                    price: 159,
                    description: "Process management, memory, concurrency & storage",
                  },
                ].map((book) => (
                  <div
                    key={book.title}
                    className="w-full rounded-2xl border border-brand-border bg-brand-card p-3.5 sm:p-4 text-left flex flex-col justify-between shadow-card space-y-3.5 hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red inline-block">
                          Book
                        </span>
                        <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-400">
                          ₹{book.price}
                        </span>
                      </div>
                      <h4 className="text-[12px] sm:text-[12.5px] xl:text-[13.5px] 2xl:text-sm font-extrabold text-white tracking-tight whitespace-nowrap" title={book.title}>
                        {book.title}
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-1" title={book.description}>
                        {book.description}
                      </p>
                    </div>

                    {/* Sample Images (One image at a time slider with navigation arrows) */}
                    <ProductSampleCarousel
                      title={book.title}
                      slug={book.slug}
                      heightClass="aspect-[16/11] w-full"
                      onEnlarge={(idx) => handleOpenProductSample(book.title, book.slug, idx)}
                    />

                    {/* Bottom bar with Sold count and Action buttons */}
                    <div className="w-full pt-3 mt-1 border-t border-brand-border/60 flex items-center justify-between gap-1.5 text-xs font-mono">
                      <SoldCountBadge count={`${csSoldCount[book.slug] ?? 0} Units Sold`} size="sm" showIcon={false} />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAddCSToCart(book)}
                          className="h-8 w-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-600 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                          title="Add to Cart"
                          aria-label={`Add ${book.title} to Cart`}
                        >
                          {addedStatus[book.slug] ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[2.5]" />
                          ) : (
                            <ShoppingCart className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCSOrder(book)}
                          className="h-8 px-2.5 sm:px-3 rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-center font-mono text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-neutral-800 my-6" />

            {/* Third Row – Databases */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-brand-red" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Databases
                </h3>
              </div>

              {/* 2 Boxes side by side on desktop, matching size and layout of CS Fundamentals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Learn SQL",
                    slug: "learn-sql",
                    price: 119,
                    description: "Complete SQL guide, queries, joins, window functions & indexing",
                  },
                  {
                    title: "Learn MongoDB",
                    slug: "learn-mongodb",
                    price: 119,
                    description: "NoSQL MongoDB, schema design, aggregation pipeline & indexing",
                  },
                ].map((db) => (
                  <div
                    key={db.title}
                    className="w-full rounded-2xl border border-brand-border bg-brand-card p-4 sm:p-4.5 text-left flex flex-col justify-between shadow-card space-y-3.5 hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red inline-block">
                          Book
                        </span>
                        <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-400">
                          ₹{db.price}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-white line-clamp-1">
                        {db.title}
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-1" title={db.description}>
                        {db.description}
                      </p>
                    </div>

                    {/* Sample Images (slider design matching Full DSA Book) */}
                    <ProductSampleCarousel
                      title={db.title}
                      slug={db.slug}
                      heightClass="aspect-[16/11] w-full"
                      onEnlarge={(idx) => handleOpenProductSample(db.title, db.slug, idx)}
                    />

                    {/* Bottom bar with Sold count and Action buttons */}
                    <div className="w-full pt-3 mt-1 border-t border-brand-border/60 flex items-center justify-between gap-1.5 text-xs font-mono">
                      <SoldCountBadge count={`${dbSoldCount[db.slug] ?? 0} Units Sold`} size="sm" showIcon={false} />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAddCSToCart(db)}
                          className="h-8 w-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-600 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                          title="Add to Cart"
                          aria-label={`Add ${db.title} to Cart`}
                        >
                          {addedStatus[db.slug] ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[2.5]" />
                          ) : (
                            <ShoppingCart className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCSOrder(db)}
                          className="h-8 px-2.5 sm:px-3 rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-center font-mono text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-neutral-800 my-6" />

            {/* Fourth Row – HR Interview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-red" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  HR Interview
                </h3>
              </div>

              {/* HR Interview Product Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                <div className="w-full rounded-2xl border border-brand-border bg-brand-card p-3.5 sm:p-4 text-left flex flex-col justify-between shadow-card space-y-3.5 hover:border-neutral-700 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red inline-block">
                        Book
                      </span>
                      <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-400">
                        ₹149
                      </span>
                    </div>
                    <h4 className="text-[12px] sm:text-[12.5px] xl:text-[13.5px] 2xl:text-sm font-extrabold text-white tracking-tight whitespace-nowrap" title="HR Interview (10 Pages)">
                      HR Interview (10 Pages)
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-1" title="Behavioral questions, situational answers & interview strategies">
                      Behavioral questions, situational answers & interview strategies
                    </p>
                  </div>

                  {/* Sample Images (One image at a time slider with navigation arrows) */}
                  <ProductSampleCarousel
                    title="HR Interview (10 Pages)"
                    slug="hr-interview"
                    heightClass="aspect-[16/11] w-full"
                    onEnlarge={(idx) => handleOpenProductSample("HR Interview (10 Pages)", "hr-interview", idx)}
                  />

                  {/* Bottom bar with Sold count and Action buttons */}
                  <div className="w-full pt-3 mt-1 border-t border-brand-border/60 flex items-center justify-between gap-1.5 text-xs font-mono">
                    <SoldCountBadge count="43 Units Sold" size="sm" showIcon={false} />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddCSToCart({
                          title: "HR Interview (10 Pages)",
                          slug: "hr-interview",
                          price: 149,
                        })}
                        className="h-8 w-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-600 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                        title="Add to Cart"
                        aria-label="Add HR Interview (10 Pages) to Cart"
                      >
                        {addedStatus["hr-interview"] ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[2.5]" />
                        ) : (
                          <ShoppingCart className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCSOrder({
                          title: "HR Interview (10 Pages)",
                          slug: "hr-interview",
                          price: 149,
                        })}
                        className="h-8 px-2.5 sm:px-3 rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-center font-mono text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-neutral-800 my-6" />

            {/* Fifth Row – Upcoming Books */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-red" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Upcoming Books
                </h3>
              </div>

              {/* 4 Book Boxes in one row on desktop, matching CS Fundamentals layout, styling & dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                {[
                  {
                    title: "JavaScript",
                    tag: "JS",
                    description: "Core concepts, closures, async JS, event loop & DOM",
                    subtitle: "Modern ES6+ & Core Architecture",
                    bullet: "Closures • Event Loop • Async/Await",
                  },
                  {
                    title: "React",
                    tag: "REACT",
                    description: "Component lifecycle, hooks, state management & SSR",
                    subtitle: "Hooks, Virtual DOM & Performance",
                    bullet: "Custom Hooks • State • Reconciliation",
                  },
                  {
                    title: "Spring Boot",
                    tag: "SPRING",
                    description: "REST APIs, dependency injection, microservices & security",
                    subtitle: "Enterprise Java & Microservices",
                    bullet: "IoC & DI • Spring Security • JPA/Hibernate",
                  },
                  {
                    title: "System Design",
                    tag: "SYSTEM",
                    description: "High-level design, scalability, caching & distributed systems",
                    subtitle: "Scalable Architectures & Distributed Systems",
                    bullet: "Load Balancing • Caching • Microservices",
                  },
                ].map((book) => (
                  <div
                    key={book.title}
                    className="w-full rounded-2xl border border-brand-border bg-brand-card p-3.5 sm:p-4 text-left flex flex-col justify-between shadow-card space-y-3.5 hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red inline-block">
                          Book
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-extrabold text-amber-400">
                          Coming Soon
                        </span>
                      </div>
                      <h4
                        className="text-[12px] sm:text-[12.5px] xl:text-[13.5px] 2xl:text-sm font-extrabold text-white tracking-tight whitespace-nowrap"
                        title={book.title}
                      >
                        {book.title}
                      </h4>
                      <p
                        className="text-xs text-neutral-400 leading-relaxed line-clamp-1"
                        title={book.description}
                      >
                        {book.description}
                      </p>
                    </div>

                    {/* Preview Cover Card matching exact dimensions and style of CS Fundamentals */}
                    <div className="w-full space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-neutral-400 text-[11px]">
                        <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                          <BookOpen className="h-3 w-3 text-brand-red" />
                          <span>Book Overview</span>
                        </span>
                        <span className="text-neutral-500 font-mono text-[10px]">
                          Preview
                        </span>
                      </div>

                      <div className="relative w-full aspect-[16/11] rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex flex-col items-center justify-center p-3 text-center select-none group hover:border-neutral-700 transition-colors shadow-inner">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red">
                            {book.tag}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            Upcoming Edition
                          </span>
                        </div>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-brand-red my-1 group-hover:border-neutral-700 transition-colors">
                          <BookOpen className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-sans text-xs font-bold text-white line-clamp-1">
                          {book.title}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 mt-0.5 line-clamp-1">
                          {book.subtitle}
                        </span>
                        <span className="mt-1 px-2 py-0.5 rounded text-[9px] font-mono bg-neutral-900/80 border border-neutral-800/80 text-amber-400/90 line-clamp-1 max-w-[85%] font-medium">
                          {book.bullet}
                        </span>
                      </div>
                    </div>

                    {/* Bottom bar with status - No Add to Cart, Order Now, or payment option */}
                    <div className="w-full pt-3 mt-1 border-t border-brand-border/60 flex items-center justify-between gap-1.5 text-xs font-mono">
                      <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span>In Preparation</span>
                      </span>
                      <div className="h-8 px-3 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400 font-mono text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 select-none shrink-0 shadow-sm">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span>Coming Soon</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-neutral-800 my-6" />

            {/* Sixth Row – Language */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-brand-red" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Language
                </h3>
              </div>

              {/* 4 Language Boxes in one row on desktop, using identical design to Upcoming Books */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                {[
                  {
                    title: "C",
                    tag: "C",
                    description: "Pointers, memory management, data structures & standard library",
                    subtitle: "Standard C Language Edition",
                    bullet: "Pointers • Structs • Memory Allocation",
                  },
                  {
                    title: "C++",
                    tag: "C++",
                    description: "Modern C++, STL containers, algorithms, templates & OOP",
                    subtitle: "Modern C++ & STL Edition",
                    bullet: "STL Vectors • Maps • Smart Pointers",
                  },
                  {
                    title: "Java",
                    tag: "JAVA",
                    description: "Core Java, Collections Framework, multithreading & streams",
                    subtitle: "Object-Oriented Java Edition",
                    bullet: "Collections • Concurrency • Streams API",
                  },
                  {
                    title: "Python",
                    tag: "PYTHON",
                    description: "Pythonic DSA, built-in data structures, OOP & clean syntax",
                    subtitle: "Pythonic & Clean Syntax Edition",
                    bullet: "Lists & Dicts • Generators • Complexity",
                  },
                ].map((book) => (
                  <div
                    key={book.title}
                    className="w-full rounded-2xl border border-brand-border bg-brand-card p-3.5 sm:p-4 text-left flex flex-col justify-between shadow-card space-y-3.5 hover:border-neutral-700 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red inline-block">
                          Book
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-extrabold text-amber-400">
                          Coming Soon
                        </span>
                      </div>
                      <h4
                        className="text-[12px] sm:text-[12.5px] xl:text-[13.5px] 2xl:text-sm font-extrabold text-white tracking-tight whitespace-nowrap"
                        title={book.title}
                      >
                        {book.title}
                      </h4>
                      <p
                        className="text-xs text-neutral-400 leading-relaxed line-clamp-1"
                        title={book.description}
                      >
                        {book.description}
                      </p>
                    </div>

                    {/* Preview Cover Card matching exact dimensions and style of Upcoming Books */}
                    <div className="w-full space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-neutral-400 text-[11px]">
                        <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                          <BookOpen className="h-3 w-3 text-brand-red" />
                          <span>Book Overview</span>
                        </span>
                        <span className="text-neutral-500 font-mono text-[10px]">
                          Preview
                        </span>
                      </div>

                      <div className="relative w-full aspect-[16/11] rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex flex-col items-center justify-center p-3 text-center select-none group hover:border-neutral-700 transition-colors shadow-inner">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red">
                            {book.tag}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            Language Edition
                          </span>
                        </div>
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-brand-red my-1 group-hover:border-neutral-700 transition-colors">
                          <BookOpen className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-sans text-xs font-bold text-white line-clamp-1">
                          {book.title}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 mt-0.5 line-clamp-1">
                          {book.subtitle}
                        </span>
                        <span className="mt-1 px-2 py-0.5 rounded text-[9px] font-mono bg-neutral-900/80 border border-neutral-800/80 text-amber-400/90 line-clamp-1 max-w-[85%] font-medium">
                          {book.bullet}
                        </span>
                      </div>
                    </div>

                    {/* Bottom bar with status - No Add to Cart, Order Now, or payment option */}
                    <div className="w-full pt-3 mt-1 border-t border-brand-border/60 flex items-center justify-between gap-1.5 text-xs font-mono">
                      <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span>In Preparation</span>
                      </span>
                      <div className="h-8 px-3 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400 font-mono text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 select-none shrink-0 shadow-sm">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        <span>Coming Soon</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO 2: TOPIC-WISE BOOK SELECTED                                      */}
        {/* ========================================================================= */}
        {selectedOption === "TOPIC_WISE" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation Bar: Back & Option Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
              <button
                type="button"
                onClick={() => setSelectedOption(null)}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Options</span>
              </button>

              <div className="inline-flex rounded-xl bg-neutral-950 p-1 border border-brand-border text-xs font-mono">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-brand-red text-white font-bold transition-all shadow-sm"
                >
                  Topic-Wise Book
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOption("FULL_BOOK");
                    setLanguageError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                  Buy Full DSA Book
                </button>
              </div>
            </div>

            {/* Section Header */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Topic-Wise Book
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-mono">
                Select an individual topic to view sample image or order sheets with computer-written solutions. Every problem includes Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity.
              </p>
            </div>

            {/* 20 Topics: SINGLE HORIZONTAL LINE PER TOPIC (ONE ROW PER TOPIC, NO GRID) */}
            <div className="space-y-2.5">
              {categories.map((cat, idx) => {
                const topicPrice = getTopicPrice(cat);
                const orderNum = String(cat.order || idx + 1).padStart(2, "0");
                const isTarget =
                  Boolean(targetTopicParam) &&
                  (cat.slug.toLowerCase() === targetTopicParam.toLowerCase() ||
                    (targetTopicParam.toLowerCase() === "sorting" && cat.slug.includes("sorting")));

                return (
                  <div
                    key={cat.id}
                    ref={(el) => {
                      topicRefs.current[cat.slug] = el;
                    }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border bg-brand-card transition-all gap-3 ${isTarget
                      ? "border-brand-red ring-1 ring-brand-red bg-brand-card/95"
                      : "border-brand-border hover:border-neutral-700"
                      }`}
                  >
                    {/* Left: Topic Name in single line */}
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <span className="font-mono text-xs text-neutral-400 font-bold w-6 text-center shrink-0">
                        {orderNum}.
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                        {cat.title}
                      </h3>
                    </div>

                    {/* Right: 2. Price -> 3. Select Language Dropdown -> 4. Sample Image -> 5. Order Now Button in single line */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 sm:gap-2.5 flex-shrink-0">
                      {/* Price */}
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-emerald-400 px-2.5 py-1.5 rounded-lg bg-brand-black border border-brand-border">
                        ₹{topicPrice}
                      </span>

                      {/* Select Language Dropdown */}
                      <div className="relative">
                        <select
                          value={topicLanguages[cat.id] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTopicLanguages((prev) => ({ ...prev, [cat.id]: val }));
                            if (topicErrors[cat.id]) {
                              setTopicErrors((prev) => {
                                const next = { ...prev };
                                delete next[cat.id];
                                return next;
                              });
                            }
                          }}
                          aria-label={`Select Language for ${cat.title}`}
                          className={`h-[34px] px-2.5 py-1 rounded-lg text-xs font-mono font-medium border bg-brand-black cursor-pointer transition-all focus:outline-none focus:border-brand-red ${topicErrors[cat.id]
                            ? "border-red-500 text-red-400 ring-1 ring-red-500/50"
                            : topicLanguages[cat.id]
                              ? "border-brand-red text-white font-bold"
                              : "border-brand-border text-neutral-400 hover:border-neutral-600"
                            }`}
                        >
                          <option value="" disabled className="bg-neutral-950 text-neutral-500">
                            Select Language
                          </option>
                          <option value="C" className="bg-neutral-950 text-white">
                            C
                          </option>
                          <option value="C++" className="bg-neutral-950 text-white">
                            C++
                          </option>
                          <option value="Java" className="bg-neutral-950 text-white">
                            Java
                          </option>
                          <option value="Python" className="bg-neutral-950 text-white">
                            Python
                          </option>
                        </select>
                      </div>



                      {/* Add to Cart Option */}
                      <button
                        type="button"
                        onClick={() => handleAddTopicToCart(cat)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 h-[34px] rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 hover:border-neutral-600 text-xs font-mono font-bold shadow-sm transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
                        title={`Add ${cat.title} to Cart`}
                      >
                        {addedStatus[`topic-${cat.id}`] ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3.5 w-3.5 text-neutral-400" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      {/* Order Now Option */}
                      <button
                        type="button"
                        onClick={() => handleOpenTopicOrder(cat)}
                        className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 h-[34px] rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold shadow-sm transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
                        title={`Order ${cat.title} printed book`}
                      >
                        <Package className="h-3.5 w-3.5" />
                        <span>Order Now</span>
                      </button>
                    </div>

                    {topicErrors[cat.id] && (
                      <div className="w-full text-right text-[11px] font-mono text-red-400 flex items-center justify-end gap-1.5 pt-0.5">
                        <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                        <span>{topicErrors[cat.id]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO 3: FULL DSA BOOK SELECTED                                        */}
        {/* ========================================================================= */}
        {selectedOption === "FULL_BOOK" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation Bar: Back & Option Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedOption(null);
                  setLanguageError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Options</span>
              </button>

              <div className="inline-flex rounded-xl bg-neutral-950 p-1 border border-brand-border text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedOption("TOPIC_WISE")}
                  className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                  Topic-Wise Book
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-brand-red text-white font-bold transition-all shadow-sm"
                >
                  Buy Full DSA Book
                </button>
              </div>
            </div>

            {/* Header info (not wrapping the cards) */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-red/10 border border-brand-red/30 text-brand-red">
                  Full Collection
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-700 text-emerald-400 flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span>Free Doorstep Delivery Across India</span>
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-700 text-neutral-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>All 20 DSA Sections (~500 Pages)</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Buy Full DSA Book
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-4xl">
                Choose your preferred programming language edition. Complete physical book covering the entire Striver A2Z DSA sheet with clean computer-written solutions including Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity across all 20 DSA sections (~500 pages).
              </p>
            </div>

            {/* Four Independent Language Cards (one horizontal row on desktop, responsive on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {[
                {
                  id: "C" as const,
                  name: "C",
                  subtitle: "Standard C Edition",
                  description: "Complete DSA solutions in procedural C with clean algorithms, pointer logic, and memory structures.",
                  badge: "C Edition",
                  badgeClass: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                  soldCount: "Sold: 5 units",
                  rating: "⭐ 4.5/5",
                },
                {
                  id: "C++" as const,
                  name: "C++",
                  subtitle: "Modern C++ & STL",
                  description: "Modern C++ solutions utilizing vectors, unordered_maps, sets, custom comparators, and STL algorithms.",
                  badge: "C++ Edition",
                  badgeClass: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
                  soldCount: "Sold: 20 units",
                  rating: "⭐ 4.7/5",
                },
                {
                  id: "Java" as const,
                  name: "Java",
                  subtitle: "Object-Oriented Java",
                  description: "Idiomatic Java solutions featuring Collections Framework, object-oriented structure, and optimal algorithms.",
                  badge: "Java Edition",
                  badgeClass: "bg-brand-red/10 border-brand-red/30 text-brand-red",
                  soldCount: "Sold: 25 units",
                  rating: "⭐ 4.7/5",
                },
                {
                  id: "Python" as const,
                  name: "Python",
                  subtitle: "Pythonic & Clean",
                  description: "Clean Pythonic solutions leveraging list comprehensions, heaps, dictionaries, and expressive algorithms.",
                  badge: "Python Edition",
                  badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                  soldCount: "Sold: 5 units",
                  rating: "⭐ 4.5/5",
                },
              ].map((langItem) => {
                const isSelected = selectedLanguage === langItem.id;

                return (
                  <div
                    key={langItem.id}
                    onClick={() => {
                      setSelectedLanguage(langItem.id);
                      setLanguageError(null);
                    }}
                    className={`rounded-xl p-3.5 sm:p-4 transition-all duration-200 flex flex-col justify-between shadow-card relative cursor-pointer ${isSelected
                      ? "bg-brand-card border-2 border-brand-red ring-1 ring-brand-red/50 shadow-brand-red/10 scale-[1.01]"
                      : "bg-brand-card border border-brand-border hover:border-neutral-700 hover:bg-neutral-900/60"
                      }`}
                  >
                    {/* Top Section */}
                    <div className="space-y-2">
                      {/* Badge, Title & Selection Indicator */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                              {langItem.name}
                            </h2>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${langItem.badgeClass}`}>
                              {langItem.badge}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400 block leading-tight">
                            {langItem.subtitle}
                          </span>
                        </div>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all shrink-0 mt-0.5 ${isSelected
                            ? "border-brand-red bg-brand-red text-white"
                            : "border-neutral-700 bg-neutral-900"
                            }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-neutral-400 leading-snug line-clamp-2">
                        {langItem.description}
                      </p>

                      {/* Rating & Sold Count */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-brand-border/60 text-xs font-mono">
                        <div className="text-[11px] font-bold text-amber-400">
                          {langItem.rating}
                        </div>
                        <SoldCountBadge count={langItem.soldCount} size="sm" />
                      </div>

                      {/* Price: ₹1,499 */}
                      <div className="flex items-center justify-between text-xs font-mono pt-0.5">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-bold">
                          Price
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-lg font-black text-emerald-400">
                            ₹1,499
                          </span>
                          <span className="text-[10px] text-neutral-500 line-through">
                            ₹2,999
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Action Buttons (Add to Cart + Order Now) */}
                    <div className="pt-2.5 mt-2 border-t border-brand-border/60 font-mono grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddFullBookToCart(langItem.id);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 hover:border-neutral-600 active:scale-95 cursor-pointer shadow-sm"
                        title={`Add Full DSA Book (${langItem.name}) to Cart`}
                      >
                        {addedStatus[`full-book-${langItem.id}`] ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3.5 w-3.5 text-neutral-400" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLanguage(langItem.id);
                          setLanguageError(null);
                          openCheckout({
                            productType: "COMPLETE_BOOK",
                            slug: "full-dsa-book",
                            title: `Full DSA Book – ${langItem.name} (All 20 Sections, ~500 Pages)`,
                            description: `Physical spiral-bound printed DSA book containing computer-written ${langItem.name} solutions with Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity across all 20 DSA sections (~500 pages) delivered to your doorstep.`,
                            language: langItem.id,
                            price: bookPrice,
                            originalPrice: bookOriginalPrice,
                            pages: 500,
                            sections: 20,
                            image: getBookImage("full-dsa-book", "COMPLETE_BOOK"),
                          });
                        }}
                        className={`w-full py-1.5 px-2 rounded-lg font-bold text-xs font-mono shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${isSelected
                          ? "bg-brand-red hover:bg-brand-redHover text-white shadow-brand"
                          : "bg-neutral-900 hover:bg-brand-red text-neutral-200 hover:text-white border border-neutral-700 hover:border-brand-red"
                          }`}
                      >
                        <Package className="h-3.5 w-3.5" />
                        <span>Order Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification for Add to Cart */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900/95 border border-brand-red/50 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="text-xs font-mono">
            <span className="font-bold text-white block">{toastMessage}</span>
            <span className="text-neutral-400 text-[11px]">Cart updated successfully</span>
          </div>
          <button
            type="button"
            onClick={openCart}
            className="ml-2 px-3 py-1.5 rounded-lg bg-brand-red hover:bg-brand-redHover text-white text-xs font-mono font-bold transition shadow-sm cursor-pointer active:scale-95"
          >
            View Cart
          </button>
        </div>
      )}



      {/* Product Box Sample Images Modal (Enlarged View for All Product Boxes) */}
      {activeSampleModal && (
        <ProductSampleModal
          isOpen={true}
          onClose={() => setActiveSampleModal(null)}
          title={activeSampleModal.title}
          slug={activeSampleModal.slug}
          initialIndex={activeSampleModal.index}
        />
      )}

      {/* Physical Delivery Address & Payment Modal */}
      {selectedProduct && (
        <PrintedOrderModal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          currentUser={user}
        />
      )}
    </div>
  );
}
