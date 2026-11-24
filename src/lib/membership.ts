export const MEMBERSHIP_PLANS = {
  MONTHLY: {
    id: "MONTHLY",
    name: "Monthly Plan",
    price: 79,
    durationDays: 30,
    tagline: "Ideal for short-term interview preparation",
    features: [
      "Access to all 495 Striver DSA problems",
      "Interactive Monaco Coding Playground",
      "Instant code execution (Java, C++, Python, JS)",
      "Submit against hidden test cases & verdicts",
      "Full access to Brute Force & Optimal code",
      "Full access to 5 groups of Premium PDF notes",
      "Time & Space complexity breakdowns",
      "DSA completion certificate eligibility (at ≥85%)",
    ],
  },
  YEARLY: {
    id: "YEARLY",
    name: "Yearly Plan",
    price: 599,
    durationDays: 365,
    tagline: "Best value — complete roadmap for a full year",
    discount: "Save 37%",
    features: [
      "Everything in Monthly Plan",
      "365 days of uninterrupted access",
      "Lowest price per month (≈ ₹50/mo equivalent)",
    ],
  },
} as const;

export type PlanType = keyof typeof MEMBERSHIP_PLANS;

export function isUserActivePlus(
  user:
    | {
        membershipType?: string | null;
        membershipExpiresAt?: Date | string | null;
      }
    | null
    | undefined
): boolean {
  if (!user || user.membershipType !== "PLUS") return false;
  if (!user.membershipExpiresAt) return true;
  return new Date(user.membershipExpiresAt).getTime() > Date.now();
}

export function calculateNewExpiry(
  currentExpiresAt: Date | string | null | undefined,
  plan: PlanType
): Date {
  const durationDays =
    MEMBERSHIP_PLANS[plan]?.durationDays || (plan === "MONTHLY" ? 30 : 365);
  const now = Date.now();

  let baseTime = now;
  if (currentExpiresAt) {
    const existingTime = new Date(currentExpiresAt).getTime();
    if (existingTime > now) {
      baseTime = existingTime;
    }
  }

  return new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);
}
