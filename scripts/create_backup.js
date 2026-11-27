const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
  }
  return result;
}

const envLocal = parseEnvFile(path.join(__dirname, '..', '.env.local'));
const envDefault = parseEnvFile(path.join(__dirname, '..', '.env'));
const env = { ...envDefault, ...envLocal };

const dbUrl = env.DIRECT_URL || env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL or DIRECT_URL not found in env files.');
  process.exit(1);
}

const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `neon_production_backup_${timestamp}.sql`);

console.log('Initiating pg_dump to:', backupPath);
try {
  execSync(`pg_dump "${dbUrl}" --clean --if-exists --no-owner --no-privileges -f "${backupPath}"`, {
    stdio: 'inherit'
  });
  const stats = fs.statSync(backupPath);
  console.log(`Backup completed successfully!`);
  console.log(`Backup file: ${backupPath}`);
  console.log(`Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);
} catch (err) {
  console.error('pg_dump backup failed:', err.message);
  process.exit(1);
}
