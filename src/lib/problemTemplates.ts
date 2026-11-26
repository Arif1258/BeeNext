import type { SupportedLanguage } from "@/lib/judge0";
import registryData from "@/data/problem_templates_registry.json";

export interface ProblemParam {
  name: string;
  type: string;
}

export interface ProblemTemplateEntry {
  title: string;
  slug: string;
  isConceptual: boolean;
  methodName: string;
  returnType: string;
  params: ProblemParam[];
  templates: {
    java: string;
    cpp: string;
    python: string;
    javascript: string;
  };
}

const registry = registryData as Record<string, ProblemTemplateEntry>;

export function getProblemStarterTemplates(
  slugOrProblem?: string | { slug?: string } | null
): ProblemTemplateEntry | null {
  if (!slugOrProblem) return null;
  const slug = typeof slugOrProblem === "string" ? slugOrProblem : slugOrProblem?.slug;
  if (!slug) return null;
  return registry[slug] || null;
}

export function getProblemTemplateForLanguage(
  slug: string,
  language: SupportedLanguage
): string | null {
  const entry = registry[slug];
  if (!entry || !entry.templates) return null;
  return entry.templates[language] || null;
}

export const CONCEPTUAL_SLUGS = new Set<string>([
  "breaking-the-myth",
  "programming-and-what-are-computers",
  "how-to-think-like-a-programmer",
  "flowcharts-and-pseudocode",
  "flowchart-problem-solving",
  "dry-runs-edge-cases-and-debugging",
  "programming-languages-and-choosing-a-path",
  "learn-cpp",
  "learn-java",
  "learn-python",
  "easy-and-medium",
  "hard",
  "theory-with-examples",
  "stl",
  "java-collections",
  "python-libraries-part-1",
  "python-libraries-part-2",
  "basic-maths",
  "basic-arrays-hashing-and-strings",
  "beginner-basic-hashing",
  "basic-string",
  "recursion-theory",
  "recursion-concepts-with-parameters",
  "learn-all-patterns-of-subsequences",
  "implementation-using-different-ds",
  "theory",
  "heaps-theory",
  "mst-theory",
  "introduction-to-dp",
  "bit-prerequisites-for-trie-problems",
  "hashing-in-strings-theory"
]);

export function isProblemConceptual(slug: string): boolean {
  if (!slug) return false;
  if (CONCEPTUAL_SLUGS.has(slug)) return true;
  return !!registry[slug]?.isConceptual;
}

export function getAllProblemSlugs(): string[] {
  return Object.keys(registry);
}
