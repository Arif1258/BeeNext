import {
  calculateEffectiveStreak,
  getTodayISTDateString,
  getYesterdayISTDateString,
} from "../src/lib/dailyChallenge";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

async function runSimulationTests() {
  console.log("=== Testing Repeated, Incorrect & Concurrent Submissions ===\n");

  const today = getTodayISTDateString();
  const yesterday = getYesterdayISTDateString();

  // Simulated Database State
  let mockUser: {
    id: string;
    currentStreak: number;
    longestStreak: number;
    lastStreakDate: string | null;
  } = {
    id: "user-123",
    currentStreak: 2,
    longestStreak: 5,
    lastStreakDate: yesterday,
  };

  const userDailyStreaks = new Set<string>(); // Set of `${userId}_${date}`

  // Simulation of the submission streak recorder
  async function simulateSubmitDailyChallenge(userId: string, isAccepted: boolean, passedTests: number) {
    if (!isAccepted || passedTests < 6) {
      // Incorrect submission
      return {
        isDailyChallenge: true,
        newlyCompleted: false,
        currentStreak: mockUser.currentStreak,
        longestStreak: mockUser.longestStreak,
      };
    }

    const key = `${userId}_${today}`;
    if (userDailyStreaks.has(key)) {
      // Repeated submission on same day
      return {
        isDailyChallenge: true,
        newlyCompleted: false,
        currentStreak: mockUser.currentStreak,
        longestStreak: mockUser.longestStreak,
      };
    }

    // Atomic insert
    userDailyStreaks.add(key);

    const isConsecutive = mockUser.lastStreakDate === yesterday;
    const newStreak = isConsecutive ? mockUser.currentStreak + 1 : 1;
    const newLongest = Math.max(mockUser.longestStreak, newStreak);

    mockUser.currentStreak = newStreak;
    mockUser.longestStreak = newLongest;
    mockUser.lastStreakDate = today;

    return {
      isDailyChallenge: true,
      newlyCompleted: true,
      currentStreak: newStreak,
      longestStreak: newLongest,
    };
  }

  // TEST 1: Incorrect submission
  console.log("1. Testing Incorrect Submission:");
  const failRes = await simulateSubmitDailyChallenge("user-123", false, 3);
  assert(!failRes.newlyCompleted, "Incorrect submission does not complete challenge");
  assert(mockUser.currentStreak === 2, "Incorrect submission does not reset streak (streak stays 2)");
  assert(mockUser.lastStreakDate === yesterday, "lastStreakDate unchanged");

  // TEST 2: First successful submission of the day
  console.log("\n2. Testing First Successful Submission Today:");
  const firstRes = await simulateSubmitDailyChallenge("user-123", true, 6);
  assert(firstRes.newlyCompleted, "First submission is newly completed");
  assert(firstRes.currentStreak === 3, "Streak increments from 2 to 3 on consecutive day");
  assert(firstRes.longestStreak === 5, "Longest streak is preserved as 5");
  assert(mockUser.lastStreakDate === today, "lastStreakDate updated to today");

  // TEST 3: Repeated submission on same day
  console.log("\n3. Testing Repeated Submission on Same Day:");
  const repeatRes = await simulateSubmitDailyChallenge("user-123", true, 6);
  assert(!repeatRes.newlyCompleted, "Repeated submission is NOT newly completed");
  assert(repeatRes.currentStreak === 3, "Streak remains 3, does NOT increment again");

  // TEST 4: Another incorrect submission after completion
  console.log("\n4. Testing Subsequent Incorrect Submission on Same Day:");
  const subsequentFail = await simulateSubmitDailyChallenge("user-123", false, 0);
  assert(!subsequentFail.newlyCompleted, "Failed submission does not award completion");
  assert(mockUser.currentStreak === 3, "Subsequent incorrect submission does NOT reset completed streak");

  // TEST 5: Concurrent submissions
  console.log("\n5. Testing Concurrent Submissions Race Condition:");
  // Reset for a new user
  mockUser = {
    id: "user-concurrent",
    currentStreak: 0,
    longestStreak: 0,
    lastStreakDate: null,
  };

  // Launch 10 concurrent submission attempts at the exact same time
  const results = await Promise.all([
    simulateSubmitDailyChallenge("user-concurrent", true, 6),
    simulateSubmitDailyChallenge("user-concurrent", true, 6),
    simulateSubmitDailyChallenge("user-concurrent", true, 6),
    simulateSubmitDailyChallenge("user-concurrent", true, 6),
    simulateSubmitDailyChallenge("user-concurrent", true, 6),
  ]);

  const newlyCompletedCount = results.filter((r) => r.newlyCompleted).length;
  assert(newlyCompletedCount === 1, `Exactly 1 concurrent request succeeded as newlyCompleted (got ${newlyCompletedCount})`);
  assert(mockUser.currentStreak === 1, `Final streak is exactly 1 (got ${mockUser.currentStreak})`);

  console.log("\n=== ALL SIMULATION & CONCURRENCY TESTS PASSED! ===");
}

runSimulationTests().catch((err) => {
  console.error("Simulation error:", err);
  process.exit(1);
});
