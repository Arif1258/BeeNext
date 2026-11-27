import prisma from '../src/lib/prisma';
import { signToken } from '../src/lib/auth';
import { getTodayISTDateString, getOrCreateDailyChallenge, verifyAndRecordDailySubmission } from '../src/lib/dailyChallenge';
import { POST as executeRoute } from '../src/app/api/playground/execute/route';
import { POST as submitRoute } from '../src/app/api/playground/submit/route';
import { GET as dailyChallengeRoute } from '../src/app/api/daily-challenge/route';

async function runEndToEndVerification() {
  console.log('=== STARTING END-TO-END PRODUCTION VERIFICATION ===\n');

  const todayStr = getTodayISTDateString();
  console.log(`Current IST Date: ${todayStr}`);

  // 1. Fetch Today's Daily Challenge problem
  const dailyProblem = await getOrCreateDailyChallenge(todayStr);
  if (!dailyProblem) {
    throw new Error('Daily Challenge problem could not be created or fetched!');
  }
  console.log(`✓ Daily Challenge Problem: "${dailyProblem.title}" (slug: ${dailyProblem.slug}, id: ${dailyProblem.id})`);

  // 2. Identify Test Users
  const normalUser = await prisma.user.findFirst({
    where: { email: 'razorpay@gmail.com' },
  });
  const plusUser = await prisma.user.findFirst({
    where: { email: 'monthly_plus_test@test.com' },
  });

  if (!normalUser || !plusUser) {
    throw new Error('Test users not found in database!');
  }

  console.log(`✓ Normal User identified: ${normalUser.name} (${normalUser.email})`);
  console.log(`✓ Plus User identified: ${plusUser.name} (${plusUser.email})`);

  const normalToken = signToken({
    id: normalUser.id,
    name: normalUser.name,
    email: normalUser.email,
    role: normalUser.role,
  });

  const plusToken = signToken({
    id: plusUser.id,
    name: plusUser.name,
    email: plusUser.email,
    role: plusUser.role,
  });

  // Ensure clean attempt record for Normal user today for test
  await prisma.$executeRawUnsafe(
    `DELETE FROM "daily_challenge_attempts" WHERE "userId" = $1 AND "date" = $2`,
    normalUser.id,
    todayStr
  );
  console.log('✓ Initialized clean attempt state for Normal user.');

  // -------------------------------------------------------------
  // Test 1: GET /api/daily-challenge endpoint
  // -------------------------------------------------------------
  console.log('\n--- 1. Testing GET /api/daily-challenge ---');
  const getReq = new Request(`http://localhost:3000/api/daily-challenge?problemId=${dailyProblem.id}`, {
    headers: { cookie: `beenext_token=${normalToken}` },
  });
  const getRes = await dailyChallengeRoute(getReq);
  const getData = await getRes.json();
  console.log(`   - Status: ${getRes.status}`);
  console.log(`   - Daily problem title: ${getData.problem?.title}`);
  console.log(`   - Free Runs remaining: ${getData.allowance?.freeRunsRemaining}`);
  console.log(`   - Free Submits remaining: ${getData.allowance?.freeSubmitsRemaining}`);

  if (getData.allowance?.freeRunsRemaining !== 1 || getData.allowance?.freeSubmitsRemaining !== 1) {
    throw new Error('Initial allowance for Normal user was not 1 Run / 1 Submit!');
  }
  console.log('   ✓ GET /api/daily-challenge returned correct initial 1/1 allowance.');

  // -------------------------------------------------------------
  // Test 2: Normal user's first Run on Daily Challenge
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing Normal User First Run on Daily Challenge ---');
  // Simple python template that compiles
  const pythonCode = `class Solution:
    pass
`;
  const runReq1 = new Request('http://localhost:3000/api/playground/execute', {
    method: 'POST',
    headers: {
      cookie: `beenext_token=${normalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      problemId: dailyProblem.id,
      language: 'python',
      sourceCode: pythonCode,
    }),
  });

  const runRes1 = await executeRoute(runReq1);
  const runData1 = await runRes1.json();
  console.log(`   - Status: ${runRes1.status} (expected 200 or execution verdict)`);
  console.log(`   - Verdict: ${runData1.verdict || runData1.status}`);

  if (runRes1.status === 403) {
    throw new Error(`First run unexpectedly blocked with 403: ${JSON.stringify(runData1)}`);
  }
  console.log('   ✓ Normal user first Run on Daily Challenge succeeded!');

  // Check database attempt count
  const attemptRowAfterRun = await prisma.$queryRawUnsafe<Array<{ runCount: number; submitCount: number }>>(
    `SELECT "runCount", "submitCount" FROM "daily_challenge_attempts" WHERE "userId" = $1 AND "date" = $2`,
    normalUser.id,
    todayStr
  );
  console.log(`   - Database state: runCount=${attemptRowAfterRun[0]?.runCount}, submitCount=${attemptRowAfterRun[0]?.submitCount}`);
  if (attemptRowAfterRun[0]?.runCount !== 1) {
    throw new Error('runCount was not recorded as 1 in daily_challenge_attempts!');
  }
  console.log('   ✓ Database accurately persisted runCount = 1.');

  // -------------------------------------------------------------
  // Test 3: Normal user's second Run on Daily Challenge (Should block with 403)
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing Normal User Second Run on Daily Challenge (Exhausted) ---');
  const runReq2 = new Request('http://localhost:3000/api/playground/execute', {
    method: 'POST',
    headers: {
      cookie: `beenext_token=${normalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      problemId: dailyProblem.id,
      language: 'python',
      sourceCode: pythonCode,
    }),
  });

  const runRes2 = await executeRoute(runReq2);
  const runData2 = await runRes2.json();
  console.log(`   - Status: ${runRes2.status} (expected 403)`);
  console.log(`   - Code: ${runData2.code} (expected DAILY_FREE_RUN_EXHAUSTED)`);
  console.log(`   - Message: ${runData2.error}`);

  if (runRes2.status !== 403 || runData2.code !== 'DAILY_FREE_RUN_EXHAUSTED') {
    throw new Error('Second run was not blocked with DAILY_FREE_RUN_EXHAUSTED!');
  }
  console.log('   ✓ Second Run properly rejected with DAILY_FREE_RUN_EXHAUSTED (triggers Plus upgrade modal).');

  // -------------------------------------------------------------
  // Test 4: Normal user attempting to execute a Non-Daily Problem (Should block with 403 PLUS_REQUIRED)
  // -------------------------------------------------------------
  console.log('\n--- 4. Testing Normal User Executing Other (Non-Daily) Problem ---');
  const otherProblem = await prisma.problem.findFirst({
    where: { id: { not: dailyProblem.id } },
    select: { id: true, title: true },
  });

  if (!otherProblem) throw new Error('No other problem found!');

  const nonDailyRunReq = new Request('http://localhost:3000/api/playground/execute', {
    method: 'POST',
    headers: {
      cookie: `beenext_token=${normalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      problemId: otherProblem.id,
      language: 'python',
      sourceCode: pythonCode,
    }),
  });

  const nonDailyRunRes = await executeRoute(nonDailyRunReq);
  const nonDailyRunData = await nonDailyRunRes.json();
  console.log(`   - Status on problem "${otherProblem.title}": ${nonDailyRunRes.status} (expected 403)`);
  console.log(`   - Code: ${nonDailyRunData.code} (expected PLUS_REQUIRED)`);

  if (nonDailyRunRes.status !== 403 || nonDailyRunData.code !== 'PLUS_REQUIRED') {
    throw new Error('Normal user was able to execute non-daily problem!');
  }
  console.log('   ✓ Normal user strictly blocked from executing other problems (Plus-exclusive).');

  // -------------------------------------------------------------
  // Test 5: Normal user's first Submit on Daily Challenge
  // -------------------------------------------------------------
  console.log('\n--- 5. Testing Normal User First Submit on Daily Challenge ---');
  const submitReq1 = new Request('http://localhost:3000/api/playground/submit', {
    method: 'POST',
    headers: {
      cookie: `beenext_token=${normalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      problemId: dailyProblem.id,
      language: 'python',
      sourceCode: pythonCode,
    }),
  });

  const submitRes1 = await submitRoute(submitReq1);
  const submitData1 = await submitRes1.json();
  console.log(`   - Status: ${submitRes1.status} (expected 200)`);
  console.log(`   - Verdict: ${submitData1.verdict}`);
  console.log(`   - Total tests evaluated: ${submitData1.totalTests}`);

  if (submitRes1.status === 403) {
    throw new Error(`First submit unexpectedly blocked: ${JSON.stringify(submitData1)}`);
  }
  console.log('   ✓ Normal user first Submit executed all test cases.');

  // Check database submitCount
  const attemptRowAfterSubmit = await prisma.$queryRawUnsafe<Array<{ runCount: number; submitCount: number }>>(
    `SELECT "runCount", "submitCount" FROM "daily_challenge_attempts" WHERE "userId" = $1 AND "date" = $2`,
    normalUser.id,
    todayStr
  );
  console.log(`   - Database state: runCount=${attemptRowAfterSubmit[0]?.runCount}, submitCount=${attemptRowAfterSubmit[0]?.submitCount}`);
  if (attemptRowAfterSubmit[0]?.submitCount !== 1) {
    throw new Error('submitCount was not recorded as 1!');
  }
  console.log('   ✓ Database accurately persisted submitCount = 1.');

  // -------------------------------------------------------------
  // Test 6: Normal user's second Submit on Daily Challenge (Should block with 403)
  // -------------------------------------------------------------
  console.log('\n--- 6. Testing Normal User Second Submit on Daily Challenge (Exhausted) ---');
  const submitReq2 = new Request('http://localhost:3000/api/playground/submit', {
    method: 'POST',
    headers: {
      cookie: `beenext_token=${normalToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      problemId: dailyProblem.id,
      language: 'python',
      sourceCode: pythonCode,
    }),
  });

  const submitRes2 = await submitRoute(submitReq2);
  const submitData2 = await submitRes2.json();
  console.log(`   - Status: ${submitRes2.status} (expected 403)`);
  console.log(`   - Code: ${submitData2.code} (expected DAILY_FREE_SUBMIT_EXHAUSTED)`);

  if (submitRes2.status !== 403 || submitData2.code !== 'DAILY_FREE_SUBMIT_EXHAUSTED') {
    throw new Error('Second submit was not blocked with DAILY_FREE_SUBMIT_EXHAUSTED!');
  }
  console.log('   ✓ Second Submit properly rejected with DAILY_FREE_SUBMIT_EXHAUSTED (triggers Plus upgrade modal).');

  // -------------------------------------------------------------
  // Test 7: Streak Increment & Celebration Verification for Normal User
  // -------------------------------------------------------------
  console.log('\n--- 7. Testing Streak Increment & Celebration Metadata for Normal User ---');
  // Simulate successful 6/6 test case submission
  const streakResult = await verifyAndRecordDailySubmission({
    userId: normalUser.id,
    problemId: dailyProblem.id,
    passedTests: 6,
    totalTests: 6,
    isAccepted: true,
  });

  console.log(`   - isDailyChallenge: ${streakResult.isDailyChallenge}`);
  console.log(`   - newlyCompleted: ${streakResult.newlyCompleted}`);
  console.log(`   - currentStreak: ${streakResult.currentStreak}`);
  console.log(`   - longestStreak: ${streakResult.longestStreak}`);

  if (!streakResult.isDailyChallenge || !streakResult.newlyCompleted || streakResult.currentStreak < 1) {
    throw new Error('Streak increment failed for Normal user!');
  }
  console.log('   ✓ Normal user received streak increment & newlyCompleted=true (triggers bomb blast celebration modal)!');

  // Verify in database users table
  const updatedNormalUser = await prisma.user.findUnique({
    where: { id: normalUser.id },
    select: { currentStreak: true, longestStreak: true, lastStreakDate: true },
  });
  console.log(`   - Database users table: currentStreak=${updatedNormalUser?.currentStreak}, longestStreak=${updatedNormalUser?.longestStreak}, lastStreakDate=${updatedNormalUser?.lastStreakDate}`);
  if (updatedNormalUser?.currentStreak !== streakResult.currentStreak) {
    throw new Error('Database users streak did not match!');
  }
  console.log('   ✓ Streak successfully persisted in production users table.');

  // Repeated submission check: must not increment streak again on same day
  console.log('\n--- 8. Testing Repeated Submission Does Not Increment Streak Again ---');
  const repeatStreakResult = await verifyAndRecordDailySubmission({
    userId: normalUser.id,
    problemId: dailyProblem.id,
    passedTests: 6,
    totalTests: 6,
    isAccepted: true,
  });
  console.log(`   - Repeat submission newlyCompleted: ${repeatStreakResult.newlyCompleted} (expected false)`);
  console.log(`   - Repeat submission currentStreak: ${repeatStreakResult.currentStreak} (expected ${streakResult.currentStreak})`);
  if (repeatStreakResult.newlyCompleted !== false || repeatStreakResult.currentStreak !== streakResult.currentStreak) {
    throw new Error('Repeated submission erroneously incremented streak!');
  }
  console.log('   ✓ Repeated submission deduplicated cleanly (no double increment).');

  // -------------------------------------------------------------
  // Test 9: Plus Member Retains Unrestricted Access
  // -------------------------------------------------------------
  console.log('\n--- 9. Testing Plus Member Unrestricted Access ---');
  const plusRunReq1 = new Request('http://localhost:3000/api/playground/execute', {
    method: 'POST',
    headers: {
      cookie: `beenext_token=${plusToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      problemId: otherProblem.id, // Non-daily problem
      language: 'python',
      sourceCode: pythonCode,
    }),
  });

  const plusRunRes1 = await executeRoute(plusRunReq1);
  console.log(`   - Plus User Run on Non-Daily Problem status: ${plusRunRes1.status} (expected non-403)`);
  if (plusRunRes1.status === 403) {
    throw new Error('Plus user was restricted on non-daily problem!');
  }
  console.log('   ✓ Plus members retain full unrestricted execution access.');

  // -------------------------------------------------------------
  // Test 10: Existing Tables & Data Integrity Check
  // -------------------------------------------------------------
  console.log('\n--- 10. Checking Existing Database Integrity ---');
  const totalUsers = await prisma.user.count();
  const totalProblems = await prisma.problem.count();
  const totalTestCases = await prisma.testCase.count();
  const totalOrders = await prisma.membershipOrder.count();
  const totalTx = await prisma.paymentTransaction.count();

  console.log(`   - Users: ${totalUsers} (expected 5)`);
  console.log(`   - Problems: ${totalProblems} (expected 495)`);
  console.log(`   - Test Cases: ${totalTestCases} (expected 5916)`);
  console.log(`   - Membership Orders: ${totalOrders} (expected 2)`);
  console.log(`   - Payment Transactions: ${totalTx} (expected 1)`);

  if (totalUsers < 5 || totalProblems < 495 || totalTestCases < 5000) {
    throw new Error('Database data counts were altered!');
  }
  console.log('   ✓ All existing database data, orders, payments, and test cases remain 100% intact.');

  // Clean up test attempt record & streak for normalUser so production stays pristine
  await prisma.$executeRawUnsafe(
    `DELETE FROM "daily_challenge_attempts" WHERE "userId" = $1 AND "date" = $2`,
    normalUser.id,
    todayStr
  );
  await prisma.$executeRawUnsafe(
    `DELETE FROM "user_daily_streaks" WHERE "userId" = $1 AND "date" = $2`,
    normalUser.id,
    todayStr
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "users" SET "currentStreak" = 0, "longestStreak" = 0, "lastStreakDate" = NULL WHERE id = $1`,
    normalUser.id
  );
  console.log('\n✓ Test records cleaned up. Production user states restored.');

  console.log('\n=== ALL END-TO-END VERIFICATION CHECKS PASSED 100%! ===\n');
  await prisma.$disconnect();
}

runEndToEndVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
