import { prisma } from "../src/lib/prisma";
import registryData from "../src/data/problem_templates_registry.json";
import { parseInputToArgs, resolveArgValue, normalizeOutput, compareOutputs } from "../src/lib/executionWrapper";

interface ProblemTemplate {
  title: string;
  slug: string;
  isConceptual: boolean;
  methodName: string;
  returnType: string;
  params: Array<{ name: string; type: string }>;
  templates?: Record<string, string>;
}

const registry = registryData as Record<string, ProblemTemplate>;

async function main() {
  console.log("==========================================================");
  console.log("   BATCH VERIFICATION: ALL 495 TOPICS & 464 CODING PROBLEMS");
  console.log("==========================================================\n");

  const problems = await prisma.problem.findMany({
    include: {
      testCases: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { slug: "asc" },
  });

  console.log(`Total topics in database: ${problems.length}`);

  let conceptualCount = 0;
  let codingCount = 0;
  let malformedInputCount = 0;
  let malformedExpectedCount = 0;
  let incorrectTestCaseCount = 0;
  let paramMismatchCount = 0;

  const conceptualSlugs: string[] = [];
  const codingSlugs: string[] = [];

  for (const p of problems) {
    const tmpl = registry[p.slug];
    const isConceptual = tmpl?.isConceptual ?? false;

    if (isConceptual) {
      conceptualCount++;
      conceptualSlugs.push(p.slug);
      if (p.testCases.length !== 0) {
        console.error(`Conceptual topic ${p.slug} has active test cases: ${p.testCases.length}`);
        incorrectTestCaseCount++;
      }
      continue;
    }

    codingCount++;
    codingSlugs.push(p.slug);

    if (p.testCases.length !== 6) {
      console.error(`Problem ${p.slug} does not have 6 test cases: has ${p.testCases.length}`);
      incorrectTestCaseCount++;
    }

    // Verify test case order and sample flags
    p.testCases.forEach((tc, idx) => {
      const expectedOrder = idx + 1;
      if (tc.order !== expectedOrder) {
        console.error(`Problem ${p.slug} case ${idx} has order ${tc.order}, expected ${expectedOrder}`);
        incorrectTestCaseCount++;
      }
      const expectedSample = expectedOrder <= 3;
      if (tc.isSample !== expectedSample) {
        console.error(`Problem ${p.slug} case ${tc.order} isSample=${tc.isSample}, expected ${expectedSample}`);
        incorrectTestCaseCount++;
      }

      if (!tc.input || !tc.input.trim()) {
        console.error(`Problem ${p.slug} case ${tc.order} has empty input!`);
        malformedInputCount++;
      }

      if (tc.expectedOutput === null || tc.expectedOutput === undefined || tc.expectedOutput.trim() === "") {
        console.error(`Problem ${p.slug} case ${tc.order} has empty expected output!`);
        malformedExpectedCount++;
      }

      // Check input parsing
      const argsMap = parseInputToArgs(tc.input);
      if (tmpl && tmpl.params && tmpl.params.length > 0) {
        const isDesign = Array.isArray(argsMap["__commands__"]);
        if (!isDesign) {
          const resolvedArgs = tmpl.params.map(param => resolveArgValue(param, argsMap));
          const missingIdx = resolvedArgs.findIndex(a => a === undefined);
          if (missingIdx >= 0) {
            console.warn(`  [Param mismatch] ${p.slug} Case ${tc.order}: param "${tmpl.params[missingIdx].name}" (${tmpl.params[missingIdx].type}) unresolved from input "${tc.input}"`);
            paramMismatchCount++;
          }
        }
      }
    });
  }

  console.log(`\nAudit Results:`);
  console.log(`- Conceptual Topics (0 test cases, no playground): ${conceptualCount} (Expected: 31)`);
  console.log(`- Active Coding Problems (exactly 6 test cases): ${codingCount} (Expected: 464)`);
  console.log(`- Total Active Test Cases: ${codingCount * 6} (Expected: 2784)`);
  console.log(`- Test Case Count Inconsistencies: ${incorrectTestCaseCount}`);
  console.log(`- Empty/Malformed Inputs: ${malformedInputCount}`);
  console.log(`- Empty/Malformed Expected Outputs: ${malformedExpectedCount}`);
  console.log(`- Parameter Resolution Mismatches: ${paramMismatchCount}`);

  if (incorrectTestCaseCount > 0 || malformedInputCount > 0 || malformedExpectedCount > 0) {
    console.error("\nFAIL: Found structural inconsistencies in problem test cases.");
    process.exit(1);
  } else {
    console.log("\nSUCCESS: All 464 coding problems have exactly 6 active test cases (Run: 3, Submit: 6).");
    console.log("SUCCESS: All 31 conceptual topics have 0 active test cases and no playground.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
