/**
 * Real Sandboxed Code Execution Wrapper
 *
 * Integrates with OnlineCompiler.io for authentic, sandboxed execution:
 * - Generates language-specific harness drivers for Java, C++, Python, JavaScript
 * - Full support for Linked Lists (singly, doubly, specialized, cycle detection)
 * - Full support for Binary Trees and BSTs (level-order BFS deserialization/serialization)
 * - Full support for Class-Based Design Problems (LRU/LFU cache, BST Iterator, Trie, etc.)
 * - Injects problem inputs as type-safe native literals
 * - Dispatches test cases via test indices against isolated gVisor containers
 * - Compares genuine stdout against expected outputs with robust normalization
 * - Eliminates all mock execution, fake verdicts, and Node VM sandboxes
 */

import { SupportedLanguage } from "@/lib/judge0";
export type { SupportedLanguage };
import { getProblemStarterTemplates, ProblemTemplateEntry } from "@/lib/problemTemplates";
import {
  executeOnlineCompilerTests,
  executeOnlineCompilerSync,
  OnlineCompilerTestCase,
} from "@/lib/onlineCompiler";

export interface EvaluationResult {
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Compilation Error"
    | "Runtime Error"
    | "Time Limit Exceeded"
    | "Memory Limit Exceeded"
    | "Execution Service Unavailable";
  time: string;
  memory: number;
  compileError?: string;
  runtimeError?: string;
}

export interface TestSuiteEvaluationResult {
  success: boolean;
  overallStatus: "ACCEPTED" | "WRONG_ANSWER" | "COMPILATION_ERROR" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED" | "SERVICE_UNAVAILABLE";
  verdict: string;
  passedTests: number;
  totalTests: number;
  executionTime: string;
  memoryUsage: number;
  errorOutput: string | null;
  testResults: Array<{
    testIndex: number;
    passed: boolean;
    input: string;
    expectedOutput: string | null;
    actualOutput: string;
    status: string;
    time: string;
    memory: number;
  }>;
}

export interface ParsedCommand {
  name: string;
  args: any[];
}

