import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CategoryDetailClient from "@/components/CategoryDetailClient";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

const getCachedCategory = unstable_cache(
  async (slug: string, isSorting: boolean) => {
    return prisma.category.findFirst({
      where: isSorting
        ? { OR: [{ slug: "sorting" }, { slug: "sorting-techniques" }] }
        : { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        isFree: true,
        price: true,
        order: true,
        problems: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            order: true,
            isFree: true,
            price: true,
            leetcodeUrl: true,
            youtubeUrl: true,
          },
        },
      },
    });
  },
  ["category-detail-by-slug"],
  { revalidate: 60, tags: ["categories"] }
);

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;

  // Handle both "sorting" and "sorting-techniques" alias
  const isSorting = slug === "sorting" || slug === "sorting-techniques";

  const category = await getCachedCategory(slug, isSorting);

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
