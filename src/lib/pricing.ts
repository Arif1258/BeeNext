/**
 * Centralized Pricing Configuration for BeeNext
 *
 * Physical printed DSA books:
 * - Complete Book (all 20 sections, ~500 pages): ₹1,499
 * - Topic-wise Books (individual topics): ₹81 - ₹241
 */

export const TOPIC_BOOK_PRICES: Record<string, number> = {
  "beginner-problems": 241,
  "sorting": 89,
  "arrays": 139,
  "hashing": 87,
  "binary-search": 139,
  "strings-basic-and-medium": 89,
  "recursion": 119,
  "linked-list": 173,
  "bit-manipulation": 103,
  "greedy-algorithms": 103,
  "sliding-window-2-pointer": 101,
  "stack-queues": 137,
  "binary-trees": 139,
  "binary-search-trees": 105,
  "heaps": 115,
  "graphs": 167,
  "dynamic-programming": 181,
  "tries": 89,
  "strings-advanced-algo": 93,
  "maths": 81,
};

export const PRICING = {
  COMPLETE_BOOK: {
    id: "complete-book",
    title: "Complete DSA Notes Book",
    subtitle: "All 20 DSA Sections • ~500 Pages • Computer-Written Java Solutions",
    description:
      "Physical printed DSA notes book containing computer-written Java solutions with Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity across all 20 DSA sections (~500 pages) delivered directly to your doorstep.",
    price: 1499,
    originalPrice: 2999,
    sections: 20,
    estimatedPages: 500,
    deliveryCharge: 0,
    isFreeShipping: true,
  },
  TOPIC_SHEETS: {
    startingPrice: 81,
    defaultPrice: 89,
    description:
      "Physical printed notes sheets for this topic featuring computer-written Java solutions with Brute Force Solution, Optimal Solution, Time Complexity, and Space Complexity delivered directly to your doorstep.",
    deliveryCharge: 0,
    isFreeShipping: true,
  },
  CURRENCY: "INR",
  CURRENCY_SYMBOL: "₹",
} as const;

export function getTopicPrice(category?: { slug?: string; price?: number | null } | null): number {
  if (category?.slug && TOPIC_BOOK_PRICES[category.slug]) {
    return TOPIC_BOOK_PRICES[category.slug];
  }
  return category?.price ?? PRICING.TOPIC_SHEETS.defaultPrice;
}

export function getBookPrice(config?: { price?: number | null } | null): number {
  return config?.price ?? PRICING.COMPLETE_BOOK.price;
}

export const CS_FUNDAMENTAL_PRICES: Record<
  string,
  { slug: string; title: string; price: number; originalPrice: number; subtitle: string }
> = {
  "oops": {
    slug: "oops",
    title: "OOPs Book",
    price: 149,
    originalPrice: 299,
    subtitle: "Object-Oriented Programming concepts, patterns & design",
  },
  "computer-networks": {
    slug: "computer-networks",
    title: "Computer Networks (CN)",
    price: 149,
    originalPrice: 299,
    subtitle: "TCP/IP, OSI layers, routing, protocols & architectures",
  },
  "operating-systems": {
    slug: "operating-systems",
    title: "Operating Systems (OS)",
    price: 159,
    originalPrice: 299,
    subtitle: "Process management, memory, concurrency & storage",
  },
  "dbms": {
    slug: "dbms",
    title: "DBMS",
    price: 119,
    originalPrice: 249,
    subtitle: "Database management, SQL, normalization & indexing",
  },
  "learn-sql": {
    slug: "learn-sql",
    title: "Learn SQL",
    price: 119,
    originalPrice: 249,
    subtitle: "Complete SQL guide, queries, joins, window functions & indexing",
  },
  "learn-mongodb": {
    slug: "learn-mongodb",
    title: "Learn MongoDB",
    price: 119,
    originalPrice: 249,
    subtitle: "NoSQL MongoDB, schema design, aggregation pipeline & indexing",
  },
};

export function getCsFundamentalPrice(
  identifier?: string | null
): { slug: string; title: string; price: number; originalPrice: number; subtitle: string } | null {
  if (!identifier) return null;
  const lower = identifier.toLowerCase().trim();
  if (lower.includes("oops") || lower === "oop" || lower.includes("oops-book")) {
    return CS_FUNDAMENTAL_PRICES["oops"];
  }
  if (lower.includes("network") || lower === "cn" || lower.includes("computer-networks")) {
    return CS_FUNDAMENTAL_PRICES["computer-networks"];
  }
  if (lower.includes("operating") || lower === "os" || lower.includes("operating-systems")) {
    return CS_FUNDAMENTAL_PRICES["operating-systems"];
  }
  if (lower.includes("dbms") || lower === "database") {
    return CS_FUNDAMENTAL_PRICES["dbms"];
  }
  if (lower.includes("sql") || lower.includes("learn-sql")) {
    return CS_FUNDAMENTAL_PRICES["learn-sql"];
  }
  if (lower.includes("mongo") || lower.includes("mongodb") || lower.includes("learn-mongodb")) {
    return CS_FUNDAMENTAL_PRICES["learn-mongodb"];
  }
  return null;
}

