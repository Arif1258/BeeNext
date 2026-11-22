import React from "react";
import prisma from "@/lib/prisma";
import TopicsClient from "@/components/TopicsClient";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const categories = await prisma.category.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    include: {
      problems: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        include: {
          _count: { select: { notes: true } },
        },
      },
      _count: { select: { problems: true } },
    },
  });

  return <TopicsClient initialCategories={categories as any} />;
}
