const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const allProblems = await prisma.problem.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      inputFormat: true,
      outputFormat: true,
      constraints: true,
      examples: true,
      category: {
        select: {
          title: true,
          slug: true,
        },
      },
      codes: {
        select: {
          id: true,
          approachType: true,
        },
      },
    },
  });

  console.log(`Auditing all ${allProblems.length} problems in database...`);

  let invalidCount = 0;
  const categories = {};

  for (const p of allProblems) {
    const cat = p.category.title;
    if (!categories[cat]) categories[cat] = 0;
    categories[cat]++;

    const hasDesc = p.description && p.description.trim().length >= 20;
    const hasInput = p.inputFormat && p.inputFormat.trim().length > 0;
    const hasOutput = p.outputFormat && p.outputFormat.trim().length > 0;
    const hasConstraints = p.constraints && p.constraints.trim().length > 0;
    const hasExamples = Array.isArray(p.examples) && p.examples.length >= 2;

    if (!hasDesc || !hasInput || !hasOutput || !hasConstraints || !hasExamples) {
      console.error(`Invalid problem: ${p.slug} (${p.title}) in [${cat}]`, {
        descLen: p.description ? p.description.length : 0,
        hasInput,
        hasOutput,
        hasConstraints,
        examplesCount: Array.isArray(p.examples) ? p.examples.length : 0,
      });
      invalidCount++;
    }

    if (p.codes.length !== 2) {
      console.warn(`Problem ${p.slug} has ${p.codes.length} codes instead of 2!`);
    }
  }

  console.log("\nProblems by category:");
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`  - ${cat}: ${count} problems`);
  }

  const totalCodes = await prisma.problemCode.count();
  console.log(`\nTotal ProblemCodes in DB: ${totalCodes} (Expected: 990)`);

  if (invalidCount === 0 && totalCodes === 990 && allProblems.length === 495) {
    console.log("\nALL 495 PROBLEMS & 990 SOLUTIONS FULLY VERIFIED IN DATABASE!");
  } else {
    console.error(`\nFAILED AUDIT: ${invalidCount} invalid problems, ${totalCodes} codes.`);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
