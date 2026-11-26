/**
 * OnlineCompiler.io Execution Service Integration
 *
 * Provides real, sandboxed multi-language code execution:
 * - C++ (g++-15)
 * - Java (openjdk-25)
 * - Python (python-3.14)
 * - JavaScript (nodejs-24)
 *
 * Features:
 * - Server-side API key protection
 * - Bounded concurrency (max 3 concurrent requests to respect 4-run limit)
 * - Rate limiting (sliding window to respect 60 req/min)
 * - In-flight duplicate request debouncing
 * - Graceful handling of HTTP 429, timeouts, and provider unavailability
 */

import { SupportedLanguage } from "@/lib/judge0";
import prisma from "@/lib/prisma";

export const ONLINECOMPILER_CONFIG = {
  baseUrl: "https://api.onlinecompiler.io",
  maxConcurrency: 3,
  maxRequestsPerMinute: 50,
  timeoutMs: 25000,
  compilers: {
    cpp: "g++-15",
    java: "openjdk-25",
    python: "python-3.14",
    javascript: "nodejs-24",
  } as const,
};

export interface OnlineCompilerTestCase {
  input: string;
  expected_output: string;
  hidden?: boolean;
}

export interface OnlineCompilerTestResult {
  verdict: "accepted" | "wrong_answer" | "compilation_error" | "runtime_error" | "time_limit_exceeded" | "memory_limit_exceeded" | "skipped";
  hidden: boolean;
  time?: string;
  memory?: string;
  exit_code?: number;
  signal?: string | null;
  output?: string;
  error?: string;
}

export interface OnlineCompilerRunTestsResponse {
  verdict: "accepted" | "wrong_answer" | "compilation_error" | "runtime_error" | "time_limit_exceeded" | "memory_limit_exceeded";
  score: number;
  passed: number;
  total: number;
  time_limit?: number;
  memory_limit?: number;
  compile_error?: string | null;
  tests: OnlineCompilerTestResult[];
  summary?: string;
}

export interface OnlineCompilerSyncResponse {
  output: string;
  error: string;
  status: "success" | "error" | "timeout";
  exit_code: number;
  signal: string | null;
  time: string;
  memory: string;
  compile_error?: string;
}

export interface OnlineCompilerUsage {
  month: string;
  submissions: number;
  monthly_limit: number;
  remaining: number;
  submissions_per_minute: number;
  running_submissions: number;
  pending_submissions: number;
  resets_at: string;
}

// -------------------------------------------------------------
// Bounded Concurrency & Rate Limiting Queue
// -------------------------------------------------------------

class RequestQueue {
  private running = 0;
  private queue: Array<() => void> = [];
  private timestamps: number[] = [];

  async acquire(): Promise<() => void> {
    // 1. Sliding window rate limit check (60 req/min limit)
    while (true) {
      const now = Date.now();
      this.timestamps = this.timestamps.filter((t) => now - t < 60000);
      if (this.timestamps.length < ONLINECOMPILER_CONFIG.maxRequestsPerMinute) {
        break;
      }
      // Wait until oldest request rolls off the 1-minute window
      const waitTime = Math.max(100, 60000 - (now - this.timestamps[0]) + 50);
      await new Promise((r) => setTimeout(r, waitTime));
    }

    // 2. Bounded concurrency check (max 3 concurrent)
    if (this.running >= ONLINECOMPILER_CONFIG.maxConcurrency) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.running++;
    this.timestamps.push(Date.now());

    let released = false;
    return () => {
      if (!released) {
        released = true;
        this.running--;
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          if (next) next();
        }
      }
    };
  }
}

const executionQueue = new RequestQueue();

// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Distributed Serverless Rate Limiter and Concurrency Coordinator
 * Uses atomic PostgreSQL transactions on execution_locks to coordinate across Vercel serverless containers.
 */
async function acquireDistributedExecutionLock(
  userId?: string,
  problemId?: string
): Promise<() => Promise<void>> {
  // Opportunistic background cleanup of expired locks
  prisma.executionLock
    .deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    .catch(() => {});

  let lockId: string | null = null;
  let attempts = 0;

  while (attempts < 6) {
    try {
      lockId = await prisma.$transaction(async (tx) => {
        // 1. Opportunistic cleanup of expired locks within transaction
        await tx.executionLock.deleteMany({
          where: { expiresAt: { lt: new Date() } },
        });

        // 2. Distributed rate limit check (sliding 60-second window across instances)
        const oneMinuteAgo = new Date(Date.now() - 60000);
        const recentCount = await tx.executionLock.count({
          where: { createdAt: { gte: oneMinuteAgo } },
        });

        if (recentCount >= ONLINECOMPILER_CONFIG.maxRequestsPerMinute) {
          throw new Error("RATE_LIMIT_EXCEEDED");
        }

        // 3. Distributed concurrency check (max 3 concurrent requests across instances)
        const activeCount = await tx.executionLock.count({
          where: { expiresAt: { gt: new Date() } },
        });

        if (activeCount >= ONLINECOMPILER_CONFIG.maxConcurrency) {
          throw new Error("CONCURRENCY_SATURATED");
        }

        // 4. Atomically insert lock with 60s expiration margin
        // (Guarantees the lock never expires while the 25s provider fetch is still running)
        const newLock = await tx.executionLock.create({
          data: {
            userId: userId || "anonymous",
            problemId: problemId || null,
            expiresAt: new Date(Date.now() + 60000),
          },
        });

        return newLock.id;
      });

      if (lockId) break;
    } catch (err: any) {
      if (err.message === "RATE_LIMIT_EXCEEDED") {
        throw new Error(
          "Distributed execution rate limit reached (50 requests/min). Please wait a moment and try again."
        );
      }
      if (err.message === "CONCURRENCY_SATURATED") {
        attempts++;
        if (attempts >= 6) {
          throw new Error(
            "Execution concurrency limit reached. Other executions are currently running across instances. Please retry in a moment."
          );
        }
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));
        continue;
      }
      attempts++;
      if (attempts >= 6) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return async () => {
    if (lockId) {
      await prisma.executionLock.delete({ where: { id: lockId } }).catch(() => {});
    }
  };
}

