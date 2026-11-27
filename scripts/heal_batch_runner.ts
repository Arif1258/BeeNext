import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { buildExecutableDriver, compareOutputs, parseInputToArgs } from "../src/lib/executionWrapper";

const registry = JSON.parse(fs.readFileSync("src/data/problem_templates_registry.json", "utf-8"));
const statements = JSON.parse(fs.readFileSync("scripts/all_problem_statements.json", "utf-8"));
const curatedPath = path.resolve("scripts/curated_active_test_cases.json");
const curatedData: Record<string, Array<{ order: number; isSample: boolean; input: string; expectedOutput: string }>> = JSON.parse(fs.readFileSync(curatedPath, "utf-8"));
const allJavaSolutions: Record<string, string> = JSON.parse(fs.readFileSync("scripts/all_java_solutions.json", "utf-8"));

export function prepareReferenceSolution(slug: string, solCode: string): string {
  let code = solCode;

  // Sorting problems
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
  } else if (slug === "traversal-in-linked-list") {
    code = `public class Solution {
    public List<Integer> traverseList(ListNode head) {
        List<Integer> res = new ArrayList<>();
        ListNode curr = head;
        while (curr != null) {
            res.add(curr.val);
            curr = curr.next;
        }
        return res;
    }
}`;
  } else if (slug === "flattening-of-ll") {
    code = code.replace(/static\s+class\s+Node\s*\{[\s\S]*?\n\s*\}/g, "");
  } else if (slug === "reverse-an-array") {
    code = code.replace(/class\s+\w+[\s\S]*?\{/, (m) => `${m}\n    public void reverseArray(int n, int[] arr) { reverseArray(arr); }`);
  } else if (slug === "disjoint-set-") {
    code = code.replace(/class\s+\w+[\s\S]*?\{/, (m) => `${m}\n    private DisjointSet ds = new DisjointSet(100000);\n    public int findUPar(int node) { return ds.findUPar(node); }`);
  } else if (slug === "introduction-to-bits-and-tricks") {
    code = code.replace(/public\s+static\s+void\s+bitTricks\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}/, "public static void bitTricks(int n, int i) { System.out.println((n & (1 << i)) != 0); }");
  } else if (slug === "implement-stack-using-linkedlist") {
    code = `public class Solution {
    static class StackNode {
        int data;
        StackNode next;
        StackNode(int a) { data = a; next = null; }
    }
    static class MyStack {
        StackNode top;
        public void push(int a) {
            StackNode temp = new StackNode(a);
            temp.next = top;
            top = temp;
        }
        public int pop() {
            if (top == null) return -1;
            int res = top.data;
            top = top.next;
            return res;
        }
        public int top() {
            if (top == null) return -1;
            return top.data;
        }
    }
}`;
  }

  return code;
}

export function executeJava(
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
    const stderr = err.stderr ? err.stderr.toString() : err.message;
    return { success: false, outputs: {}, error: stderr };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}
