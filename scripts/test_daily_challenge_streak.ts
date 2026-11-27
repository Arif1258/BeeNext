import {
  getTodayISTDateString,
  getYesterdayISTDateString,
  getNextMidnightIST,
  calculateEffectiveStreak,
} from "../src/lib/dailyChallenge";
import { isProblemConceptual } from "../src/lib/problemTemplates";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

async function runTests() {
  console.log("=== Testing Daily Challenge & Streak Logic ===\n");

  // TEST 1: Date calculations in IST
  console.log("1. Testing Date Calculations in Asia/Kolkata (IST):");
  const testUtc1 = new Date("2026-11-26T18:29:59.000Z"); // 23:59:59 IST on 2026-11-26
  const testUtc2 = new Date("2026-11-26T18:30:00.000Z"); // 00:00:00 IST on 2026-11-27
  assert(getTodayISTDateString(testUtc1) === "2026-11-26", "23:59 IST maps to 2026-11-26");
  assert(getTodayISTDateString(testUtc2) === "2026-11-27", "00:00 IST maps to 2026-11-27 (midnight rollover)");

  const yesterdayStr = getYesterdayISTDateString(testUtc2);
  assert(yesterdayStr === "2026-11-26", "Yesterday for 2026-11-27 is 2026-11-26");

  const nextMidnight = getNextMidnightIST(testUtc2);
  assert(
    nextMidnight.toISOString() === "2026-11-27T18:30:00.000Z",
    "Next midnight for 2026-11-27 is 2026-11-27 18:30:00 UTC (00:00 IST on 2026-11-28)"
  );

  // TEST 2: Effective Streak Calculation
  console.log("\n2. Testing Streak Rules & Boundary Conditions:");

  // A. Initial user (no challenge completed)
  const userFresh = { currentStreak: 0, longestStreak: 0, lastStreakDate: null };
  const s0 = calculateEffectiveStreak(userFresh, "2026-11-27");
  assert(s0.currentStreak === 0, "Fresh user has 0 streak");
  assert(s0.longestStreak === 0, "Fresh user has 0 longest streak");
  assert(!s0.isCompletedToday, "Fresh user has not completed today");

  // B. User completed yesterday (streak alive, today pending)
  const userCompletedYesterday = { currentStreak: 3, longestStreak: 5, lastStreakDate: "2026-11-26" };
  const s1 = calculateEffectiveStreak(userCompletedYesterday, "2026-11-27");
  assert(s1.currentStreak === 3, "Streak is preserved as 3 when yesterday was completed");
  assert(!s1.isCompletedToday, "Today is not completed yet");

  // C. User completed today
  const userCompletedToday = { currentStreak: 4, longestStreak: 5, lastStreakDate: "2026-11-27" };
  const s2 = calculateEffectiveStreak(userCompletedToday, "2026-11-27");
  assert(s2.currentStreak === 4, "Streak is 4 after completing today");
  assert(s2.isCompletedToday, "isCompletedToday is true");

  // D. User missed an entire day (last completed was 2026-11-25, today is 2026-11-27)
  const userMissedDay = { currentStreak: 4, longestStreak: 5, lastStreakDate: "2026-11-25" };
  const s3 = calculateEffectiveStreak(userMissedDay, "2026-11-27");
  assert(s3.currentStreak === 0, "Missing an entire day resets current streak to 0");
  assert(s3.longestStreak === 5, "Longest streak is preserved as 5 even when current streak resets");
  assert(!s3.isCompletedToday, "Today is not completed");

  // E. User missed multiple weeks
  const userMissedMonth = { currentStreak: 12, longestStreak: 12, lastStreakDate: "2026-10-01" };
  const s4 = calculateEffectiveStreak(userMissedMonth, "2026-11-27");
  assert(s4.currentStreak === 0, "Missing multiple days/weeks resets current streak to 0");
  assert(s4.longestStreak === 12, "Longest streak of 12 is preserved permanently");

  // TEST 3: Problem Pool & Conceptual Exclusion
  console.log("\n3. Testing Conceptual Exclusion from Daily Challenge Pool:");
  assert(isProblemConceptual("recursion-theory"), "recursion-theory is identified as conceptual");
  assert(isProblemConceptual("introduction-to-dp"), "introduction-to-dp is identified as conceptual");
  assert(!isProblemConceptual("two-sum"), "two-sum is a coding problem, not conceptual");
  assert(!isProblemConceptual("climbing-stairs"), "climbing-stairs is a coding problem, not conceptual");

  console.log("\n=== ALL DAILY CHALLENGE & STREAK TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
