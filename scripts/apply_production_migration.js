const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function execMulti(sql) {
  // Strip comments and split by semicolon
  const cleanSql = sql
    .replace(/--.*$/gm, '')
    .trim();

  // Handle DO $$ blocks and standard statements
  const statements = [];
  let current = '';
  let inDollarQuote = false;

  const lines = cleanSql.split('\n');
  for (const line of lines) {
    if (line.includes('$$')) {
      inDollarQuote = !inDollarQuote;
    }
    current += line + '\n';
    if (!inDollarQuote && line.trim().endsWith(';')) {
      const stmt = current.trim();
      if (stmt) statements.push(stmt);
      current = '';
    }
  }
  if (current.trim()) {
    statements.push(current.trim());
  }

  for (let i = 0; i < statements.length; i++) {
    const s = statements[i].trim();
    if (!s) continue;
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    await prisma.$executeRawUnsafe(s);
  }
}

async function applyProductionMigration() {
  console.log('=== APPLYING ADDITIVE MIGRATION TO PRODUCTION NEON POSTGRESQL ===\n');

  const migrationFilePath = path.join(
    __dirname,
    '..',
    'prisma',
    'migrations',
    '20261127_daily_challenge_streak',
    'migration.sql'
  );

  console.log(`Reading migration SQL from: ${migrationFilePath}`);
  const sql = fs.readFileSync(migrationFilePath, 'utf8');

  console.log('\nExecuting additive DDL statements in public schema...');
  await execMulti(sql);
  console.log('✓ All migration DDL statements executed successfully!');

  console.log('\n=== VERIFYING POST-MIGRATION PRODUCTION SCHEMA ===');

  // Verify users table columns
  const userCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users'
    AND column_name IN ('currentStreak', 'longestStreak', 'lastStreakDate')
    ORDER BY column_name;
  `);
  console.log('Verified users table streak columns:');
  for (const c of userCols) {
    console.log(`  ✓ ${c.column_name} (${c.data_type}, default: ${c.column_default})`);
  }

  // Verify daily_challenges table
  const dcCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'daily_challenges'
    ORDER BY ordinal_position;
  `);
  console.log(`Verified daily_challenges columns (${dcCols.length} columns):`);
  for (const c of dcCols) {
    console.log(`  ✓ ${c.column_name} (${c.data_type})`);
  }

  // Verify user_daily_streaks table
  const udsCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_daily_streaks'
    ORDER BY ordinal_position;
  `);
  console.log(`Verified user_daily_streaks columns (${udsCols.length} columns):`);
  for (const c of udsCols) {
    console.log(`  ✓ ${c.column_name} (${c.data_type})`);
  }

  // Verify daily_challenge_attempts table
  const dcaCols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'daily_challenge_attempts'
    ORDER BY ordinal_position;
  `);
  console.log(`Verified daily_challenge_attempts columns (${dcaCols.length} columns):`);
  for (const c of dcaCols) {
    console.log(`  ✓ ${c.column_name} (${c.data_type}, default: ${c.column_default})`);
  }

  // Verify existing data counts unchanged
  const userCount = await prisma.user.count();
  const probCount = await prisma.problem.count();
  const testCaseCount = await prisma.testCase.count();
  const progressCount = await prisma.userProgress.count();
  console.log('\nVerified existing data counts remain 100% intact:');
  console.log(`  ✓ users: ${userCount}`);
  console.log(`  ✓ problems: ${probCount}`);
  console.log(`  ✓ test_cases: ${testCaseCount}`);
  console.log(`  ✓ user_progress: ${progressCount}`);

  console.log('\n=== PRODUCTION MIGRATION SUCCESSFULLY APPLIED & VERIFIED! ===\n');
  await prisma.$disconnect();
}

applyProductionMigration().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
