import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  const withSolution = apnaQuestions.filter(q => q.solutionLink && q.solutionLink.trim() !== '');
  console.log('Total Questions in Apna:', apnaQuestions.length);
  console.log('Questions with solutionLink in Apna:', withSolution.length);

  const beenextProblems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      leetcodeUrl: true,
      youtubeUrl: true,
      category: { select: { title: true } }
    }
  });

  function extractLeetCodeSlug(url) {
    if (!url) return null;
    const match = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
    return match ? match[1].toLowerCase().trim() : null;
  }

  function normalizeTitle(t) {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Build map of Apna questions by LC slug and normalized title
  // Prefer the one that has a solutionLink
  const apnaByLcSlug = new Map();
  const apnaByTitle = new Map();

  for (const q of apnaQuestions) {
    const lcSlug = extractLeetCodeSlug(q.problemLink);
    const normTitle = normalizeTitle(q.questionName);

    if (lcSlug) {
      if (!apnaByLcSlug.has(lcSlug) || (!apnaByLcSlug.get(lcSlug).solutionLink && q.solutionLink)) {
        apnaByLcSlug.set(lcSlug, q);
      }
    }
    if (!apnaByTitle.has(normTitle) || (!apnaByTitle.get(normTitle).solutionLink && q.solutionLink)) {
      apnaByTitle.set(normTitle, q);
    }
  }

  // Also build GFG slug mapping if any
  function extractGfgSlug(url) {
    if (!url) return null;
    const match = url.match(/geeksforgeeks\.org\/problems\/([^/?#]+)/i);
    return match ? match[1].toLowerCase().trim() : null;
  }

  const apnaByGfgSlug = new Map();
  for (const q of apnaQuestions) {
    const gfgSlug = extractGfgSlug(q.problemLink);
    if (gfgSlug) {
      if (!apnaByGfgSlug.has(gfgSlug) || (!apnaByGfgSlug.get(gfgSlug).solutionLink && q.solutionLink)) {
        apnaByGfgSlug.set(gfgSlug, q);
      }
    }
  }

  let matchedWithSolution = 0;
  const matchedPairs = [];
  const matchedApnaIds = new Set();

  for (const bp of beenextProblems) {
    const bpLcSlug = extractLeetCodeSlug(bp.leetcodeUrl);
    const bpNormTitle = normalizeTitle(bp.title);

    let matchedApna = null;
    let matchType = '';

    if (bpLcSlug && apnaByLcSlug.has(bpLcSlug)) {
      matchedApna = apnaByLcSlug.get(bpLcSlug);
      matchType = 'leetcode-slug';
    } else if (apnaByTitle.has(bpNormTitle)) {
      matchedApna = apnaByTitle.get(bpNormTitle);
      matchType = 'exact-title';
    }

    if (matchedApna && matchedApna.solutionLink) {
      matchedWithSolution++;
      matchedApnaIds.add(matchedApna.id);
      matchedPairs.push({
        problemId: bp.id,
        beenextTitle: bp.title,
        beenextCategory: bp.category.title,
        apnaTitle: matchedApna.questionName,
        matchType,
        solutionLink: matchedApna.solutionLink.replace(/&amp;/g, '&'),
        striverYoutube: bp.youtubeUrl
      });
    }
  }

  console.log(`BeeNext problems matched with valid Apna video: ${matchedWithSolution}`);
  console.log(`Distinct Apna questions used: ${matchedApnaIds.size}`);

  // Find Apna questions with solution that didn't match any BeeNext problem
  const unmatchedApna = withSolution.filter(q => !matchedApnaIds.has(q.id));
  console.log(`Unmatched Apna questions with solution: ${unmatchedApna.length}`);

  for (const uq of unmatchedApna) {
    console.log(`Unmatched: "${uq.questionName}" [${uq.problemLink}] -> Solution: ${uq.solutionLink}`);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