export function parseCommandSequence(inputStr: string): ParsedCommand[] {
  const commands: ParsedCommand[] = [];
  const regex = /([A-Za-z0-9_]+)\s*\((.*?)\)(?:,\s*|\s*;\s*|$)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(inputStr)) !== null) {
    const name = match[1].trim();
    const argsStr = match[2].trim();
    let args: any[] = [];
    if (argsStr.length > 0) {
      try {
        args = JSON.parse(`[${argsStr}]`);
      } catch {
        args = argsStr.split(",").map((s) => {
          const t = s.trim();
          if (t === "true") return true;
          if (t === "false") return false;
          if (t === "null") return null;
          if (!isNaN(Number(t))) return Number(t);
          return t.replace(/^["']|["']$/g, "");
        });
      }
    }
    commands.push({ name, args });
  }
  return commands;
}

/**
 * Parses a LeetCode-style test case input string into argument values.
 * Handles arrow notation for linked lists, command sequences, and natural-language parts.
 */
export function parseInputToArgs(inputStr: string): Record<string, any> {
  const args: Record<string, any> = {};
  if (!inputStr || !inputStr.trim()) return args;

  let trimmed = inputStr.trim();

  // Normalize "head: 25 -> ..." to "head = 25 -> ..."
  if (/^[a-zA-Z0-9_]+\s*:/i.test(trimmed) && !trimmed.startsWith("http")) {
    trimmed = trimmed.replace(/^([a-zA-Z0-9_]+)\s*:/, "$1 =");
  }

  // Check if input is a command sequence like LRUCache(2), put(1, 1)... or pop()
  if (/^[A-Za-z0-9_]+\s*\(.*?\)/.test(trimmed) && !trimmed.includes("=")) {
    args["__commands__"] = parseCommandSequence(trimmed);
    return args;
  }

  // Check for multilevel linked list ASCII diagram
  if (trimmed.includes("\n|") || trimmed.includes("\n |")) {
    const lines = trimmed.split("\n");
    const topValues = lines[0].split("->").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
    const columns: number[][] = topValues.map((v) => [v]);
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("|")) continue;
      const tokens = line.trim().split(/\s+/).map(Number).filter((n) => !isNaN(n));
      tokens.forEach((val, colIdx) => {
        if (colIdx < columns.length) columns[colIdx].push(val);
      });
    }
    args["head"] = columns;
    args["root"] = columns;
    return args;
  }

  // Handle loop back in arrow notation
  let loopVal: number | null = null;
  let hasNoLoop = false;
  if (trimmed.includes("(loops back to")) {
    const m = trimmed.match(/\(loops back to\s*(\d+)\)/i);
    if (m) loopVal = Number(m[1]);
    trimmed = trimmed.replace(/\(loops back to.*?\)/i, "").trim();
  }
  if (trimmed.includes("(no loop)")) {
    hasNoLoop = true;
    trimmed = trimmed.replace(/\(no loop\)/i, "").trim();
  }

  const parts: string[] = [];
  let depth = 0;
  let inQuote = false;
  let current = "";

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '"' && trimmed[i - 1] !== "\\") {
      inQuote = !inQuote;
    } else if (!inQuote) {
      if (ch === "[" || ch === "{" || ch === "(") depth++;
      else if (ch === "]" || ch === "}" || ch === ")") depth--;
      else if (ch === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());

  for (const part of parts) {
    const eqIdx = part.indexOf("=");
    if (eqIdx !== -1) {
      const key = part.slice(0, eqIdx).trim();
      let valStr = part.slice(eqIdx + 1).trim();

      // Clean pos extra description: e.g. "1 (tail connects to node index 1)" -> "1"
      if (/^-?\d+\s*\(/.test(valStr)) {
        valStr = valStr.split("(")[0].trim();
      }

      // Check if value is arrow notation: e.g. "1 -> 2 -> 3" or 1 -> 2 -> 3 or 1 <-> 2 <-> 3
      if (valStr.includes("->") || valStr.includes("<->")) {
        const clean = valStr.replace(/^["']|["']$/g, "");
        const tokens = clean.split(/<->|->/).map((t) => t.trim()).filter(Boolean);
        const arr = tokens.map((t) => (!isNaN(Number(t)) ? Number(t) : t === "null" ? null : t));
        args[key] = arr;
        if (key === "list") args["head"] = arr;
        if (loopVal !== null) {
          const idx = arr.indexOf(loopVal);
          args["pos"] = idx !== -1 ? idx : 0;
        } else if (hasNoLoop) {
          args["pos"] = -1;
        }
        continue;
      }

      let parsed = false;
      if (valStr.includes("{") || valStr.includes("[")) {
        try {
          const jsonCandidate = valStr
            .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
            .replace(/\(/g, "[")
            .replace(/\)/g, "]");
          args[key] = JSON.parse(jsonCandidate);
          parsed = true;
        } catch {}
      }

      if (!parsed) {
        try {
          args[key] = JSON.parse(valStr);
        } catch {
          if (valStr === "true") args[key] = true;
          else if (valStr === "false") args[key] = false;
          else if (!isNaN(Number(valStr))) args[key] = Number(valStr);
          else args[key] = valStr;
        }
      }

      if (key === "list") {
        args["head"] = args[key];
      }
    } else {
      // Natural language descriptive part without "="
      // e.g. "delete value 3" or "delete node 3" or "target node: 2"
      const numMatch = part.match(/(?:delete\s+(?:value|node)|insert\s+(\d+)\s+before\s+head|target\s+node:?|k\s*=|val\s*=)\s*(\d+)/i);
      if (numMatch) {
        const val = Number(numMatch[2] || numMatch[1]);
        args["position"] = val;
        args["x"] = val;
        args["val"] = val;
        args["k"] = val;
        args["node"] = val;
        args["target"] = val;
      }
    }
  }

  return args;
}

/**
 * Normalizes output strings for robust comparison:
 * - strips outer quotes and trailing newlines
 * - converts arrow notation ("1 -> 2 -> 3") to JSON arrays
 * - normalizes descriptive headers ("Intersected at '8'", "Node with value 2", "Inorder = ...")
 * - normalizes booleans (true/false)
 */
export function normalizeOutput(val: any): string {
  if (val === null || val === undefined) return "null";
  let str = typeof val === "string" ? val.trim() : JSON.stringify(val);

  if (str.startsWith('"') && str.endsWith('"') && str.length > 1) {
    try {
      const unquoted = JSON.parse(str);
      if (typeof unquoted === "string") str = unquoted;
    } catch {}
  }

  // Handle arrow notation in output: "1 -> 2 -> 3" or "1 <-> 2 <-> 3"
  if (str.includes("->") || str.includes("<->")) {
    const tokens = str.split(/<->|->/).map((t) => t.trim()).filter(Boolean);
    const parsed = tokens.map((t) => (!isNaN(Number(t)) ? Number(t) : t === "null" ? null : t));
    return JSON.stringify(parsed);
  }

  // Extract common descriptive wrappers:
  // "Intersected at '8'" -> "8"
  // "Node with value 2" -> "2"
  const nodeValMatch = str.match(/(?:Intersected at '(\d+)'|Node with value (\d+))/i);
  if (nodeValMatch) {
    return nodeValMatch[1] || nodeValMatch[2];
  }

  // "right view = [1, 3, 4]" -> "[1,3,4]"
  // "Inorder = [1, 2, 3, 4, 7]" -> "[1,2,3,4,7]"
  const arrMatch = str.match(/=\s*(\[.*?\])/);
  if (arrMatch) {
    try {
      return JSON.stringify(JSON.parse(arrMatch[1]));
    } catch {}
  }

  // "pop: 2, top: 1" -> "[2,1]"
  // "getMin: -3, top: 0, getMin: -2" -> "[-3,0,-2]"
  if (/^[a-zA-Z]+:\s*[-0-9]+(?:\s*,\s*[a-zA-Z]+:\s*[-0-9]+)+$/.test(str)) {
    const nums: number[] = [];
    const re = /:\s*([-0-9]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(str)) !== null) {
      nums.push(Number(m[1]));
    }
    return JSON.stringify(nums);
  }

  try {
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed);
  } catch {
    return str
      .replace(/\r?\n/g, "\n")
      .trim()
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false");
  }
}

export function compareOutputs(actual: any, expected: any): boolean {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  if (normActual === normExpected) return true;

  // Single scalar number vs 1-element array e.g. 6 vs [6]
  if (normActual === `[${normExpected}]` || normExpected === `[${normActual}]`) {
    return true;
  }

  // Floating point equality (1.50 vs 1.5)
  const numA = Number(normActual);
  const numB = Number(normExpected);
  if (!isNaN(numA) && !isNaN(numB) && Math.abs(numA - numB) < 1e-5) {
    return true;
  }

  // Try parsing both as JSON arrays
  try {
    const arrA = JSON.parse(normActual);
    const arrB = JSON.parse(normExpected);
    if (Array.isArray(arrA) && Array.isArray(arrB)) {
      if (arrA.length === arrB.length) {
        if (JSON.stringify(arrA) === JSON.stringify(arrB)) return true;
        // Unordered set/list comparison
        const sortedA = [...arrA].sort((a, b) => (JSON.stringify(a) > JSON.stringify(b) ? 1 : -1));
        const sortedB = [...arrB].sort((a, b) => (JSON.stringify(a) > JSON.stringify(b) ? 1 : -1));
        if (JSON.stringify(sortedA) === JSON.stringify(sortedB)) return true;
      }
    }
  } catch {}

  // If actual is JSON array and expected is scalar (e.g. [2, 0, -4] from linked list traversal vs expected 2), or vice-versa
  try {
    const arrA = JSON.parse(normActual);
    if (Array.isArray(arrA) && arrA.length > 0 && String(arrA[0]) === normExpected) {
      return true;
    }
  } catch {}
  try {
    const arrB = JSON.parse(normExpected);
    if (Array.isArray(arrB) && arrB.length > 0 && String(arrB[0]) === normActual) {
      return true;
    }
  } catch {}

  // Pattern matching (ignore multiple spaces or trailing whitespace on lines)
  const cleanA = normActual.split("\n").map((l) => l.trim().replace(/\s+/g, " ")).join("\n");
  const cleanB = normExpected.split("\n").map((l) => l.trim().replace(/\s+/g, " ")).join("\n");
  if (cleanA === cleanB) return true;

  return false;
}

export function isScalarExpectedOutput(expectedOutput: string): boolean {
  if (!expectedOutput) return false;
  const s = expectedOutput.trim();
  if (s.startsWith("[") || s.startsWith("{") || s.includes("->") || s.includes("<->")) {
    return false;
  }
  return true;
}

export function resolveArgValue(
  p: { name: string; type: string },
  argsMap: Record<string, any>
): any {
  if (argsMap[p.name] !== undefined) return argsMap[p.name];
  const pLower = p.name.toLowerCase();
  for (const k of Object.keys(argsMap)) {
    if (k.toLowerCase() === pLower) return argsMap[k];
  }

  // Common aliases
  if (["arr", "nums", "a", "arr1", "list", "array", "items", "jobs"].includes(pLower)) {
    for (const alt of ["nums", "arr", "a", "arr1", "list", "array", "head", "items", "jobs", "mat", "matrix"]) {
      if (argsMap[alt] !== undefined) return argsMap[alt];
      for (const k of Object.keys(argsMap)) {
        if (k.toLowerCase() === alt.toLowerCase()) return argsMap[k];
      }
    }
  }
  if (["heights", "height"].includes(pLower)) {
    for (const alt of ["heights", "height"]) {
      if (argsMap[alt] !== undefined) return argsMap[alt];
    }
  }
  if (["target", "k", "x", "val", "key", "position"].includes(pLower)) {
    for (const alt of ["target", "k", "x", "val", "key", "position", "c", "C"]) {
      if (argsMap[alt] !== undefined) return argsMap[alt];
    }
  }
  if (["maxweight", "w", "capacity"].includes(pLower)) {
    for (const alt of ["w", "maxweight", "capacity", "w_max", "W"]) {
      if (argsMap[alt] !== undefined) return argsMap[alt];
    }
  }
  if (["weight", "wt"].includes(pLower)) {
    for (const alt of ["wt", "weight", "weights"]) {
      if (argsMap[alt] !== undefined) return argsMap[alt];
    }
  }
  if (["value", "val"].includes(pLower)) {
    for (const alt of ["val", "value", "values"]) {
      if (argsMap[alt] !== undefined) return argsMap[alt];
    }
  }
  if (["heada", "lista"].includes(pLower)) {
    if (argsMap["listA"] !== undefined) return argsMap["listA"];
    if (argsMap["lista"] !== undefined) return argsMap["lista"];
  }
  if (["headb", "listb"].includes(pLower)) {
    if (argsMap["listB"] !== undefined) return argsMap["listB"];
    if (argsMap["listb"] !== undefined) return argsMap["listb"];
  }
  if (["edges", "adj"].includes(pLower)) {
    for (const alt of ["edges", "adj", "graph"]) {
      if (argsMap[alt] !== undefined) return argsMap[alt];
    }
  }
  if (["grid", "heights", "mat", "matrix"].includes(pLower)) {
    for (const alt of ["grid", "heights", "mat", "matrix", "arr"]) {
      if (argsMap[alt] !== undefined) return argsMap[alt];
    }
  }
  if (["words", "dict"].includes(pLower)) {
    for (const alt of ["words", "dict"]) {
      if (argsMap[alt] !== undefined) return argsMap[alt];
    }
  }
  if (["head", "root"].includes(pLower)) {
    for (const alt of ["head", "root", "list", "tree"]) {
      if (argsMap[alt] !== undefined) return argsMap[alt];
    }
  }

  // Dimension & default autodetect
  if (pLower === "n") {
    for (const [key, val] of Object.entries(argsMap)) {
      if (Array.isArray(val) && ["nums", "arr", "a", "arr1", "val", "start", "edges", "height", "heights", "points", "m", "mat", "matrix", "jobs", "words", "head", "items", "a", "b"].includes(key.toLowerCase())) {
        return val.length;
      }
    }
    if (argsMap["v"] !== undefined || argsMap["V"] !== undefined) return argsMap["v"] ?? argsMap["V"];
    if (typeof argsMap["s"] === "string") return argsMap["s"].length;
  }
  if (pLower === "m" || pLower === "cols") {
    if (Array.isArray(argsMap["arr2"])) return argsMap["arr2"].length;
    if (Array.isArray(argsMap["mat"]) && Array.isArray(argsMap["mat"][0])) return argsMap["mat"][0].length;
    if (Array.isArray(argsMap["matrix"]) && Array.isArray(argsMap["matrix"][0])) return argsMap["matrix"][0].length;
    if (Array.isArray(argsMap["grid"]) && Array.isArray(argsMap["grid"][0])) return argsMap["grid"][0].length;
    if (Array.isArray(argsMap["edges"])) return argsMap["edges"].length;
  }
  if (pLower === "k" || pLower === "num") {
    if (argsMap["c"] !== undefined || argsMap["C"] !== undefined) return argsMap["c"] ?? argsMap["C"];
    if (pLower === "num" && Array.isArray(argsMap["arr"])) return argsMap["arr"].length;
  }
  if (pLower === "x" && Array.isArray(argsMap["nums"])) {
    return argsMap["nums"].length;
  }
  if (pLower === "index") {
    return 0;
  }
  if (pLower === "source") {
    return [0, 0];
  }
  if (pLower === "destination") {
    const g = argsMap["grid"] || argsMap["heights"] || argsMap["mat"] || argsMap["matrix"];
    if (Array.isArray(g) && Array.isArray(g[0])) {
      return [g.length - 1, g[0].length - 1];
    }
    return [0, 0];
  }

  return undefined;
}

// -------------------------------------------------------------
// Language Argument Literal Serializers
// -------------------------------------------------------------

function serializePythonLiteral(val: any): string {
  if (val === null || val === undefined) return "None";
  if (typeof val === "boolean") return val ? "True" : "False";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return JSON.stringify(val);
  if (Array.isArray(val)) {
    return `[${val.map((x) => serializePythonLiteral(x)).join(", ")}]`;
  }
  if (typeof val === "object") {
    const entries = Object.entries(val).map(
      ([k, v]) => `${JSON.stringify(k)}: ${serializePythonLiteral(v)}`
    );
    return `{${entries.join(", ")}}`;
  }
  return JSON.stringify(val);
}

function serializeJavaLiteral(val: any, typeHint?: string): string {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") {
    if (typeHint?.toLowerCase().includes("long")) return `${val}L`;
    if (typeHint?.toLowerCase().includes("double")) return `${val}.0`;
    return String(val);
  }
  if (typeof val === "string") return JSON.stringify(val);
  if (Array.isArray(val)) {
    if (val.length === 0) {
      if (typeHint?.includes("int[][]")) return "new int[0][0]";
      if (typeHint?.includes("TreeNode") || typeHint?.includes("Integer")) return "new Integer[0]";
      if (typeHint?.includes("int[]")) return "new int[0]";
      if (typeHint?.includes("Integer[]")) return "new Integer[0]";
      if (typeHint?.includes("String[]")) return "new String[0]";
      return "new int[0]";
    }
    if (Array.isArray(val[0])) {
      return `new int[][]{${val.map((row) => `{${row.join(", ")}}`).join(", ")}}`;
    }
    if (typeof val[0] === "string") {
      return `new String[]{${val.map((s) => JSON.stringify(s)).join(", ")}}`;
    }
    if (typeof val[0] === "boolean") {
      return `new boolean[]{${val.map((b) => (b ? "true" : "false")).join(", ")}}`;
    }
    if (typeHint?.includes("TreeNode") || typeHint?.includes("Integer") || val.some((x) => x === null)) {
      return `new Integer[]{${val.map((x) => (x === null ? "null" : x)).join(", ")}}`;
    }
    return `new int[]{${val.join(", ")}}`;
  }
  return String(val);
}

function serializeCppLiteral(val: any, typeHint?: string): string {
  if (val === null || val === undefined) return "nullptr";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") {
    if (typeHint?.toLowerCase().includes("long")) return `${val}LL`;
    return String(val);
  }
  if (typeof val === "string") return JSON.stringify(val);
  if (Array.isArray(val)) {
    if (val.length === 0) {
      if (typeHint?.includes("vector<vector<int>>")) return "vector<vector<int>>{}";
      if (typeHint?.includes("vector<string>")) return "vector<string>{}";
      return "vector<int>{}";
    }
    if (Array.isArray(val[0])) {
      return `vector<vector<int>>{${val.map((row) => `{${row.join(", ")}}`).join(", ")}}`;
    }
    if (typeof val[0] === "string") {
      return `vector<string>{${val.map((s) => JSON.stringify(s)).join(", ")}}`;
    }
    if (typeof val[0] === "boolean") {
      return `vector<bool>{${val.map((b) => (b ? "true" : "false")).join(", ")}}`;
    }
    return `vector<int>{${val.map((x) => (x === null ? 0 : x)).join(", ")}}`;
  }
  return String(val);
}

// -------------------------------------------------------------
// Driver Code Builders
// -------------------------------------------------------------

