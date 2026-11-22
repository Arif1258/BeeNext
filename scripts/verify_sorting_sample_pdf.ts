import fs from "fs";
import path from "path";

async function verifySortingSamplePDF() {
  console.log("==================================================");
  console.log("VERIFYING SORTING SAMPLE PDF DOWNLOAD FEATURE");
  console.log("==================================================");

  // 1. Verify file on disk
  console.log("\n[Test 1] Checking Sample PDF file on disk...");
  const publicPdfPath = path.join(process.cwd(), "public", "notes", "BeeNext-Sorting-Sample.pdf");
  if (!fs.existsSync(publicPdfPath)) {
    throw new Error(`File not found at: ${publicPdfPath}`);
  }
  const stats = fs.statSync(publicPdfPath);
  console.log(`✓ File exists: ${publicPdfPath} (${stats.size} bytes)`);
  if (stats.size !== 1327967) {
    throw new Error(`Expected file size 1327967, got ${stats.size}`);
  }

  // 2. Test API download route
  console.log("\n[Test 2] Testing /api/sample-pdf/sorting API route...");
  const apiRes = await fetch("http://localhost:3000/api/sample-pdf/sorting");
  if (!apiRes.ok) {
    throw new Error(`HTTP ${apiRes.status} on /api/sample-pdf/sorting`);
  }

  const contentType = apiRes.headers.get("content-type");
  const contentDisposition = apiRes.headers.get("content-disposition");
  console.log(`✓ Content-Type: ${contentType}`);
  console.log(`✓ Content-Disposition: ${contentDisposition}`);

  if (!contentType?.includes("application/pdf")) {
    throw new Error(`Expected application/pdf, got ${contentType}`);
  }
  if (!contentDisposition?.includes('attachment; filename="BeeNext-Sorting-Sample.pdf"')) {
    throw new Error(`Expected attachment header with BeeNext-Sorting-Sample.pdf, got ${contentDisposition}`);
  }

  const arrayBuffer = await apiRes.arrayBuffer();
  console.log(`✓ Downloaded buffer size: ${arrayBuffer.byteLength} bytes`);
  if (arrayBuffer.byteLength !== 1327967) {
    throw new Error(`Downloaded byte length mismatch: expected 1327967, got ${arrayBuffer.byteLength}`);
  }

  // 3. Test static route
  console.log("\n[Test 3] Testing /notes/BeeNext-Sorting-Sample.pdf static route...");
  const staticRes = await fetch("http://localhost:3000/notes/BeeNext-Sorting-Sample.pdf");
  if (!staticRes.ok) {
    throw new Error(`HTTP ${staticRes.status} on /notes/BeeNext-Sorting-Sample.pdf`);
  }
  const staticBuffer = await staticRes.arrayBuffer();
  if (staticBuffer.byteLength !== 1327967) {
    throw new Error(`Static buffer size mismatch: ${staticBuffer.byteLength}`);
  }
  console.log(`✓ Static route served full 1.3MB PDF directly`);

  // 4. Test /topics page rendering
  console.log("\n[Test 4] Testing /topics page for Download Sample PDF button...");
  const topicsRes = await fetch("http://localhost:3000/topics");
  if (!topicsRes.ok) throw new Error(`HTTP ${topicsRes.status} on /topics`);
  const topicsHtml = await topicsRes.text();

  if (!topicsHtml.includes("Download Sample PDF")) {
    throw new Error("Missing 'Download Sample PDF' on /topics");
  }

  if (!topicsHtml.includes("BeeNext-Sorting-Sample.pdf")) {
    throw new Error("Missing 'BeeNext-Sorting-Sample.pdf' filename in /topics");
  }

  // Count occurrences of matching anchor tags on /topics
  const aTagMatches = (topicsHtml.match(/<a[^>]*BeeNext-Sorting-Sample\.pdf[^>]*>/g) || []).length;
  console.log(`✓ Matching Download Sample PDF anchor tag occurs ${aTagMatches} time(s) on /topics (should be exactly 1 for Sorting)`);
  if (aTagMatches !== 1) {
    throw new Error(`Expected exactly 1 Download Sample PDF anchor tag on /topics, found ${aTagMatches}`);
  }

  // 5. Test /topics/sorting page rendering
  console.log("\n[Test 5] Testing /topics/sorting page...");
  const sortingRes = await fetch("http://localhost:3000/topics/sorting");
  if (!sortingRes.ok) throw new Error(`HTTP ${sortingRes.status} on /topics/sorting`);
  const sortingHtml = await sortingRes.text();
  if (!sortingHtml.includes("Download Sample PDF")) {
    throw new Error("Missing 'Download Sample PDF' on /topics/sorting");
  }
  console.log("✓ 'Download Sample PDF' is present on /topics/sorting");

  // 6. Test other topic page does NOT have Download Sample PDF
  console.log("\n[Test 6] Testing other topic page (/topics/arrays) has NO Download Sample PDF...");
  const arraysRes = await fetch("http://localhost:3000/topics/arrays");
  if (!arraysRes.ok) throw new Error(`HTTP ${arraysRes.status} on /topics/arrays`);
  const arraysHtml = await arraysRes.text();
  const arraysPdfAnchors = (arraysHtml.match(/<a[^>]*BeeNext-Sorting-Sample\.pdf[^>]*>/g) || []).length;
  if (arraysPdfAnchors > 0) {
    throw new Error("'Download Sample PDF' anchor unexpectedly found on /topics/arrays!");
  }
  console.log("✓ 'Download Sample PDF' anchor correctly absent on /topics/arrays");

  console.log("\n==================================================");
  console.log("ALL SORTING SAMPLE PDF TESTS PASSED! ✓");
  console.log("==================================================");
}

verifySortingSamplePDF().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
