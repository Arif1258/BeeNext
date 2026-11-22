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

  function cleanYoutubeUrl(url) {
    if (!url) return null;
    let clean = url.trim().replace(/&amp;/g, '&');
    // Convert embed urls if any (e.g. embed/RitppzIdMCo -> watch?v=RitppzIdMCo or youtu.be)
    if (clean.includes('youtube.com/embed/')) {
      const vidId = clean.match(/embed\/([^/?#]+)/)?.[1];
      if (vidId) {
        clean = `https://www.youtube.com/watch?v=${vidId}`;
      }
    }
    return clean;
  }

  function norm(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Explicit title/semantic overrides for problems without LC links or with title differences
  const manualTitleMap = {
    'count inversions': 'Count Inversions',
    'aggressive cows': 'Aggressive Cows',
    'painter s partition': 'Painter’s Partition',
    'painters partition': 'Painter’s Partition',
    'rat in a maze': 'Rat in a Maze',
    'merge sort': 'Merge Sort',
    'top view of bt': 'Top View of a Tree',
    'bottom view of bt': 'Bottom View of a Tree',
    'topological sort or kahn s algorithm': 'Topological Sorting (BFS)',
    'dijkstra s algorithm': 'Dijkstra\'s Algorithm',
    'bellman ford algorithm': 'Bellman Ford Algorithm',
    'kosaraju s algorithm': 'Strongly Connected Components (Kosaraju\'s)',
    'fractional knapsack': 'Fractional Knapsack',
    'book allocation problem': 'Allocate Minimum Pages',
    'morris inorder traversal': 'Morris Inorder Traversal',
    'flattening of ll': 'Flatten a Linked List',
    'stock span problem': 'Stock Span',
    'reverse every word in a string': 'Reverse Words in String',
    'largest rectangle in a histogram': 'Largest Rectangle in a Histogram',
    'rotten oranges': 'Rotting Oranges',
    'detect a cycle in an undirected graph': 'Detect Cycle in Undirected using DFS',
    'detect a cycle in a directed graph': 'Detect Cycle in Directed using DFS',
    'course schedule i': 'Course Schedule I',
    'course schedule ii': 'Course Schedule II'
  };

  // Pre-index Apna questions with solutions
  const apnaWithSol = apnaQuestions.filter(q => q.solutionLink && q.solutionLink.trim() !== '');

  // Index by LC slug (handling duplicates by preferring exact name or higher quality)
  const apnaByLc = new Map();
  for (const q of apnaWithSol) {
    const slug = extractLeetCodeSlug(q.problemLink);
    if (!slug) continue;
    if (!apnaByLc.has(slug)) {
      apnaByLc.set(slug, [q]);
    } else {
      apnaByLc.get(slug).push(q);
    }
  }

  // Index by normalized questionName
  const apnaByName = new Map();
  for (const q of apnaWithSol) {
    const n = norm(q.questionName);
    if (!apnaByName.has(n)) {
      apnaByName.set(n, q);
    }
  }

  const matches = [];
  const unmatchedBeenext = [];

  for (const bp of beenextProblems) {
    const bpSlug = extractLeetCodeSlug(bp.leetcodeUrl);
    const bpNormTitle = norm(bp.title);

    let chosenApna = null;
    let matchType = '';

    // 1. Check manual mapping first
    if (manualTitleMap[bpNormTitle]) {
      const targetName = norm(manualTitleMap[bpNormTitle]);
      if (apnaByName.has(targetName)) {
        chosenApna = apnaByName.get(targetName);
        matchType = `manual-title: ${manualTitleMap[bpNormTitle]}`;
      }
    }

    // 2. Exact Title match
    if (!chosenApna && apnaByName.has(bpNormTitle)) {
      chosenApna = apnaByName.get(bpNormTitle);
      matchType = 'exact-title';
    }

    // 3. LC slug match (careful with generic URLs like course-schedule, split-array-largest-sum)
    if (!chosenApna && bpSlug && apnaByLc.has(bpSlug)) {
      const candidates = apnaByLc.get(bpSlug);
      // If multiple, try to find closest name match
      if (candidates.length === 1) {
        // Only accept if title is reasonably close or verified
        const c = candidates[0];
        // Special check: don't map unrelated problems that share discuss links
        if (!bp.leetcodeUrl.includes('/discuss/')) {
          chosenApna = c;
          matchType = `lc-slug: ${bpSlug}`;
        }
      } else {
        // Pick the candidate whose name is closest
        let bestCandidate = null;
        for (const c of candidates) {
          if (norm(c.questionName) === bpNormTitle || norm(c.questionName).includes(bpNormTitle) || bpNormTitle.includes(norm(c.questionName))) {
            bestCandidate = c;
            break;
          }
        }
        if (bestCandidate) {
          chosenApna = bestCandidate;
          matchType = `lc-slug-disambiguated: ${bpSlug}`;
        } else {
          // Default to first if they all have the same video
          const firstVid = candidates[0].solutionLink;
          const allSame = candidates.every(c => c.solutionLink === firstVid);
          if (allSame) {
            chosenApna = candidates[0];
            matchType = `lc-slug-multi-same-vid: ${bpSlug}`;
          }
        }
      }
    }

    if (chosenApna) {
      matches.push({
        beenextId: bp.id,
        category: bp.category.title,
        beenextTitle: bp.title,
        apnaTopic: chosenApna.topicName,
        apnaTitle: chosenApna.questionName,
        matchType,
        solutionUrl: cleanYoutubeUrl(chosenApna.solutionLink),
        striverUrl: bp.youtubeUrl
      });
    } else {
      unmatchedBeenext.push({
        id: bp.id,
        category: bp.category.title,
        title: bp.title,
        lc: bp.leetcodeUrl
      });
    }
  }

  console.log(`===============================================`);
  console.log(`TOTAL BEENEXT PROBLEMS: ${beenextProblems.length}`);
  console.log(`MATCHED WITH APNA COLLEGE VIDEO: ${matches.length}`);
  console.log(`WITHOUT APNA COLLEGE VIDEO: ${unmatchedBeenext.length}`);
  console.log(`===============================================`);

  fs.writeFileSync('scripts/final_mapping_preview.json', JSON.stringify(matches, null, 2));

  // Print all matches by category
  const byCat = {};
  for (const m of matches) {
    if (!byCat[m.category]) byCat[m.category] = [];
    byCat[m.category].push(m);
  }

  for (const [cat, items] of Object.entries(byCat)) {
    console.log(`\n--- Category: ${cat} (${items.length} matched) ---`);
    for (const item of items) {
      console.log(`  "${item.beenextTitle}" -> Apna: "${item.apnaTitle}" | [${item.matchType}]`);
      console.log(`     Apna Vid:    ${item.solutionUrl}`);
      console.log(`     Striver Vid: ${item.striverUrl}`);
    }
  }

  // Also check remaining Apna questions with solutions that were NOT matched
  const matchedApnaNames = new Set(matches.map(m => norm(m.apnaTitle)));
  const unmatchedApnaWithSol = apnaWithSol.filter(q => !matchedApnaNames.has(norm(q.questionName)));
  console.log(`\n===============================================`);
  console.log(`APNA QUESTIONS WITH VIDEO NOT MATCHED TO BEENEXT: ${unmatchedApnaWithSol.length}`);
  console.log(`===============================================`);
  for (const u of unmatchedApnaWithSol) {
    console.log(`  "${u.questionName}" (${u.topicName}) | LC: ${u.problemLink} | Vid: ${u.solutionLink}`);
  }

  await prisma.$disconnect();
}

run();
