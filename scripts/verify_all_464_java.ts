import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { buildExecutableDriver, compareOutputs } from "../src/lib/executionWrapper";
import { prepareReferenceSolution } from "./heal_batch_runner";

const reg = JSON.parse(fs.readFileSync("src/data/problem_templates_registry.json", "utf8"));
const curated = JSON.parse(fs.readFileSync("scripts/curated_active_test_cases.json", "utf8"));
const sols = JSON.parse(fs.readFileSync("scripts/all_java_solutions.json", "utf8"));

const codingSlugs = Object.keys(reg).filter((s) => !reg[s].isConceptual);

interface Result {
  slug: string;
  passed: boolean;
  passCount: number;
  totalCount: number;
  error?: string;
  failures?: Array<{ order: number; expected: string; actual: string }>;
}

function runProblemJava(slug: string): Result {
  const tmpl = reg[slug];
  const sol = sols[slug];
  const cases = curated[slug];

  if (!sol) {
    return { slug, passed: false, passCount: 0, totalCount: cases.length, error: "Missing solution" };
  }

  const preparedSol = prepareReferenceSolution(slug, sol);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bn_verify_java_"));

  try {
    const javaSource = buildExecutableDriver({
      language: "java",
      sourceCode: preparedSol,
      problemTemplate: tmpl,
      testCases: cases,
    });

    fs.writeFileSync(path.join(tmpDir, "Main.java"), javaSource);
    try {
      execSync("javac Main.java", { cwd: tmpDir, stdio: "pipe", timeout: 15000 });
    } catch (err: any) {
      const stderr = err.stderr ? err.stderr.toString() : err.message;
      return {
        slug,
        passed: false,
        passCount: 0,
        totalCount: cases.length,
        error: `Compilation failed: ${stderr.split("\n")[0]}`,
      };
    }

    let passCount = 0;
    const failures: Array<{ order: number; expected: string; actual: string }> = [];

    for (const tc of cases) {
      try {
        const out = execSync("java Main", {
          cwd: tmpDir,
          input: `${tc.order}\n`,
          timeout: 5000,
          stdio: "pipe",
        })
          .toString()
          .trim();

        if (compareOutputs(out, tc.expectedOutput)) {
          passCount++;
        } else {
          failures.push({ order: tc.order, expected: tc.expectedOutput, actual: out });
        }
      } catch (err: any) {
        failures.push({ order: tc.order, expected: tc.expectedOutput, actual: `RUNTIME_ERROR: ${err.message}` });
      }
    }

    return {
      slug,
      passed: passCount === cases.length,
      passCount,
      totalCount: cases.length,
      failures: failures.length > 0 ? failures : undefined,
    };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  console.log(`Starting Java offline verification of all ${codingSlugs.length} coding problems...`);
  const startTime = Date.now();

  const results: Result[] = [];
  const chunkSize = 16;

  for (let i = 0; i < codingSlugs.length; i += chunkSize) {
    const chunk = codingSlugs.slice(i, i + chunkSize);
    const chunkPromises = chunk.map((slug) => {
      return new Promise<Result>((resolve) => {
        // Run synchronously within the worker promise
        const res = runProblemJava(slug);
        resolve(res);
      });
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);

    const passedSoFar = results.filter((r) => r.passed).length;
    console.log(`Progress: ${results.length}/${codingSlugs.length} problems tested. Passed so far: ${passedSoFar}`);
  }

  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);

  console.log("\n=======================================================");
  console.log(`SUMMARY: ${passed.length}/${codingSlugs.length} problems passed 6/6 test cases in Java.`);
  console.log(`Elapsed time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log("=======================================================\n");

  if (failed.length > 0) {
    console.log(`Failed problems count: ${failed.length}`);
    fs.writeFileSync("scripts/java_verify_failures.json", JSON.stringify(failed, null, 2));
    console.log("Written failures to scripts/java_verify_failures.json");
    for (const f of failed.slice(0, 10)) {
      console.log(`FAIL [${f.slug}]: ${f.passCount}/${f.totalCount} passed. ${f.error || ""}`);
      if (f.failures) {
        for (const failItem of f.failures) {
          console.log(`   Case ${failItem.order}: Expected: ${failItem.expected.slice(0, 40)} | Actual: ${failItem.actual.slice(0, 40)}`);
        }
      }
    }
    if (failed.length > 10) {
      console.log(`... and ${failed.length - 10} more.`);
    }
  } else {
    console.log("ALL 464 CODING PROBLEMS PASSED 6/6 IN JAVA OFFLINE EXECUTION!");
  }
}

main().catch(console.error);
