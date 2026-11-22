import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CategoryDetailClient from "@/components/CategoryDetailClient";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;

  // Handle both "sorting" and "sorting-techniques" alias
  const isSorting = slug === "sorting" || slug === "sorting-techniques";

  const category = await prisma.category.findFirst({
    where: isSorting
      ? { OR: [{ slug: "sorting" }, { slug: "sorting-techniques" }] }
      : { slug },
    include: {
      problems: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <CategoryDetailClient
      initialCategory={category}
      initialProblems={category.problems}
    />
  );
}