export function buildExecutableDriver({
  language,
  sourceCode,
  problemTemplate,
  testCases,
}: {
  language: SupportedLanguage;
  sourceCode: string;
  problemTemplate: ProblemTemplateEntry | null;
  testCases: Array<{ order: number; input: string; expectedOutput: string }>;
}): string {
  const methodName = problemTemplate?.methodName || "solve";
  const returnType = problemTemplate?.returnType || "";
  const params = problemTemplate?.params || [];

  const isDesignProblem = testCases.some((tc) => {
    const parsed = parseInputToArgs(tc.input);
    return Array.isArray(parsed["__commands__"]) && parsed["__commands__"].length > 0;
  });

  const voidTargetIdx = (() => {
    if (returnType !== "void") return 0;
    const mutableIdx = params.findIndex((p) => {
      const t = p.type.toLowerCase();
      return t.includes("[]") || t.includes("vector") || t.includes("list") || t.includes("node");
    });
    return mutableIdx >= 0 ? mutableIdx : 0;
  })();

  // Extract argument arrays for each test case
  const testCasesArgs = testCases.map((tc) => {
    const argsMap = parseInputToArgs(tc.input);
    const commands = argsMap["__commands__"] || null;
    const argValues =
      params.length > 0
        ? params.map((p) => resolveArgValue(p, argsMap))
        : Object.values(argsMap).filter((v) => v !== commands);
    const pos = argsMap["pos"] !== undefined ? Number(argsMap["pos"]) : -1;
    const isScalar = isScalarExpectedOutput(tc.expectedOutput);
    return {
      order: tc.order,
      argValues,
      rawInput: tc.input,
      expectedOutput: tc.expectedOutput,
      commands,
      pos,
      isScalar,
      meta: {
        intersectVal: argsMap["intersectVal"] !== undefined ? Number(argsMap["intersectVal"]) : null,
        skipA: argsMap["skipA"] !== undefined ? Number(argsMap["skipA"]) : null,
        skipB: argsMap["skipB"] !== undefined ? Number(argsMap["skipB"]) : null,
        listA: Array.isArray(argsMap["listA"]) ? argsMap["listA"] : null,
        listB: Array.isArray(argsMap["listB"]) ? argsMap["listB"] : null,
      },
    };
  });

  switch (language) {
    case "python": {
      if (isDesignProblem) {
        const casesDict = testCasesArgs
          .map(({ order, commands, expectedOutput }) => {
            const jsonCmds = JSON.stringify(commands || []);
            const includeNulls = expectedOutput.includes("null");
            return `        ${order}: {"cmds": ${jsonCmds}, "include_nulls": ${includeNulls ? "True" : "False"}}`;
          })
          .join(",\n");

        return `from typing import *
import sys, json, math, collections, heapq, bisect

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# --- Student Solution ---
${sourceCode}

# --- Design Execution Dispatcher ---
if __name__ == "__main__":
    t_str = sys.stdin.read().strip()
    if not t_str:
        sys.exit(0)
    t = int(t_str)
    
    cases = {
${casesDict}
    }
    
    if t in cases:
        data = cases[t]
        cmds = data["cmds"]
        include_nulls = data["include_nulls"]
        
        if not cmds:
            print("[]")
            sys.exit(0)
            
        first_cmd = cmds[0]
        cls_name = first_cmd["name"]
        target_cls = globals().get(cls_name) or globals().get("Solution")
        
        inst = None
        cmds_to_run = cmds
        results = []
        
        if target_cls:
            try:
                inst = target_cls(*first_cmd["args"])
                cmds_to_run = cmds[1:]
                if include_nulls:
                    results.append(None)
            except Exception:
                inst = target_cls()
                cmds_to_run = cmds
        else:
            inst = Solution()
            cmds_to_run = cmds
            
        for cmd in cmds_to_run:
            fn = getattr(inst, cmd["name"], None)
            if fn is None:
                fn = globals().get(cmd["name"])
            if fn is not None:
                r = fn(*cmd["args"])
                if include_nulls or r is not None:
                    results.append(r)
                    
        print(json.dumps(results, separators=(',', ':')))
`;
      }

      const casesDictEntries = testCasesArgs
        .map(({ order, argValues, pos, isScalar, meta }) => {
          const serialized = argValues.map((v) => serializePythonLiteral(v)).join(", ");
          const metaPy = serializePythonLiteral(meta);
          return `        ${order}: {"args": (${serialized}${argValues.length === 1 ? "," : ""}), "pos": ${pos}, "is_scalar": ${isScalar ? "True" : "False"}, "meta": ${metaPy}}`;
        })
        .join(",\n");

      return `from typing import *
import sys, json, math, collections, heapq, bisect

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.data = val
        self.next = next

class Node:
    def __init__(self, val=0, data=None, next=None, prev=None, back=None, child=None, bottom=None, random=None):
        self.val = val if data is None else data
        self.data = self.val
        self.next = next
        self.prev = prev or back
        self.back = self.prev
        self.child = child
        self.bottom = bottom
        self.random = random

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def _create_linked_list(arr, pos=-1, is_node=False):
    if not arr:
        return None
    nodes = [Node(x) if is_node else ListNode(x) for x in arr]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
        if is_node:
            nodes[i + 1].prev = nodes[i]
            nodes[i + 1].back = nodes[i]
    if 0 <= pos < len(nodes):
        nodes[-1].next = nodes[pos]
    return nodes[0]

def _to_list(node):
    res = []
    visited = set()
    while node and id(node) not in visited and len(res) < 10000:
        visited.add(id(node))
        res.append(getattr(node, 'val', getattr(node, 'data', None)))
        node = node.next
    return res

def _create_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    q = collections.deque([root])
    i = 1
    while q and i < len(arr):
        curr = q.popleft()
        if i < len(arr) and arr[i] is not None:
            curr.left = TreeNode(arr[i])
            q.append(curr.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            curr.right = TreeNode(arr[i])
            q.append(curr.right)
        i += 1
    return root

def _tree_to_list(root):
    if not root:
        return []
    res = []
    q = collections.deque([root])
    while q:
        curr = q.popleft()
        if curr:
            res.append(curr.val)
            q.append(curr.left)
            q.append(curr.right)
        else:
            res.append(None)
    while res and res[-1] is None:
        res.pop()
    return res

def _find_tree_node(root, val):
    if not root or val is None:
        return None
    if isinstance(val, TreeNode):
        return val
    if root.val == val:
        return root
    return _find_tree_node(root.left, val) or _find_tree_node(root.right, val)

def _create_intersected(listA, listB, skipA, skipB, intersectVal):
    if not listA:
        return None, None
    nodesA = [ListNode(x) for x in listA]
    for i in range(len(nodesA) - 1):
        nodesA[i].next = nodesA[i + 1]
    headA = nodesA[0]
    if not listB:
        return headA, None
    if intersectVal and intersectVal > 0 and 0 <= skipA < len(nodesA):
        prefix = [ListNode(x) for x in listB[:skipB]]
        for i in range(len(prefix) - 1):
            prefix[i].next = prefix[i + 1]
        if prefix:
            prefix[-1].next = nodesA[skipA]
            headB = prefix[0]
        else:
            headB = nodesA[skipA]
    else:
        nodesB = [ListNode(x) for x in listB]
        for i in range(len(nodesB) - 1):
            nodesB[i].next = nodesB[i + 1]
        headB = nodesB[0]
    return headA, headB

def _create_random_list(arr):
    if not arr:
        return None
    nodes = [Node(x[0]) for x in arr]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    for i, item in enumerate(arr):
        if len(item) > 1 and item[1] is not None and 0 <= item[1] < len(nodes):
            nodes[i].random = nodes[item[1]]
    return nodes[0]

def _random_to_list(head):
    if not head:
        return []
    nodes = []
    curr = head
    visited = set()
    while curr and id(curr) not in visited and len(nodes) < 10000:
        visited.add(id(curr))
        nodes.append(curr)
        curr = curr.next
    node_to_idx = {id(n): i for i, n in enumerate(nodes)}
    res = []
    for n in nodes:
        r_idx = node_to_idx.get(id(n.random), None) if n.random else None
        res.append([getattr(n, 'val', getattr(n, 'data', 0)), r_idx])
    return res

def _create_multilevel_list(cols):
    if not cols:
        return None
    col_heads = []
    for col in cols:
        if not col:
            continue
        col_nodes = [Node(x) for x in col]
        for j in range(len(col_nodes) - 1):
            col_nodes[j].bottom = col_nodes[j + 1]
            col_nodes[j].child = col_nodes[j + 1]
        col_heads.append(col_nodes[0])
    for i in range(len(col_heads) - 1):
        col_heads[i].next = col_heads[i + 1]
    return col_heads[0] if col_heads else None

def _flattened_to_list(head):
    res = []
    visited = set()
    curr = head
    while curr and id(curr) not in visited and len(res) < 10000:
        visited.add(id(curr))
        res.append(getattr(curr, 'val', getattr(curr, 'data', None)))
        curr = curr.bottom or curr.next or curr.child
    return res

# --- Student Solution ---
${sourceCode}

# --- Server-Side Execution Dispatcher ---
if __name__ == "__main__":
    t_str = sys.stdin.read().strip()
    if not t_str:
        sys.exit(0)
    t = int(t_str)
    
    sol = Solution()
    method = getattr(sol, "${methodName}", None)
    if method is None:
        method = globals().get("${methodName}")
    if method is None:
        raise AttributeError("Function '${methodName}' not found in Solution")
        
    cases = {
${casesDictEntries}
    }
    
    param_types = ${JSON.stringify(params.map((p) => p.type.toLowerCase()))}
    ret_type = "${returnType.toLowerCase()}"
    
    if t in cases:
        c_info = cases[t]
        raw_args = list(c_info["args"])
        c_pos = c_info.get("pos", -1)
        is_scalar = c_info.get("is_scalar", False)
        meta = c_info.get("meta", {})
        
        if "${methodName}" == "getIntersectionNode" and meta.get("listA") is not None and meta.get("listB") is not None:
            headA, headB = _create_intersected(meta["listA"], meta["listB"], meta.get("skipA", 0) or 0, meta.get("skipB", 0) or 0, meta.get("intersectVal", 0) or 0)
            call_args = [headA, headB]
        elif "${methodName}" == "copyRandomList" and raw_args and isinstance(raw_args[0], list) and raw_args[0] and isinstance(raw_args[0][0], list):
            call_args = [_create_random_list(raw_args[0])]
        elif "${methodName}" == "flatten" and raw_args and isinstance(raw_args[0], list) and raw_args[0] and isinstance(raw_args[0][0], list):
            call_args = [_create_multilevel_list(raw_args[0])]
        else:
            call_args = []
            for idx, arg in enumerate(raw_args):
                pt = param_types[idx] if idx < len(param_types) else ""
                if isinstance(arg, list) and ("listnode" in pt):
                    call_args.append(_create_linked_list(arg, pos=c_pos, is_node=False))
                elif isinstance(arg, list) and ("node" in pt and "treenode" not in pt):
                    call_args.append(_create_linked_list(arg, pos=c_pos, is_node=True))
                elif isinstance(arg, list) and ("treenode" in pt):
                    call_args.append(_create_tree(arg))
                elif "treenode" in pt and isinstance(arg, (int, float)) and len(call_args) > 0 and isinstance(call_args[0], TreeNode):
                    node = _find_tree_node(call_args[0], arg)
                    call_args.append(node if node is not None else TreeNode(int(arg)))
                else:
                    call_args.append(arg)
                    
        res = method(*call_args)
        
        if "${methodName}" == "copyRandomList":
            print(json.dumps(_random_to_list(res), separators=(',', ':')))
        elif "${methodName}" == "flatten":
            print(json.dumps(_flattened_to_list(res), separators=(',', ':')))
        elif isinstance(res, (ListNode, Node)):
            if is_scalar:
                v = getattr(res, 'val', getattr(res, 'data', None))
                print(json.dumps(v) if v is not None else "null")
            else:
                print(json.dumps(_to_list(res), separators=(',', ':')))
        elif isinstance(res, TreeNode):
            if is_scalar:
                print(json.dumps(res.val) if res else "null")
            else:
                print(json.dumps(_tree_to_list(res), separators=(',', ':')))
        elif "${returnType}" == "void" and len(call_args) > ${voidTargetIdx}:
            target = call_args[${voidTargetIdx}]
            if isinstance(target, (ListNode, Node)):
                print(json.dumps(_to_list(target), separators=(',', ':')))
            elif isinstance(target, TreeNode):
                print(json.dumps(_tree_to_list(target), separators=(',', ':')))
            else:
                print(json.dumps(target, separators=(',', ':')))
        elif res is None and is_scalar:
            print("null")
        else:
            print(json.dumps(res, separators=(',', ':')))
`;
    }

    case "javascript": {
      if (isDesignProblem) {
        const casesDict = testCasesArgs
          .map(({ order, commands, expectedOutput }) => {
            const jsonCmds = JSON.stringify(commands || []);
            const includeNulls = expectedOutput.includes("null");
            return `        ${order}: { cmds: ${jsonCmds}, includeNulls: ${includeNulls} }`;
          })
          .join(",\n");

        return `const fs = require('fs');

class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// --- Student Solution ---
${sourceCode}

// --- Design Execution Dispatcher ---
try {
    const raw = fs.readFileSync(0, 'utf-8').trim();
    if (!raw) process.exit(0);
    const t = parseInt(raw, 10);

    const cases = {
${casesDict}
    };

    if (cases[t]) {
        const { cmds, includeNulls } = cases[t];
        if (!cmds || cmds.length === 0) {
            console.log("[]");
            process.exit(0);
        }

        const firstCmd = cmds[0];
        let Cls = typeof global[firstCmd.name] !== 'undefined' ? global[firstCmd.name] : null;
        if (!Cls && typeof Solution !== 'undefined') Cls = Solution;

        let inst = null;
        let cmdsToRun = cmds;
        const results = [];

        if (Cls) {
            try {
                inst = new Cls(...firstCmd.args);
                cmdsToRun = cmds.slice(1);
                if (includeNulls) results.push(null);
            } catch (e) {
                inst = new Cls();
                cmdsToRun = cmds;
            }
        }

        for (const cmd of cmdsToRun) {
            let fn = inst && typeof inst[cmd.name] === 'function' ? inst[cmd.name].bind(inst) : null;
            if (!fn && typeof global[cmd.name] === 'function') fn = global[cmd.name];
            if (fn) {
                const r = fn(...cmd.args);
                if (includeNulls || r !== undefined) {
                    results.push(r !== undefined ? r : null);
                }
            }
        }

        console.log(JSON.stringify(results));
    }
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
`;
      }

      const casesEntries = testCasesArgs
        .map(({ order, argValues, pos, isScalar, meta }) => {
          const serialized = argValues.map((v) => JSON.stringify(v)).join(", ");
          return `        ${order}: { args: [${serialized}], pos: ${pos}, isScalar: ${isScalar}, meta: ${JSON.stringify(meta)} }`;
        })
        .join(",\n");

      return `const fs = require('fs');

class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.data = val;
        this.next = next;
    }
}

class Node {
    constructor(val = 0, next = null, prev = null, child = null, bottom = null, random = null) {
        this.val = val;
        this.data = val;
        this.next = next;
        this.prev = prev;
        this.back = prev;
        this.child = child;
        this.bottom = bottom;
        this.random = random;
    }
}

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function _createLinkedList(arr, pos = -1, isNode = false) {
    if (!arr || !arr.length) return null;
    const nodes = arr.map(x => isNode ? new Node(x) : new ListNode(x));
    for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].next = nodes[i + 1];
        if (isNode) {
            nodes[i + 1].prev = nodes[i];
            nodes[i + 1].back = nodes[i];
        }
    }
    if (pos >= 0 && pos < nodes.length) {
        nodes[nodes.length - 1].next = nodes[pos];
    }
    return nodes[0];
}

function _toList(node) {
    const res = [];
    const visited = new Set();
    while (node && !visited.has(node) && res.length < 10000) {
        visited.add(node);
        res.push(node.val !== undefined ? node.val : node.data);
        node = node.next;
    }
    return res;
}

function _createTree(arr) {
    if (!arr || !arr.length || arr[0] === null) return null;
    const root = new TreeNode(arr[0]);
    const queue = [root];
    let i = 1;
    while (queue.length > 0 && i < arr.length) {
        const curr = queue.shift();
        if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
            curr.left = new TreeNode(arr[i]);
            queue.push(curr.left);
        }
        i++;
        if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
            curr.right = new TreeNode(arr[i]);
            queue.push(curr.right);
        }
        i++;
    }
    return root;
}

function _treeToList(root) {
    if (!root) return [];
    const res = [];
    const queue = [root];
    while (queue.length > 0) {
        const curr = queue.shift();
        if (curr) {
            res.push(curr.val);
            queue.push(curr.left);
            queue.push(curr.right);
        } else {
            res.push(null);
        }
    }
    while (res.length > 0 && res[res.length - 1] === null) {
        res.pop();
    }
    return res;
}

function _findTreeNode(root, val) {
    if (!root || val === null || val === undefined) return null;
    if (root instanceof TreeNode && root.val === val) return root;
    return _findTreeNode(root.left, val) || _findTreeNode(root.right, val);
}

function _createIntersected(listA, listB, skipA, skipB, intersectVal) {
    if (!listA || !listA.length) return [null, null];
    const nodesA = listA.map(x => new ListNode(x));
    for (let i = 0; i < nodesA.length - 1; i++) nodesA[i].next = nodesA[i + 1];
    const headA = nodesA[0];
    if (!listB || !listB.length) return [headA, null];
    if (intersectVal > 0 && skipA >= 0 && skipA < nodesA.length) {
        const prefix = listB.slice(0, skipB).map(x => new ListNode(x));
        for (let i = 0; i < prefix.length - 1; i++) prefix[i].next = prefix[i + 1];
        if (prefix.length > 0) {
            prefix[prefix.length - 1].next = nodesA[skipA];
            return [headA, prefix[0]];
        }
        return [headA, nodesA[skipA]];
    }
    const nodesB = listB.map(x => new ListNode(x));
    for (let i = 0; i < nodesB.length - 1; i++) nodesB[i].next = nodesB[i + 1];
    return [headA, nodesB[0]];
}

function _createRandomList(arr) {
    if (!arr || !arr.length) return null;
    const nodes = arr.map(x => new Node(x[0]));
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];
    for (let i = 0; i < arr.length; i++) {
        const rIdx = arr[i][1];
        if (rIdx !== null && rIdx !== undefined && rIdx >= 0 && rIdx < nodes.length) {
            nodes[i].random = nodes[rIdx];
        }
    }
    return nodes[0];
}

function _randomToList(head) {
    if (!head) return [];
    const nodes = [];
    const visited = new Set();
    let curr = head;
    while (curr && !visited.has(curr) && nodes.length < 10000) {
        visited.add(curr);
        nodes.push(curr);
        curr = curr.next;
    }
    const map = new Map();
    nodes.forEach((n, idx) => map.set(n, idx));
    return nodes.map(n => [
        n.val !== undefined ? n.val : n.data,
        n.random && map.has(n.random) ? map.get(n.random) : null
    ]);
}

function _createMultilevelList(cols) {
    if (!cols || !cols.length) return null;
    const colHeads = [];
    for (const col of cols) {
        if (!col || !col.length) continue;
        const colNodes = col.map(x => new Node(x));
        for (let j = 0; j < colNodes.length - 1; j++) {
            colNodes[j].bottom = colNodes[j + 1];
            colNodes[j].child = colNodes[j + 1];
        }
        colHeads.push(colNodes[0]);
    }
    for (let i = 0; i < colHeads.length - 1; i++) {
        colHeads[i].next = colHeads[i + 1];
    }
    return colHeads.length > 0 ? colHeads[0] : null;
}

function _flattenedToList(head) {
    const res = [];
    const visited = new Set();
    let curr = head;
    while (curr && !visited.has(curr) && res.length < 10000) {
        visited.add(curr);
        res.push(curr.val !== undefined ? curr.val : curr.data);
        curr = curr.bottom || curr.next || curr.child;
    }
    return res;
}

// --- Student Solution ---
${sourceCode}

// --- Server-Side Execution Dispatcher ---
try {
    const raw = fs.readFileSync(0, 'utf-8').trim();
    if (!raw) process.exit(0);
    const t = parseInt(raw, 10);

    let fn = typeof ${methodName} !== 'undefined' ? ${methodName} : null;
    if (!fn && typeof Solution !== 'undefined') {
        if (typeof Solution.${methodName} === 'function') fn = Solution.${methodName};
        else if (typeof (new Solution()).${methodName} === 'function') {
            const inst = new Solution();
            fn = inst.${methodName}.bind(inst);
        }
    }
    if (!fn) throw new Error("Function '${methodName}' was not found.");

    const cases = {
${casesEntries}
    };

    const paramTypes = ${JSON.stringify(params.map((p) => p.type.toLowerCase()))};

    if (cases[t]) {
        const { args: rawArgs, pos: cPos, isScalar, meta } = cases[t];
        let callArgs = [];

        if ("${methodName}" === "getIntersectionNode" && meta && meta.listA && meta.listB) {
            const [headA, headB] = _createIntersected(meta.listA, meta.listB, meta.skipA || 0, meta.skipB || 0, meta.intersectVal || 0);
            callArgs = [headA, headB];
        } else if ("${methodName}" === "copyRandomList" && rawArgs.length > 0 && Array.isArray(rawArgs[0]) && Array.isArray(rawArgs[0][0])) {
            callArgs = [_createRandomList(rawArgs[0])];
        } else if ("${methodName}" === "flatten" && rawArgs.length > 0 && Array.isArray(rawArgs[0]) && Array.isArray(rawArgs[0][0])) {
            callArgs = [_createMultilevelList(rawArgs[0])];
        } else {
            for (let i = 0; i < rawArgs.length; i++) {
                const arg = rawArgs[i];
                const pt = paramTypes[i] || "";
                if (Array.isArray(arg) && pt.includes("listnode")) {
                    callArgs.push(_createLinkedList(arg, cPos, false));
                } else if (Array.isArray(arg) && pt.includes("node") && !pt.includes("treenode")) {
                    callArgs.push(_createLinkedList(arg, cPos, true));
                } else if (Array.isArray(arg) && pt.includes("treenode")) {
                    callArgs.push(_createTree(arg));
                } else if (pt.includes("treenode") && typeof arg === 'number' && callArgs.length > 0 && callArgs[0] instanceof TreeNode) {
                    const node = _findTreeNode(callArgs[0], arg);
                    callArgs.push(node || new TreeNode(arg));
                } else {
                    callArgs.push(arg);
                }
            }
        }

        const res = fn(...callArgs);
        if ("${methodName}" === "copyRandomList") {
            console.log(JSON.stringify(_randomToList(res)));
        } else if ("${methodName}" === "flatten") {
            console.log(JSON.stringify(_flattenedToList(res)));
        } else if (res instanceof ListNode || res instanceof Node) {
            if (isScalar) {
                console.log(JSON.stringify(res.val !== undefined ? res.val : res.data));
            } else {
                console.log(JSON.stringify(_toList(res)));
            }
        } else if (res instanceof TreeNode) {
            if (isScalar) {
                console.log(JSON.stringify(res.val));
            } else {
                console.log(JSON.stringify(_treeToList(res)));
            }
        } else if ("${returnType}" === "void" && callArgs.length > ${voidTargetIdx}) {
            const target = callArgs[${voidTargetIdx}];
            if (target instanceof ListNode || target instanceof Node) {
                console.log(JSON.stringify(_toList(target)));
            } else if (target instanceof TreeNode) {
                console.log(JSON.stringify(_treeToList(target)));
            } else {
                console.log(JSON.stringify(target));
            }
        } else if (res === null && isScalar) {
            console.log("null");
        } else {
            console.log(JSON.stringify(res));
        }
    }
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
`;
    }

    case "java": {
      const javaSourceCode = sourceCode.replace(/\bpublic\s+class\s+Solution\b/g, "class Solution");
      if (isDesignProblem) {
        const switchCases = testCasesArgs
          .map(({ order, commands, expectedOutput }) => {
            const jsonCmds = JSON.stringify(commands || []).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
            const includeNulls = expectedOutput.includes("null");
            return `            case ${order}: {
                executeDesignCommands("${jsonCmds}", ${includeNulls});
                break;
            }`;
          })
          .join("\n");

        return `import java.util.*;
import java.io.*;
import java.lang.reflect.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// --- Student Solution ---
${javaSourceCode}

// --- Dynamic Design Dispatcher ---
public class Main {
    static void executeDesignCommands(String json, boolean includeNulls) throws Exception {
        // Simple JSON command parser
        List<String> results = new ArrayList<>();
        if (includeNulls) results.add("null");
        
        // Find student class
        Class<?> cls = null;
        String[] possibleClasses = new String[]{"LRUCache", "LFUCache", "BSTIterator", "Twitter", "MinStack", "Trie", "KthLargest", "Solution"};
        for (String cName : possibleClasses) {
            try {
                cls = Class.forName(cName);
                if (cls != null) break;
            } catch (Exception ignored) {}
        }
        if (cls == null) cls = Class.forName("Solution");

        // Parse method names and args
        // Format: [{"name":"put","args":[1,1]}, ...]
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\\{\"name\":\"(.*?)\",\"args\":\\[(.*?)\\]\\}");
        java.util.regex.Matcher m = p.matcher(json);

        Object inst = null;
        boolean first = true;

        while (m.find()) {
            String methodName = m.group(1);
            String rawArgs = m.group(2).trim();
            List<Object> argsList = new ArrayList<>();
            if (!rawArgs.isEmpty()) {
                for (String t : rawArgs.split(",")) {
                    String tok = t.trim();
                    if (tok.equals("true")) argsList.add(true);
                    else if (tok.equals("false")) argsList.add(false);
                    else if (tok.startsWith("\"") && tok.endsWith("\"")) argsList.add(tok.substring(1, tok.length() - 1));
                    else if (tok.matches("-?\\d+")) argsList.add(Integer.parseInt(tok));
                    else argsList.add(tok);
                }
            }

            if (first) {
                first = false;
                // Instantiate class
                for (Constructor<?> ctor : cls.getConstructors()) {
                    if (ctor.getParameterCount() == argsList.size()) {
                        try {
                            inst = ctor.newInstance(argsList.toArray());
                            break;
                        } catch (Exception ignored) {}
                    }
                }
                if (inst == null) inst = cls.getConstructor().newInstance();
                continue;
            }

            // Invoke method on inst
            Method targetMethod = null;
            for (Method meth : cls.getMethods()) {
                if (meth.getName().equals(methodName) && meth.getParameterCount() == argsList.size()) {
                    targetMethod = meth;
                    break;
                }
            }

            if (targetMethod != null) {
                Object ret = targetMethod.invoke(inst, argsList.toArray());
                if (targetMethod.getReturnType() == void.class) {
                    if (includeNulls) results.add("null");
                } else {
                    results.add(String.valueOf(ret));
                }
            }
        }

        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < results.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(results.get(i));
        }
        sb.append("]");
        System.out.println(sb.toString());
    }

    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int t = sc.nextInt();
        switch(t) {
${switchCases}
        }
    }
}
`;
      }

      const switchCases = testCasesArgs
        .map(({ order, argValues, pos, isScalar, meta }) => {
          if (methodName === "getIntersectionNode" && meta.listA && meta.listB) {
            const arrA = serializeJavaLiteral(meta.listA, "int[]");
            const arrB = serializeJavaLiteral(meta.listB, "int[]");
            const callPrint = isScalar
              ? "System.out.println(formatScalar(sol.getIntersectionNode(inter[0], inter[1])));"
              : "System.out.println(format(sol.getIntersectionNode(inter[0], inter[1])));";
            return `            case ${order}: {
                ListNode[] inter = ListNode.createIntersected(${arrA}, ${arrB}, ${meta.skipA ?? 0}, ${meta.skipB ?? 0}, ${meta.intersectVal ?? 0});
                ${callPrint}
                break;
            }`;
          }

          if (methodName === "copyRandomList" && argValues.length > 0 && Array.isArray(argValues[0]) && Array.isArray(argValues[0][0])) {
            const items = argValues[0];
            const valsLit = serializeJavaLiteral(items.map((x: any) => x[0]), "int[]");
            const rIdxLit = serializeJavaLiteral(items.map((x: any) => (x[1] === null || x[1] === undefined ? -1 : x[1])), "int[]");
            return `            case ${order}: {
                Node head = Node.createRandomList(${valsLit}, ${rIdxLit});
                System.out.println(Node.randomToList(sol.copyRandomList(head)));
                break;
            }`;
          }

          if (methodName === "flatten" && argValues.length > 0 && Array.isArray(argValues[0]) && Array.isArray(argValues[0][0])) {
            const colsLit = serializeJavaLiteral(argValues[0], "int[][]");
            return `            case ${order}: {
                Node root = Node.createMultilevelList(${colsLit});
                System.out.println(format(Node.flattenedToList(sol.flatten(root))));
                break;
            }`;
          }

          const varDecls: string[] = [];
          const callArgNames: string[] = [];

          argValues.forEach((v, i) => {
            const pType = params[i]?.type || "";
            const varName = `a${i}`;
            callArgNames.push(varName);

            if (pType.includes("ListNode")) {
              const arrLit = serializeJavaLiteral(v, "int[]");
              varDecls.push(`                ListNode ${varName} = ListNode.createList(${arrLit}, ${pos});`);
            } else if (pType.includes("Node") && !pType.includes("TreeNode")) {
              const arrLit = serializeJavaLiteral(v, "int[]");
              varDecls.push(`                Node ${varName} = Node.createNodeList(${arrLit}, ${pos});`);
            } else if (pType.includes("TreeNode")) {
              if (i === 0) {
                const arrLit = serializeJavaLiteral(v, "Integer[]");
                varDecls.push(`                TreeNode ${varName} = TreeNode.createTree(${arrLit});`);
              } else {
                varDecls.push(`                TreeNode ${varName} = TreeNode.findNode(a0, ${v});`);
              }
            } else {
              varDecls.push(`                ${pType} ${varName} = ${serializeJavaLiteral(v, pType)};`);
            }
          });

          const argsStr = callArgNames.join(", ");
          if (returnType === "void" && argValues.length > 0) {
            return `            case ${order}: {
${varDecls.join("\n")}
                sol.${methodName}(${argsStr});
                System.out.println(format(a${voidTargetIdx}));
                break;
            }`;
          }

          const printStmt = isScalar
            ? `System.out.println(formatScalar(sol.${methodName}(${argsStr})));`
            : `System.out.println(format(sol.${methodName}(${argsStr})));`;

          return `            case ${order}: {
${varDecls.join("\n")}
                ${printStmt}
                break;
            }`;
        })
        .join("\n");

      return `import java.util.*;
import java.io.*;

class ListNode {
    int val;
    int data;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; this.data = val; }
    ListNode(int val, ListNode next) { this.val = val; this.data = val; this.next = next; }
    static ListNode createList(int[] arr, int pos) {
        if (arr == null || arr.length == 0) return null;
        ListNode[] nodes = new ListNode[arr.length];
        for (int i = 0; i < arr.length; i++) nodes[i] = new ListNode(arr[i]);
        for (int i = 0; i < arr.length - 1; i++) nodes[i].next = nodes[i + 1];
        if (pos >= 0 && pos < arr.length) nodes[arr.length - 1].next = nodes[pos];
        return nodes[0];
    }
    static ListNode createList(int[] arr) {
        return createList(arr, -1);
    }
    static ListNode[] createIntersected(int[] listA, int[] listB, int skipA, int skipB, int intersectVal) {
        if (listA == null || listA.length == 0) return new ListNode[]{null, null};
        ListNode[] nodesA = new ListNode[listA.length];
        for (int i = 0; i < listA.length; i++) nodesA[i] = new ListNode(listA[i]);
        for (int i = 0; i < listA.length - 1; i++) nodesA[i].next = nodesA[i + 1];
        ListNode headA = nodesA[0];
        if (listB == null || listB.length == 0) return new ListNode[]{headA, null};
        if (intersectVal > 0 && skipA >= 0 && skipA < listA.length) {
            if (skipB > 0) {
                ListNode[] prefixB = new ListNode[skipB];
                for (int i = 0; i < skipB; i++) prefixB[i] = new ListNode(listB[i]);
                for (int i = 0; i < skipB - 1; i++) prefixB[i].next = prefixB[i + 1];
                prefixB[skipB - 1].next = nodesA[skipA];
                return new ListNode[]{headA, prefixB[0]};
            } else {
                return new ListNode[]{headA, nodesA[skipA]};
            }
        } else {
            ListNode[] nodesB = new ListNode[listB.length];
            for (int i = 0; i < listB.length; i++) nodesB[i] = new ListNode(listB[i]);
            for (int i = 0; i < listB.length - 1; i++) nodesB[i].next = nodesB[i + 1];
            return new ListNode[]{headA, nodesB[0]};
        }
    }
    static List<Integer> toList(ListNode head) {
        List<Integer> list = new ArrayList<>();
        Set<ListNode> visited = new HashSet<>();
        while (head != null && !visited.contains(head) && list.size() < 10000) {
            visited.add(head);
            list.add(head.val);
            head = head.next;
        }
        return list;
    }
}

class Node {
    int val;
    int data;
    Node next;
    Node prev;
    Node back;
    Node child;
    Node bottom;
    Node random;
    Node() {}
    Node(int val) { this.val = val; this.data = val; }
    Node(int val, Node next) { this.val = val; this.data = val; this.next = next; }
    Node(int val, Node next, Node prev) { this.val = val; this.data = val; this.next = next; this.prev = prev; this.back = prev; }
    static Node createNodeList(int[] arr, int pos) {
        if (arr == null || arr.length == 0) return null;
        Node[] nodes = new Node[arr.length];
        for (int i = 0; i < arr.length; i++) nodes[i] = new Node(arr[i]);
        for (int i = 0; i < arr.length - 1; i++) {
            nodes[i].next = nodes[i + 1];
            nodes[i + 1].prev = nodes[i];
            nodes[i + 1].back = nodes[i];
        }
        if (pos >= 0 && pos < arr.length) nodes[arr.length - 1].next = nodes[pos];
        return nodes[0];
    }
    static Node createNodeList(int[] arr) {
        return createNodeList(arr, -1);
    }
    static Node createMultilevelList(int[][] cols) {
        if (cols == null || cols.length == 0) return null;
        List<Node> colHeads = new ArrayList<>();
        for (int[] col : cols) {
            if (col == null || col.length == 0) continue;
            Node[] colNodes = new Node[col.length];
            for (int j = 0; j < col.length; j++) colNodes[j] = new Node(col[j]);
            for (int j = 0; j < col.length - 1; j++) {
                colNodes[j].bottom = colNodes[j + 1];
                colNodes[j].child = colNodes[j + 1];
            }
            colHeads.add(colNodes[0]);
        }
        for (int i = 0; i < colHeads.size() - 1; i++) {
            colHeads.get(i).next = colHeads.get(i + 1);
        }
        return colHeads.isEmpty() ? null : colHeads.get(0);
    }
    static List<Integer> flattenedToList(Node head) {
        List<Integer> res = new ArrayList<>();
        Set<Node> visited = new HashSet<>();
        Node curr = head;
        while (curr != null && !visited.contains(curr) && res.size() < 10000) {
            visited.add(curr);
            res.add(curr.data != 0 ? curr.data : curr.val);
            curr = curr.bottom != null ? curr.bottom : (curr.next != null ? curr.next : curr.child);
        }
        return res;
    }
    static Node createRandomList(int[] vals, int[] randomIndices) {
        if (vals == null || vals.length == 0) return null;
        Node[] nodes = new Node[vals.length];
        for (int i = 0; i < vals.length; i++) nodes[i] = new Node(vals[i]);
        for (int i = 0; i < vals.length - 1; i++) nodes[i].next = nodes[i + 1];
        for (int i = 0; i < vals.length; i++) {
            int r = randomIndices[i];
            if (r >= 0 && r < vals.length) nodes[i].random = nodes[r];
        }
        return nodes[0];
    }
    static String randomToList(Node head) {
        if (head == null) return "[]";
        List<Node> nodes = new ArrayList<>();
        Set<Node> visited = new HashSet<>();
        Node curr = head;
        while (curr != null && !visited.contains(curr) && nodes.size() < 10000) {
            visited.add(curr);
            nodes.add(curr);
            curr = curr.next;
        }
        Map<Node, Integer> map = new HashMap<>();
        for (int i = 0; i < nodes.size(); i++) map.put(nodes.get(i), i);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < nodes.size(); i++) {
            if (i > 0) sb.append(",");
            Node n = nodes.get(i);
            sb.append("[").append(n.data != 0 ? n.data : n.val).append(",");
            if (n.random != null && map.containsKey(n.random)) {
                sb.append(map.get(n.random));
            } else {
                sb.append("null");
            }
            sb.append("]");
        }
        sb.append("]");
        return sb.toString();
    }
    static List<Integer> toList(Node head) {
        List<Integer> list = new ArrayList<>();
        Set<Node> visited = new HashSet<>();
        while (head != null && !visited.contains(head) && list.size() < 10000) {
            visited.add(head);
            list.add(head.data != 0 ? head.data : head.val);
            head = head.next;
        }
        return list;
    }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
    static TreeNode createTree(int[] arr) {
        if (arr == null || arr.length == 0) return null;
        Integer[] boxed = new Integer[arr.length];
        for (int i = 0; i < arr.length; i++) boxed[i] = arr[i];
        return createTree(boxed);
    }
    static TreeNode createTree(Integer[] arr) {
        if (arr == null || arr.length == 0 || arr[0] == null) return null;
        TreeNode root = new TreeNode(arr[0]);
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < arr.length) {
            TreeNode curr = q.poll();
            if (i < arr.length && arr[i] != null) {
                curr.left = new TreeNode(arr[i]);
                q.add(curr.left);
            }
            i++;
            if (i < arr.length && arr[i] != null) {
                curr.right = new TreeNode(arr[i]);
                q.add(curr.right);
            }
            i++;
        }
        return root;
    }
    static TreeNode findNode(TreeNode root, int val) {
        if (root == null) return null;
        if (root.val == val) return root;
        TreeNode l = findNode(root.left, val);
        if (l != null) return l;
        return findNode(root.right, val);
    }
    static List<Integer> treeToList(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            TreeNode curr = q.poll();
            if (curr != null) {
                res.add(curr.val);
                q.add(curr.left);
                q.add(curr.right);
            } else {
                res.add(null);
            }
        }
        while (!res.isEmpty() && res.get(res.size() - 1) == null) {
            res.remove(res.size() - 1);
        }
        return res;
    }
}

// --- Student Solution ---
${javaSourceCode}

// --- Server-Side Execution Dispatcher ---
public class Main {
    static String formatScalar(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof ListNode) return String.valueOf(((ListNode) obj).val);
        if (obj instanceof Node) {
            Node n = (Node) obj;
            return String.valueOf(n.data != 0 ? n.data : n.val);
        }
        if (obj instanceof TreeNode) return String.valueOf(((TreeNode) obj).val);
        return format(obj);
    }

    static String format(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof int[][]) {
            int[][] mat = (int[][]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < mat.length; i++) {
                if (i > 0) sb.append(",");
                sb.append("[");
                for (int j = 0; j < mat[i].length; j++) {
                    if (j > 0) sb.append(",");
                    sb.append(mat[i][j]);
                }
                sb.append("]");
            }
            return sb.append("]").toString();
        }
        if (obj instanceof int[]) {
            int[] a = (int[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(a[i]);
            }
            return sb.append("]").toString();
        }
        if (obj instanceof long[]) {
            long[] a = (long[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(a[i]);
            }
            return sb.append("]").toString();
        }
        if (obj instanceof double[]) {
            double[] a = (double[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(a[i]);
            }
            return sb.append("]").toString();
        }
        if (obj instanceof boolean[]) {
            boolean[] a = (boolean[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(a[i]);
            }
            return sb.append("]").toString();
        }
        if (obj instanceof String[]) {
            String[] a = (String[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) {
                if (i > 0) sb.append(",");
                sb.append('"').append(a[i]).append('"');
            }
            return sb.append("]").toString();
        }
        if (obj instanceof List) {
            List<?> l = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < l.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(format(l.get(i)));
            }
            return sb.append("]").toString();
        }
        if (obj instanceof ListNode) return format(ListNode.toList((ListNode) obj));
        if (obj instanceof Node) return format(Node.toList((Node) obj));
        if (obj instanceof TreeNode) return format(TreeNode.treeToList((TreeNode) obj));
        return String.valueOf(obj);
    }

    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int t = sc.nextInt();
        Solution sol = new Solution();
        
        switch(t) {
${switchCases}
        }
    }
}
`;
    }

    case "cpp": {
      if (isDesignProblem) {
        const switchCases = testCasesArgs
          .map(({ order, commands, expectedOutput }) => {
            if (!commands || commands.length === 0) {
              return `        case ${order}: cout << "[]\\n"; break;`;
            }
            const firstCmd = commands[0];
            const className = firstCmd.name;
            const initArgs = firstCmd.args.map((a: any) => serializeCppLiteral(a)).join(", ");
            const includeNulls = expectedOutput.includes("null");

            const methodInvocations = commands
              .slice(1)
              .map((c: any) => {
                const argsStr = c.args.map((a: any) => serializeCppLiteral(a)).join(", ");
                if (c.name.startsWith("get") || c.name.startsWith("search") || c.name.startsWith("is") || c.name.startsWith("top") || c.name.startsWith("pop") || c.name.startsWith("next") || c.name.startsWith("has") || c.name.startsWith("find") || c.name.startsWith("count")) {
                  return `            cout << "," << obj.${c.name}(${argsStr});`;
                }
                return `            obj.${c.name}(${argsStr});\n            cout << ",null";`;
              })
              .join("\n");

            return `        case ${order}: {
            ${className} obj(${initArgs});
            cout << "[${includeNulls ? "null" : ""}";
${methodInvocations}
            cout << "]\\n";
            break;
        }`;
          })
          .join("\n");

        return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <list>
using namespace std;

class ListNode {
public:
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class TreeNode {
public:
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

// --- Student Solution ---
${sourceCode}

// --- Design Execution Dispatcher ---
int main() {
    int t;
    if (!(cin >> t)) return 0;
    switch(t) {
${switchCases}
    }
    return 0;
}
`;
      }

      const switchCases = testCasesArgs
        .map(({ order, argValues, pos, isScalar, meta }) => {
          if (methodName === "getIntersectionNode" && meta.listA && meta.listB) {
            const arrA = serializeCppLiteral(meta.listA, "vector<int>");
            const arrB = serializeCppLiteral(meta.listB, "vector<int>");
            const callPrint = isScalar
              ? "printScalar(sol.getIntersectionNode(headA, headB));"
              : "printVal(sol.getIntersectionNode(headA, headB));";
            return `        case ${order}: {
            ListNode *headA = nullptr, *headB = nullptr;
            createIntersected(${arrA}, ${arrB}, ${meta.skipA ?? 0}, ${meta.skipB ?? 0}, ${meta.intersectVal ?? 0}, headA, headB);
            ${callPrint}
            break;
        }`;
          }

          if (methodName === "copyRandomList" && argValues.length > 0 && Array.isArray(argValues[0]) && Array.isArray(argValues[0][0])) {
            const items = argValues[0];
            const valsStr = items.map((x: any) => x[0]).join(", ");
            const rIdxStr = items.map((x: any) => (x[1] === null || x[1] === undefined ? -1 : x[1])).join(", ");
            return `        case ${order}: {
            vector<int> vals = {${valsStr}};
            vector<int> rIdx = {${rIdxStr}};
            Node* head = createRandomList(vals, rIdx);
            printRandomList(sol.copyRandomList(head));
            break;
        }`;
          }

          if (methodName === "flatten" && argValues.length > 0 && Array.isArray(argValues[0]) && Array.isArray(argValues[0][0])) {
            const colsLit = serializeCppLiteral(argValues[0], "vector<vector<int>>");
            return `        case ${order}: {
            vector<vector<int>> cols = ${colsLit};
            Node* root = createMultilevelList(cols);
            printFlattenedList(sol.flatten(root));
            break;
        }`;
          }

          const varDecls = argValues
            .map((v, i) => {
              const cppType = params[i]?.type || "auto";
              if (cppType.includes("ListNode")) {
                const vecLiteral = serializeCppLiteral(v, "vector<int>");
                return `            ListNode* a${i} = createList(${vecLiteral}, ${pos});`;
              }
              if (cppType.includes("Node") && !cppType.includes("TreeNode")) {
                const vecLiteral = serializeCppLiteral(v, "vector<int>");
                return `            Node* a${i} = createNodeList(${vecLiteral}, ${pos});`;
              }
              if (cppType.includes("TreeNode")) {
                if (i === 0) {
                  const vecLiteral = serializeCppLiteral(v, "vector<int>");
                  const isNullVec = Array.isArray(v)
                    ? `vector<bool>{${v.map((x) => (x === null ? "true" : "false")).join(", ")}}`
                    : "vector<bool>{}";
                  return `            TreeNode* a${i} = createTree(${vecLiteral}, ${isNullVec});`;
                } else {
                  return `            TreeNode* a${i} = findNode(a0, ${v});`;
                }
              }
              const literal = serializeCppLiteral(v, cppType);
              if (cppType.includes("int[]") || cppType.includes("vector<int>")) {
                return `            vector<int> a${i} = ${literal};`;
              }
              if (cppType.includes("String") || cppType.includes("string")) {
                return `            string a${i} = ${literal};`;
              }
              if (cppType.includes("int[][]") || cppType.includes("vector<vector<int>>")) {
                return `            vector<vector<int>> a${i} = ${literal};`;
              }
              return `            auto a${i} = ${literal};`;
            })
            .join("\n");

          const argNames = argValues.map((_, i) => `a${i}`).join(", ");

          if (returnType === "void" && argValues.length > 0) {
            return `        case ${order}: {
${varDecls}
            sol.${methodName}(${argNames});
            printVal(a${voidTargetIdx});
            break;
        }`;
          }

          const printStmt = isScalar
            ? `printScalar(sol.${methodName}(${argNames}));`
            : `printVal(sol.${methodName}(${argNames}));`;

          return `        case ${order}: {
${varDecls}
            ${printStmt}
            break;
        }`;
        })
        .join("\n");

      return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <sstream>
using namespace std;

struct ListNode {
    int val;
    int data;
    ListNode *next;
    ListNode() : val(0), data(0), next(nullptr) {}
    ListNode(int x) : val(x), data(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), data(x), next(next) {}
};

struct Node {
    int val;
    int data;
    Node *next;
    Node *prev;
    Node *back;
    Node *child;
    Node *bottom;
    Node *random;
    Node() : val(0), data(0), next(nullptr), prev(nullptr), back(nullptr), child(nullptr), bottom(nullptr), random(nullptr) {}
    Node(int x) : val(x), data(x), next(nullptr), prev(nullptr), back(nullptr), child(nullptr), bottom(nullptr), random(nullptr) {}
    Node(int x, Node* next) : val(x), data(x), next(next), prev(nullptr), back(nullptr), child(nullptr), bottom(nullptr), random(nullptr) {}
    Node(int x, Node* next, Node* prev) : val(x), data(x), next(next), prev(prev), back(prev), child(nullptr), bottom(nullptr), random(nullptr) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

ListNode* createList(const vector<int>& arr, int pos = -1) {
    if (arr.empty()) return nullptr;
    ListNode* head = new ListNode(arr[0]);
    ListNode* curr = head;
    vector<ListNode*> nodes = {head};
    for (size_t i = 1; i < arr.size(); i++) {
        curr->next = new ListNode(arr[i]);
        curr = curr->next;
        nodes.push_back(curr);
    }
    if (pos >= 0 && pos < (int)nodes.size()) {
        nodes.back()->next = nodes[pos];
    }
    return head;
}

Node* createNodeList(const vector<int>& arr, int pos = -1) {
    if (arr.empty()) return nullptr;
    Node* head = new Node(arr[0]);
    Node* curr = head;
    vector<Node*> nodes = {head};
    for (size_t i = 1; i < arr.size(); i++) {
        Node* nxt = new Node(arr[i]);
        curr->next = nxt;
        nxt->prev = curr;
        nxt->back = curr;
        curr = nxt;
        nodes.push_back(curr);
    }
    if (pos >= 0 && pos < (int)nodes.size()) {
        nodes.back()->next = nodes[pos];
    }
    return head;
}

TreeNode* createTree(const vector<int>& vals, const vector<bool>& isNull) {
    if (vals.empty() || isNull[0]) return nullptr;
    TreeNode* root = new TreeNode(vals[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < vals.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (i < vals.size() && !isNull[i]) {
            curr->left = new TreeNode(vals[i]);
            q.push(curr->left);
        }
        i++;
        if (i < vals.size() && !isNull[i]) {
            curr->right = new TreeNode(vals[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

TreeNode* findNode(TreeNode* root, int val) {
    if (!root) return nullptr;
    if (root->val == val) return root;
    TreeNode* l = findNode(root->left, val);
    if (l) return l;
    return findNode(root->right, val);
}

void createIntersected(const vector<int>& listA, const vector<int>& listB, int skipA, int skipB, int intersectVal, ListNode*& headA, ListNode*& headB) {
    if (listA.empty()) { headA = nullptr; headB = nullptr; return; }
    vector<ListNode*> nodesA;
    for (int x : listA) nodesA.push_back(new ListNode(x));
    for (size_t i = 0; i + 1 < nodesA.size(); i++) nodesA[i]->next = nodesA[i + 1];
    headA = nodesA[0];
    if (listB.empty()) { headB = nullptr; return; }
    if (intersectVal > 0 && skipA >= 0 && skipA < (int)nodesA.size()) {
        if (skipB > 0) {
            vector<ListNode*> prefixB;
            for (int i = 0; i < skipB && i < (int)listB.size(); i++) prefixB.push_back(new ListNode(listB[i]));
            for (size_t i = 0; i + 1 < prefixB.size(); i++) prefixB[i]->next = prefixB[i + 1];
            if (!prefixB.empty()) {
                prefixB.back()->next = nodesA[skipA];
                headB = prefixB[0];
            } else {
                headB = nodesA[skipA];
            }
        } else {
            headB = nodesA[skipA];
        }
    } else {
        vector<ListNode*> nodesB;
        for (int x : listB) nodesB.push_back(new ListNode(x));
        for (size_t i = 0; i + 1 < nodesB.size(); i++) nodesB[i]->next = nodesB[i + 1];
        headB = nodesB[0];
    }
}

Node* createRandomList(const vector<int>& vals, const vector<int>& rIdx) {
    if (vals.empty()) return nullptr;
    vector<Node*> nodes;
    for (int x : vals) nodes.push_back(new Node(x));
    for (size_t i = 0; i + 1 < nodes.size(); i++) nodes[i]->next = nodes[i + 1];
    for (size_t i = 0; i < vals.size(); i++) {
        int r = rIdx[i];
        if (r >= 0 && r < (int)nodes.size()) nodes[i]->random = nodes[r];
    }
    return nodes[0];
}

void printRandomList(Node* head) {
    if (!head) { cout << "[]\\n"; return; }
    vector<Node*> nodes;
    unordered_set<Node*> visited;
    Node* curr = head;
    while (curr && visited.find(curr) == visited.end() && (int)nodes.size() < 10000) {
        visited.insert(curr);
        nodes.push_back(curr);
        curr = curr->next;
    }
    unordered_map<Node*, int> idxMap;
    for (size_t i = 0; i < nodes.size(); i++) idxMap[nodes[i]] = (int)i;
    cout << "[";
    for (size_t i = 0; i < nodes.size(); i++) {
        if (i > 0) cout << ",";
        cout << "[" << (nodes[i]->data != 0 ? nodes[i]->data : nodes[i]->val) << ",";
        if (nodes[i]->random && idxMap.find(nodes[i]->random) != idxMap.end()) {
            cout << idxMap[nodes[i]->random];
        } else {
            cout << "null";
        }
        cout << "]";
    }
    cout << "]\\n";
}

Node* createMultilevelList(const vector<vector<int>>& cols) {
    if (cols.empty()) return nullptr;
    vector<Node*> colHeads;
    for (const auto& col : cols) {
        if (col.empty()) continue;
        vector<Node*> colNodes;
        for (int x : col) colNodes.push_back(new Node(x));
        for (size_t j = 0; j + 1 < colNodes.size(); j++) {
            colNodes[j]->bottom = colNodes[j + 1];
            colNodes[j]->child = colNodes[j + 1];
        }
        colHeads.push_back(colNodes[0]);
    }
    for (size_t i = 0; i + 1 < colHeads.size(); i++) {
        colHeads[i]->next = colHeads[i + 1];
    }
    return colHeads.empty() ? nullptr : colHeads[0];
}

void printFlattenedList(Node* head) {
    cout << "[";
    unordered_set<Node*> visited;
    Node* curr = head;
    int count = 0;
    while (curr && visited.find(curr) == visited.end() && count < 10000) {
        visited.insert(curr);
        if (count > 0) cout << ",";
        cout << (curr->data != 0 ? curr->data : curr->val);
        curr = curr->bottom ? curr->bottom : (curr->next ? curr->next : curr->child);
        count++;
    }
    cout << "]\\n";
}

template<typename T>
void printVal(const T& val) {
    cout << val << "\\n";
}

void printVal(bool val) {
    cout << (val ? "true" : "false") << "\\n";
}

template<typename T>
void printVal(const vector<vector<T>>& mat) {
    cout << "[";
    for (size_t i = 0; i < mat.size(); i++) {
        cout << "[";
        for (size_t j = 0; j < mat[i].size(); j++) {
            cout << mat[i][j] << (j + 1 < mat[i].size() ? "," : "");
        }
        cout << "]" << (i + 1 < mat.size() ? "," : "");
    }
    cout << "]\\n";
}

template<typename T>
void printVal(const vector<T>& vec) {
    cout << "[";
    for (size_t i = 0; i < vec.size(); i++) {
        cout << vec[i] << (i + 1 < vec.size() ? "," : "");
    }
    cout << "]\\n";
}

void printVal(ListNode* node) {
    cout << "[";
    unordered_set<ListNode*> visited;
    int count = 0;
    while (node && visited.find(node) == visited.end() && count < 10000) {
        visited.insert(node);
        cout << node->val << (node->next && visited.find(node->next) == visited.end() ? "," : "");
        node = node->next;
        count++;
    }
    cout << "]\\n";
}

void printVal(Node* node) {
    cout << "[";
    unordered_set<Node*> visited;
    int count = 0;
    while (node && visited.find(node) == visited.end() && count < 10000) {
        visited.insert(node);
        cout << (node->data != 0 ? node->data : node->val) << (node->next && visited.find(node->next) == visited.end() ? "," : "");
        node = node->next;
        count++;
    }
    cout << "]\\n";
}

void printVal(TreeNode* root) {
    if (!root) {
        cout << "[]\\n";
        return;
    }
    vector<string> res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();
        if (curr) {
            res.push_back(to_string(curr->val));
            q.push(curr->left);
            q.push(curr->right);
        } else {
            res.push_back("null");
        }
    }
    while (!res.empty() && res.back() == "null") {
        res.pop_back();
    }
    cout << "[";
    for (size_t i = 0; i < res.size(); i++) {
        cout << res[i] << (i + 1 < res.size() ? "," : "");
    }
    cout << "]\\n";
}

template<typename T>
void printScalar(const T& val) {
    printVal(val);
}

void printScalar(ListNode* n) {
    if (!n) cout << "null\\n";
    else cout << n->val << "\\n";
}

void printScalar(Node* n) {
    if (!n) cout << "null\\n";
    else cout << (n->data != 0 ? n->data : n->val) << "\\n";
}

void printScalar(TreeNode* n) {
    if (!n) cout << "null\\n";
    else cout << n->val << "\\n";
}

// --- Student Solution ---
${sourceCode}

// --- Server-Side Execution Dispatcher ---
int main() {
    int t;
    if (!(cin >> t)) return 0;
    Solution sol;
    
    switch(t) {
${switchCases}
    }
    return 0;
}
`;
    }

    default:
      return sourceCode;
  }
}

// -------------------------------------------------------------
// Core Test Suite Evaluation via OnlineCompiler
// -------------------------------------------------------------

export async function evaluateTestSuiteWithOnlineCompiler({
  language,
  sourceCode,
  problemSlug,
  testCases,
  isSubmission = false,
  cacheKey,
  userId,
  problemId,
}: {
  language: SupportedLanguage;
  sourceCode: string;
  problemSlug: string;
  testCases: Array<{ order: number; input: string; expectedOutput: string; isSample?: boolean }>;
  isSubmission?: boolean;
  cacheKey?: string;
  userId?: string;
  problemId?: string;
}): Promise<TestSuiteEvaluationResult> {
  const trimmed = sourceCode.trim();
  if (!trimmed) {
    return {
      success: false,
      overallStatus: "COMPILATION_ERROR",
      verdict: "Compilation Error",
      passedTests: 0,
      totalTests: testCases.length,
      executionTime: "0.00",
      memoryUsage: 0,
      errorOutput: "Error: No source code provided.",
      testResults: testCases.map((tc) => ({
        testIndex: tc.order,
        passed: false,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: "",
        status: "Compilation Error",
        time: "0.00",
        memory: 0,
      })),
    };
  }

  const problemTemplate = getProblemStarterTemplates(problemSlug);

  // Generate real driver
  const executableCode = buildExecutableDriver({
    language,
    sourceCode,
    problemTemplate,
    testCases,
  });

  // Prepare batch test cases for OnlineCompiler (all cases visible for inspection)
  const onlineTests: OnlineCompilerTestCase[] = testCases.map((tc) => ({
    input: `${tc.order}\n`,
    expected_output: `${normalizeOutput(tc.expectedOutput)}\n`,
    hidden: false,
  }));

  try {
    const rawResult = await executeOnlineCompilerTests({
      language,
      code: executableCode,
      tests: onlineTests,
      timeLimit: 2,
      cacheKey,
      userId,
      problemId,
    });

    let passedTests = 0;
    let maxTime = 0.0;
    let maxMemory = 0;
    let overallVerdict = "Accepted";
    let overallStatus: TestSuiteEvaluationResult["overallStatus"] = "ACCEPTED";
    let errorOutput: string | null = rawResult.compile_error || null;

    if (rawResult.verdict === "compilation_error") {
      overallVerdict = "Compilation Error";
      overallStatus = "COMPILATION_ERROR";
      errorOutput = rawResult.compile_error || "Compilation failed.";
    }

    const testResults: TestSuiteEvaluationResult["testResults"] = [];

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const ocRes = rawResult.tests?.[i];

      const timeVal = parseFloat(ocRes?.time || "0.00");
      if (timeVal > maxTime) maxTime = timeVal;

      const memVal = parseInt(ocRes?.memory || "0", 10);
      if (memVal > maxMemory) maxMemory = memVal;

      let status = "Wrong Answer";
      let passed = false;
      const actualOutput = ocRes?.output ? ocRes.output.trim() : "";

      if (!ocRes || ocRes.verdict === "skipped") {
        status = ocRes?.verdict === "skipped" ? "Execution Skipped" : "Incomplete Provider Response";
        passed = false;
      } else {
        const isCompilationError =
          rawResult.verdict === "compilation_error" ||
          ocRes?.verdict === "compilation_error" ||
          !!rawResult.compile_error ||
          ocRes?.error?.includes("error:") ||
          ocRes?.error?.includes("SyntaxError");

        if (isCompilationError) {
          status = "Compilation Error";
          passed = false;
          if (!errorOutput) errorOutput = rawResult.compile_error || ocRes?.error || "Compilation failed.";
        } else if (ocRes?.verdict === "time_limit_exceeded" || ocRes?.exit_code === 124) {
          status = "Time Limit Exceeded";
          passed = false;
          if (!errorOutput) errorOutput = "Time Limit Exceeded. Execution timed out.";
        } else if (ocRes?.verdict === "runtime_error" || (ocRes?.exit_code !== 0 && ocRes?.exit_code !== undefined)) {
          status = "Runtime Error";
          passed = false;
          if (!errorOutput) errorOutput = ocRes?.error || "Runtime error occurred during execution.";
        } else if (ocRes?.verdict === "memory_limit_exceeded") {
          status = "Memory Limit Exceeded";
          passed = false;
          if (!errorOutput) errorOutput = "Memory Limit Exceeded.";
        } else if (ocRes?.hidden) {
          passed = ocRes.verdict === "accepted" && ocRes.exit_code === 0;
          status = passed ? "Accepted" : "Wrong Answer";
        } else if (ocRes.exit_code === 0 && (compareOutputs(actualOutput, tc.expectedOutput) || ocRes.verdict === "accepted")) {
          status = "Accepted";
          passed = true;
        } else {
          status = "Wrong Answer";
          passed = false;
        }
      }

      if (passed) {
        passedTests++;
      }

      testResults.push({
        testIndex: tc.order,
        passed,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput,
        status,
        time: (ocRes?.time || "0.00").toString(),
        memory: memVal,
      });
    }

    if (overallStatus !== "COMPILATION_ERROR") {
      if (testResults.some((t) => t.status === "Compilation Error")) {
        overallStatus = "COMPILATION_ERROR";
        overallVerdict = "Compilation Error";
      } else if (testResults.some((t) => t.status === "Runtime Error")) {
        overallStatus = "RUNTIME_ERROR";
        overallVerdict = "Runtime Error";
      } else if (testResults.some((t) => t.status === "Time Limit Exceeded")) {
        overallStatus = "TIME_LIMIT_EXCEEDED";
        overallVerdict = "Time Limit Exceeded";
      } else if (testResults.some((t) => t.status === "Memory Limit Exceeded")) {
        overallStatus = "WRONG_ANSWER";
        overallVerdict = "Memory Limit Exceeded";
      } else if (passedTests < testCases.length) {
        overallStatus = "WRONG_ANSWER";
        overallVerdict = "Wrong Answer";
      } else {
        overallStatus = "ACCEPTED";
        overallVerdict = "Accepted";
      }
    }

    return {
      success: true,
      overallStatus,
      verdict: overallVerdict,
      passedTests,
      totalTests: testCases.length,
      executionTime: maxTime.toFixed(3),
      memoryUsage: maxMemory,
      errorOutput,
      testResults,
    };
  } catch (err: any) {
    const isRateLimit = err.message?.includes("429") || err.message?.includes("rate limit");
    const errorMsg = isRateLimit
      ? "Execution rate limit reached. Please wait a few seconds before retrying."
      : `Execution Service Unavailable: ${err.message || "Failed to reach execution provider."}`;

    return {
      success: false,
      overallStatus: "SERVICE_UNAVAILABLE",
      verdict: "Execution Service Unavailable",
      passedTests: 0,
      totalTests: testCases.length,
      executionTime: "0.00",
      memoryUsage: 0,
      errorOutput: errorMsg,
      testResults: testCases.map((tc) => ({
        testIndex: tc.order,
        passed: false,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: "",
        status: "Execution Service Unavailable",
        time: "0.00",
        memory: 0,
      })),
    };
  }
}

/**
 * Backwards-compatible single-test execution wrapper.
 */
export async function evaluateCodeWithWrapper({
  language,
  sourceCode,
  input,
  expectedOutput,
  testIndex = 1,
  problemSlug = "",
}: {
  language: SupportedLanguage;
  sourceCode: string;
  input: string;
  expectedOutput: string;
  testIndex: number;
  problemSlug?: string;
}): Promise<EvaluationResult> {
  const result = await evaluateTestSuiteWithOnlineCompiler({
    language,
    sourceCode,
    problemSlug,
    testCases: [{ order: testIndex, input, expectedOutput, isSample: true }],
  });

  const firstTest = result.testResults[0];
  return {
    passed: firstTest?.passed || false,
    actualOutput: firstTest?.actualOutput || "",
    expectedOutput,
    status: (firstTest?.status as EvaluationResult["status"]) || "Wrong Answer",
    time: firstTest?.time || result.executionTime,
    memory: firstTest?.memory || result.memoryUsage,
    compileError: result.overallStatus === "COMPILATION_ERROR" ? result.errorOutput || undefined : undefined,
    runtimeError: result.overallStatus === "RUNTIME_ERROR" || result.overallStatus === "TIME_LIMIT_EXCEEDED" ? result.errorOutput || undefined : undefined,
  };
}
