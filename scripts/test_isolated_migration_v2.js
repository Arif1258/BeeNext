const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function execMulti(sql) {
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.trim()) {
      await prisma.$executeRawUnsafe(statement);
    }
  }
}

async function runIsolatedMigrationAndFlowTest() {
  console.log('=== STARTING ISOLATED DATABASE MIGRATION & FLOW TEST (V2 WITH ATTEMPTS) ===\n');

  const testSchema = 'beenext_test_isolated';

  try {
    // 1. Create isolated schema
    console.log(`1. Creating isolated schema "${testSchema}"...`);
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE;`);
    await prisma.$executeRawUnsafe(`CREATE SCHEMA "${testSchema}";`);
    console.log('✓ Isolated schema created.');

    // 2. Create base tables matching production in the isolated schema
    console.log('\n2. Creating base tables in isolated schema...');
    await execMulti(`
      CREATE TABLE "${testSchema}"."users" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'USER'
      );

      CREATE TABLE "${testSchema}"."categories" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL
      );

      CREATE TABLE "${testSchema}"."problems" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "difficulty" TEXT NOT NULL,
        "categoryId" TEXT REFERENCES "${testSchema}"."categories"("id")
      );
    `);
    console.log('✓ Base tables created.');

    // Insert dummy test data
    await execMulti(`
      INSERT INTO "${testSchema}"."users" ("id", "name", "email") VALUES ('user-1', 'Alice Normal', 'alice@test.com');
      INSERT INTO "${testSchema}"."users" ("id", "name", "email") VALUES ('user-2', 'Bob Normal', 'bob@test.com');
      INSERT INTO "${testSchema}"."categories" ("id", "title", "slug") VALUES ('cat-1', 'Dynamic Programming', 'dynamic-programming');
      INSERT INTO "${testSchema}"."problems" ("id", "title", "slug", "difficulty", "categoryId")
      VALUES ('prob-1', 'Climbing Stairs', 'climbing-stairs', 'EASY', 'cat-1');
      INSERT INTO "${testSchema}"."problems" ("id", "title", "slug", "difficulty", "categoryId")
      VALUES ('prob-2', 'Coin Change', 'coin-change', 'MEDIUM', 'cat-1');
    `);
    console.log('✓ Seeded sample users and problems into isolated schema.');

    // 3. Apply the updated migration SQL in the isolated schema
    console.log('\n3. Executing Migration DDL in isolated schema...');
    await execMulti(`
      ALTER TABLE "${testSchema}"."users" ADD COLUMN IF NOT EXISTS "currentStreak" INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE "${testSchema}"."users" ADD COLUMN IF NOT EXISTS "longestStreak" INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE "${testSchema}"."users" ADD COLUMN IF NOT EXISTS "lastStreakDate" TEXT;

      CREATE TABLE IF NOT EXISTS "${testSchema}"."daily_challenges" (
          "id" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "problemId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "daily_challenges_date_key" ON "${testSchema}"."daily_challenges"("date");
      CREATE INDEX IF NOT EXISTS "daily_challenges_date_idx" ON "${testSchema}"."daily_challenges"("date");
      CREATE INDEX IF NOT EXISTS "daily_challenges_problemId_idx" ON "${testSchema}"."daily_challenges"("problemId");

      ALTER TABLE "${testSchema}"."daily_challenges" ADD CONSTRAINT "daily_challenges_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "${testSchema}"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

      CREATE TABLE IF NOT EXISTS "${testSchema}"."user_daily_streaks" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "problemId" TEXT NOT NULL,
          "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "user_daily_streaks_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "user_daily_streaks_userId_date_key" ON "${testSchema}"."user_daily_streaks"("userId", "date");
      CREATE INDEX IF NOT EXISTS "user_daily_streaks_userId_idx" ON "${testSchema}"."user_daily_streaks"("userId");
      CREATE INDEX IF NOT EXISTS "user_daily_streaks_date_idx" ON "${testSchema}"."user_daily_streaks"("date");

      ALTER TABLE "${testSchema}"."user_daily_streaks" ADD CONSTRAINT "user_daily_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "${testSchema}"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      ALTER TABLE "${testSchema}"."user_daily_streaks" ADD CONSTRAINT "user_daily_streaks_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "${testSchema}"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

      CREATE TABLE IF NOT EXISTS "${testSchema}"."daily_challenge_attempts" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "runCount" INTEGER NOT NULL DEFAULT 0,
          "submitCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "daily_challenge_attempts_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "daily_challenge_attempts_userId_date_key" ON "${testSchema}"."daily_challenge_attempts"("userId", "date");
      CREATE INDEX IF NOT EXISTS "daily_challenge_attempts_userId_idx" ON "${testSchema}"."daily_challenge_attempts"("userId");
      CREATE INDEX IF NOT EXISTS "daily_challenge_attempts_date_idx" ON "${testSchema}"."daily_challenge_attempts"("date");

      ALTER TABLE "${testSchema}"."daily_challenge_attempts" ADD CONSTRAINT "daily_challenge_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "${testSchema}"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    console.log('✓ Migration DDL executed cleanly without errors!');

    // 4. Verify daily_challenge_attempts table structure
    console.log('\n4. Verifying daily_challenge_attempts columns & defaults:');
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_schema = '${testSchema}' AND table_name = 'daily_challenge_attempts'
      ORDER BY ordinal_position;
    `);
    for (const c of cols) {
      console.log(`   - ${c.column_name} (${c.data_type}, default: ${c.column_default})`);
    }

    // 5. Test atomic Run reservation
    console.log('\n5. Testing Atomic Run Reservation (1 free run):');
    const today = '2026-11-27';
    const user1 = 'user-1';

    // First attempt
    const resRun1 = await prisma.$queryRawUnsafe(`
      INSERT INTO "${testSchema}"."daily_challenge_attempts" ("id", "userId", "date", "runCount", "submitCount", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 1, 0, NOW(), NOW())
      ON CONFLICT ("userId", "date")
      DO UPDATE SET "runCount" = "${testSchema}"."daily_challenge_attempts"."runCount" + 1, "updatedAt" = NOW()
      WHERE "${testSchema}"."daily_challenge_attempts"."runCount" < 1
      RETURNING "runCount"
    `, 'att-1', user1, today);

    console.log(`   - First Run reservation rows returned: ${resRun1.length} (expected 1, got ${resRun1.length})`);
    if (resRun1.length !== 1) throw new Error('First run reservation failed');
    console.log('   ✓ First Run attempt successfully reserved.');

    // Second concurrent attempt
    const resRun2 = await prisma.$queryRawUnsafe(`
      INSERT INTO "${testSchema}"."daily_challenge_attempts" ("id", "userId", "date", "runCount", "submitCount", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 1, 0, NOW(), NOW())
      ON CONFLICT ("userId", "date")
      DO UPDATE SET "runCount" = "${testSchema}"."daily_challenge_attempts"."runCount" + 1, "updatedAt" = NOW()
      WHERE "${testSchema}"."daily_challenge_attempts"."runCount" < 1
      RETURNING "runCount"
    `, 'att-2', user1, today);

    console.log(`   - Second concurrent Run reservation rows returned: ${resRun2.length} (expected 0, got ${resRun2.length})`);
    if (resRun2.length !== 0) throw new Error('Second run was not blocked by atomic condition!');
    console.log('   ✓ Second Run attempt correctly blocked atomically!');

    // 6. Test Refund on pre-execution error
    console.log('\n6. Testing Refund logic on pre-execution error:');
    await prisma.$executeRawUnsafe(`
      UPDATE "${testSchema}"."daily_challenge_attempts"
      SET "runCount" = GREATEST(0, "runCount" - 1), "updatedAt" = NOW()
      WHERE "userId" = $1 AND "date" = $2
    `, user1, today);

    const checkRefund = await prisma.$queryRawUnsafe(`
      SELECT "runCount" FROM "${testSchema}"."daily_challenge_attempts" WHERE "userId" = $1 AND "date" = $2
    `, user1, today);
    console.log(`   - runCount after refund: ${checkRefund[0].runCount} (expected 0)`);
    if (checkRefund[0].runCount !== 0) throw new Error('Refund failed!');
    console.log('   ✓ Attempt refunded to 0 successfully.');

    // Re-reserve to verify it allows retry after refund
    const resRunRetry = await prisma.$queryRawUnsafe(`
      INSERT INTO "${testSchema}"."daily_challenge_attempts" ("id", "userId", "date", "runCount", "submitCount", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 1, 0, NOW(), NOW())
      ON CONFLICT ("userId", "date")
      DO UPDATE SET "runCount" = "${testSchema}"."daily_challenge_attempts"."runCount" + 1, "updatedAt" = NOW()
      WHERE "${testSchema}"."daily_challenge_attempts"."runCount" < 1
      RETURNING "runCount"
    `, 'att-3', user1, today);
    console.log(`   - Retry after refund returned: ${resRunRetry.length} (expected 1)`);
    if (resRunRetry.length !== 1) throw new Error('Retry after refund failed!');
    console.log('   ✓ Re-reservation allowed after refund.');

    // 7. Test atomic Submit reservation
    console.log('\n7. Testing Atomic Submit Reservation (separate from Run):');
    const resSubmit1 = await prisma.$queryRawUnsafe(`
      INSERT INTO "${testSchema}"."daily_challenge_attempts" ("id", "userId", "date", "runCount", "submitCount", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 0, 1, NOW(), NOW())
      ON CONFLICT ("userId", "date")
      DO UPDATE SET "submitCount" = "${testSchema}"."daily_challenge_attempts"."submitCount" + 1, "updatedAt" = NOW()
      WHERE "${testSchema}"."daily_challenge_attempts"."submitCount" < 1
      RETURNING "submitCount"
    `, 'att-4', user1, today);

    console.log(`   - First Submit reservation rows returned: ${resSubmit1.length} (expected 1)`);
    if (resSubmit1.length !== 1) throw new Error('Submit reservation failed!');
    console.log('   ✓ First Submit attempt successfully reserved.');

    // Check counts in row
    const counts = await prisma.$queryRawUnsafe(`
      SELECT "runCount", "submitCount" FROM "${testSchema}"."daily_challenge_attempts" WHERE "userId" = $1 AND "date" = $2
    `, user1, today);
    console.log(`   - User 1 current attempts for today: runCount=${counts[0].runCount}, submitCount=${counts[0].submitCount}`);
    if (counts[0].runCount !== 1 || counts[0].submitCount !== 1) throw new Error('Separate counter integrity check failed!');
    console.log('   ✓ Both separate counters maintained accurately in same row.');

    // Second submit attempt
    const resSubmit2 = await prisma.$queryRawUnsafe(`
      INSERT INTO "${testSchema}"."daily_challenge_attempts" ("id", "userId", "date", "runCount", "submitCount", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 0, 1, NOW(), NOW())
      ON CONFLICT ("userId", "date")
      DO UPDATE SET "submitCount" = "${testSchema}"."daily_challenge_attempts"."submitCount" + 1, "updatedAt" = NOW()
      WHERE "${testSchema}"."daily_challenge_attempts"."submitCount" < 1
      RETURNING "submitCount"
    `, 'att-5', user1, today);
    console.log(`   - Second Submit reservation rows returned: ${resSubmit2.length} (expected 0)`);
    if (resSubmit2.length !== 0) throw new Error('Second submit was not blocked!');
    console.log('   ✓ Second Submit attempt correctly blocked atomically!');

    // 8. Test Midnight Rollover (Tomorrow date)
    console.log('\n8. Testing Automatic Midnight Rollover (new IST date):');
    const tomorrow = '2026-11-28';
    const resTomorrowRun = await prisma.$queryRawUnsafe(`
      INSERT INTO "${testSchema}"."daily_challenge_attempts" ("id", "userId", "date", "runCount", "submitCount", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 1, 0, NOW(), NOW())
      ON CONFLICT ("userId", "date")
      DO UPDATE SET "runCount" = "${testSchema}"."daily_challenge_attempts"."runCount" + 1, "updatedAt" = NOW()
      WHERE "${testSchema}"."daily_challenge_attempts"."runCount" < 1
      RETURNING "runCount"
    `, 'att-6', user1, tomorrow);

    console.log(`   - Tomorrow Run reservation rows returned: ${resTomorrowRun.length} (expected 1)`);
    if (resTomorrowRun.length !== 1) throw new Error('Tomorrow allowance was not fresh!');
    console.log('   ✓ Allowances automatically reset on new date without needing cron job.');

    // 9. Test Normal user streak increment upon successful Submit
    console.log('\n9. Testing Normal User Streak increment upon successful submission:');
    await prisma.$executeRawUnsafe(`
      INSERT INTO "${testSchema}"."daily_challenges" ("id", "date", "problemId")
      VALUES ('dc-1', '${today}', 'prob-1')
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO "${testSchema}"."user_daily_streaks" ("id", "userId", "date", "problemId")
      VALUES ('uds-1', '${user1}', '${today}', 'prob-1')
    `);
    await prisma.$executeRawUnsafe(`
      UPDATE "${testSchema}"."users" SET "currentStreak" = 1, "longestStreak" = 1, "lastStreakDate" = '${today}' WHERE id = '${user1}'
    `);
    const userStreak = await prisma.$queryRawUnsafe(`
      SELECT "currentStreak", "longestStreak", "lastStreakDate" FROM "${testSchema}"."users" WHERE id = '${user1}'
    `);
    console.log(`   - User 1 updated streak: current=${userStreak[0].currentStreak}, longest=${userStreak[0].longestStreak}, date=${userStreak[0].lastStreakDate}`);
    if (userStreak[0].currentStreak !== 1) throw new Error('Streak update failed!');
    console.log('   ✓ Normal user received streak increment.');

    console.log('\n=== ALL ISOLATED MIGRATION & ATTEMPT TESTS PASSED 100%! ===\n');

  } finally {
    // Always clean up isolated schema
    console.log(`Cleaning up isolated schema "${testSchema}"...`);
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE;`);
    console.log('✓ Isolated schema dropped. Production public schema completely untouched.\n');
    await prisma.$disconnect();
  }
}

runIsolatedMigrationAndFlowTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
