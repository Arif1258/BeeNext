import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TestCaseDef {
  order: number;
  input: string;
  expectedOutput: string;
}

const updates: Record<string, TestCaseDef[]> = {
  "detect-a-loop-in-ll": [
    { order: 1, input: "head = [3, 2, 0, -4], pos = 1", expectedOutput: "true" },
    { order: 2, input: "head = [1], pos = -1", expectedOutput: "false" },
    { order: 3, input: "head = [1, 2], pos = 0", expectedOutput: "true" },
    { order: 4, input: "head = [1, 2, 3, 4, 5], pos = 2", expectedOutput: "true" },
    { order: 5, input: "head = [1, 2, 3, 4], pos = -1", expectedOutput: "false" },
    { order: 6, input: "head = [5], pos = 0", expectedOutput: "true" },
  ],

  "find-the-starting-point-in-ll": [
    { order: 1, input: "head = [3, 2, 0, -4], pos = 1", expectedOutput: "Node with value 2" },
    { order: 2, input: "head = [1, 2], pos = 0", expectedOutput: "Node with value 1" },
    { order: 3, input: "head = [1], pos = -1", expectedOutput: "null" },
    { order: 4, input: "head = [1, 2, 3, 4, 5], pos = 2", expectedOutput: "Node with value 3" },
    { order: 5, input: "head = [10, 20, 30], pos = -1", expectedOutput: "null" },
    { order: 6, input: "head = [7], pos = 0", expectedOutput: "Node with value 7" },
  ],

  "length-of-loop-in-ll": [
    { order: 1, input: "head = [25, 14, 19, 33, 10], pos = 1", expectedOutput: "4" },
    { order: 2, input: "head = [1, 2, 3], pos = -1", expectedOutput: "0" },
    { order: 3, input: "head = [1, 2, 3, 4, 5, 6], pos = 2", expectedOutput: "4" },
    { order: 4, input: "head = [1], pos = 0", expectedOutput: "1" },
    { order: 5, input: "head = [1, 2], pos = 0", expectedOutput: "2" },
    { order: 6, input: "head = [1, 2, 3, 4, 5], pos = -1", expectedOutput: "0" },
  ],

  "find-the-intersection-point-of-y-ll": [
    { order: 1, input: "intersectVal = 8, listA = [4, 1, 8, 4, 5], listB = [5, 6, 1, 8, 4, 5], skipA = 2, skipB = 3", expectedOutput: "Intersected at '8'" },
    { order: 2, input: "intersectVal = 0, listA = [2, 6, 4], listB = [1, 5], skipA = 3, skipB = 2", expectedOutput: "null" },
    { order: 3, input: "intersectVal = 2, listA = [1, 9, 1, 2, 4], listB = [3, 2, 4], skipA = 3, skipB = 1", expectedOutput: "Intersected at '2'" },
    { order: 4, input: "intersectVal = 0, listA = [1, 2, 3], listB = [4, 5, 6], skipA = 3, skipB = 3", expectedOutput: "null" },
    { order: 5, input: "intersectVal = 1, listA = [1], listB = [1], skipA = 0, skipB = 0", expectedOutput: "Intersected at '1'" },
    { order: 6, input: "intersectVal = 3, listA = [7, 8, 3], listB = [9, 3], skipA = 2, skipB = 1", expectedOutput: "Intersected at '3'" },
  ],

  "flattening-of-ll": [
    { order: 1, input: "head = [[5, 7, 8], [10, 20], [19, 22, 50], [28, 35, 40]]", expectedOutput: "5 -> 7 -> 8 -> 10 -> 19 -> 20 -> 22 -> 28 -> 35 -> 40 -> 50" },
    { order: 2, input: "head = [[5, 10]]", expectedOutput: "5 -> 10" },
    { order: 3, input: "head = [[1, 2, 3], [4, 5, 6]]", expectedOutput: "1 -> 2 -> 3 -> 4 -> 5 -> 6" },
    { order: 4, input: "head = [[2, 10, 20], [3, 8], [7, 11, 15]]", expectedOutput: "2 -> 3 -> 7 -> 8 -> 10 -> 11 -> 15 -> 20" },
    { order: 5, input: "head = [[1]]", expectedOutput: "1" },
    { order: 6, input: "head = [[3, 6, 9], [1, 4, 7], [2, 5, 8]]", expectedOutput: "1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9" },
  ],

  "convert-min-heap-to-max-heap": [
    { order: 1, input: "n = 10, arr = [3, 5, 9, 6, 8, 20, 10, 12, 18, 9]", expectedOutput: "[20, 18, 10, 12, 9, 9, 3, 5, 6, 8]" },
    { order: 2, input: "n = 3, arr = [1, 2, 3]", expectedOutput: "[3, 2, 1]" },
    { order: 3, input: "n = 4, arr = [1, 3, 5, 7]", expectedOutput: "[7, 3, 5, 1]" },
    { order: 4, input: "n = 5, arr = [2, 4, 6, 8, 10]", expectedOutput: "[10, 8, 6, 2, 4]" },
    { order: 5, input: "n = 1, arr = [42]", expectedOutput: "[42]" },
    { order: 6, input: "n = 6, arr = [1, 4, 2, 8, 9, 5]", expectedOutput: "[9, 8, 5, 4, 1, 2]" },
  ],

  "find-pairs-with-given-sum-in-doubly-linked-list": [
    { order: 1, input: "head = 1 <-> 2 <-> 4 <-> 5 <-> 6 <-> 8 <-> 9, target = 7", expectedOutput: "[[1, 6], [2, 5]]" },
    { order: 2, input: "head = 1 <-> 5 <-> 6, target = 6", expectedOutput: "[[1, 5]]" },
    { order: 3, input: "head = 1 <-> 2 <-> 3 <-> 4 <-> 5, target = 5", expectedOutput: "[[1, 4], [2, 3]]" },
    { order: 4, input: "head = 1 <-> 2 <-> 3, target = 10", expectedOutput: "[]" },
    { order: 5, input: "head = 2 <-> 4 <-> 6 <-> 8, target = 10", expectedOutput: "[[2, 8], [4, 6]]" },
    { order: 6, input: "head = 1 <-> 3 <-> 5 <-> 7 <-> 9, target = 10", expectedOutput: "[[1, 9], [3, 7]]" },
  ],

  "print-shortest-path-": [
    { order: 1, input: "n = 5, m = 6, edges = [[1, 2, 2], [2, 5, 5], [2, 3, 4], [1, 4, 1], [4, 3, 3], [3, 5, 1]]", expectedOutput: "[1, 4, 3, 5]" },
    { order: 2, input: "n = 2, m = 0, edges = []", expectedOutput: "[-1]" },
    { order: 3, input: "n = 4, m = 4, edges = [[1, 2, 1], [2, 3, 2], [3, 4, 3], [1, 4, 10]]", expectedOutput: "[1, 2, 3, 4]" },
    { order: 4, input: "n = 3, m = 3, edges = [[1, 2, 4], [2, 3, 1], [1, 3, 7]]", expectedOutput: "[1, 2, 3]" },
    { order: 5, input: "n = 3, m = 1, edges = [[1, 2, 1]]", expectedOutput: "[-1]" },
    { order: 6, input: "n = 4, m = 5, edges = [[1, 2, 2], [1, 3, 1], [3, 4, 1], [2, 4, 3], [1, 4, 5]]", expectedOutput: "[1, 3, 4]" },
  ],

  "introduction-to-graph": [
    { order: 1, input: "V = 4, edges = [[0, 1], [0, 2], [1, 2], [2, 3]]", expectedOutput: "[[1, 2], [0, 2], [0, 1, 3], [2]]" },
    { order: 2, input: "V = 2, edges = [[0, 1]]", expectedOutput: "[[1], [0]]" },
    { order: 3, input: "V = 3, edges = [[0, 1], [1, 2]]", expectedOutput: "[[1], [0, 2], [1]]" },
    { order: 4, input: "V = 3, edges = []", expectedOutput: "[[], [], []]" },
    { order: 5, input: "V = 4, edges = [[0, 1], [2, 3]]", expectedOutput: "[[1], [0], [3], [2]]" },
    { order: 6, input: "V = 1, edges = []", expectedOutput: "[[]]" },
  ],

  "number-of-islands-ii": [
    { order: 1, input: "rows = 4, cols = 5, operators = [[0, 0], [0, 0], [1, 1], [1, 0], [0, 1], [0, 3], [1, 3], [0, 4], [3, 2], [2, 2], [1, 2], [0, 2]]", expectedOutput: "[1, 1, 2, 1, 1, 2, 2, 2, 3, 3, 1, 1]" },
    { order: 2, input: "rows = 1, cols = 2, operators = [[0, 0], [0, 1]]", expectedOutput: "[1, 1]" },
    { order: 3, input: "rows = 3, cols = 3, operators = [[0, 0], [0, 1], [1, 2], [2, 1]]", expectedOutput: "[1, 1, 2, 3]" },
    { order: 4, input: "rows = 2, cols = 2, operators = [[0, 0], [1, 1], [0, 1]]", expectedOutput: "[1, 2, 1]" },
    { order: 5, input: "rows = 1, cols = 1, operators = [[0, 0]]", expectedOutput: "[1]" },
    { order: 6, input: "rows = 2, cols = 3, operators = [[0, 0], [1, 2], [0, 2]]", expectedOutput: "[1, 2, 2]" },
  ],

  "traversal-techniques": [
    { order: 1, input: "V = 5, adj = [[1, 2, 3], [], [4], [], []]", expectedOutput: "[0, 1, 2, 4, 3]" },
    { order: 2, input: "V = 3, adj = [[1, 2], [0], [0]]", expectedOutput: "[0, 1, 2]" },
    { order: 3, input: "V = 4, adj = [[1], [0, 2], [1, 3], [2]]", expectedOutput: "[0, 1, 2, 3]" },
    { order: 4, input: "V = 1, adj = [[]]", expectedOutput: "[0]" },
    { order: 5, input: "V = 4, adj = [[1, 2], [0], [0, 3], [2]]", expectedOutput: "[0, 1, 2, 3]" },
    { order: 6, input: "V = 2, adj = [[1], [0]]", expectedOutput: "[0, 1]" },
  ],

  "reverse-a-string-ii": [
    { order: 1, input: 's = "hello", k = 5', expectedOutput: '"olleh"' },
    { order: 2, input: 's = "Hannah", k = 6', expectedOutput: '"hannaH"' },
    { order: 3, input: 's = "abcba", k = 4', expectedOutput: '"abcba"' },
    { order: 4, input: 's = "racecar", k = 5', expectedOutput: '"racecar"' },
    { order: 5, input: 's = "leetcode", k = 6', expectedOutput: '"edocteel"' },
    { order: 6, input: 's = "a", k = 7', expectedOutput: '"a"' },
  ],

  "insertion-in-linked-list": [
    { order: 1, input: "head = 1 -> 2, x = 3", expectedOutput: "1 -> 2 -> 3" },
    { order: 2, input: "head = 2 -> 3, x = 4", expectedOutput: "2 -> 3 -> 4" },
    { order: 3, input: "head = 8 -> 9, x = 10", expectedOutput: "8 -> 9 -> 10" },
    { order: 4, input: "head = 10 -> 11, x = 12", expectedOutput: "10 -> 11 -> 12" },
    { order: 5, input: "head = 12 -> 13, x = 14", expectedOutput: "12 -> 13 -> 14" },
    { order: 6, input: "head = 14 -> 15, x = 16", expectedOutput: "14 -> 15 -> 16" },
  ],

  "deletion-in-doubly-ll": [
    { order: 1, input: "head = 1 <-> 2 <-> 3 <-> 4, x = 3", expectedOutput: "1 <-> 2 <-> 4" },
    { order: 2, input: "head = 5 <-> 10, x = 1", expectedOutput: "10" },
    { order: 3, input: "head = 7 <-> 8 <-> 9 <-> 10, x = 3", expectedOutput: "7 <-> 8 <-> 10" },
    { order: 4, input: "head = 9 <-> 10 <-> 11 <-> 12, x = 3", expectedOutput: "9 <-> 10 <-> 12" },
    { order: 5, input: "head = 11 <-> 12 <-> 13 <-> 14, x = 3", expectedOutput: "11 <-> 12 <-> 14" },
    { order: 6, input: "head = 13 <-> 14 <-> 15 <-> 16, x = 3", expectedOutput: "13 <-> 14 <-> 16" },
  ],

  "insertion-in-dll": [
    { order: 1, input: "head = 2 <-> 3, pos = 0, data = 1", expectedOutput: "2 <-> 1 <-> 3" },
    { order: 2, input: "head = 1 <-> 3, pos = 1, data = 2", expectedOutput: "1 <-> 3 <-> 2" },
    { order: 3, input: "head = 8 <-> 9, pos = 0, data = 4", expectedOutput: "8 <-> 4 <-> 9" },
    { order: 4, input: "head = 10 <-> 11, pos = 0, data = 5", expectedOutput: "10 <-> 5 <-> 11" },
    { order: 5, input: "head = 12 <-> 13, pos = 0, data = 6", expectedOutput: "12 <-> 6 <-> 13" },
    { order: 6, input: "head = 14 <-> 15, pos = 0, data = 7", expectedOutput: "14 <-> 7 <-> 15" },
  ],

  "introduction-to-bits-and-tricks": [
    { order: 1, input: "n = 13, i = 2", expectedOutput: "true" },
    { order: 2, input: "n = 13, i = 1", expectedOutput: "false" },
    { order: 3, input: "n = 8, i = 3", expectedOutput: "true" },
    { order: 4, input: "n = 8, i = 2", expectedOutput: "false" },
    { order: 5, input: "n = 1, i = 0", expectedOutput: "true" },
    { order: 6, input: "n = 16, i = 4", expectedOutput: "true" },
  ],
};

async function main() {
  console.log("Updating specialized test cases in database...");
  for (const [slug, cases] of Object.entries(updates)) {
    const prob = await prisma.problem.findUnique({
      where: { slug },
      include: { testCases: { where: { isActive: true }, orderBy: { order: "asc" } } },
    });

    if (!prob) {
      console.warn(`Problem not found: ${slug}`);
      continue;
    }

    for (const c of cases) {
      const existing = prob.testCases.find((tc) => tc.order === c.order);
      if (existing) {
        await prisma.testCase.update({
          where: { id: existing.id },
          data: {
            input: c.input,
            expectedOutput: c.expectedOutput,
            isSample: c.order <= 3,
            isActive: true,
          },
        });
      } else {
        await prisma.testCase.create({
          data: {
            problemId: prob.id,
            order: c.order,
            input: c.input,
            expectedOutput: c.expectedOutput,
            isSample: c.order <= 3,
            isActive: true,
          },
        });
      }
    }
    console.log(`✓ Updated ${cases.length} test cases for ${slug}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
