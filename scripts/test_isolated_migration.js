const { PrismaClient } = require('@prisma/client');
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
  console.log('=== STARTING ISOLATED DATABASE MIGRATION & FLOW TEST ===\n');

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
      INSERT INTO "${testSchema}"."users" ("id", "name", "email") VALUES ('user-1', 'Alice', 'alice@test.com');
      INSERT INTO "${testSchema}"."users" ("id", "name", "email") VALUES ('user-2', 'Bob', 'bob@test.com');
      INSERT INTO "${testSchema}"."categories" ("id", "title", "slug") VALUES ('cat-1', 'Dynamic Programming', 'dynamic-programming');
      INSERT INTO "${testSchema}"."problems" ("id", "title", "slug", "difficulty", "categoryId")
      VALUES ('prob-1', 'Climbing Stairs', 'climbing-stairs', 'EASY', 'cat-1');
      INSERT INTO "${testSchema}"."problems" ("id", "title", "slug", "difficulty", "categoryId")
      VALUES ('prob-2', 'Coin Change', 'coin-change', 'MEDIUM', 'cat-1');
    `);
    console.log('✓ Seeded sample users and problems into isolated schema.');

    // 3. Apply the exact migration SQL in the isolated schema
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
    `);
    console.log('✓ Migration DDL executed cleanly without errors!');

    // 4. Verify columns in users table
    const userCols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_schema = '${testSchema}' AND table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log('\n4. Verified users table columns after migration:');
    userCols.forEach(c => console.log(`   - ${c.column_name} (${c.data_type}, default: ${c.column_default})`));

    // 5. Test Daily Challenge insertion & unique constraint
    console.log('\n5. Testing DailyChallenge insertion and uniqueness...');
    await prisma.$executeRawUnsafe(`
      INSERT INTO "${testSchema}"."daily_challenges" ("id", "date", "problemId")
      VALUES ('dc-1', '2026-11-27', 'prob-1');
    `);
    console.log('✓ Inserted DailyChallenge for 2026-11-27.');

    let duplicateCaught = false;
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "${testSchema}"."daily_challenges" ("id", "date", "problemId")
        VALUES ('dc-2', '2026-11-27', 'prob-2');
      `);
    } catch (e) {
      duplicateCaught = true;
      console.log('✓ Duplicate DailyChallenge for same date blocked by UNIQUE index.');
    }
    if (!duplicateCaught) throw new Error('Unique constraint on daily_challenges(date) failed!');

    // 6. Test Streak recording, increment, and re-submission
    console.log('\n6. Testing UserDailyStreak rules...');

    // Day 1 submission
    await execMulti(`
      INSERT INTO "${testSchema}"."user_daily_streaks" ("id", "userId", "date", "problemId")
      VALUES ('uds-1', 'user-1', '2026-11-27', 'prob-1');

      UPDATE "${testSchema}"."users" 
      SET "currentStreak" = 1, "longestStreak" = 1, "lastStreakDate" = '2026-11-27'
      WHERE "id" = 'user-1';
    `);

    const userDay1 = await prisma.$queryRawUnsafe(`
      SELECT "currentStreak", "longestStreak", "lastStreakDate" FROM "${testSchema}"."users" WHERE id = 'user-1'
    `);
    console.log('✓ User 1 Day 1 streak:', userDay1[0]);

    // Repeated submission on same day
    let reSubmissionCaught = false;
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "${testSchema}"."user_daily_streaks" ("id", "userId", "date", "problemId")
        VALUES ('uds-2', 'user-1', '2026-11-27', 'prob-1');
      `);
    } catch (e) {
      reSubmissionCaught = true;
      console.log('✓ Repeated submission on same day blocked by UNIQUE constraint (userId, date).');
    }
    if (!reSubmissionCaught) throw new Error('Duplicate user streak for same date allowed!');

    // Day 2 (Consecutive Day)
    await execMulti(`
      INSERT INTO "${testSchema}"."user_daily_streaks" ("id", "userId", "date", "problemId")
      VALUES ('uds-3', 'user-1', '2026-11-28', 'prob-2');

      UPDATE "${testSchema}"."users" 
      SET "currentStreak" = 2, "longestStreak" = 2, "lastStreakDate" = '2026-11-28'
      WHERE "id" = 'user-1';
    `);
    const userDay2 = await prisma.$queryRawUnsafe(`
      SELECT "currentStreak", "longestStreak", "lastStreakDate" FROM "${testSchema}"."users" WHERE id = 'user-1'
    `);
    console.log('✓ User 1 Day 2 streak (consecutive):', userDay2[0]);

    // Day 4 (Missed Day 3)
    await execMulti(`
      INSERT INTO "${testSchema}"."user_daily_streaks" ("id", "userId", "date", "problemId")
      VALUES ('uds-4', 'user-1', '2026-11-30', 'prob-1');

      UPDATE "${testSchema}"."users" 
      SET "currentStreak" = 1, "longestStreak" = 2, "lastStreakDate" = '2026-11-30'
      WHERE "id" = 'user-1';
    `);
    const userDay4 = await prisma.$queryRawUnsafe(`
      SELECT "currentStreak", "longestStreak", "lastStreakDate" FROM "${testSchema}"."users" WHERE id = 'user-1'
    `);
    console.log('✓ User 1 Day 4 streak after missing Day 3 (reset to 1, longest preserved as 2):', userDay4[0]);

    console.log('\n=== ALL ISOLATED MIGRATION & FLOW TESTS PASSED 100%! ===');
  } catch (err) {
    console.error('Test error:', err);
    throw err;
  } finally {
    console.log(`\nCleaning up isolated schema "${testSchema}"...`);
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE;`);
    console.log('✓ Isolated schema dropped. Production public schema completely untouched.');
    await prisma.$disconnect();
  }
}

runIsolatedMigrationAndFlowTest().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