function getApiKey(): string {
  const key = process.env.ONLINECOMPILER_API_KEY;
  if (!key || !key.trim()) {
    throw new Error("ONLINECOMPILER_API_KEY is not configured in environment variables.");
  }
  return key.trim();
}

/**
 * Executes a batch of test cases via OnlineCompiler.io /api/run-tests/
 */
export async function executeOnlineCompilerTests({
  language,
  code,
  tests,
  timeLimit = 2,
  cacheKey,
  userId,
  problemId,
}: {
  language: SupportedLanguage;
  code: string;
  tests: OnlineCompilerTestCase[];
  timeLimit?: number;
  cacheKey?: string;
  userId?: string;
  problemId?: string;
}): Promise<OnlineCompilerRunTestsResponse> {
  // Deduplicate in-flight requests with identical hash/cacheKey
  if (cacheKey && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const task = (async () => {
    const releaseLocal = await executionQueue.acquire();
    const releaseDistributed = await acquireDistributedExecutionLock(userId, problemId);
    try {
      const apiKey = getApiKey();
      const compiler = ONLINECOMPILER_CONFIG.compilers[language];
      if (!compiler) {
        throw new Error(`Unsupported compiler language: ${language}`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ONLINECOMPILER_CONFIG.timeoutMs);

      const response = await fetch(`${ONLINECOMPILER_CONFIG.baseUrl}/api/run-tests/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          compiler,
          code,
          time_limit: timeLimit,
          tests,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new Error("Execution rate limit reached (HTTP 429). Please wait a few seconds and try again.");
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OnlineCompiler returned status ${response.status}: ${errText.slice(0, 150)}`);
      }

      const data: OnlineCompilerRunTestsResponse = await response.json();
      return data;
    } finally {
      await releaseDistributed();
      releaseLocal();
    }
  })();

  if (cacheKey) {
    inFlightRequests.set(cacheKey, task);
    task.finally(() => {
      // Remove from in-flight cache after completion with a short 1s debounce
      setTimeout(() => inFlightRequests.delete(cacheKey), 1000);
    });
  }

  return task;
}

/**
 * Executes code synchronously with standard input via /api/run-code-sync/
 * (Used for Custom Input mode in playground)
 */
export async function executeOnlineCompilerSync({
  language,
  code,
  input = "",
  timeLimit = 5,
  userId,
  problemId,
}: {
  language: SupportedLanguage;
  code: string;
  input?: string;
  timeLimit?: number;
  userId?: string;
  problemId?: string;
}): Promise<OnlineCompilerSyncResponse> {
  const releaseLocal = await executionQueue.acquire();
  const releaseDistributed = await acquireDistributedExecutionLock(userId, problemId);
  try {
    const apiKey = getApiKey();
    const compiler = ONLINECOMPILER_CONFIG.compilers[language];
    if (!compiler) {
      throw new Error(`Unsupported compiler language: ${language}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ONLINECOMPILER_CONFIG.timeoutMs);

    const response = await fetch(`${ONLINECOMPILER_CONFIG.baseUrl}/api/run-code-sync/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        compiler,
        code,
        input,
        time_limit: timeLimit,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new Error("Execution rate limit reached (HTTP 429). Please wait a few seconds and try again.");
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OnlineCompiler returned status ${response.status}: ${errText.slice(0, 150)}`);
    }

    const data = await response.json();
    return {
      output: data.output || "",
      error: data.error || "",
      status: data.status || (data.exit_code === 0 ? "success" : "error"),
      exit_code: data.exit_code ?? 0,
      signal: data.signal || null,
      time: data.time || "0.00",
      memory: data.memory || "0",
    };
  } finally {
    await releaseDistributed();
    releaseLocal();
  }
}

/**
 * Checks current account usage and quota limits
 */
export async function getOnlineCompilerUsage(): Promise<OnlineCompilerUsage> {
  const apiKey = getApiKey();
  const response = await fetch(`${ONLINECOMPILER_CONFIG.baseUrl}/api/usage/`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to retrieve usage stats: HTTP ${response.status}`);
  }

  return response.json();
}
