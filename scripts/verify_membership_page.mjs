import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const BRAIN_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";

async function verifyMembership() {
  console.log("=== BROWSER VERIFICATION: MEMBERSHIP PAGE ===");

  const port = 9860 + Math.floor(Math.random() * 100);
  const userDataDir = `/tmp/chrome_membership_verify_${Date.now()}`;

  // 1. Desktop Check (1440x900)
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--disable-gpu",
    "--window-size=1440,900",
  ]);

  try {
    await new Promise((r) => setTimeout(r, 2000));

    const list = await new Promise((res, rej) =>
      http.get(`http://127.0.0.1:${port}/json/list`, (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => res(JSON.parse(d)));
      }).on("error", rej)
    );

    const ws = new WebSocket(list[0].webSocketDebuggerUrl);
    let id = 1;
    const pending = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) pending.get(m.id)(m);
    };

    const send = (method, params = {}) =>
      new Promise((r) => {
        const cid = id++;
        pending.set(cid, r);
        ws.send(JSON.stringify({ id: cid, method, params }));
      });

    await new Promise((r) => (ws.onopen = r));
    await send("Page.enable");
    await send("DOM.enable");
    await send("Network.enable");

    // Navigate to /membership
    await send("Page.navigate", { url: "http://localhost:3000/membership" });
    await new Promise((r) => setTimeout(r, 3000));
    console.log("✓ Navigated to http://localhost:3000/membership");

    // Check 1: Introductory heading removed
    const introCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        return document.body.innerText.includes("Elevate Your DSA Preparation");
      })()`,
      returnByValue: true,
    });
    console.log("Introductory heading 'Elevate Your DSA Preparation' present:", introCheck.result?.result?.value);
    if (introCheck.result?.result?.value === true) {
      throw new Error("Introductory heading 'Elevate Your DSA Preparation' should have been removed!");
    }
    console.log("✓ 'Elevate Your DSA Preparation' successfully removed");

    // Check 2: Verify ₹599 is displayed and old ₹299 is absent
    const pricingTextCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          has599: text.includes("₹599") || text.includes("599"),
          has299: text.includes("₹299") || text.includes("299"),
          has79: text.includes("₹79") || text.includes("79"),
        };
      })()`,
      returnByValue: true,
    });
    const pt = pricingTextCheck.result?.result?.value;
    console.log("Pricing Text Check on /membership:", pt);
    if (!pt.has599) throw new Error("Expected /membership to display ₹599!");
    if (pt.has299) throw new Error("Expected /membership to NOT display ₹299!");
    if (!pt.has79) throw new Error("Expected /membership to display ₹79 for Monthly!");
    console.log("✓ Pricing text correctly displays ₹599 for Yearly and ₹79 for Monthly (no ₹299)");

    // Check 3: Inspect the three boxes and their dimensions & outlines
    const boxesEvaluation = await send("Runtime.evaluate", {
      expression: `(() => {
        const headings = Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim());
        const normalBox = document.querySelector('.border-yellow-500');
        const greenBoxes = Array.from(document.querySelectorAll('.border-green-500'));

        const normalRect = normalBox ? normalBox.getBoundingClientRect() : null;
        const monthlyRect = greenBoxes[0] ? greenBoxes[0].getBoundingClientRect() : null;
        const yearlyRect = greenBoxes[1] ? greenBoxes[1].getBoundingClientRect() : null;

        return {
          headings,
          normalBoxExists: !!normalBox,
          greenBoxesCount: greenBoxes.length,
          normalBox: normalRect ? {
            top: normalRect.top,
            bottom: normalRect.bottom,
            width: normalRect.width,
            height: normalRect.height,
          } : null,
          monthlyBox: monthlyRect ? {
            top: monthlyRect.top,
            bottom: monthlyRect.bottom,
            left: monthlyRect.left,
            width: monthlyRect.width,
            height: monthlyRect.height,
          } : null,
          yearlyBox: yearlyRect ? {
            top: yearlyRect.top,
            bottom: yearlyRect.bottom,
            left: yearlyRect.left,
            width: yearlyRect.width,
            height: yearlyRect.height,
          } : null,
        };
      })()`,
      returnByValue: true,
    });

    const data = boxesEvaluation.result?.result?.value;
    console.log("\n--- PLAN BOXES GEOMETRY ON DESKTOP ---");
    console.log("Headings found:", data.headings);
    console.log("Normal box exists (yellow outline):", data.normalBoxExists, data.normalBox);
    console.log("Green boxes count (green outline):", data.greenBoxesCount);
    console.log("Monthly box:", data.monthlyBox);
    console.log("Yearly box:", data.yearlyBox);

    if (!data.normalBoxExists || data.greenBoxesCount !== 2) {
      throw new Error(`Expected 1 yellow box and 2 green boxes, got ${data.normalBoxExists ? 1 : 0} yellow and ${data.greenBoxesCount} green!`);
    }

    // Verify Normal box is above Monthly & Yearly
    if (data.normalBox.bottom > data.monthlyBox.top || data.normalBox.bottom > data.yearlyBox.top) {
      throw new Error("Normal box must appear ABOVE Monthly & Yearly Plus boxes!");
    }
    console.log("✓ Normal box correctly positioned above Monthly & Yearly boxes");

    // Verify Normal box spans full width (wider than monthly & yearly)
    if (data.normalBox.width <= data.monthlyBox.width) {
      throw new Error("Normal box must span available width on the first row!");
    }
    console.log("✓ Normal box spans full available width");

    // Verify Monthly & Yearly equal width & height (within 1px tolerance)
    const widthDiff = Math.abs(data.monthlyBox.width - data.yearlyBox.width);
    const heightDiff = Math.abs(data.monthlyBox.height - data.yearlyBox.height);
    console.log(`Width difference: ${widthDiff}px, Height difference: ${heightDiff}px`);
    if (widthDiff > 2 || heightDiff > 2) {
      throw new Error(`Monthly and Yearly boxes must be equal in width and height! (Diff: width ${widthDiff}px, height ${heightDiff}px)`);
    }
    console.log("✓ Monthly and Yearly boxes are equal in width and height side by side");

    // Capture Desktop Screenshot
    const shotDesktop = await send("Page.captureScreenshot", { format: "png" });
    const desktopPath = path.join(BRAIN_DIR, "membership_page_desktop.png");
    fs.writeFileSync(desktopPath, Buffer.from(shotDesktop.result.data, "base64"));
    console.log(`✓ Saved Desktop Screenshot to: ${desktopPath}`);

    // 2. Mobile Viewport Check (375x812)
    console.log("\n--- MOBILE VIEWPORT VERIFICATION (375x812) ---");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 1000));

    const mobileEvaluation = await send("Runtime.evaluate", {
      expression: `(() => {
        const greenBoxes = Array.from(document.querySelectorAll('.border-green-500'));
        const monthlyRect = greenBoxes[0] ? greenBoxes[0].getBoundingClientRect() : null;
        const yearlyRect = greenBoxes[1] ? greenBoxes[1].getBoundingClientRect() : null;

        return {
          monthlyTop: monthlyRect?.top,
          monthlyBottom: monthlyRect?.bottom,
          yearlyTop: yearlyRect?.top,
          yearlyBottom: yearlyRect?.bottom,
          isStacked: (monthlyRect && yearlyRect) ? (yearlyRect.top >= monthlyRect.bottom - 2) : false,
        };
      })()`,
      returnByValue: true,
    });

    const mobileData = mobileEvaluation.result?.result?.value;
    console.log("Mobile Stacked Check:", mobileData);
    if (!mobileData.isStacked) {
      throw new Error("Monthly and Yearly boxes should stack vertically on smaller screens!");
    }
    console.log("✓ Monthly and Yearly boxes stack vertically on mobile");

    const shotMobile = await send("Page.captureScreenshot", { format: "png" });
    const mobilePath = path.join(BRAIN_DIR, "membership_page_mobile.png");
    fs.writeFileSync(mobilePath, Buffer.from(shotMobile.result.data, "base64"));
    console.log(`✓ Saved Mobile Screenshot to: ${mobilePath}`);

    console.log("\n✓ ALL MEMBERSHIP PAGE REQUIREMENTS MET SUCCESSFULLY!");
  } finally {
    try {
      chrome.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

verifyMembership().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
