import React from "react";
import prisma from "@/lib/prisma";
import TopicsClient from "@/components/TopicsClient";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        isFree: true,
        price: true,
        order: true,
        _count: { select: { problems: true } },
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
            apnaYoutubeUrl: true,
            _count: { select: { notes: true } },
          },
        },
      },
    });
  },
  ["dsa-topics-categories-lean"],
  { revalidate: 60, tags: ["categories"] }
);

export default async function TopicsPage() {
  const categories = await getCachedCategories();

  return <TopicsClient initialCategories={categories as any} />;
}
