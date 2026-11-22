import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const p = await prisma.problem.findMany({
    where: {
      OR: [
        { title: { contains: "Orange", mode: "insensitive" } },
        { title: { contains: "Stock", mode: "insensitive" } },
        { title: { contains: "Reverse Words", mode: "insensitive" } },
        { title: { contains: "Histogram", mode: "insensitive" } },
        { title: { contains: "Gas Station", mode: "insensitive" } },
        { title: { contains: "Top View", mode: "insensitive" } },
        { title: { contains: "Bottom View", mode: "insensitive" } },
        { title: { contains: "Kosaraju", mode: "insensitive" } },
        { title: { contains: "Inversion", mode: "insensitive" } },
        { title: { contains: "Duplicate", mode: "insensitive" } },
        { title: { contains: "Container", mode: "insensitive" } },
        { title: { contains: "Mountain", mode: "insensitive" } },
        { title: { contains: "Pages", mode: "insensitive" } },
        { title: { contains: "Knight", mode: "insensitive" } },
        { title: { contains: "Flatten", mode: "insensitive" } },
        { title: { contains: "Morris", mode: "insensitive" } },
        { title: { contains: "Subtree", mode: "insensitive" } },
        { title: { contains: "Kruskal", mode: "insensitive" } },
        { title: { contains: "Prim", mode: "insensitive" } },
        { title: { contains: "Topological", mode: "insensitive" } }
      ]
    },
    select: { title: true, slug: true, leetcodeUrl: true }
  });
  console.log(JSON.stringify(p, null, 2));
  await prisma.$disconnect();
}
run();
