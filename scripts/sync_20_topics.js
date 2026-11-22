const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const EXPECTED_TOPICS = [
  { order: 1, title: "Beginner Problems", slug: "beginner-problems", oldSlug: "learn-the-basics", isFree: false, price: 99 },
  { order: 2, title: "Sorting", slug: "sorting", oldSlug: "sorting-techniques", isFree: true, price: 0 },
  { order: 3, title: "Arrays", slug: "arrays", oldSlug: "arrays", isFree: false, price: 149 },
  { order: 4, title: "Hashing", slug: "hashing", oldSlug: null, isFree: false, price: 99 },
  { order: 5, title: "Binary Search", slug: "binary-search", oldSlug: "binary-search", isFree: false, price: 149 },
  { order: 6, title: "Strings (Basic and Medium)", slug: "strings-basic-and-medium", oldSlug: "strings", isFree: false, price: 129 },
  { order: 7, title: "Recursion", slug: "recursion", oldSlug: "recursion", isFree: false, price: 129 },
  { order: 8, title: "Linked-List", slug: "linked-list", oldSlug: "linked-list", isFree: false, price: 149 },
  { order: 9, title: "Bit Manipulation", slug: "bit-manipulation", oldSlug: "bit-manipulation", isFree: false, price: 99 },
  { order: 10, title: "Greedy Algorithms", slug: "greedy-algorithms", oldSlug: "greedy-algorithms", isFree: false, price: 129 },
  { order: 11, title: "Sliding Window / 2 Pointer", slug: "sliding-window-2-pointer", oldSlug: "sliding-window-and-two-pointer", isFree: false, price: 149 },
  { order: 12, title: "Stack / Queues", slug: "stack-queues", oldSlug: "stack-and-queue", isFree: false, price: 149 },
  { order: 13, title: "Binary Trees", slug: "binary-trees", oldSlug: "binary-trees", isFree: false, price: 199 },
  { order: 14, title: "Binary Search Trees", slug: "binary-search-trees", oldSlug: "binary-search-trees", isFree: false, price: 149 },
  { order: 15, title: "Heaps", slug: "heaps", oldSlug: "heaps", isFree: false, price: 129 },
  { order: 16, title: "Graphs", slug: "graphs", oldSlug: "graphs", isFree: false, price: 249 },
  { order: 17, title: "Dynamic Programming", slug: "dynamic-programming", oldSlug: "dynamic-programming", isFree: false, price: 299 },
  { order: 18, title: "Tries", slug: "tries", oldSlug: "tries", isFree: false, price: 129 },
  { order: 19, title: "Strings (Advanced Algo)", slug: "strings-advanced-algo", oldSlug: null, isFree: false, price: 149 },
  { order: 20, title: "Maths", slug: "maths", oldSlug: null, isFree: false, price: 99 },
];

async function syncTopics() {
  console.log("=== SYNCING 20 DSA TOPICS ===");

  for (const t of EXPECTED_TOPICS) {
    // 1. Try finding by new slug first, then by old slug
    let existing = await prisma.category.findUnique({ where: { slug: t.slug } });
    if (!existing && t.oldSlug) {
      existing = await prisma.category.findUnique({ where: { slug: t.oldSlug } });
    }

    if (existing) {
      const updated = await prisma.category.update({
        where: { id: existing.id },
        data: {
          title: t.title,
          slug: t.slug,
          order: t.order,
          isFree: t.isFree,
          isPublished: true,
          price: t.price,
        },
      });
      console.log(`[UPDATED] #${t.order} ${updated.title} (slug: ${updated.slug}, id: ${updated.id})`);
    } else {
      const created = await prisma.category.create({
        data: {
          title: t.title,
          slug: t.slug,
          order: t.order,
          isFree: t.isFree,
          isPublished: true,
          price: t.price,
          description: `Handwritten DSA Notes and Java solutions for ${t.title}.`,
        },
      });
      console.log(`[CREATED] #${t.order} ${created.title} (slug: ${created.slug}, id: ${created.id})`);
    }
  }

  // 2. Identify Sorting category id
  const sortingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ slug: "sorting" }, { slug: "sorting-techniques" }],
    },
  });

  if (!sortingCategory) {
    throw new Error("Sorting category could not be found!");
  }
  console.log(`Sorting category ID: ${sortingCategory.id}`);

  // 3. Ensure all 8 sorting problems are active, published, and belong to sortingCategory
  const sortingProblemSlugs = [
    "selection-sort",
    "bubble-sort",
    "insertion-sort",
    "merge-sort",
    "recursive-bubble-sort",
    "recursive-insertion-sort",
    "quick-sort",
    "count-inversions",
  ];

  const publishSortingRes = await prisma.problem.updateMany({
    where: {
      slug: { in: sortingProblemSlugs },
    },
    data: {
      categoryId: sortingCategory.id,
      isPublished: true,
    },
  });
  console.log(`Active Sorting problems published: ${publishSortingRes.count}`);

  // 4. For any other problems in the database (not in sortingProblemSlugs),
  // set isPublished: false so they do not appear in the other 19 topics.
  const unpublishOtherRes = await prisma.problem.updateMany({
    where: {
      slug: { notIn: sortingProblemSlugs },
    },
    data: {
      isPublished: false,
    },
  });
  console.log(`Other sample problems unpublished from visible lists: ${unpublishOtherRes.count}`);

  // 5. Verify final database state
  const finalCategories = await prisma.category.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    include: {
      problems: {
        where: { isPublished: true },
        select: { id: true, title: true, slug: true },
      },
    },
  });

  console.log(`\nTotal Published Categories: ${finalCategories.length}`);
  finalCategories.forEach((c) => {
    console.log(
      `#${c.order.toString().padStart(2, "0")} ${c.title.padEnd(30, " ")} (slug: ${c.slug.padEnd(28, " ")}) -> ${c.problems.length} problems`
    );
  });
}

syncTopics()
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
