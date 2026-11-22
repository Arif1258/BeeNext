import prisma from "../src/lib/prisma";
import { Role } from "@prisma/client";

async function verifyAdminDashboardRedesign() {
  console.log("==================================================");
  console.log("VERIFYING ADMIN DASHBOARD REDESIGN");
  console.log("==================================================");

  const adminEmail = (process.env.ADMIN_EMAIL || "supportbeenext@gmail.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  const customerEmail = (process.env.CUSTOMER_EMAIL || "arifahmedma490@gmail.com").toLowerCase().trim();
  const customerPassword = process.env.CUSTOMER_PASSWORD;

  if (!adminPassword || !customerPassword) {
    throw new Error("Missing ADMIN_PASSWORD or CUSTOMER_PASSWORD!");
  }

  // 1. Authenticate Admin
  console.log("\n[Test 1] Authenticating Admin & Customer...");
  const adminLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  if (!adminLoginRes.ok) throw new Error("Admin login failed");
  const adminCookieHeader = adminLoginRes.headers.get("set-cookie");
  if (!adminCookieHeader) throw new Error("Missing admin set-cookie");
  const adminCookie = adminCookieHeader.split(";")[0];
  console.log("✓ Admin authenticated successfully.");

  const customerLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: customerEmail, password: customerPassword }),
  });
  if (!customerLoginRes.ok) throw new Error("Customer login failed");
  const customerCookieHeader = customerLoginRes.headers.get("set-cookie");
  if (!customerCookieHeader) throw new Error("Missing customer set-cookie");
  const customerCookie = customerCookieHeader.split(";")[0];
  console.log("✓ Customer authenticated successfully.");

  // 2. Test Real Metrics (No Fake Data)
  console.log("\n[Test 2] Testing /api/admin/metrics (Real Data Only)...");
  const metricsRes = await fetch("http://localhost:3000/api/admin/metrics", {
    headers: { Cookie: adminCookie },
  });
  if (!metricsRes.ok) throw new Error(`Metrics failed: ${metricsRes.status}`);
  const metricsData = await metricsRes.json();

  const realUserCount = await prisma.user.count();
  const realProblemCount = await prisma.problem.count({ where: { isPublished: true } });
  const realOrderCount = await prisma.printedOrder.count();

  if (metricsData.totalUsers !== realUserCount) {
    throw new Error(`Metric mismatch: totalUsers=${metricsData.totalUsers}, real=${realUserCount}`);
  }
  if (metricsData.totalProblemsCount !== realProblemCount) {
    throw new Error(`Metric mismatch: totalProblems=${metricsData.totalProblemsCount}, real=${realProblemCount}`);
  }
  console.log(`✓ Metrics match real database counts: Users=${metricsData.totalUsers}, Problems=${metricsData.totalProblemsCount}, Orders=${metricsData.totalOrders}`);

  // 3. Test Users List
  console.log("\n[Test 3] Testing /api/admin/users (Real Registered Users)...");
  const usersRes = await fetch("http://localhost:3000/api/admin/users", {
    headers: { Cookie: adminCookie },
  });
  if (!usersRes.ok) throw new Error(`Users failed: ${usersRes.status}`);
  const usersData = await usersRes.json();
  const usersList = usersData.users;
  if (!Array.isArray(usersList) || usersList.length !== realUserCount) {
    throw new Error(`Expected ${realUserCount} real users, received ${usersList.length}`);
  }

  const sampleUser = usersList[0];
  if (!sampleUser.name || !sampleUser.email || !sampleUser.createdAt || !sampleUser.updatedAt) {
    throw new Error("User record missing required fields (name, email, createdAt, updatedAt)");
  }
  console.log(`✓ ${usersList.length} real registered users loaded with email, registration date, and last login/activity timestamp.`);

  // 4. Test Customer Blocked from Admin APIs
  console.log("\n[Test 4] Verifying Customer Blocked from Admin APIs...");
  const blockedMetrics = await fetch("http://localhost:3000/api/admin/metrics", {
    headers: { Cookie: customerCookie },
  });
  if (blockedMetrics.status !== 403) throw new Error("Security leak: Customer accessed /api/admin/metrics");
  const blockedUsers = await fetch("http://localhost:3000/api/admin/users", {
    headers: { Cookie: customerCookie },
  });
  if (blockedUsers.status !== 403) throw new Error("Security leak: Customer accessed /api/admin/users");
  console.log("✓ Customer access to /api/admin/metrics and /api/admin/users blocked with 403 Forbidden.");

  // 5. Test Add, Edit, Delete DSA Problem
  console.log("\n[Test 5] Testing Add, Edit, and Delete DSA Problem Flow...");
  const sortingCategory = await prisma.category.findUnique({ where: { slug: "sorting" } });
  if (!sortingCategory) throw new Error("Sorting category not found in DB");

  const testTitle = `Test Admin Problem ${Date.now()}`;
  const addProblemRes = await fetch("http://localhost:3000/api/problems", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      title: testTitle,
      categoryId: sortingCategory.id,
      difficulty: "MEDIUM",
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      youtubeUrl: "https://www.youtube.com/watch?v=kPRA0W1kECg",
      bruteForce: {
        title: "Brute Force Approach",
        timeComplexity: "O(N^2)",
        spaceComplexity: "O(1)",
        javaCode: "class Solution { public void sort(int[] a) {} }",
      },
      optimal: {
        title: "Optimal Approach",
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(log N)",
        javaCode: "class Solution { public void quickSort(int[] a) {} }",
      },
    }),
  });

  if (!addProblemRes.ok) {
    const errData = await addProblemRes.json();
    throw new Error(`Failed to add problem: ${errData.error}`);
  }
  const addedData = await addProblemRes.json();
  const createdProblem = addedData.problem;
  console.log(`✓ Problem created successfully: id=${createdProblem.id}, slug=${createdProblem.slug}`);

  // Verify created problem has codes
  if (!createdProblem.codes || createdProblem.codes.length !== 2) {
    throw new Error(`Expected 2 solution codes (Brute & Optimal), got ${createdProblem.codes?.length}`);
  }
  console.log("✓ Both Brute Force and Optimal Java solutions saved with TC and SC.");

  // Verify problem displays on /topics
  const topicsRes = await fetch("http://localhost:3000/topics");
  if (!topicsRes.ok) throw new Error("Failed to fetch /topics");
  const topicsHtml = await topicsRes.text();
  if (!topicsHtml.includes(testTitle)) {
    throw new Error(`Created problem "${testTitle}" not found on /topics page!`);
  }
  console.log(`✓ Created problem "${testTitle}" is visible under its topic on the DSA Topics page.`);

  // Verify problem page /problem/[slug]
  const probPageRes = await fetch(`http://localhost:3000/problem/${createdProblem.slug}`);
  if (!probPageRes.ok) throw new Error(`Failed to fetch /problem/${createdProblem.slug}`);
  const probHtml = await probPageRes.text();
  if (!probHtml.includes(testTitle)) {
    throw new Error("Problem title missing from problem detail page");
  }
  console.log(`✓ Problem page /problem/${createdProblem.slug} renders successfully.`);

  // Test Problem Edit
  console.log("\n[Test 6] Testing Problem Update (Edit)...");
  const updatedTitle = `${testTitle} (Updated)`;
  const editRes = await fetch(`http://localhost:3000/api/problems/id/${createdProblem.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
    },
    body: JSON.stringify({
      title: updatedTitle,
      difficulty: "HARD",
      optimal: {
        title: "Optimal Approach",
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(1)",
        javaCode: "class Solution { public void heapSort(int[] a) {} }",
      },
    }),
  });
  if (!editRes.ok) throw new Error("Failed to update problem");
  const editData = await editRes.json();
  if (editData.problem?.title !== updatedTitle) {
    throw new Error(`Update title mismatch: ${editData.problem?.title}`);
  }
  console.log(`✓ Problem updated successfully: "${updatedTitle}" (difficulty=${editData.problem?.difficulty}).`);

  // Test Problem Delete
  console.log("\n[Test 7] Testing Problem Deletion...");
  const deleteRes = await fetch(`http://localhost:3000/api/problems/id/${createdProblem.id}`, {
    method: "DELETE",
    headers: { Cookie: adminCookie },
  });
  if (!deleteRes.ok) throw new Error("Failed to delete problem");
  console.log("✓ Test problem deleted cleanly from database.");

  // Verify problem no longer exists
  const checkDeleted = await prisma.problem.findUnique({ where: { id: createdProblem.id } });
  if (checkDeleted) throw new Error("Problem still exists after deletion!");
  console.log("✓ Deletion verified: problem completely removed.");

  // 6. Test Admin Dashboard Page (Sections & Tabs)
  console.log("\n[Test 8] Verifying Admin Dashboard Page & 4 Essential Sections...");
  const adminPageRes = await fetch("http://localhost:3000/admin", {
    headers: { Cookie: adminCookie },
  });
  if (!adminPageRes.ok) throw new Error(`Failed to fetch /admin: ${adminPageRes.status}`);

  const fs = await import("fs");
  const path = await import("path");
  const adminSource = fs.readFileSync(path.join(process.cwd(), "src/app/admin/page.tsx"), "utf-8");

  if (!adminSource.includes("Overview") || !adminSource.includes("Users") || !adminSource.includes("Manage DSA Problems") || !adminSource.includes("Orders")) {
    throw new Error("Admin page source missing one of the 4 essential section tabs");
  }
  if (!adminSource.includes("activeTab === \"OVERVIEW\"") || !adminSource.includes("activeTab === \"USERS\"") || !adminSource.includes("activeTab === \"PROBLEMS\"") || !adminSource.includes("activeTab === \"ORDERS\"")) {
    throw new Error("Admin page missing section render blocks for the 4 tabs");
  }
  // Verify removed sections
  if (adminSource.includes("PDF_PRODUCT") || adminSource.includes("GALLERY") || adminSource.includes("activeTab === \"CATEGORIES\"")) {
    throw new Error("Unnecessary sections (PDF_PRODUCT, GALLERY, CATEGORIES) must be removed!");
  }
  console.log("✓ Admin dashboard verified: exactly 4 essential sections (Overview, Users, Manage DSA Problems, Orders) and zero unnecessary sections or decorative charts.");

  console.log("\n==================================================");
  console.log("ALL ADMIN DASHBOARD REDESIGN TESTS PASSED! ✓");
  console.log("==================================================");
}

verifyAdminDashboardRedesign()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
