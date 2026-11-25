import { isUserActivePlus, determineUserCurrentPlan } from "../src/lib/membership";
import prismaModule from "../src/lib/prisma";
const prisma = prismaModule.default || prismaModule.prisma || prismaModule;

async function runTests() {
  console.log("=================================================");
  console.log("   BeeNext Current Membership Plan Test Suite");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const now = Date.now();
  const futureExpiry = new Date(now + 30 * 24 * 60 * 60 * 1000); // +30 days
  const pastExpiry = new Date(now - 2 * 24 * 60 * 60 * 1000);   // -2 days

  // 1. Logged-out user
  console.log("--- 1. Logged-out User ---");
  const loggedOutPlan = determineUserCurrentPlan(null);
  assert(loggedOutPlan === null, "Logged-out user resolves to null (no current plan badge)");

  const undefinedUserPlan = determineUserCurrentPlan(undefined);
  assert(undefinedUserPlan === null, "Undefined user resolves to null");

  // 2. Normal Membership
  console.log("\n--- 2. Normal Membership ---");
  const normalUser = {
    role: "USER",
    membershipType: "NORMAL",
    membershipPlan: null,
    membershipExpiresAt: null,
  };
  assert(determineUserCurrentPlan(normalUser) === "NORMAL", "Normal user resolves to 'NORMAL'");

  // 3. Active Monthly Plus
  console.log("\n--- 3. Active Monthly Plus Membership ---");
  const activeMonthlyUser = {
    role: "USER",
    membershipType: "PLUS",
    membershipPlan: "MONTHLY",
    membershipExpiresAt: futureExpiry,
  };
  assert(isUserActivePlus(activeMonthlyUser) === true, "Active Monthly user has isUserActivePlus: true");
  assert(determineUserCurrentPlan(activeMonthlyUser) === "MONTHLY", "Active Monthly user resolves to 'MONTHLY'");

  // 4. Active Yearly Plus
  console.log("\n--- 4. Active Yearly Plus Membership ---");
  const activeYearlyUser = {
    role: "USER",
    membershipType: "PLUS",
    membershipPlan: "YEARLY",
    membershipExpiresAt: futureExpiry,
  };
  assert(isUserActivePlus(activeYearlyUser) === true, "Active Yearly user has isUserActivePlus: true");
  assert(determineUserCurrentPlan(activeYearlyUser) === "YEARLY", "Active Yearly user resolves to 'YEARLY'");

  // 5. Expired Plus Membership (Treated as Normal)
  console.log("\n--- 5. Expired Plus Membership (Treated as Normal) ---");
  const expiredMonthlyUser = {
    role: "USER",
    membershipType: "PLUS",
    membershipPlan: "MONTHLY",
    membershipExpiresAt: pastExpiry,
  };
  assert(isUserActivePlus(expiredMonthlyUser) === false, "Expired Monthly user has isUserActivePlus: false");
  assert(determineUserCurrentPlan(expiredMonthlyUser) === "NORMAL", "Expired Monthly user resolves to 'NORMAL'");

  const expiredYearlyUser = {
    role: "USER",
    membershipType: "PLUS",
    membershipPlan: "YEARLY",
    membershipExpiresAt: pastExpiry,
  };
  assert(isUserActivePlus(expiredYearlyUser) === false, "Expired Yearly user has isUserActivePlus: false");
  assert(determineUserCurrentPlan(expiredYearlyUser) === "NORMAL", "Expired Yearly user resolves to 'NORMAL'");

  // 6. Real Database Users Verification
  console.log("\n--- 6. Database Verification ---");
  const arifUser = await prisma.user.findUnique({
    where: { email: "arifahmedma490@gmail.com" },
    select: { membershipType: true, membershipPlan: true, membershipExpiresAt: true, role: true },
  });
  if (arifUser) {
    const arifPlan = determineUserCurrentPlan(arifUser);
    assert(arifPlan === "YEARLY", `Active Plus user arifahmedma490@gmail.com resolves to 'YEARLY' (got: ${arifPlan})`);
  }

  const razorpayUser = await prisma.user.findUnique({
    where: { email: "razorpay@gmail.com" },
    select: { membershipType: true, membershipPlan: true, membershipExpiresAt: true, role: true },
  });
  if (razorpayUser) {
    const rzpPlan = determineUserCurrentPlan(razorpayUser);
    assert(rzpPlan === "NORMAL", `Normal user razorpay@gmail.com resolves to 'NORMAL' (got: ${rzpPlan})`);
  }

  const expiredUser = await prisma.user.findUnique({
    where: { email: "expired_plus_test@test.com" },
    select: { membershipType: true, membershipPlan: true, membershipExpiresAt: true, role: true },
  });
  if (expiredUser) {
    const expPlan = determineUserCurrentPlan(expiredUser);
    assert(expPlan === "NORMAL", `Expired user expired_plus_test@test.com resolves to 'NORMAL' (got: ${expPlan})`);
  }

  const monthlyUser = await prisma.user.findUnique({
    where: { email: "monthly_plus_test@test.com" },
    select: { membershipType: true, membershipPlan: true, membershipExpiresAt: true, role: true },
  });
  if (monthlyUser) {
    const monPlan = determineUserCurrentPlan(monthlyUser);
    assert(monPlan === "MONTHLY", `Active Monthly user monthly_plus_test@test.com resolves to 'MONTHLY' (got: ${monPlan})`);
  }

  console.log("\n-------------------------------------------------");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("-------------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
