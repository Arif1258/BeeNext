/**
 * Heal the Remaining 117 Problems with Genuine Test Cases and Execution Verification
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { buildExecutableDriver, compareOutputs, parseInputToArgs } from "../src/lib/executionWrapper";

const prisma = new PrismaClient();
const registry = JSON.parse(fs.readFileSync("src/data/problem_templates_registry.json", "utf-8"));
const statements = JSON.parse(fs.readFileSync("scripts/all_problem_statements.json", "utf-8"));
const curatedPath = path.resolve("scripts/curated_active_test_cases.json");
const curatedData: Record<string, Array<{ order: number; isSample: boolean; input: string; expectedOutput: string }>> = JSON.parse(fs.readFileSync(curatedPath, "utf-8"));

function prepareReferenceSolution(slug: string, solCode: string): string {
  let code = solCode;
  if (slug === "selection-sort" && !code.includes("sortArray")) {
    code = code.replace(/class\s+\w+[\s\S]*?\{/, (m) => `${m}\n    public int[] sortArray(int[] nums) { selectionSort(nums); return nums; }`);
  } else if (slug === "bubble-sort" && !code.includes("sortArray")) {
    code = code.replace(/class\s+\w+[\s\S]*?\{/, (m) => `${m}\n    public int[] sortArray(int[] nums) { bubbleSort(nums); return nums; }`);
  } else if (slug === "insertion-sort" && !code.includes("sortArray")) {
    code = code.replace(/class\s+\w+[\s\S]*?\{/, (m) => `${m}\n    public int[] sortArray(int[] nums) { insertionSort(nums); return nums; }`);
  } else if (slug === "merge-sort" && !code.includes("sortArray")) {
    code = code.replace(/class\s+\w+[\s\S]*?\{/, (m) => `${m}\n    public int[] sortArray(int[] nums) { mergeSort(nums, 0, nums.length - 1); return nums; }`);
  } else if (slug === "quick-sort" && !code.includes("sortArray")) {
    code = code.replace(/class\s+\w+[\s\S]*?\{/, (m) => `${m}\n    public int[] sortArray(int[] nums) { quickSort(nums, 0, nums.length - 1); return nums; }`);
  } else if (slug === "recursive-insertion-sort" && !code.includes("sortArray")) {
    code = code.replace(/class\s+\w+[\s\S]*?\{/, (m) => `${m}\n    public int[] sortArray(int[] nums) { insertionSort(nums, 0, nums.length); return nums; }`);
  } else if (slug === "recursive-bubble-sort" && !code.includes("sortArray")) {
    code = code.replace(/class\s+\w+[\s\S]*?\{/, (m) => `${m}\n    public int[] sortArray(int[] nums) { bubbleSort(nums, nums.length); return nums; }`);
  } else if (slug === "traversal-in-linked-list" && !code.includes("traverseList")) {
    code = code.replace(/class\s+\w+[\s\S]*?\{/, (m) => `${m}\n    public List<Integer> traverseList(ListNode head) { return printList(head); }`);
  } else if (slug === "count-inversions") {
    return `public class Solution {
    public static long numberOfInversions(long[] a, int n) {
        return mergeSort(a, 0, n - 1);
    }
    private static long mergeSort(long[] a, int low, int high) {
        long count = 0;
        if (low >= high) return count;
        int mid = (low + high) / 2;
        count += mergeSort(a, low, mid);
        count += mergeSort(a, mid + 1, high);
        count += merge(a, low, mid, high);
        return count;
    }
    private static long merge(long[] a, int low, int mid, int high) {
        java.util.ArrayList<Long> temp = new java.util.ArrayList<>();
        int left = low, right = mid + 1;
        long count = 0;
        while (left <= mid && right <= high) {
            if (a[left] <= a[right]) { temp.add(a[left++]); }
            else { temp.add(a[right++]); count += (mid - left + 1); }
        }
        while (left <= mid) temp.add(a[left++]);
        while (right <= high) temp.add(a[right++]);
        for (int i = low; i <= high; i++) a[i] = temp.get(i - low);
        return count;
    }
}`;
  }
  return code;
}

function executeJava(
  solCode: string,
  tmpl: any,
  cases: Array<{ order: number; input: string; expectedOutput: string }>
): { success: boolean; outputs: Record<number, string>; error?: string } {
  const preparedSol = prepareReferenceSolution(tmpl.slug, solCode);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "heal_exec_"));
  try {
    const javaSource = buildExecutableDriver({
      language: "java",
      sourceCode: preparedSol,
      problemTemplate: tmpl,
      testCases: cases,
    });
    fs.writeFileSync(path.join(tmpDir, "Main.java"), javaSource);
    execSync("javac Main.java", { cwd: tmpDir, stdio: "pipe" });

    const outputs: Record<number, string> = {};
    for (const tc of cases) {
      try {
        const out = execSync("java Main", {
          cwd: tmpDir,
          input: `${tc.order}\n`,
          timeout: 5000,
          stdio: "pipe",
        }).toString().trim();
        outputs[tc.order] = out;
      } catch (err: any) {
        outputs[tc.order] = "";
      }
    }
    return { success: true, outputs };
  } catch (err: any) {
    const msg = err.stderr ? err.stderr.toString() : err.message;
    return { success: false, outputs: {}, error: msg };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

export { executeJava, prepareReferenceSolution };
