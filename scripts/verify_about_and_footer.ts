async function main() {
  console.log("==================================================");
  console.log("VERIFYING ABOUT PAGE, NAVBAR & FOOTER REQUIREMENTS");
  console.log("==================================================");

  // [Test 1] Verify Navbar order and presence of About
  console.log("\n[Test 1] Checking Navbar links and order...");
  const homeRes = await fetch("http://localhost:3000/");
  const homeHtml = await homeRes.text();
  const cleanHomeHtml = homeHtml.replace(/<!--[\s\S]*?-->/g, "");

  if (!cleanHomeHtml.includes("DSA Topics")) throw new Error("Missing 'DSA Topics' in navbar!");
  if (!cleanHomeHtml.includes("Purchase")) throw new Error("Missing 'Purchase' in navbar!");
  if (!cleanHomeHtml.includes("My Orders")) throw new Error("Missing 'My Orders' in navbar!");
  if (!cleanHomeHtml.includes("About")) throw new Error("Missing 'About' in navbar!");
  if (!cleanHomeHtml.includes('aria-label="Profile and Account Menu"')) {
    throw new Error("Missing profile icon in navbar!");
  }

  const dsaIdx = cleanHomeHtml.indexOf("DSA Topics");
  const purchaseIdx = cleanHomeHtml.indexOf("Purchase", dsaIdx);
  const ordersIdx = cleanHomeHtml.indexOf("My Orders", purchaseIdx);
  const aboutIdx = cleanHomeHtml.indexOf("About", ordersIdx);
  const profileIconIdx = cleanHomeHtml.indexOf('aria-label="Profile and Account Menu"', aboutIdx);

  if (!(dsaIdx < purchaseIdx && purchaseIdx < ordersIdx && ordersIdx < aboutIdx && aboutIdx < profileIconIdx)) {
    throw new Error(
      `Navbar ordering violated! Expected: DSA Topics < Purchase < My Orders < About < Profile Icon. Got: dsa=${dsaIdx}, purchase=${purchaseIdx}, orders=${ordersIdx}, about=${aboutIdx}, profileIcon=${profileIconIdx}`
    );
  }
  console.log("✓ Navbar order verified: 1. DSA Topics -> 2. Purchase -> 3. My Orders -> 4. About -> 5. Profile Icon");

  // [Test 2] Verify /about page HTTP 200 and required content
  console.log("\n[Test 2] Checking /about page content and sections...");
  const aboutRes = await fetch("http://localhost:3000/about");
  if (!aboutRes.ok) throw new Error(`/about returned status ${aboutRes.status}`);
  const aboutHtml = await aboutRes.text();

  // 1. About BeeNext section
  if (!aboutHtml.includes("About BeeNext")) throw new Error("Missing 'About BeeNext' heading on /about");
  if (!aboutHtml.includes("BeeNext is created to provide handwritten Data Structures and Algorithms (DSA) notes to students and working professionals.")) {
    throw new Error("Missing About BeeNext description sentence 1");
  }
  if (!aboutHtml.includes("Our goal is to make learning, understanding, and revising DSA concepts easier through well-organized handwritten study materials.")) {
    throw new Error("Missing About BeeNext description sentence 2");
  }
  console.log("✓ 'About BeeNext' section verified");

  // 2. Our Purpose section
  if (!aboutHtml.includes("Our Purpose")) throw new Error("Missing 'Our Purpose' heading on /about");
  if (!aboutHtml.includes("We aim to help students and professionals prepare for coding interviews, strengthen their problem-solving skills, and revise important DSA concepts with convenient handwritten notes.")) {
    throw new Error("Missing 'Our Purpose' description text");
  }
  console.log("✓ 'Our Purpose' section verified");

  // 3. Company Information section
  if (!aboutHtml.includes("Company Information")) throw new Error("Missing 'Company Information' section");
  if (!aboutHtml.includes("BeeNext")) throw new Error("Missing company name BeeNext");
  if (!aboutHtml.includes("C5, 104, 1st Floor, Larica") || !aboutHtml.includes("Barasat, Kolkata") || !aboutHtml.includes("West Bengal – 700126, India")) {
    throw new Error("Missing complete company address on /about");
  }
  console.log("✓ 'Company Information' & address verified");

  // 4. Complaints & Customer Support section
  if (!aboutHtml.includes("Complaints &amp; Customer Support") && !aboutHtml.includes("Complaints & Customer Support")) {
    throw new Error("Missing 'Complaints & Customer Support' section");
  }
  if (!aboutHtml.includes("supportbeenext@gmail.com")) {
    throw new Error("Missing support email on /about");
  }
  if (!aboutHtml.includes('href="mailto:supportbeenext@gmail.com"')) {
    throw new Error("Support email must be a clickable mailto: link!");
  }
  console.log("✓ 'Complaints & Customer Support' and clickable mailto link verified");

  // [Test 3] Verify Website Footer across pages
  console.log("\n[Test 3] Checking Footer across pages...");
  const footerPages = ["http://localhost:3000/", "http://localhost:3000/topics", "http://localhost:3000/about"];

  for (const pageUrl of footerPages) {
    const res = await fetch(pageUrl);
    const html = await res.text();

    if (!html.includes("supportbeenext@gmail.com")) {
      throw new Error(`Missing support email in footer on ${pageUrl}`);
    }
    if (!html.includes('href="mailto:supportbeenext@gmail.com"')) {
      throw new Error(`Support email in footer on ${pageUrl} is not a mailto link!`);
    }
    if (!html.includes("C5, 104, 1st Floor, Larica, Barasat, Kolkata, West Bengal – 700126, India.")) {
      throw new Error(`Missing or incomplete company address in footer on ${pageUrl}`);
    }
    // Check no duplicate footers
    const footerCount = (html.match(/<footer/g) || []).length;
    if (footerCount !== 1) {
      throw new Error(`Expected exactly 1 footer on ${pageUrl}, found ${footerCount}`);
    }
  }
  console.log("✓ Footer verified across pages: Clickable mailto support email, complete company address, single footer");

  console.log("\n==================================================");
  console.log("ALL ABOUT PAGE, NAVBAR & FOOTER REQUIREMENTS VERIFIED! ✓");
  console.log("==================================================");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
