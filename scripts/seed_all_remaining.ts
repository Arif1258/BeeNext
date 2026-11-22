import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

interface ProblemSeedData {
  order: number;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  youtubeUrl: string | null;
  leetcodeUrl: string | null;
  subtopic: string;
  solutions: {
    bf_code: string;
    bf_tc: string;
    bf_sc: string;
    opt_code: string;
    opt_tc: string;
    opt_sc: string;
  };
}

interface CategorySeedData {
  sheet_cat_slug: string;
  db_cat_slug: string;
  label: string;
  problems: ProblemSeedData[];
}

async function main() {
  console.log("=== Striver A2Z DSA Sheet: Master Database Seeding ===");

  // 1. Verify and safeguard Sorting
  const sortingCategory = await prisma.category.findUnique({
    where: { slug: "sorting" },
    include: { problems: true },
  });

  if (!sortingCategory) {
    throw new Error("Sorting category not found in DB! Aborting.");
  }

  console.log(`Sorting category has ${sortingCategory.problems.length} problems (PROTECTED - will NOT touch).`);
  if (sortingCategory.problems.length !== 7) {
    console.warn(`WARNING: Sorting expected 7 problems, found ${sortingCategory.problems.length}`);
  }

  // 2. Clean up old dummy problems from non-sorting categories
  console.log("Cleaning up old test/dummy problems from non-sorting categories...");
  const nonSortingProblems = await prisma.problem.findMany({
    where: {
      category: {
        slug: { not: "sorting" },
      },
    },
    select: { id: true, slug: true },
  });

  console.log(`Found ${nonSortingProblems.length} old problems to clean up.`);
  if (nonSortingProblems.length > 0) {
    await prisma.problem.deleteMany({
      where: {
        id: { in: nonSortingProblems.map((p) => p.id) },
      },
    });
    console.log(`Successfully deleted ${nonSortingProblems.length} old problems.`);
  }

  // 3. Load seed data
  const rawData = fs.readFileSync("/tmp/all_remaining_problems_to_seed.json", "utf-8");
  const categoriesToSeed: CategorySeedData[] = JSON.parse(rawData);

  console.log(`Loaded ${categoriesToSeed.length} categories to seed.`);

  let totalProblemsCreated = 0;
  let totalCodesCreated = 0;

  for (const catData of categoriesToSeed) {
    const dbCat = await prisma.category.findUnique({
      where: { slug: catData.db_cat_slug },
    });

    if (!dbCat) {
      throw new Error(`Category ${catData.db_cat_slug} not found in database!`);
    }

    console.log(`\nSeeding category: ${dbCat.title} (${catData.db_cat_slug}) - ${catData.problems.length} problems`);

    for (const prob of catData.problems) {
      const createdProb = await prisma.problem.create({
        data: {
          title: prob.title,
          slug: prob.slug,
          difficulty: prob.difficulty,
          description: prob.title,
          youtubeUrl: prob.youtubeUrl,
          leetcodeUrl: prob.leetcodeUrl,
          isFree: true,
          price: 0,
          order: prob.order,
          isPublished: true,
          categoryId: dbCat.id,
          codes: {
            create: [
              {
                approachType: "BRUTE_FORCE",
                title: "Brute Force Solution",
                explanation: "",
                javaCode: prob.solutions.bf_code,
                timeComplexity: prob.solutions.bf_tc,
                spaceComplexity: prob.solutions.bf_sc,
              },
              {
                approachType: "OPTIMAL",
                title: "Optimal Solution",
                explanation: "",
                javaCode: prob.solutions.opt_code,
                timeComplexity: prob.solutions.opt_tc,
                spaceComplexity: prob.solutions.opt_sc,
              },
            ],
          },
        },
      });

      totalProblemsCreated++;
      totalCodesCreated += 2;
    }

    console.log(`  -> Completed ${catData.problems.length} problems for ${catData.db_cat_slug}`);
  }

  console.log("\n=== Seeding Summary ===");
  console.log(`Total new problems created: ${totalProblemsCreated}`);
  console.log(`Total code approaches created: ${totalCodesCreated}`);

  // Final verification
  const allProblemsCount = await prisma.problem.count();
  const allSortingCount = await prisma.problem.count({
    where: { category: { slug: "sorting" } },
  });

  console.log(`Total problems now in DB: ${allProblemsCount} (expected: 495)`);
  console.log(`Total sorting problems in DB: ${allSortingCount} (expected: 7)`);
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
