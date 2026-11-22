import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const apnaRaw = JSON.parse(fs.readFileSync('/Users/skarifahmed/Documents/Files/codes/apna_sheet_raw.json', 'utf8'));
  const sheetData = apnaRaw.sheets;

  const apnaQuestions = [];
  for (const topic of sheetData.topics || []) {
    for (const q of topic.questions || []) {
      apnaQuestions.push({
        topicName: topic.topicName,
        ...q
      });
    }
  }

  const beenextProblems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      leetcodeUrl: true,
      youtubeUrl: true,
      category: { select: { title: true, order: true } },
      order: true
    },
    orderBy: [
      { category: { order: 'asc' } },
      { order: 'asc' }
    ]
  });

  function extractLeetCodeSlug(url) {
    if (!url) return null;
    const match = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
    return match ? match[1].toLowerCase().trim() : null;
  }

  // Check Graph traversal in BeeNext
  const graphProblems = beenextProblems.filter(p => p.category.title.toLowerCase().includes('graph'));
  console.log('Graph problems in BeeNext:');
  graphProblems.forEach(p => console.log(`  "${p.title}" | slug: ${p.slug} | lc: ${p.leetcodeUrl}`));

  await prisma.$disconnect();
}

run();
