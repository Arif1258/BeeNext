import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_SORTING_LINKS = {
  'bubble-sort': 'https://youtu.be/1jCFUv-Xlqo?si=PQWKdD2pPFhtGOO3',
  'selection-sort': 'https://youtu.be/1jCFUv-Xlqo?si=PQWKdD2pPFhtGOO3',
  'insertion-sort': 'https://youtu.be/1jCFUv-Xlqo?si=PQWKdD2pPFhtGOO3',
  'quick-sort': 'https://youtu.be/8MNB0Mba_Dc?si=1TtJjOZvVj-3w4pI',
};

async function main() {
  console.log('--- Updating 4 Sorting Topics with Apna YouTube Links ---');

  // 1. Fetch the 4 problems from DB
  const problems = await prisma.problem.findMany({
    where: {
      category: { slug: 'sorting' },
      slug: { in: Object.keys(TARGET_SORTING_LINKS) },
    },
    select: { id: true, title: true, slug: true, apnaYoutubeUrl: true },
  });

  if (problems.length !== 4) {
    throw new Error(`Expected to find 4 sorting problems, found ${problems.length}`);
  }

  // 2. Update each problem in DB
  for (const prob of problems) {
    const targetUrl = TARGET_SORTING_LINKS[prob.slug];
    await prisma.problem.update({
      where: { id: prob.id },
      data: { apnaYoutubeUrl: targetUrl },
    });
    console.log(`✓ Updated DB for "${prob.title}" (${prob.slug}): ${targetUrl}`);
  }

  // 3. Update scripts/apna_final_verified_mapping.json if present
  const mappingPath = path.resolve('scripts/apna_final_verified_mapping.json');
  if (fs.existsSync(mappingPath)) {
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

    for (const prob of problems) {
      const targetUrl = TARGET_SORTING_LINKS[prob.slug];
      const existingIdx = mapping.findIndex((m) => m.slug === prob.slug || m.id === prob.id);
      const entry = {
        id: prob.id,
        slug: prob.slug,
        title: prob.title,
        category: 'Sorting',
        apnaYoutubeUrl: targetUrl,
        source: 'manualOverride',
      };
      if (existingIdx >= 0) {
        mapping[existingIdx] = entry;
      } else {
        mapping.push(entry);
      }
    }

    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2) + '\n', 'utf8');
    console.log('✓ Updated scripts/apna_final_verified_mapping.json');
  }

  // 4. Verification
  console.log('\n--- Verification of Sorting Category Problems in DB ---');
  const allSorting = await prisma.problem.findMany({
    where: { category: { slug: 'sorting' } },
    orderBy: { order: 'asc' },
    select: { id: true, title: true, slug: true, order: true, apnaYoutubeUrl: true },
  });

  for (const p of allSorting) {
    console.log(`[Order ${p.order}] ${p.title} (${p.slug}): ${p.apnaYoutubeUrl || 'NULL (disabled)'}`);
  }
}

main()
  .catch((e) => {
    console.error('Error updating sorting links:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
