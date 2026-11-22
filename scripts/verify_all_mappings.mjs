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
      category: { select: { title: true } }
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

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .replace(/binary\s+tree/g, 'bt')
      .replace(/linked\s*list/g, 'll')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 1. Check all LeetCode slug matches
  // Map of lcSlug -> Apna question with solutionLink (preferred)
  const apnaByLc = new Map();
  for (const q of apnaQuestions) {
    const slug = extractLeetCodeSlug(q.problemLink);
    if (!slug) continue;
    if (!apnaByLc.has(slug) || (!apnaByLc.get(slug).solutionLink && q.solutionLink)) {
      apnaByLc.set(slug, q);
    }
  }

  console.log(`Unique LeetCode slugs in Apna: ${apnaByLc.size}`);

  const matches = [];

  for (const bp of beenextProblems) {
    const bpLcSlug = extractLeetCodeSlug(bp.leetcodeUrl);
    let matchedApna = null;
    let matchMethod = '';

    // Direct LeetCode slug match
    if (bpLcSlug && apnaByLc.has(bpLcSlug)) {
      const candidate = apnaByLc.get(bpLcSlug);
      // Verify that this LeetCode slug is meaningful and not a generic/discuss link
      if (candidate.solutionLink) {
        matchedApna = candidate;
        matchMethod = 'LC Slug (' + bpLcSlug + ')';
      }
    }

    if (matchedApna) {
      matches.push({
        beenextId: bp.id,
        beenextCategory: bp.category.title,
        beenextTitle: bp.title,
        apnaTopic: matchedApna.topicName,
        apnaTitle: matchedApna.questionName,
        matchMethod,
        solutionLink: matchedApna.solutionLink.replace(/&amp;/g, '&'),
        striverLink: bp.youtubeUrl
      });
    }
  }

  console.log(`Total Matches via LC Slug with solutionLink: ${matches.length}`);

  // Let's inspect potential non-LC matches (e.g. GFG or title matches)
  const matchedBeeNextIds = new Set(matches.map(m => m.beenextId));
  const unmatchedBeeNext = beenextProblems.filter(b => !matchedBeeNextIds.has(b.id));

  // Apna questions with solution that haven't been matched
  const matchedApnaLinks = new Set(matches.map(m => m.solutionLink));
  const remainingApna = apnaQuestions.filter(q => q.solutionLink && !matchedApnaLinks.has(q.solutionLink.replace(/&amp;/g, '&')));

  console.log(`Remaining Apna questions with video: ${remainingApna.length}`);
  for (const ra of remainingApna) {
    console.log(`[Remaining Apna] "${ra.questionName}" (Topic: ${ra.topicName}) | LC: ${ra.problemLink} | Vid: ${ra.solutionLink}`);
  }

  fs.writeFileSync('scripts/lc_matches.json', JSON.stringify(matches, null, 2));

  await prisma.$disconnect();
}

run();
