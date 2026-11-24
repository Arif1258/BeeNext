import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

// Helper to format inputs consistently
export function formatInput(params, values) {
  if (params.length === 1) {
    const val = typeof values[0] === "object" ? JSON.stringify(values[0]) : String(values[0]);
    return `${params[0].name} = ${val}`;
  }
  return params
    .map((p, idx) => {
      const v = values[idx] !== undefined ? values[idx] : 0;
      const valStr = typeof v === "object" ? JSON.stringify(v) : String(v);
      return `${p.name} = ${valStr}`;
    })
    .join(", ");
}

export function formatOutput(val) {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

// Generate 12 test cases for an array-sorting problem
function generateSortingCases() {
  return [
    { in: [[13, 46, 24, 52, 20, 9]], out: [9, 13, 20, 24, 46, 52], sample: true },
    { in: [[5, 4, 3, 2, 1]], out: [1, 2, 3, 4, 5], sample: true },
    { in: [[12, 11, 13, 5, 6]], out: [5, 6, 11, 12, 13], sample: true },
    { in: [[3, 1, 2]], out: [1, 2, 3], sample: false },
    { in: [[1]], out: [1], sample: false },
    { in: [[2, 2, 2, 2]], out: [2, 2, 2, 2], sample: false },
    { in: [[-5, -1, -8, 2, 0, 7]], out: [-8, -5, -1, 0, 2, 7], sample: false },
    { in: [[1, 2, 3, 4, 5]], out: [1, 2, 3, 4, 5], sample: false },
    { in: [[100, -100, 50, -50, 0]], out: [-100, -50, 0, 50, 100], sample: false },
    { in: [[4, 2, 2, 8, 3, 3, 1]], out: [1, 2, 2, 3, 3, 4, 8], sample: false },
    { in: [[9, 8, 7, 6, 5, 4, 3, 2, 1, 0]], out: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], sample: false },
    { in: [[15, 3, 9, 8, 5, 2, 7, 1, 6]], out: [1, 2, 3, 5, 6, 7, 8, 9, 15], sample: false },
  ];
}

// Generate 12 test cases for Two Sum
function generateTwoSumCases() {
  return [
    { in: [[2, 7, 11, 15], 9], out: [0, 1], sample: true },
    { in: [[3, 2, 4], 6], out: [1, 2], sample: true },
    { in: [[3, 3], 6], out: [0, 1], sample: true },
    { in: [[1, 5, 8, 3], 8], out: [1, 3], sample: false },
    { in: [[-3, 4, 3, 90], 0], out: [0, 2], sample: false },
    { in: [[0, 4, 3, 0], 0], out: [0, 3], sample: false },
    { in: [[-1, -2, -3, -4, -5], -8], out: [2, 4], sample: false },
    { in: [[10, 20, 30, 40], 50], out: [1, 2], sample: false },
    { in: [[1, 2, 3, 4, 5, 6], 11], out: [4, 5], sample: false },
    { in: [[7, 14, 21, 28, 35], 49], out: [2, 3], sample: false },
    { in: [[2, 5, 5, 11], 10], out: [1, 2], sample: false },
    { in: [[100, 200, 300, 400], 700], out: [2, 3], sample: false },
  ];
}

console.log("Test case generator module initialized.");
