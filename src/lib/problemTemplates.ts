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

export function isProblemConceptual(slug: string): boolean {
  return !!registry[slug]?.isConceptual;
}

export function getAllProblemSlugs(): string[] {
  return Object.keys(registry);
}
