const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, "all_problem_statements.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const slugs = Object.keys(data);
  console.log(`Starting non-destructive update of ${slugs.length} problems with concurrency...`);

  const BATCH_SIZE = 15;
  let updatedCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < slugs.length; i += BATCH_SIZE) {
    const batchSlugs = slugs.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batchSlugs.map(async (slug) => {
        const item = data[slug];
        await prisma.problem.update({
          where: { slug },
          data: {
            description: item.description,
            inputFormat: item.inputFormat,
            outputFormat: item.outputFormat,
            constraints: item.constraints,
            examples: item.examples,
          },
        });
      })
    );
    updatedCount += batchSlugs.length;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Updated ${updatedCount}/${slugs.length} problems (${elapsed}s)...`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Successfully updated all ${updatedCount} problems in ${totalTime}s!`);
}

main()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
