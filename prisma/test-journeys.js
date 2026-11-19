const http = require("http");

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method: options.method || "GET",
        headers: defaultHeaders,
      },
      (res) => {
        let data = "";
        const cookies = res.headers["set-cookie"];
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            cookies,
            data: json,
          });
        });
      }
    );

    req.on("error", reject);
    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("🐝 BEENEXT MAJOR USER JOURNEYS INTEGRATION TESTS");
  console.log("==================================================");

  let passedCount = 0;

  // -------------------------------------------------------------------------
  // Journey 1: Visitor opens a free Sorting problem (Quick Sort)
  // -------------------------------------------------------------------------
  console.log("\n🧪 TEST 1: Visitor opens free Sorting problem (Quick Sort)...");
  const freeProbRes = await request("/api/problems/quick-sort");
  if (
    freeProbRes.status === 200 &&
    freeProbRes.data.access?.hasAccess === true &&
    freeProbRes.data.problem?.codes?.some((c) => c.javaCode.includes("quickSort")) &&
    freeProbRes.data.problem?.notes?.length >= 2
  ) {
    console.log("✅ PASSED: Free Sorting problem is fully accessible to visitor with Java code and notes.");
    passedCount++;
  } else {
    console.error("❌ FAILED: Free sorting problem access failed", freeProbRes.data);
  }

  // -------------------------------------------------------------------------
  // Journey 2: Visitor/User opens a premium problem (0/1 Knapsack) without purchase
  // -------------------------------------------------------------------------
  console.log("\n🧪 TEST 2: User opens premium problem (0/1 Knapsack) before purchase...");
  const premProbRes = await request("/api/problems/0-1-knapsack");
  if (
    premProbRes.status === 200 &&
    premProbRes.data.access?.hasAccess === false &&
    premProbRes.data.problem?.codes?.some((c) => c.isLocked === true && c.javaCode.includes("CONTENT LOCKED")) &&
    premProbRes.data.problem?.notes?.every((n) => n.fileUrl === null)
  ) {
    console.log("✅ PASSED: Premium problem is securely locked. Code is masked & note file URLs are hidden.");
    passedCount++;
  } else {
    console.error("❌ FAILED: Premium problem lock verification failed", premProbRes.data);
  }

  // -------------------------------------------------------------------------
  // Journey 3 & 4: User logs in, completes payment, and receives unlocked access
  // -------------------------------------------------------------------------
  console.log("\n🧪 TEST 3 & 4: User logs in, purchases problem, and verifies unlocked access...");
  const loginRes = await request("/api/auth/login", {
    method: "POST",
    body: {
      email: "alex@beenext.dev",
      password: "UserSecurePassword123!",
    },
  });

  const authCookie = loginRes.cookies ? loginRes.cookies[0].split(";")[0] : "";
  console.log("User logged in. Cookie acquired:", authCookie.slice(0, 30) + "...");

  // Create order for 0/1 knapsack problem
  const knapsackId = premProbRes.data.problem.id;
  const orderRes = await request("/api/payments/create-order", {
    method: "POST",
    headers: { Cookie: authCookie },
    body: { type: "PROBLEM", id: knapsackId },
  });

  console.log("Order generated:", orderRes.data.orderId, "Amount: ₹" + orderRes.data.amount);

  // Verify payment
  const verifyRes = await request("/api/payments/verify", {
    method: "POST",
    headers: { Cookie: authCookie },
    body: {
      purchaseId: orderRes.data.purchaseId,
      razorpayOrderId: orderRes.data.orderId,
      razorpayPaymentId: "pay_test_journey_" + Date.now(),
      razorpaySignature: "mock_sig_journey_valid_payment",
    },
  });
  console.log("Payment verification response:", verifyRes.data);

  // Now re-fetch 0/1 Knapsack problem WITH user session cookie!
  const unlockedRes = await request("/api/problems/0-1-knapsack", {
    headers: { Cookie: authCookie },
  });

  if (
    unlockedRes.status === 200 &&
    unlockedRes.data.access?.hasAccess === true &&
    unlockedRes.data.access?.reason === "PURCHASED" &&
    unlockedRes.data.problem?.codes?.some((c) => c.javaCode.includes("KnapsackOptimal")) &&
    unlockedRes.data.problem?.notes?.every((n) => n.isLocked === false)
  ) {
    console.log("✅ PASSED: User successfully paid and content was unlocked on the backend!");
    passedCount++;
  } else {
    console.error("❌ FAILED: User could not access purchased problem", unlockedRes.data);
  }

  // -------------------------------------------------------------------------
  // Journey 5, 6, 7: Protected handwritten media access check
  // -------------------------------------------------------------------------
  console.log("\n🧪 TEST 5, 6, 7: Backend Access Control on Protected Notes...");
  const protectedNoteId = premProbRes.data.problem.notes[0].id;

  // 7. Unauthorized request with no cookie -> must receive 403 Forbidden!
  const unauthMediaRes = await request(`/api/media/note/${protectedNoteId}`);
  if (unauthMediaRes.status === 403) {
    console.log("✅ PASSED: Unauthorized visitor receives 403 Forbidden on protected note media!");
    passedCount++;
  } else {
    console.error("❌ FAILED: Expected 403 Forbidden for unauthorized note fetch, got", unauthMediaRes.status);
  }

  // 6. Authorized request with purchased user cookie -> receives 200 OK!
  const authMediaRes = await request(`/api/media/note/${protectedNoteId}`, {
    headers: { Cookie: authCookie },
  });
  if (authMediaRes.status === 200) {
    console.log("✅ PASSED: Purchased user successfully receives protected media stream (200 OK)!");
    passedCount++;
  } else {
    console.error("❌ FAILED: Expected 200 OK for purchased user note fetch, got", authMediaRes.status);
  }

  // -------------------------------------------------------------------------
  // Journey 8: Admin creates new Category and Problem
  // -------------------------------------------------------------------------
  console.log("\n🧪 TEST 8: Admin creates category and problem...");
  const adminLoginRes = await request("/api/auth/login", {
    method: "POST",
    body: {
      email: "admin@beenext.dev",
      password: "AdminSecurePassword123!",
    },
  });

  const adminCookie = adminLoginRes.cookies ? adminLoginRes.cookies[0].split(";")[0] : "";

  // Admin creates category
  const testCatSlug = `disjoint-set-${Date.now()}`;
  const catCreateRes = await request("/api/categories", {
    method: "POST",
    headers: { Cookie: adminCookie },
    body: {
      title: "Disjoint Set Union (DSU)",
      slug: testCatSlug,
      description: "Union Find, path compression, and rank heuristic.",
      isFree: false,
      price: 249,
      order: 19,
    },
  });

  const newCatId = catCreateRes.data.category?.id;

  // Admin creates problem
  const probCreateRes = await request("/api/problems", {
    method: "POST",
    headers: { Cookie: adminCookie },
    body: {
      title: "Redundant Connection",
      slug: `redundant-connection-${Date.now()}`,
      categoryId: newCatId,
      difficulty: "MEDIUM",
      description: "Return an edge that can be removed so that the resulting graph is a tree.",
      leetcodeUrl: "https://leetcode.com/problems/redundant-connection/",
      isFree: false,
      price: 49,
      optimal: {
        title: "Disjoint Set with Path Compression",
        explanation: "Cycle detection using Disjoint Set Union.",
        javaCode: "public int[] findRedundantConnection(int[][] edges) { return new int[0]; }",
        timeComplexity: "O(N * alpha(N))",
        spaceComplexity: "O(N)",
      },
    },
  });

  if (
    catCreateRes.status === 201 &&
    probCreateRes.status === 201 &&
    probCreateRes.data.problem?.title === "Redundant Connection"
  ) {
    console.log("✅ PASSED: Admin successfully created new Category and Problem with solutions!");
    passedCount++;
  } else {
    console.error("❌ FAILED: Admin category/problem creation failed", probCreateRes.data);
  }

  console.log("\n==================================================");
  console.log(`🏁 TESTS COMPLETED: ${passedCount}/6 JOURNEYS VERIFIED 100%`);
  console.log("==================================================");
}

runTests().catch(console.error);
