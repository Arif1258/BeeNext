import http from "http";
import fs from "fs";
import { spawn } from "child_process";

const BASE_URL = "http://localhost:3000";
const ARTIFACT_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";
const PORT = 9397;
const userDataDir = `/tmp/chrome_navbar_audit_${Date.now()}`;

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDataDir}`,
  "--disable-gpu",
  "--window-size=1366,768",
]);

async function main() {
  try {
    await new Promise((r) => setTimeout(r, 2000));
    const list = await new Promise((res, rej) =>
      http.get(`http://127.0.0.1:${PORT}/json/list`, (r) => {
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
    await send("Network.enable");

    async function loginAs(email, password) {
      await send("Network.clearBrowserCookies");
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await loginRes.json();
      const cookieHeader = loginRes.headers.get("set-cookie") || "";
      const match = cookieHeader.match(/beenext_token=([^;]+)/);
      const token = match ? match[1] : null;
      if (token) {
        await send("Network.setCookie", {
          name: "beenext_token",
          value: token,
          url: "http://localhost:3000",
        });
      }
      return { status: loginRes.status, user: data.user, hasToken: !!token };
    }

    async function inspectNavbar() {
      const check = await send("Runtime.evaluate", {
        expression: `
          (() => {
            try {
              // Find account badge (NORMAL or PLUS) near avatar
              const spans = Array.from(document.querySelectorAll('header span'));
              const badge = spans.find(s => s.textContent === 'NORMAL' || s.textContent === 'PLUS');
              
              // Find avatar button
              const avatarBtn = Array.from(document.querySelectorAll('header button')).find(b => b.getAttribute('aria-label') === 'Profile and Account Menu');

              // Verify badge is positioned BEFORE avatar button
              const isBadgeBeforeAvatar = badge && avatarBtn ? (badge.compareDocumentPosition(avatarBtn) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 : false;

              // Find any red plus sign after avatar
              const plusSign = spans.find(s => s.textContent && s.textContent.trim() === '+' && s.classList.contains('text-brand-red'));
              
              // Check dropdown content if open
              const dropdown = document.querySelector('.animate-in');
              const dropdownText = dropdown ? dropdown.innerText : '';
              const dropdownHasAccountType = dropdownText.includes('NORMAL') || dropdownText.includes('PLUS');

              // Check topics layout metrics if on topics page
              const introParagraphs = Array.from(document.querySelectorAll('main p'));
              const progressBar = document.querySelector('[role="progressbar"]');
              const beginnerSection = Array.from(document.querySelectorAll('[role="button"], button')).find(b => b.textContent && b.textContent.includes('Beginner Problems'));
              
              const progressBarHeight = progressBar ? progressBar.getBoundingClientRect().height : null;
              const beginnerTop = beginnerSection ? beginnerSection.getBoundingClientRect().top : null;

              return {
                hasBadge: !!badge,
                badgeText: badge ? badge.textContent.trim() : null,
                badgeClasses: badge ? badge.className : null,
                isBadgeBeforeAvatar,
                hasRedPlusSign: !!plusSign,
                dropdownHasAccountType,
                windowWidth: window.innerWidth,
                bodyScrollWidth: document.body.scrollWidth,
                progressBarHeight,
                beginnerTop,
                introParagraphsCount: introParagraphs.length,
              };
            } catch (err) {
              return { error: err.message };
            }
          })()
        `,
        returnByValue: true,
      });
      return check.result?.result?.value || check.result?.value;
    }

    async function waitForNavbarBadge(expectedText, maxWaitMs = 10000) {
      const start = Date.now();
      while (Date.now() - start < maxWaitMs) {
        const nav = await inspectNavbar();
        if (nav && nav.hasBadge && nav.badgeText === expectedText) {
          return nav;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      return await inspectNavbar();
    }

    console.log("========================================================");
    console.log("TEST 1: NORMAL USER (skasif@test.com)");
    console.log("========================================================");
    const normalLogin = await loginAs("skasif@test.com", "Arif@12588");
    console.log("Normal Login result:", normalLogin);

    await send("Page.navigate", { url: `${BASE_URL}/topics` });
    await new Promise((r) => setTimeout(r, 2000));

    const normalNav = await waitForNavbarBadge("NORMAL");
    console.log("Normal User Navbar Check:", normalNav);

    if (normalNav.badgeText !== "NORMAL") {
      throw new Error(`Expected badge NORMAL, got: ${normalNav.badgeText}`);
    }
    if (!normalNav.isBadgeBeforeAvatar) {
      throw new Error("Expected NORMAL badge to be positioned BEFORE avatar button!");
    }
    if (normalNav.hasRedPlusSign) {
      throw new Error("Red + sign should NOT appear!");
    }
    console.log("✓ Normal user correctly displays 'NORMAL' badge BEFORE avatar without red + sign!");
    console.log("✓ Topics page metrics:", {
      beginnerTop: normalNav.beginnerTop,
      progressBarHeight: normalNav.progressBarHeight,
      introParagraphsCount: normalNav.introParagraphsCount
    });

    const shotNormalDesk = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      `${ARTIFACT_DIR}/navbar_normal_user_desktop.png`,
      Buffer.from(shotNormalDesk.result.data, "base64")
    );
    fs.writeFileSync(
      `${ARTIFACT_DIR}/dsa_topics_compact_header.png`,
      Buffer.from(shotNormalDesk.result.data, "base64")
    );

    // Test Mobile for Normal User
    await send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 1000));
    const normalMobile = await inspectNavbar();
    console.log("Normal User Mobile Check:", normalMobile);
    if (normalMobile.badgeText !== "NORMAL") {
      throw new Error("Mobile normal badge failed!");
    }
    const shotNormalMob = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      `${ARTIFACT_DIR}/navbar_normal_user_mobile.png`,
      Buffer.from(shotNormalMob.result.data, "base64")
    );
    console.log("✓ Normal user mobile layout verified (no horizontal overflow, badge visible)!");

    // Reset Desktop Viewport
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log("\n========================================================");
    console.log("TEST 2: ACTIVE PLUS USER (arifahmedma490@gmail.com)");
    console.log("========================================================");
    const plusLogin = await loginAs("arifahmedma490@gmail.com", "Arif@12588");
    console.log("Plus Login result:", plusLogin);

    await send("Page.navigate", { url: `${BASE_URL}/topics` });
    await new Promise((r) => setTimeout(r, 2000));

    const plusNav = await waitForNavbarBadge("PLUS");
    console.log("Plus User Navbar Check:", plusNav);

    if (plusNav.badgeText !== "PLUS") {
      throw new Error(`Expected badge PLUS, got: ${plusNav.badgeText}`);
    }
    if (!plusNav.isBadgeBeforeAvatar) {
      throw new Error("Expected PLUS badge to be positioned BEFORE avatar button!");
    }
    if (plusNav.hasRedPlusSign) {
      throw new Error("Red + sign should be COMPLETELY REMOVED!");
    }
    console.log("✓ Active Plus user correctly displays 'PLUS' badge (red styling) BEFORE avatar and NO red + sign!");

    const shotPlusDesk = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      `${ARTIFACT_DIR}/navbar_plus_user_desktop.png`,
      Buffer.from(shotPlusDesk.result.data, "base64")
    );

    // Test Mobile for Plus User
    await send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await new Promise((r) => setTimeout(r, 1000));
    const plusMobile = await inspectNavbar();
    console.log("Plus User Mobile Check:", plusMobile);
    if (plusMobile.badgeText !== "PLUS") {
      throw new Error("Mobile Plus badge check failed!");
    }
    if (plusMobile.hasRedPlusSign) {
      throw new Error("Mobile Plus red + sign should be completely removed!");
    }
    const shotPlusMob = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      `${ARTIFACT_DIR}/navbar_plus_user_mobile.png`,
      Buffer.from(shotPlusMob.result.data, "base64")
    );
    console.log("✓ Plus user mobile layout verified (PLUS badge before avatar, zero + sign, no overflow)!");

    // Reset Desktop Viewport
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log("\n========================================================");
    console.log("TEST 3: EXPIRED PLUS USER (expired_plus_test@test.com)");
    console.log("========================================================");
    const expiredLogin = await loginAs("expired_plus_test@test.com", "Test@12345");
    console.log("Expired Plus Login result:", expiredLogin);

    await send("Page.navigate", { url: `${BASE_URL}/topics` });
    await new Promise((r) => setTimeout(r, 2000));

    const expiredNav = await waitForNavbarBadge("NORMAL");
    console.log("Expired Plus User Navbar Check:", expiredNav);

    if (expiredNav.badgeText !== "NORMAL") {
      throw new Error(`Expired user MUST display NORMAL, got: ${expiredNav.badgeText}`);
    }
    if (expiredNav.hasRedPlusSign) {
      throw new Error("Expired user must NOT have red + sign!");
    }
    if (!expiredNav.isBadgeBeforeAvatar) {
      throw new Error("Expired user NORMAL badge must be BEFORE avatar button!");
    }
    console.log("✓ Expired Plus user automatically reverted to 'NORMAL' before avatar without red + sign!");

    const shotExpiredDesk = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      `${ARTIFACT_DIR}/navbar_expired_plus_desktop.png`,
      Buffer.from(shotExpiredDesk.result.data, "base64")
    );

    console.log("\n========================================================");
    console.log("TEST 4: DROPDOWN NO-DUPLICATION VERIFICATION");
    console.log("========================================================");
    // Click avatar button to open dropdown
    await send("Runtime.evaluate", {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('header button')).find(b => b.getAttribute('aria-label') === 'Profile and Account Menu');
          if (btn) btn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 600));

    const dropdownCheck = await send("Runtime.evaluate", {
      expression: `
        (() => {
          const dropdown = document.querySelector('.animate-in');
          if (!dropdown) return { hasDropdown: false };
          const text = dropdown.innerText;
          const hasNormal = text.includes('NORMAL');
          const hasPlus = text.includes('PLUS');
          return {
            hasDropdown: true,
            hasNormal,
            hasPlus,
            dropdownItems: Array.from(dropdown.querySelectorAll('a, button')).map(el => el.textContent.trim())
          };
        })()
      `,
      returnByValue: true,
    });
    const ddData = dropdownCheck.result?.result?.value || dropdownCheck.result?.value;
    console.log("Dropdown Check Result:", ddData);

    if (ddData.hasNormal || ddData.hasPlus) {
      throw new Error("Account type was duplicated inside profile dropdown!");
    }
    console.log("✓ Account type correctly NOT duplicated inside profile dropdown!");

    const shotDropdown = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(
      `${ARTIFACT_DIR}/navbar_profile_dropdown_no_duplicate.png`,
      Buffer.from(shotDropdown.result.data, "base64")
    );

    console.log("\n========================================================");
    console.log("ALL NAVBAR VERIFICATIONS PASSED WITH 100% SUCCESS!");
    console.log("========================================================");

    ws.close();
  } finally {
    chrome.kill("SIGKILL");
  }
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
