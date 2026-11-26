import React from "react";
import { notFound, redirect } from "next/navigation";
import { getProblemWithAccess } from "@/lib/problem";
import ProblemDetailClient from "@/components/ProblemDetailClient";
import { isProblemConceptual } from "@/lib/problemTemplates";

export const dynamic = "force-dynamic";

interface BruteForcePageProps {
  params: {
    slug: string;
  };
}

export default async function BruteForcePage({ params }: BruteForcePageProps) {
  if (isProblemConceptual(params.slug)) {
    redirect(`/problem/${params.slug}`);
  }

  const result = await getProblemWithAccess(params.slug);

  if (!result) {
    notFound();
  }

  return (
    <ProblemDetailClient
      initialProblem={result.problem}
      initialAccess={result.access}
      initialTab="BRUTE_FORCE"
    />
  );
}
