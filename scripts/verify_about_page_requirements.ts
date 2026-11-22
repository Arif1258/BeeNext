async function verifyAboutPage() {
  console.log("==================================================");
  console.log("VERIFYING ABOUT BEENEXT PAGE REQUIREMENTS");
  console.log("==================================================");

  // 1. Fetch /about page
  const res = await fetch("http://localhost:3000/about");
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching /about`);
  const html = await res.text();

  // 1. Who We Are
  console.log("\n[Test 1] Checking 1. Who We Are...");
  if (!html.includes("Who We Are")) throw new Error("Missing 'Who We Are' section");
  if (!html.includes("educational platform focused on providing high-quality, interview-oriented books")) {
    throw new Error("Missing Who We Are platform description");
  }
  if (!html.includes("Striver&#x27;s A to Z DSA sheet") && !html.includes("Striver's A to Z DSA sheet")) {
    throw new Error("Missing Striver's A to Z DSA sheet reference");
  }
  if (!html.includes("Learn What Matters. Skip What Doesn&#x27;t.") && !html.includes("Learn What Matters. Skip What Doesn't.")) {
    throw new Error("Missing philosophy: Learn What Matters. Skip What Doesn't.");
  }
  console.log("✓ Section 1: Who We Are verified");

  // 2. Our Book Collection
  console.log("\n[Test 2] Checking 2. Our Book Collection...");
  if (!html.includes("Our Book Collection")) throw new Error("Missing 'Our Book Collection' section");
  if (!html.includes("DSA Topic-Wise Books")) throw new Error("Missing DSA Topic-Wise Books");
  if (!html.includes("Full DSA Book")) throw new Error("Missing Full DSA Book");
  if (!html.includes("Computer Science Fundamentals Books")) throw new Error("Missing Computer Science Fundamentals Books");

  // Check subjects
  const csSubjects = ["OOPS", "DBMS", "Operating Systems (OS)", "Computer Networks (CN)", "More Subjects"];
  for (const sub of csSubjects) {
    if (!html.includes(sub)) throw new Error(`Missing CS subject: ${sub}`);
  }

  // Check features
  const bookFeatures = [
    "Important problems",
    "Brute Force solutions",
    "Optimal solutions",
    "Time Complexity (TC)",
    "Space Complexity (SC)",
    "Computer-written solutions",
  ];
  for (const feat of bookFeatures) {
    if (!html.includes(feat)) throw new Error(`Missing book feature: ${feat}`);
  }
  console.log("✓ Section 2: Our Book Collection verified");

  // 3. Why Choose BeeNext?
  console.log("\n[Test 3] Checking 3. Why Choose BeeNext?...");
  if (!html.includes("Why Choose BeeNext?")) throw new Error("Missing 'Why Choose BeeNext?' section");
  const reasons = [
    "Interview-Focused Content",
    "No Unnecessary Material",
    "Brute Force and Optimal Solutions",
    "Complexity Analysis",
    "Computer-Written Content",
    "Flexible Purchasing",
    "Expanding Collection",
  ];
  for (const r of reasons) {
    if (!html.includes(r)) throw new Error(`Missing reason: ${r}`);
  }
  console.log("✓ Section 3: Why Choose BeeNext? (all 7 points) verified");

  // 4. Order & Delivery
  console.log("\n[Test 4] Checking 4. Order & Delivery...");
  if (!html.includes("Order &amp; Delivery") && !html.includes("Order & Delivery")) {
    throw new Error("Missing 'Order & Delivery' section");
  }
  if (!html.includes("100% assured delivery commitment within 10 days of placing an order")) {
    throw new Error("Missing 10-day 100% delivery assurance");
  }
  if (!html.includes("Orders are processed and fulfilled based on demand")) {
    throw new Error("Missing demand-based fulfilment text");
  }
  if (!html.includes("Customers can check their order details and delivery status through the website")) {
    throw new Error("Missing order information text");
  }
  console.log("✓ Section 4: Order & Delivery verified");

  // 5. Our Mission
  console.log("\n[Test 5] Checking 5. Our Mission...");
  if (!html.includes("Our Mission")) throw new Error("Missing 'Our Mission' section");
  if (!html.includes("make technical interview preparation more focused, affordable and accessible")) {
    throw new Error("Missing mission statement");
  }
  if (
    !html.includes("BeeNext – Everything You Need for Interviews.") ||
    (!html.includes("Nothing You Don&#x27;t.") && !html.includes("Nothing You Don't."))
  ) {
    throw new Error("Missing mission motto");
  }
  console.log("✓ Section 5: Our Mission verified");

  // 6. Company Information
  console.log("\n[Test 6] Checking 6. Company Information...");
  if (!html.includes("Company Information")) throw new Error("Missing 'Company Information' section");
  if (!html.includes("BeeNext")) throw new Error("Missing BeeNext company name");
  if (!html.includes("C5, 104, 1st Floor, Larica") || !html.includes("Barasat, Kolkata") || !html.includes("West Bengal – 700126, India")) {
    throw new Error("Missing full company address");
  }
  console.log("✓ Section 6: Company Information verified");

  // 7. Complaints & Customer Support
  console.log("\n[Test 7] Checking 7. Complaints & Customer Support...");
  if (!html.includes("Complaints &amp; Customer Support") && !html.includes("Complaints & Customer Support")) {
    throw new Error("Missing 'Complaints & Customer Support' section");
  }
  if (!html.includes("supportbeenext@gmail.com")) {
    throw new Error("Missing support email");
  }
  if (!html.includes('href="mailto:supportbeenext@gmail.com"')) {
    throw new Error("Support email is not a clickable mailto: link");
  }
  console.log("✓ Section 7: Complaints & Customer Support & mailto verified");

  // Strict restrictions check: Navbar and Footer
  console.log("\n[Test 8] Checking Navbar & Footer integrity across site...");
  const pages = ["http://localhost:3000/", "http://localhost:3000/purchase", "http://localhost:3000/about"];
  for (const url of pages) {
    const pageRes = await fetch(url);
    const pageHtml = await pageRes.text();
    if (!pageHtml.includes("DSA Topics") || !pageHtml.includes("Purchase") || !pageHtml.includes("My Orders") || !pageHtml.includes("About")) {
      throw new Error(`Navbar broken on ${url}`);
    }
    if (!pageHtml.includes("supportbeenext@gmail.com") || !pageHtml.includes("C5, 104, 1st Floor, Larica")) {
      throw new Error(`Footer broken on ${url}`);
    }
  }
  console.log("✓ Navbar & Footer verified completely intact across pages");

  console.log("\n==================================================");
  console.log("ALL ABOUT BEENEXT REQUIREMENTS VERIFIED! ✓");
  console.log("==================================================");
}

verifyAboutPage().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
