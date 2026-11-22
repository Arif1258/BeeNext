import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const mapping = JSON.parse(fs.readFileSync('scripts/apna_final_verified_mapping.json', 'utf8'));
  console.log(`Updating ${mapping.length} problems with Apna YouTube URLs...`);

  // First, reset all apnaYoutubeUrl to null to ensure clean state
  await prisma.problem.updateMany({
    data: { apnaYoutubeUrl: null }
  });

  let updatedCount = 0;
  for (const item of mapping) {
    await prisma.problem.update({
      where: { id: item.id },
      data: { apnaYoutubeUrl: item.apnaYoutubeUrl }
    });
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} problems in database.`);

  // Verify counts in DB
  const countWithApna = await prisma.problem.count({
    where: { apnaYoutubeUrl: { not: null } }
  });
  const countTotal = await prisma.problem.count();

  console.log(`Total problems in DB: ${countTotal}`);
  console.log(`Problems with apnaYoutubeUrl: ${countWithApna}`);

  await prisma.$disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
