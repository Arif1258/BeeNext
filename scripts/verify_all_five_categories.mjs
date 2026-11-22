import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/skarifahmed/.gemini/antigravity/brain/c8b7009b-d510-4d67-847d-ce23023a07bb';

async function run() {
  const port = 9600 + Math.floor(Math.random() * 50);
  const userDataDir = `/tmp/chrome_all5_${Date.now()}`;
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--window-size=1440,1100'
  ]);

  let list = null;
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      list = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/json/list`, r => {
          let d = '';
          r.on('data', c => d += c);
          r.on('end', () => resolve(JSON.parse(d)));
        });
        req.on('error', reject);
      });
      if (list && list.length > 0) break;
    } catch (e) {}
  }

  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) pending.get(m.id)(m);
  };
  const send = (method, params = {}) => new Promise(r => {
    const cid = id++;
    pending.set(cid, r);
    ws.send(JSON.stringify({ id: cid, method, params }));
  });

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res?.result?.result?.value;
  };

  const takeScreenshot = async (filename) => {
    const shot = await send('Page.captureScreenshot');
    const base64 = shot?.result?.data || shot?.data;
    if (base64) {
      fs.writeFileSync(`${ARTIFACT_DIR}/${filename}`, Buffer.from(base64, 'base64'));
      console.log(`   Saved ${filename}`);
    }
  };

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');

  console.log("=================================================");
  console.log("VERIFYING ALL 5 PRODUCT CATEGORIES");
  console.log("1. CS Fundamentals");
  console.log("2. Databases (DB)");
  console.log("3. HR Interview");
  console.log("4. Topic-Wise DSA");
  console.log("5. Full DSA Book");
  console.log("=================================================");

  // 1. DESKTOP VIEW (1440px)
  console.log("\n--- TEST 1: DESKTOP VIEW (1440px) ---");
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1400,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise(r => setTimeout(r, 2000));

  const desktopBoxesInfo = await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.shadow-card'));
      return cards.map(c => {
        const title = c.querySelector('h2, h4')?.textContent?.trim();
        const cardRect = c.getBoundingClientRect();
        
        // Find cart button and order button
        const buttons = Array.from(c.querySelectorAll('button'));
        const cartBtn = buttons.find(b => b.getAttribute('title') === 'Add to Cart' || b.getAttribute('aria-label')?.includes('Cart') || b.querySelector('svg.lucide-shopping-cart'));
        const orderBtn = buttons.find(b => b.textContent?.includes('Order Now'));
        
        const cartRect = cartBtn ? cartBtn.getBoundingClientRect() : null;
        const orderRect = orderBtn ? orderBtn.getBoundingClientRect() : null;
        
        const cartInside = cartRect ? (cartRect.left >= cardRect.left - 1 && cartRect.right <= cardRect.right + 1) : null;
        const orderInside = orderRect ? (orderRect.left >= cardRect.left - 1 && orderRect.right <= cardRect.right + 1) : null;
        const isOverflowing = c.scrollWidth > c.clientWidth + 1;

        return {
          title,
          cardWidth: Math.round(cardRect.width),
          isOverflowing,
          hasCartBtn: !!cartBtn,
          cartTitle: cartBtn ? cartBtn.getAttribute('title') : null,
          cartAria: cartBtn ? cartBtn.getAttribute('aria-label') : null,
          hasOrderBtn: !!orderBtn,
          orderText: orderBtn ? orderBtn.textContent.trim() : null,
          cartInside,
          orderInside,
          cartWidth: cartRect ? Math.round(cartRect.width) : null,
          cartHeight: cartRect ? Math.round(cartRect.height) : null,
          orderWidth: orderRect ? Math.round(orderRect.width) : null,
          orderHeight: orderRect ? Math.round(orderRect.height) : null
        };
      });
    })()
  `);

  console.log("Desktop Cards Inspection:");
  desktopBoxesInfo.forEach((b, idx) => {
    console.log(`  [Box ${idx + 1}] "${b.title}":`);
    console.log(`    - Card width: ${b.cardWidth}px, Overflowing: ${b.isOverflowing}`);
    console.log(`    - Cart Icon Button: ${b.cartWidth}x${b.cartHeight}px, title="${b.cartTitle}", aria-label="${b.cartAria}", inside=${b.cartInside}`);
    console.log(`    - Order Now Button: ${b.orderWidth}x${b.orderHeight}px, text="${b.orderText}", inside=${b.orderInside}`);
  });

  await takeScreenshot('all_five_categories_desktop.png');

  // 2. FUNCTIONALITY CHECK: Click Add to Cart on Full DSA Book (Box 2)
  console.log("\n--- TEST 2: FUNCTIONALITY: Click Cart Icon on Full DSA Book ---");
  const fullBookCartClick = await evaluate(`
    (() => {
      // Box 2 is Full DSA Book
      const cards = Array.from(document.querySelectorAll('.shadow-card'));
      const fullBookCard = cards.find(c => c.querySelector('h2')?.textContent?.includes('Full DSA Book'));
      if (!fullBookCard) return { error: 'Full DSA Book card not found' };
      
      const cartBtn = Array.from(fullBookCard.querySelectorAll('button')).find(b => b.getAttribute('title') === 'Add to Cart');
      if (!cartBtn) return { error: 'Cart button not found' };
      
      cartBtn.click();
      return { success: true };
    })()
  `);
  console.log("  Click Full DSA Book Cart:", fullBookCartClick);
  await new Promise(r => setTimeout(r, 600));

  const fullBookFeedback = await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.shadow-card'));
      const fullBookCard = cards.find(c => c.querySelector('h2')?.textContent?.includes('Full DSA Book'));
      const cartBtn = fullBookCard?.querySelector('button[title="Add to Cart"]');
      const hasCheck = !!cartBtn?.querySelector('.lucide-check');
      const toast = document.querySelector('.fixed.bottom-6')?.textContent;
      const cart = JSON.parse(localStorage.getItem('beenext_cart_v1') || '[]');
      return { hasCheck, toast, cartItemCount: cart.length, firstItem: cart[0]?.title };
    })()
  `);
  console.log("  Feedback after clicking Full DSA Book cart icon:", fullBookFeedback);

  await takeScreenshot('full_dsa_cart_clicked_desktop.png');

  // 3. FUNCTIONALITY CHECK: Click Add to Cart on Topic-Wise Book (Box 1)
  console.log("\n--- TEST 3: FUNCTIONALITY: Click Cart Icon on Topic-Wise Book ---");
  // First reload to reset state
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise(r => setTimeout(r, 1500));

  const topicCartClick = await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.shadow-card'));
      const topicCard = cards.find(c => c.querySelector('h2')?.textContent?.includes('Topic-Wise Book'));
      if (!topicCard) return { error: 'Topic-Wise Book card not found' };
      
      const cartBtn = Array.from(topicCard.querySelectorAll('button')).find(b => b.getAttribute('title') === 'Add to Cart');
      if (!cartBtn) return { error: 'Cart button not found' };
      
      cartBtn.click();
      return { success: true };
    })()
  `);
  console.log("  Click Topic-Wise Book Cart:", topicCartClick);
  await new Promise(r => setTimeout(r, 800));

  const topicViewCheck = await evaluate(`
    (() => {
      const heading = document.querySelector('h1')?.textContent;
      const topicsCount = document.querySelectorAll('h3').length;
      return { heading, topicsCount };
    })()
  `);
  console.log("  Navigation result after Topic-Wise Cart click:", topicViewCheck);

  // 4. MOBILE VIEW (390px - iPhone 12/13/14)
  console.log("\n--- TEST 4: MOBILE VIEW (390px) ---");
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Page.navigate', { url: 'http://localhost:3000/purchase' });
  await new Promise(r => setTimeout(r, 2000));

  const mobileBoxesInfo = await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.shadow-card'));
      return cards.map(c => {
        const title = c.querySelector('h2, h4')?.textContent?.trim();
        const cardRect = c.getBoundingClientRect();
        
        const buttons = Array.from(c.querySelectorAll('button'));
        const cartBtn = buttons.find(b => b.getAttribute('title') === 'Add to Cart' || b.getAttribute('aria-label')?.includes('Cart') || b.querySelector('svg.lucide-shopping-cart'));
        const orderBtn = buttons.find(b => b.textContent?.includes('Order Now'));
        
        const cartRect = cartBtn ? cartBtn.getBoundingClientRect() : null;
        const orderRect = orderBtn ? orderBtn.getBoundingClientRect() : null;
        
        const cartInside = cartRect ? (cartRect.left >= cardRect.left - 1 && cartRect.right <= cardRect.right + 1) : null;
        const orderInside = orderRect ? (orderRect.left >= cardRect.left - 1 && orderRect.right <= cardRect.right + 1) : null;
        const isOverflowing = c.scrollWidth > c.clientWidth + 1;

        return {
          title,
          cardWidth: Math.round(cardRect.width),
          isOverflowing,
          hasCartBtn: !!cartBtn,
          cartTitle: cartBtn ? cartBtn.getAttribute('title') : null,
          hasOrderBtn: !!orderBtn,
          orderText: orderBtn ? orderBtn.textContent.trim() : null,
          cartInside,
          orderInside,
          cartWidth: cartRect ? Math.round(cartRect.width) : null,
          cartHeight: cartRect ? Math.round(cartRect.height) : null,
          orderWidth: orderRect ? Math.round(orderRect.width) : null,
          orderHeight: orderRect ? Math.round(orderRect.height) : null
        };
      });
    })()
  `);

  console.log("Mobile Cards Inspection:");
  mobileBoxesInfo.forEach((b, idx) => {
    console.log(`  [Box ${idx + 1}] "${b.title}":`);
    console.log(`    - Card width: ${b.cardWidth}px, Overflowing: ${b.isOverflowing}`);
    console.log(`    - Cart Icon Button: ${b.cartWidth}x${b.cartHeight}px, inside=${b.cartInside}`);
    console.log(`    - Order Now Button: ${b.orderWidth}x${b.orderHeight}px, inside=${b.orderInside}`);
  });

  await takeScreenshot('all_five_categories_mobile_top.png');

  // Scroll down to capture CS Fundamentals, Databases, HR
  await evaluate(`window.scrollBy(0, 900)`);
  await new Promise(r => setTimeout(r, 600));
  await takeScreenshot('all_five_categories_mobile_middle.png');

  await evaluate(`window.scrollBy(0, 900)`);
  await new Promise(r => setTimeout(r, 600));
  await takeScreenshot('all_five_categories_mobile_bottom.png');

  chrome.kill();
  console.log("\n=== ALL 5 CATEGORIES VERIFICATION COMPLETE ===");
}

run().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
