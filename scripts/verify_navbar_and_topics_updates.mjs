import http from "http";
import fs from "fs";
import { spawn } from "child_process";

const BASE_URL = "http://localhost:3000";
const ARTIFACT_DIR = "/Users/skarifahmed/Documents/Files/codes/beenext";
const BRAIN_ARTIFACT_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";
const PORT = 9399;
const userDataDir = `/tmp/chrome_navbar_topics_audit_${Date.now()}`;

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
    await send("DOM.enable");
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

    async function inspectPage(options = {}) {
      const check = await send("Runtime.evaluate", {
        expression: `
          (() => {
            try {
              const header = document.querySelector('header');
              const headerRect = header ? header.getBoundingClientRect() : null;

              // Find account badge (NORMAL or PLUS) near avatar
              const spans = Array.from(document.querySelectorAll('header span'));
              const badge = spans.find(s => s.textContent === 'NORMAL' || s.textContent === 'PLUS');
              const badgeRect = badge ? badge.getBoundingClientRect() : null;
              
              // Find avatar button
              const avatarBtn = Array.from(document.querySelectorAll('header button')).find(b => b.getAttribute('aria-label') === 'Profile and Account Menu');
              const avatarRect = avatarBtn ? avatarBtn.getBoundingClientRect() : null;

              // Verify badge is positioned AFTER avatar button
              const isBadgeAfterAvatar = badge && avatarBtn ? (avatarBtn.compareDocumentPosition(badge) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 : false;

              // Check dropdown
              const dropdown = document.querySelector('.animate-in');
              const dropdownRect = dropdown ? dropdown.getBoundingClientRect() : null;
              const isDropdownBelowAvatar = dropdownRect && avatarRect ? dropdownRect.top >= avatarRect.bottom - 1 : null;
              const isDropdownClipped = dropdownRect ? (dropdownRect.right > window.innerWidth || dropdownRect.left < 0) : null;

              // Check DSA Topics Heading Gap
              const h1 = document.querySelector('h1');
              const h1Rect = h1 ? h1.getBoundingClientRect() : null;
              const navbarToHeadingGap = (h1Rect && headerRect) ? Math.round(h1Rect.top - headerRect.bottom) : null;

              // Check Performance Bar
              const progressBar = document.querySelector('[role="progressbar"]');
              const progressBarParent = progressBar ? progressBar.parentElement : null;
              const progressParentText = progressBarParent ? progressBarParent.innerText : '';
              const hasSolvedCountText = progressParentText.includes('of 495 solved') || /\\d+\\s+of\\s+\\d+\\s+solved/i.test(progressParentText);
              const hasYourProgressText = progressParentText.includes('Your Progress:');

              // Check square boxes
              const boxes = progressBar ? Array.from(progressBar.querySelectorAll('div')) : [];
              const boxDimensions = boxes.map(b => {
                const r = b.getBoundingClientRect();
                return { width: Math.round(r.width * 10) / 10, height: Math.round(r.height * 10) / 10 };
              });
              const allBoxesSquare = boxDimensions.length === 50 && boxDimensions.every(b => Math.abs(b.width - b.height) <= 1.5);

              return {
                hasBadge: !!badge,
                badgeText: badge ? badge.textContent.trim() : null,
                badgeClasses: badge ? badge.className : null,
                isBadgeAfterAvatar,
                avatarRect: avatarRect ? { top: avatarRect.top, bottom: avatarRect.bottom, left: avatarRect.left, right: avatarRect.right } : null,
                badgeRect: badgeRect ? { top: badgeRect.top, bottom: badgeRect.bottom, left: badgeRect.left, right: badgeRect.right } : null,
                isDropdownOpen: !!dropdown,
                dropdownRect: dropdownRect ? { top: dropdownRect.top, bottom: dropdownRect.bottom, left: dropdownRect.left, right: dropdownRect.right } : null,
                isDropdownBelowAvatar,
                isDropdownClipped,
                navbarToHeadingGap,
                hasSolvedCountText,
                hasYourProgressText,
                totalBoxesCount: boxDimensions.length,
                allBoxesSquare,
                sampleBoxSize: boxDimensions[0] || null,
                windowWidth: window.innerWidth,
                bodyScrollWidth: document.body.scrollWidth,
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

    async function setViewport(width, height) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 2,
        mobile: width < 768,
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    async function clickAvatar() {
      await send("Runtime.evaluate", {
        expression: `
          (() => {
            const avatarBtn = Array.from(document.querySelectorAll('header button')).find(b => b.getAttribute('aria-label') === 'Profile and Account Menu');
            if (avatarBtn) avatarBtn.click();
          })()
        `,
      });
      await new Promise((r) => setTimeout(r, 300));
    }

    async function saveScreenshot(filename) {
      const shot = await send("Page.captureScreenshot", { format: "png" });
      const buf = Buffer.from(shot.result.data, "base64");
      fs.writeFileSync(`${BRAIN_ARTIFACT_DIR}/${filename}`, buf);
      console.log(`Saved screenshot: ${filename}`);
    }

    async function waitForPageBadge(expectedText, maxWaitMs = 8000) {
      const start = Date.now();
      while (Date.now() - start < maxWaitMs) {
        const page = await inspectPage();
        if (page && page.hasBadge && (!expectedText || page.badgeText === expectedText)) {
          return page;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      return await inspectPage();
    }

    console.log("=== 1. TEST NORMAL USER ===");
    await loginAs("skasif@test.com", "Arif@12588");
    await setViewport(1366, 768);
    await send("Page.navigate", { url: `${BASE_URL}/topics` });
    await new Promise((r) => setTimeout(r, 1500));

    let normalDesktop = await waitForPageBadge("NORMAL");
    console.log("Normal Desktop Initial:", JSON.stringify(normalDesktop, null, 2));

    if (!normalDesktop.isBadgeAfterAvatar) throw new Error("Badge should be after avatar!");
    if (normalDesktop.badgeText !== "NORMAL") throw new Error(`Expected NORMAL, got ${normalDesktop.badgeText}`);
    if (normalDesktop.hasSolvedCountText) throw new Error("Solved count text must be removed!");
    if (!normalDesktop.allBoxesSquare) throw new Error(`Boxes are not square: sample = ${JSON.stringify(normalDesktop.sampleBoxSize)}`);
    if (normalDesktop.navbarToHeadingGap < 15 || normalDesktop.navbarToHeadingGap > 25) {
      throw new Error(`Navbar to heading gap unexpected: ${normalDesktop.navbarToHeadingGap}px`);
    }

    // Click avatar to test dropdown
    await clickAvatar();
    let normalDropdownDesktop = await inspectPage();
    console.log("Normal Dropdown Desktop:", JSON.stringify(normalDropdownDesktop, null, 2));
    if (!normalDropdownDesktop.isDropdownOpen) throw new Error("Dropdown should be open!");
    if (!normalDropdownDesktop.isDropdownBelowAvatar) throw new Error("Dropdown should open below avatar!");
    if (normalDropdownDesktop.isDropdownClipped) throw new Error("Dropdown is clipped!");
    await saveScreenshot("navbar_dropdown_open_desktop.png");

    // Close dropdown
    await clickAvatar();
    await saveScreenshot("dsa_topics_updated_desktop.png");

    // Mobile Normal
    await setViewport(375, 667);
    await new Promise((r) => setTimeout(r, 500));
    let normalMobile = await inspectPage();
    console.log("Normal Mobile Initial:", JSON.stringify(normalMobile, null, 2));
    if (!normalMobile.isBadgeAfterAvatar) throw new Error("Mobile: Badge should be after avatar!");
    if (!normalMobile.allBoxesSquare) throw new Error(`Mobile: Boxes are not square: sample = ${JSON.stringify(normalMobile.sampleBoxSize)}`);

    // Click avatar on mobile
    await clickAvatar();
    let normalDropdownMobile = await inspectPage();
    console.log("Normal Dropdown Mobile:", JSON.stringify(normalDropdownMobile, null, 2));
    if (!normalDropdownMobile.isDropdownOpen) throw new Error("Mobile: Dropdown should be open!");
    if (!normalDropdownMobile.isDropdownBelowAvatar) throw new Error("Mobile: Dropdown should open below avatar!");
    if (normalDropdownMobile.isDropdownClipped) throw new Error("Mobile: Dropdown is clipped!");
    await saveScreenshot("navbar_dropdown_open_mobile.png");

    await clickAvatar(); // close dropdown
    await saveScreenshot("dsa_topics_updated_mobile.png");

    console.log("=== 2. TEST PLUS USER ===");
    await loginAs("arifahmedma490@gmail.com", "Arif@12588");
    await setViewport(1366, 768);
    await send("Page.navigate", { url: `${BASE_URL}/topics` });
    await new Promise((r) => setTimeout(r, 1500));

    let plusDesktop = await waitForPageBadge("PLUS");
    console.log("Plus Desktop:", JSON.stringify(plusDesktop, null, 2));
    if (!plusDesktop.isBadgeAfterAvatar) throw new Error("Plus: Badge should be after avatar!");
    if (plusDesktop.badgeText !== "PLUS") throw new Error(`Expected PLUS, got ${plusDesktop.badgeText}`);
    if (!plusDesktop.badgeClasses.includes("emerald")) throw new Error("PLUS badge must have green/emerald styling!");
    await saveScreenshot("navbar_plus_green_desktop.png");

    await setViewport(375, 667);
    await new Promise((r) => setTimeout(r, 500));
    let plusMobile = await waitForPageBadge("PLUS");
    console.log("Plus Mobile:", JSON.stringify(plusMobile, null, 2));
    if (!plusMobile.isBadgeAfterAvatar) throw new Error("Plus Mobile: Badge should be after avatar!");
    if (plusMobile.badgeText !== "PLUS") throw new Error("Plus Mobile: Badge should be PLUS!");
    await saveScreenshot("navbar_plus_green_mobile.png");

    console.log("=== 3. TEST EXPIRED PLUS USER ===");
    await loginAs("expired_plus_test@test.com", "Test@12345");
    await setViewport(1366, 768);
    await send("Page.navigate", { url: `${BASE_URL}/topics` });
    await new Promise((r) => setTimeout(r, 1500));

    let expiredDesktop = await waitForPageBadge("NORMAL");
    console.log("Expired Desktop:", JSON.stringify(expiredDesktop, null, 2));
    if (!expiredDesktop.isBadgeAfterAvatar) throw new Error("Expired: Badge should be after avatar!");
    if (expiredDesktop.badgeText !== "NORMAL") throw new Error(`Expired Plus should display NORMAL, got ${expiredDesktop.badgeText}`);
    await saveScreenshot("navbar_expired_plus_normal_desktop.png");

    console.log("SUCCESS: All navbar and DSA topics assertions PASSED!");
    try { ws.close(); } catch(e) {}
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  } finally {
    try { chrome.kill("SIGKILL"); } catch (e) {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  }
}

main();
