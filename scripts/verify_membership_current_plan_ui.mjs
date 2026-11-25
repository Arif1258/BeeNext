import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { signToken } from "../src/lib/auth";
import prismaModule from "../src/lib/prisma";
const prisma = prismaModule.default || prismaModule.prisma || prismaModule;

const BRAIN_DIR = "/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb";

async function runBrowserVerification() {
  console.log("=================================================");
  console.log("   BeeNext Membership Current Plan UI Verification");
  console.log("=================================================\n");

  const port = 9870 + Math.floor(Math.random() * 80);
  const userDataDir = `/tmp/chrome_membership_verify_${Date.now()}`;

  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    "--headless",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--disable-gpu",
    "--window-size=1440,1000",
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

    async function setAuthCookie(token) {
      if (!token) {
        await send("Network.clearBrowserCookies");
      } else {
        await send("Network.clearBrowserCookies");
        await send("Network.setCookie", {
          name: "beenext_token",
          value: token,
          domain: "localhost",
          path: "/",
          httpOnly: true,
        });
      }
    }

    async function evaluatePlanBadges() {
      const res = await send("Runtime.evaluate", {
        returnByValue: true,
        expression: `(() => {
          const normalBox = document.querySelector('.border-yellow-500');
          const greenBoxes = Array.from(document.querySelectorAll('.border-green-500'));
          const monthlyBox = greenBoxes[0];
          const yearlyBox = greenBoxes[1];

          const hasBadge = (el) => {
            if (!el) return false;
            return Array.from(el.querySelectorAll('span')).some(s => s.textContent.includes('CURRENT PLAN'));
          };

          return {
            normalHasBadge: hasBadge(normalBox),
            monthlyHasBadge: hasBadge(monthlyBox),
            yearlyHasBadge: hasBadge(yearlyBox),
            normalTitle: normalBox?.querySelector('h3')?.textContent || '',
            monthlyTitle: monthlyBox?.querySelector('h3')?.textContent || '',
            yearlyTitle: yearlyBox?.querySelector('h3')?.textContent || '',
            monthlyButtonText: monthlyBox?.querySelector('button')?.textContent || '',
            yearlyButtonText: yearlyBox?.querySelector('button')?.textContent || '',
          };
        })()`,
      });
      return res.result.result?.value;
    }

    // ------------------------------------------------------------------------
    // SCENARIO 1: Logged-out User
    // ------------------------------------------------------------------------
    console.log("--- SCENARIO 1: Logged-out User ---");
    await setAuthCookie(null);
    await send("Page.navigate", { url: "http://localhost:3000/membership" });
    await new Promise((r) => setTimeout(r, 2500));

    const s1 = await evaluatePlanBadges();
    console.log("Badges detected:", s1);
    if (s1.normalHasBadge || s1.monthlyHasBadge || s1.yearlyHasBadge) {
      throw new Error("Logged-out user must NOT see CURRENT PLAN on any plan box!");
    }
    console.log("✅ PASS: No CURRENT PLAN badges visible for logged-out user.");

    const shot1 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(BRAIN_DIR, "membership_logged_out.png"), Buffer.from(shot1.result.data, "base64"));
    console.log("✓ Saved screenshot: membership_logged_out.png");

    // ------------------------------------------------------------------------
    // SCENARIO 2: Normal Member (skasif@test.com)
    // ------------------------------------------------------------------------
    console.log("\n--- SCENARIO 2: Normal Member (skasif@test.com) ---");
    const normalUserDb = await prisma.user.findUnique({ where: { email: "skasif@test.com" } });
    const normalToken = signToken({
      id: normalUserDb.id,
      name: normalUserDb.name,
      email: normalUserDb.email,
      role: normalUserDb.role,
    });
    await setAuthCookie(normalToken);
    await send("Page.navigate", { url: "http://localhost:3000/membership" });
    await new Promise((r) => setTimeout(r, 2500));

    const s2 = await evaluatePlanBadges();
    console.log("Badges detected:", s2);
    if (!s2.normalHasBadge) {
      throw new Error("Normal user must see CURRENT PLAN in Normal Account box!");
    }
    if (s2.monthlyHasBadge || s2.yearlyHasBadge) {
      throw new Error("Normal user must NOT see CURRENT PLAN on Monthly or Yearly box!");
    }
    console.log("✅ PASS: Normal user sees CURRENT PLAN exclusively in Normal Account box.");
    console.log(`✓ Monthly purchase button: "${s2.monthlyButtonText.trim()}"`);
    console.log(`✓ Yearly purchase button: "${s2.yearlyButtonText.trim()}"`);

    const shot2 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(BRAIN_DIR, "membership_normal_user.png"), Buffer.from(shot2.result.data, "base64"));
    console.log("✓ Saved screenshot: membership_normal_user.png");

    // ------------------------------------------------------------------------
    // SCENARIO 3: Active Monthly Plus Member (monthly_plus_test@test.com)
    // ------------------------------------------------------------------------
    console.log("\n--- SCENARIO 3: Active Monthly Plus Member ---");
    const monthlyUserDb = await prisma.user.findUnique({ where: { email: "monthly_plus_test@test.com" } });
    const monthlyToken = signToken({
      id: monthlyUserDb.id,
      name: monthlyUserDb.name,
      email: monthlyUserDb.email,
      role: monthlyUserDb.role,
    });
    await setAuthCookie(monthlyToken);
    await send("Page.navigate", { url: "http://localhost:3000/membership" });
    await new Promise((r) => setTimeout(r, 2500));

    const s3 = await evaluatePlanBadges();
    console.log("Badges detected:", s3);
    if (!s3.monthlyHasBadge) {
      throw new Error("Active Monthly user must see CURRENT PLAN in Monthly Plan box!");
    }
    if (s3.normalHasBadge || s3.yearlyHasBadge) {
      throw new Error("Active Monthly user must NOT see CURRENT PLAN on Normal or Yearly box!");
    }
    console.log("✅ PASS: Active Monthly user sees CURRENT PLAN exclusively in Monthly Plan box.");
    console.log(`✓ Monthly button: "${s3.monthlyButtonText.trim()}"`);
    console.log(`✓ Yearly button: "${s3.yearlyButtonText.trim()}"`);

    const shot3 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(BRAIN_DIR, "membership_monthly_user.png"), Buffer.from(shot3.result.data, "base64"));
    console.log("✓ Saved screenshot: membership_monthly_user.png");

    // ------------------------------------------------------------------------
    // SCENARIO 4: Active Yearly Plus Member (arifahmedma490@gmail.com)
    // ------------------------------------------------------------------------
    console.log("\n--- SCENARIO 4: Active Yearly Plus Member ---");
    const yearlyUserDb = await prisma.user.findUnique({ where: { email: "arifahmedma490@gmail.com" } });
    const yearlyToken = signToken({
      id: yearlyUserDb.id,
      name: yearlyUserDb.name,
      email: yearlyUserDb.email,
      role: yearlyUserDb.role,
    });
    await setAuthCookie(yearlyToken);
    await send("Page.navigate", { url: "http://localhost:3000/membership" });
    await new Promise((r) => setTimeout(r, 2500));

    const s4 = await evaluatePlanBadges();
    console.log("Badges detected:", s4);
    if (!s4.yearlyHasBadge) {
      throw new Error("Active Yearly user must see CURRENT PLAN in Yearly Plan box!");
    }
    if (s4.normalHasBadge || s4.monthlyHasBadge) {
      throw new Error("Active Yearly user must NOT see CURRENT PLAN on Normal or Monthly box!");
    }
    console.log("✅ PASS: Active Yearly user sees CURRENT PLAN exclusively in Yearly Plan box.");
    console.log(`✓ Monthly button: "${s4.monthlyButtonText.trim()}"`);
    console.log(`✓ Yearly button: "${s4.yearlyButtonText.trim()}"`);

    const shot4 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(BRAIN_DIR, "membership_yearly_user.png"), Buffer.from(shot4.result.data, "base64"));
    console.log("✓ Saved screenshot: membership_yearly_user.png");

    // ------------------------------------------------------------------------
    // SCENARIO 5: Expired Plus Member (expired_plus_test@test.com)
    // ------------------------------------------------------------------------
    console.log("\n--- SCENARIO 5: Expired Plus Member (Treated as Normal) ---");
    const expiredUserDb = await prisma.user.findUnique({ where: { email: "expired_plus_test@test.com" } });
    const expiredToken = signToken({
      id: expiredUserDb.id,
      name: expiredUserDb.name,
      email: expiredUserDb.email,
      role: expiredUserDb.role,
    });
    await setAuthCookie(expiredToken);
    await send("Page.navigate", { url: "http://localhost:3000/membership" });
    await new Promise((r) => setTimeout(r, 2500));

    const s5 = await evaluatePlanBadges();
    console.log("Badges detected:", s5);
    if (!s5.normalHasBadge) {
      throw new Error("Expired Plus user must be treated as Normal and see CURRENT PLAN in Normal Account box!");
    }
    if (s5.monthlyHasBadge || s5.yearlyHasBadge) {
      throw new Error("Expired Plus user must NOT see CURRENT PLAN on Monthly or Yearly box!");
    }
    console.log("✅ PASS: Expired Plus user is treated as Normal and sees CURRENT PLAN in Normal Account box.");
    console.log(`✓ Monthly purchase button: "${s5.monthlyButtonText.trim()}"`);
    console.log(`✓ Yearly purchase button: "${s5.yearlyButtonText.trim()}"`);

    const shot5 = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(BRAIN_DIR, "membership_expired_user.png"), Buffer.from(shot5.result.data, "base64"));
    console.log("✓ Saved screenshot: membership_expired_user.png");

    console.log("\n=================================================");
    console.log("   ALL 5 MEMBERSHIP SCENARIOS VERIFIED SUCCESSFULLY!");
    console.log("=================================================");

    ws.close();
    chrome.kill();
  } catch (err) {
    console.error("Browser verification error:", err);
    chrome.kill();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBrowserVerification();
