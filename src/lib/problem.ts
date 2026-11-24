import prisma from "@/lib/prisma";
import { getCurrentUser, checkProblemAccess } from "@/lib/auth";

export async function getProblemWithAccess(
  slug: string,
  mode?: "BRUTE_FORCE" | "OPTIMAL" | "HANDWRITTEN"
) {
  const session = await getCurrentUser();

  const problem = await prisma.problem.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          title: true,
          slug: true,
          isFree: true,
          price: true,
        },
      },
      codes: {
        orderBy: { approachType: "desc" }, // OPTIMAL, then BRUTE_FORCE
      },
      notes: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!problem || !problem.isPublished) {
    return null;
  }

  // Filter content by mode for true server-side isolation
  let filteredCodes = problem.codes;
  let filteredNotes = problem.notes;

  if (mode === "BRUTE_FORCE") {
    filteredCodes = problem.codes.filter((c) => c.approachType === "BRUTE_FORCE");
    filteredNotes = [];
  } else if (mode === "OPTIMAL") {
    filteredCodes = problem.codes.filter((c) => c.approachType === "OPTIMAL");
    filteredNotes = [];
  } else if (mode === "HANDWRITTEN") {
    filteredCodes = [];
    filteredNotes = problem.notes;
  }

  // In the new business model, all problem codes and approaches are 100% FREE
  const access = { hasAccess: true, reason: "FREE" as const };

  const sanitizedProblem = {
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    description: problem.description,
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat,
    constraints: problem.constraints,
    examples: problem.examples,
    explanation: problem.explanation,
    youtubeUrl: problem.youtubeUrl,
    leetcodeUrl: problem.leetcodeUrl,
    category: problem.category,
    codes: filteredCodes.map((c) => ({
      id: c.id,
      approachType: c.approachType,
      javaCode: c.javaCode,
      timeComplexity: c.timeComplexity,
      spaceComplexity: c.spaceComplexity,
      isLocked: false,
    })),
  };

  return {
    problem: sanitizedProblem,
    access: {
      hasAccess: true,
      reason: "FREE",
      price: 0,
      categoryPrice: 0,
    },
  };
}
