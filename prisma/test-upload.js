const fs = require("fs");
const path = require("path");

async function testUpload() {
  console.log("Testing Admin Uploading a handwritten note...");

  // 1. Admin login
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@beenext.dev",
      password: "AdminSecurePassword123!",
    }),
  });
  const cookie = loginRes.headers.get("set-cookie")?.split(";")[0] || "";

  // 2. Fetch problems to get 0-1-knapsack ID
  const probRes = await fetch("http://localhost:3000/api/problems/0-1-knapsack", {
    headers: { Cookie: cookie },
  });
  const probData = await probRes.json();
  const problemId = probData.problem.id;

  // 3. Create dummy note SVG buffer
  const sampleNoteSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#111111"/><text x="50" y="200" fill="#E52532" font-size="20">Admin Uploaded Handwritten Diagram</text></svg>`;
  const blob = new Blob([sampleNoteSvg], { type: "image/svg+xml" });

  const formData = new FormData();
  formData.append("file", blob, "uploaded-knapsack-p3.svg");
  formData.append("problemId", problemId);
  formData.append("title", "0/1 Knapsack Branch & Bound Tree [Page 3]");
  formData.append("isProtected", "true");

  const uploadRes = await fetch("http://localhost:3000/api/media/upload", {
    method: "POST",
    headers: { Cookie: cookie },
    body: formData,
  });

  const uploadData = await uploadRes.json();
  console.log("Upload result status:", uploadRes.status, uploadData);

  if (uploadRes.status === 201 && uploadData.note?.id) {
    console.log("✅ PASSED: Admin successfully uploaded and attached note!");

    // Verify purchased user (Alex) can view it
    const alexLoginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "alex@beenext.dev",
        password: "UserSecurePassword123!",
      }),
    });
    const alexCookie = alexLoginRes.headers.get("set-cookie")?.split(";")[0] || "";

    const mediaRes = await fetch(`http://localhost:3000/api/media/note/${uploadData.note.id}`, {
      headers: { Cookie: alexCookie },
    });
    console.log("Alex fetch uploaded note status:", mediaRes.status);
    if (mediaRes.status === 200) {
      console.log("✅ PASSED: Purchased user successfully accessed the newly uploaded note!");
    } else {
      console.error("❌ FAILED: User could not access note");
    }
  } else {
    console.error("❌ FAILED: Admin note upload failed", uploadData);
  }
}

testUpload().catch(console.error);
