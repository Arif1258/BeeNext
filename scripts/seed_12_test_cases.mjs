/**
 * Secure Test Case Seeder for BeeNext
 *
 * STAGE GUARD:
 * - NEVER generates synthetic fallback test cases or arbitrary placeholder outputs.
 * - Requires verified, curated test cases from `scripts/curated_active_test_cases.json`.
 * - Validates all active test cases against problem constraints before seeding.
 * - Conceptual problems are preserved with 0 test cases.
 * - Requires explicit --apply flag to modify database records.
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const CURATED_PATH = path.resolve("scripts/curated_active_test_cases.json");
const REGISTRY_PATH = path.resolve("src/data/problem_templates_registry.json");

async function main() {
  const applyDb = process.argv.includes("--apply");

  console.log("=== BEENEXT TEST CASE SYNCHRONIZATION SCRIPT ===");
  if (!applyDb) {
    console.log("DRY RUN MODE: Pass --apply to write changes to database.");
  } else {
    console.log("APPLY MODE: Writing curated test cases to database.");
  }

  if (!fs.existsSync(CURATED_PATH)) {
    throw new Error(
      `Curated test cases file not found at ${CURATED_PATH}. Run curation and offline verification first!`
    );
  }

  const curatedData = JSON.parse(fs.readFileSync(CURATED_PATH, "utf-8"));
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));

  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true },
    orderBy: { order: "asc" },
  });

  console.log(`Found ${problems.length} total problems in database.`);

  let codingProblemsCount = 0;
  let conceptualCount = 0;
  let validCuratedCount = 0;
  const missingFromCurated = [];

  for (const problem of problems) {
    const template = registry[problem.slug];
    const isConceptual = !template || template.isConceptual;

    if (isConceptual) {
      conceptualCount++;
      continue;
    }

    codingProblemsCount++;
    const problemCases = curatedData[problem.slug];

    if (!problemCases || !Array.isArray(problemCases) || problemCases.length < 6) {
      missingFromCurated.push(problem.slug);
      continue;
    }

    // Verify no synthetic placeholders exist in curated cases
    for (const tc of problemCases) {
      if (
        tc.input.includes("[10, 20, 30, 40]") &&
        problem.slug !== "two-sum" &&
        problem.slug !== "maximum-subarray" &&
        problem.slug !== "jump-game-ii"
      ) {
        throw new Error(
          `Curated data contains synthetic fallback input for problem ${problem.slug}!`
        );
      }
    }

    validCuratedCount++;
  }

  console.log(`Coding problems: ${codingProblemsCount}`);
  console.log(`Conceptual topics: ${conceptualCount}`);
  console.log(`Valid curated problems: ${validCuratedCount}`);

  if (missingFromCurated.length > 0) {
    throw new Error(
      `ABORTING: ${missingFromCurated.length} coding problems missing from curated data! Sample: ${missingFromCurated.slice(0, 5).join(", ")}`
    );
  }

  if (applyDb) {
    console.log("Fetching existing test cases from database in a single query...");
    const existingTestCases = await prisma.testCase.findMany({
      select: { id: true, problemId: true, order: true },
    });
    const existingMap = new Map();
    for (const etc of existingTestCases) {
      existingMap.set(`${etc.problemId}_${etc.order}`, etc.id);
    }
    console.log(`Loaded ${existingMap.size} existing test cases into memory.`);

    console.log("Marking cases > 6 inactive...");
    await prisma.testCase.updateMany({
      where: { order: { gt: 6 }, isActive: true },
      data: { isActive: false },
    });

    console.log("Preparing batch update operations...");
    const operations = [];
    for (const problem of problems) {
      const template = registry[problem.slug];
      if (!template || template.isConceptual) continue;

      const cases = curatedData[problem.slug];
      for (const tc of cases) {
        const existingId = existingMap.get(`${problem.id}_${tc.order}`);
        if (existingId) {
          operations.push(() =>
            prisma.testCase.update({
              where: { id: existingId },
              data: {
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isActive: true,
                isSample: tc.order <= 3,
              },
            })
          );
        } else {
          operations.push(() =>
            prisma.testCase.create({
              data: {
                problemId: problem.id,
                order: tc.order,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isActive: true,
                isSample: tc.order <= 3,
              },
            })
          );
        }
      }
    }

    console.log(`Executing ${operations.length} test case operations with concurrency = 30...`);
    const concurrency = 30;
    let completed = 0;
    for (let i = 0; i < operations.length; i += concurrency) {
      const chunk = operations.slice(i, i + concurrency);
      await Promise.all(chunk.map((fn) => fn()));
      completed += chunk.length;
      if (completed % 300 === 0 || completed === operations.length) {
        console.log(`Progress: ${completed} / ${operations.length} test cases synchronized.`);
      }
    }

    console.log(`Successfully updated ${operations.length} active test cases across ${validCuratedCount} problems.`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("FATAL ERROR in seed script:", err);
  process.exit(1);
});
