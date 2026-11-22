const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const youtubeUrls = {
  "selection-sort": "https://www.youtube.com/watch?v=HGk_ypEu92M",
  "bubble-sort": "https://www.youtube.com/watch?v=733TttnumK4",
  "insertion-sort": "https://www.youtube.com/watch?v=HGk_ypEu92M",
  "merge-sort": "https://www.youtube.com/watch?v=ogjf7ORKfd8",
  "quick-sort": "https://www.youtube.com/watch?v=WIrA4YexLRQ",
  "recursive-bubble-sort": "https://www.youtube.com/watch?v=HGk_ypEu92M",
  "recursive-insertion-sort": "https://www.youtube.com/watch?v=HGk_ypEu92M",
  "count-inversions": "https://www.youtube.com/watch?v=AseUmwVNaoY",
  "two-sum": "https://www.youtube.com/watch?v=UXDSeD9mN-k",
  "kadanes-algorithm-maximum-subarray": "https://www.youtube.com/watch?v=AHZpyENo7k4",
  "binary-search": "https://www.youtube.com/watch?v=MHf6a42LkAQ",
  "0-1-knapsack": "https://www.youtube.com/watch?v=GqOmJHQZivw",
  "lowest-common-ancestor-binary-tree": "https://www.youtube.com/watch?v=_-QHfMDde90",
  // "count-digits" intentionally left null to test "Video coming soon"
};

async function seed() {
  console.log("Seeding authentic Striver YouTube URLs...");
  for (const [slug, url] of Object.entries(youtubeUrls)) {
    const updated = await prisma.problem.updateMany({
      where: { slug },
      data: { youtubeUrl: url },
    });
    console.log(`- Updated ${slug}: ${updated.count > 0 ? url : "Problem not found"}`);
  }
  console.log("Done seeding YouTube URLs.");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
