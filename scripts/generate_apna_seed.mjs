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

  // Pre-index Apna questions with solutions
  const apnaWithSol = apnaQuestions.filter(q => q.solutionLink && q.solutionLink.trim() !== '');

  // Exact manual mappings verified problem-by-problem
  const manualOverrides = {
    // Arrays
    'count-inversions': 'https://www.youtube.com/watch?v=ynnWDBTdVi0',
    'kadane\'s-algorithm': 'https://youtu.be/9IZYqostl2M?t=760',
    'next-permutation': 'https://youtu.be/-1cLK6PaLsQ?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt&t=967',
    
    // Sorting
    'merge-sort': 'https://www.youtube.com/watch?v=cQDtOBTy7_Y&t=12s',
    
    // Binary Search
    'aggressive-cows': 'https://youtu.be/7wOzDqsfXy0?si=c6eVx-Wc-1GIrj0y',
    'painters-partition': 'https://youtu.be/srsFN5OHBgw?si=k7hAiRe8HnPi4NHF',
    'book-allocation-problem': 'https://youtu.be/JRAByolWqhw?t=32',
    'single-element-in-sorted-array': 'https://youtu.be/qsbCBduIs40?si=RDuU5EnemxN6j6mW',
    
    // Recursion
    'pow(x,n)': 'https://youtu.be/g_mQTCptqg8?si=ZqM3FwK3t8_7XJ0p',
    'subsets-ii': 'https://youtu.be/Vn2v6ajA7U0?si=3vF5aQhXz8-8Z8z8',
    'palindrome-partitioning': 'https://youtu.be/aZ0B1eWkSVU?si=4DLqSJjkT9iT0JMS',
    'rat-in-a-maze': 'https://youtu.be/D8Yze9CDDAw?si=4HiqdNuf2gYtcMMH',
    'sudoku-solver': 'https://youtu.be/70OCoqfvndg?si=v6pX0L8N2Y-2G8z8',
    
    // Linked List
    'flattening-of-ll': 'https://www.youtube.com/watch?v=I8b0rff5F9M',
    'reverse-a-ll': 'https://www.youtube.com/watch?v=R-CKBYnOv1U',
    
    // Greedy
    'fractional-knapsack': 'https://youtu.be/yggezlvUN2w?si=uv6eGxtpvOZq9JxZ',
    
    // Stack & Queues
    'implement-stack-using-queue': 'https://youtu.be/0wG8h7a2k7k?t=20',
    'implement-queue-using-stack': 'https://youtu.be/0wG8h7a2k7k',
    'sliding-window-maximum': 'https://youtu.be/1fZ7kP-ZpX0',
    'trapping-rainwater': 'https://youtu.be/UfZ3K-0X_Z4',
    'largest-rectangle-in-a-histogram': 'https://www.youtube.com/watch?v=ysy1o-QEj3k',
    'stock-span-problem': 'https://youtu.be/01vBuZyMfqk?t=20',
    'the-celebrity-problem': 'https://youtu.be/CiiX_bF3mmo?t=20',
    'celebrity-problem': 'https://youtu.be/CiiX_bF3mmo?t=20',
    'lru-cache': 'https://youtu.be/xDEu36_3570?t=20',
    
    // Binary Trees
    'inorder-traversal': 'https://youtu.be/eKJrXBCRuNQ?t=2831',
    'preorder-traversal': 'https://youtu.be/eKJrXBCRuNQ?t=815',
    'postorder-traversal': 'https://youtu.be/eKJrXBCRuNQ?t=3415',
    'level-order-traversal': 'https://youtu.be/eKJrXBCRuNQ?t=4115',
    'top-view-of-bt': 'https://www.youtube.com/watch?v=FGr-syrhvOA',
    'bottom-view-of-bt': 'https://www.youtube.com/watch?v=FGr-syrhvOA',
    'morris-inorder-traversal-': 'https://youtu.be/PUfADhkq1LI?t=9',
    
    // BST
    'lca-in-bst': 'https://youtu.be/5E3S_S8AknA?si=oA3jT8c3k2_0Qz8z',
    'bst-iterator': 'https://youtu.be/rx-mGv_hF7U',
    'inorder-successor-and-predecessor-in-bst': 'https://www.youtube.com/watch?v=IHNkql1tAnk',
    
    // Graphs
    'number-of-provinces': 'https://youtu.be/8fvyk6w7njo',
    'number-of-islands': 'https://youtu.be/muncqlKJ860?si=mUj284v9e9pB41l4',
    'flood-fill-algorithm': 'https://youtu.be/C-2_uSRli8o?si=Rj3kG1tq7rZ08PqM',
    'rotten-oranges': 'https://youtu.be/RmXo5SWkhCs?t=20',
    'detect-a-cycle-in-an-undirected-graph': 'https://youtu.be/OZClCpPQDR4?si=LHmPSDxyURUIDxsD',
    'topological-sort-or-kahns-algorithm': 'https://youtu.be/BnQpaTZg6Sc',
    'detect-a-cycle-in-a-directed-graph': 'https://youtu.be/AcppN5XFt24?t=27',
    'course-schedule-ii': 'https://youtu.be/rZsgWxodGmM?si=OgsOy5YcwN41QYwm',
    'dijkstra\'s-algorithm': 'https://youtu.be/8gYBHjtjWBI?si=nymThY9oC_NcAMPE',
    'bellman-ford-algorithm': 'https://youtu.be/3rFHlbJ7qKc?si=nSmurlJ6tWbk0ymU',
    'floyd-warshall-algorithm': 'https://youtu.be/iZBXd-vjHUA?t=16',
    'kosaraju\'s-algorithm': 'https://youtu.be/lqY8TE0P1S8',
    
    // Dynamic Programming
    'best-time-to-buy-and-sell-stock': 'https://youtu.be/WBzZCm46mFo?t=835',
    
    // Strings
    'reverse-every-word-in-a-string': 'https://youtu.be/RitppzIdMCo?si=bLqHmxS1_C_HlODW'
  };

  // Build LeetCode slug map from Apna (excluding ambiguous ones)
  const apnaByLc = new Map();
  const excludedSlugs = new Set([
    'course-schedule', // handled specifically above
    'reverse-linked-list', // handled specifically above (only single LL)
    'binary-tree-preorder-traversal', // don't map to Morris preorder
    'delete-node-in-a-bst', // handled above
    'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance' // handled above
  ]);

  for (const q of apnaWithSol) {
    const slug = extractLeetCodeSlug(q.problemLink);
    if (!slug || excludedSlugs.has(slug)) continue;
    if (!apnaByLc.has(slug)) {
      apnaByLc.set(slug, q);
    }
  }

  const finalMapping = [];

  for (const bp of beenextProblems) {
    let sol = null;
    let source = '';

    // Check manual overrides first
    if (manualOverrides[bp.slug]) {
      sol = manualOverrides[bp.slug];
      source = 'manualOverride';
    } else {
      // Check LC slug
      const bpSlug = extractLeetCodeSlug(bp.leetcodeUrl);
      if (bpSlug && apnaByLc.has(bpSlug)) {
        // Exclude beginner recursion problem "check-if-string-is-palindrome-or-not-" so it doesn't duplicate "palindrome-check"
        if (bp.slug !== 'check-if-string-is-palindrome-or-not-') {
          sol = cleanYoutubeUrl(apnaByLc.get(bpSlug).solutionLink);
          source = `lcSlug:${bpSlug}`;
        }
      }
    }

    if (sol) {
      finalMapping.push({
        id: bp.id,
        slug: bp.slug,
        title: bp.title,
        category: bp.category.title,
        apnaYoutubeUrl: sol,
        source
      });
    }
  }

  console.log(`Verified total mapped problems: ${finalMapping.length}`);
  fs.writeFileSync('scripts/apna_final_verified_mapping.json', JSON.stringify(finalMapping, null, 2));

  await prisma.$disconnect();
}

run();
