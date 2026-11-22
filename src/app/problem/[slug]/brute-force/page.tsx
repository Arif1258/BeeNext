import React from "react";
import { notFound } from "next/navigation";
import { getProblemWithAccess } from "@/lib/problem";
import ProblemDetailClient from "@/components/ProblemDetailClient";

export const dynamic = "force-dynamic";

interface BruteForcePageProps {
  params: {
    slug: string;
  };
}

export default async function BruteForcePage({ params }: BruteForcePageProps) {
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
