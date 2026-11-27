const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function execMulti(sql) {
  const cleanSql = sql
    .replace(/--.*$/gm, '')
    .trim();

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

async function applyJobAlertsMigration() {
  console.log('=== PREPARING ADDITIVE MIGRATION FOR JOB ALERTS ===\n');

  const migrationFilePath = path.join(
    __dirname,
    '..',
    'prisma',
    'migrations',
    '20261127_job_alerts',
    'migration.sql'
  );

  console.log(`Reading migration SQL from: ${migrationFilePath}`);
  const sql = fs.readFileSync(migrationFilePath, 'utf8');

  console.log('\nExecuting additive DDL statements in public schema...');
  await execMulti(sql);
  console.log('✓ All migration DDL statements executed successfully!');

  console.log('\n=== VERIFYING POST-MIGRATION JOB_LISTINGS TABLE ===');
  const tableCheck = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'job_listings'
    ORDER BY ordinal_position;
  `);
  console.log('Columns in job_listings:');
  console.table(tableCheck);
}

if (require.main === module) {
  applyJobAlertsMigration()
    .catch((e) => {
      console.error('Migration failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { applyJobAlertsMigration };
