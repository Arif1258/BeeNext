import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      leetcodeUrl: true,
      youtubeUrl: true,
      category: { select: { title: true } }
    }
  });

  const keywords = [
    "reverse words",
    "cows",
    "painter",
    "maze",
    "merge sort",
    "inversion",
    "flatten",
    "dijkstra",
    "bellman",
    "kosaraju",
    "knapsack",
    "topological",
    "breadth first",
    "depth first",
    "bfs",
    "dfs",
    "morris",
    "kruskal",
    "prim",
    "book allocation",
    "pages",
    "gas station",
    "duplicate"
  ];

  for (const kw of keywords) {
    const matched = problems.filter(p => 
      p.title.toLowerCase().includes(kw) || 
      p.slug.toLowerCase().includes(kw) ||
      (p.leetcodeUrl && p.leetcodeUrl.toLowerCase().includes(kw))
    );
    console.log(`\n=== Keyword: "${kw}" (${matched.length} matches) ===`);
    matched.forEach(m => console.log(`  [${m.category.title}] "${m.title}" (slug: ${m.slug}) -> LC: ${m.leetcodeUrl} | Striver: ${m.youtubeUrl}`));
  }

  await prisma.$disconnect();
}

run();
