import React from "react";
import { notFound } from "next/navigation";
import { getProblemWithAccess } from "@/lib/problem";
import ProblemCodeClient from "@/components/ProblemCodeClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ProblemCodePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ProblemCodePageProps): Promise<Metadata> {
  const result = await getProblemWithAccess(params.slug);
  if (!result?.problem) {
    return { title: "Coding Playground - BeeNext" };
  }
  return {
    title: `Solve ${result.problem.title} - BeeNext Coding Playground`,
    description: `Write, execute, and submit code for ${result.problem.title} in Java, C++, Python, and JavaScript.`,
  };
}

export default async function ProblemCodePage({ params }: ProblemCodePageProps) {
  const result = await getProblemWithAccess(params.slug);

  if (!result?.problem) {
    notFound();
  }

  return <ProblemCodeClient problem={result.problem} />;
}
