const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBackup() {
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupJsonPath = path.join(backupDir, `neon_backup_${timestamp}.json`);
  const backupSqlPath = path.join(backupDir, `neon_backup_${timestamp}.sql`);

  console.log('--- Initiating Full Neon Database Backup ---');

  const tables = [
    'users',
    'categories',
    'problems',
    'problem_codes',
    'test_cases',
    'handwritten_notes',
    'homepage_sample_images',
    'bundle_config',
    'payment_transactions',
    'membership_orders',
    'printed_orders',
    'printed_product_config',
    'certificate_orders',
    'code_submissions',
    'user_progress',
    'book_ratings',
    'bookmarks',
    'execution_locks',
    'purchases',
  ];

  const fullData = {
    metadata: {
      timestamp: new Date().toISOString(),
      tableCount: tables.length,
      database: 'Neon PostgreSQL (Production)',
    },
    tables: {},
  };

  let sqlStatements = `-- Neon PostgreSQL Full Database Backup\n-- Created: ${new Date().toISOString()}\n\n`;

  for (const table of tables) {
    try {
      const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
      fullData.tables[table] = {
        rowCount: rows.length,
        rows: rows,
      };
      console.log(`✓ Backed up "${table}": ${rows.length} rows`);

      if (rows.length > 0) {
        sqlStatements += `-- Table: ${table} (${rows.length} rows)\n`;
        for (const row of rows) {
          const cols = Object.keys(row);
          const vals = cols.map((c) => {
            const v = row[c];
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'number' || typeof v === 'boolean') return String(v);
            if (v instanceof Date) return `'${v.toISOString()}'`;
            if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
            return `'${String(v).replace(/'/g, "''")}'`;
          });
          sqlStatements += `INSERT INTO "${table}" ("${cols.join('", "')}") VALUES (${vals.join(', ')}) ON CONFLICT DO NOTHING;\n`;
        }
        sqlStatements += `\n`;
      }
    } catch (err) {
      console.error(`Error backing up "${table}":`, err.message);
      fullData.tables[table] = { error: err.message };
    }
  }

  fs.writeFileSync(backupJsonPath, JSON.stringify(fullData, null, 2), 'utf8');
  fs.writeFileSync(backupSqlPath, sqlStatements, 'utf8');

  const jsonStats = fs.statSync(backupJsonPath);
  const sqlStats = fs.statSync(backupSqlPath);

  console.log('\n--- Backup Completed Successfully ---');
  console.log(`JSON Backup: ${backupJsonPath} (${(jsonStats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`SQL Backup:  ${backupSqlPath} (${(sqlStats.size / 1024 / 1024).toFixed(2)} MB)`);
}

createBackup()
  .catch((err) => {
    console.error('Fatal backup error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
