const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

function generateSampleSlotSVG(title, subtitle, tag, color, diagramType) {
  let diagramContent = "";

  if (diagramType === "SORTING") {
    diagramContent = `
      <!-- Array Boxes -->
      <g transform="translate(60, 190)">
        <text x="0" y="-12" fill="#666666" font-family="Courier, monospace" font-size="12">Original Unsorted Array:</text>
        <rect x="0" y="0" width="46" height="42" fill="#FFFFFF" stroke="#E52532" stroke-width="2.5" rx="6"/>
        <text x="23" y="26" text-anchor="middle" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="18">38</text>
        
        <rect x="54" y="0" width="46" height="42" fill="#FFFFFF" stroke="#111111" stroke-width="1.8" rx="6"/>
        <text x="77" y="26" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="18">27</text>

        <rect x="108" y="0" width="46" height="42" fill="#FFFFFF" stroke="#111111" stroke-width="1.8" rx="6"/>
        <text x="131" y="26" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="18">43</text>

        <rect x="162" y="0" width="46" height="42" fill="#FFFFFF" stroke="#111111" stroke-width="1.8" rx="6"/>
        <text x="185" y="26" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="18">03</text>

        <rect x="216" y="0" width="46" height="42" fill="#FFFFFF" stroke="#111111" stroke-width="1.8" rx="6"/>
        <text x="239" y="26" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="18">09</text>

        <rect x="270" y="0" width="46" height="42" fill="#FFFFFF" stroke="#111111" stroke-width="1.8" rx="6"/>
        <text x="293" y="26" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="18">82</text>
      </g>

      <!-- Divide arrows -->
      <path d="M 140 250 L 100 290" stroke="#E52532" stroke-width="2" marker-end="url(#arrow)"/>
      <path d="M 280 250 L 320 290" stroke="#E52532" stroke-width="2" marker-end="url(#arrow)"/>

      <!-- Split Left -->
      <g transform="translate(40, 300)">
        <rect x="0" y="0" width="38" height="34" fill="#FFFFFF" stroke="#111111" stroke-width="1.5" rx="4"/>
        <text x="19" y="22" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="14">38</text>
        <rect x="44" y="0" width="38" height="34" fill="#FFFFFF" stroke="#111111" stroke-width="1.5" rx="4"/>
        <text x="63" y="22" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="14">27</text>
        <rect x="88" y="0" width="38" height="34" fill="#FFFFFF" stroke="#111111" stroke-width="1.5" rx="4"/>
        <text x="107" y="22" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="14">43</text>
      </g>

      <!-- Split Right -->
      <g transform="translate(260, 300)">
        <rect x="0" y="0" width="38" height="34" fill="#FFFFFF" stroke="#111111" stroke-width="1.5" rx="4"/>
        <text x="19" y="22" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="14">03</text>
        <rect x="44" y="0" width="38" height="34" fill="#FFFFFF" stroke="#111111" stroke-width="1.5" rx="4"/>
        <text x="63" y="22" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="14">09</text>
        <rect x="88" y="0" width="38" height="34" fill="#FFFFFF" stroke="#111111" stroke-width="1.5" rx="4"/>
        <text x="107" y="22" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="14">82</text>
      </g>

      <!-- Recurrence formula note -->
      <g transform="translate(50, 380)">
        <rect x="0" y="0" width="350" height="60" fill="#FFF5F5" stroke="#E52532" stroke-width="1" rx="8"/>
        <text x="16" y="24" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="13">T(N) = 2T(N/2) + O(N)</text>
        <text x="16" y="46" fill="#444444" font-family="Courier, monospace" font-size="12">Master Theorem Case 2 =&gt; Time: O(N log N)</text>
      </g>
    `;
  } else if (diagramType === "POINTER") {
    diagramContent = `
      <!-- Fast & Slow Pointer Window -->
      <g transform="translate(50, 190)">
        <text x="0" y="-12" fill="#666666" font-family="Courier, monospace" font-size="12">Sliding Window / Two Pointers:</text>
        
        <rect x="0" y="0" width="48" height="44" fill="#FFFFFF" stroke="#111111" stroke-width="1.5" rx="6"/>
        <text x="24" y="27" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="16">2</text>

        <rect x="54" y="0" width="48" height="44" fill="#FFF5F5" stroke="#E52532" stroke-width="2.5" rx="6"/>
        <text x="78" y="27" text-anchor="middle" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="16">1</text>
        <text x="78" y="62" text-anchor="middle" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="11">^ L (left)</text>

        <rect x="108" y="0" width="48" height="44" fill="#FFF5F5" stroke="#E52532" stroke-width="2.5" rx="6"/>
        <text x="132" y="27" text-anchor="middle" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="16">5</text>

        <rect x="162" y="0" width="48" height="44" fill="#FFF5F5" stroke="#E52532" stroke-width="2.5" rx="6"/>
        <text x="186" y="27" text-anchor="middle" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="16">1</text>
        <text x="186" y="62" text-anchor="middle" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="11">^ R (right)</text>

        <rect x="216" y="0" width="48" height="44" fill="#FFFFFF" stroke="#111111" stroke-width="1.5" rx="6"/>
        <text x="240" y="27" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="16">3</text>

        <rect x="270" y="0" width="48" height="44" fill="#FFFFFF" stroke="#111111" stroke-width="1.5" rx="6"/>
        <text x="294" y="27" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="16">2</text>
      </g>

      <!-- Invariant Box -->
      <g transform="translate(50, 300)">
        <rect x="0" y="0" width="350" height="135" fill="#FAFAFA" stroke="#CCCCCC" stroke-width="1.5" rx="8"/>
        <text x="16" y="25" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="13">Loop Invariant Condition:</text>
        <text x="16" y="50" fill="#E52532" font-family="Courier, monospace" font-size="12">current_sum = arr[L] + ... + arr[R]</text>
        <text x="16" y="75" fill="#555555" font-family="Courier, monospace" font-size="12">if sum &gt;= target: min_len = min(min_len, R-L+1)</text>
        <text x="16" y="98" fill="#555555" font-family="Courier, monospace" font-size="12">then contract: sum -= arr[L++]</text>
        <text x="16" y="120" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="12">Overall Time: O(2N) = O(N)</text>
      </g>
    `;
  } else if (diagramType === "TREE") {
    diagramContent = `
      <!-- Binary Tree Nodes -->
      <g transform="translate(225, 200)">
        <!-- Root -->
        <circle cx="0" cy="0" r="22" fill="#FFFFFF" stroke="#E52532" stroke-width="2.5"/>
        <text x="0" y="6" text-anchor="middle" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="16">10</text>
        
        <!-- Edges -->
        <line x1="-15" y1="15" x2="-65" y2="60" stroke="#111111" stroke-width="2"/>
        <line x1="15" y1="15" x2="65" y2="60" stroke="#111111" stroke-width="2"/>

        <!-- Left Child -->
        <circle cx="-75" cy="75" r="20" fill="#FFFFFF" stroke="#111111" stroke-width="2"/>
        <text x="-75" y="80" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="15">5</text>

        <!-- Right Child -->
        <circle cx="75" cy="75" r="20" fill="#FFFFFF" stroke="#111111" stroke-width="2"/>
        <text x="75" y="80" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="15">15</text>

        <!-- Sub edges -->
        <line x1="-85" y1="90" x2="-115" y2="130" stroke="#111111" stroke-width="1.5"/>
        <line x1="-65" y1="90" x2="-35" y2="130" stroke="#111111" stroke-width="1.5"/>

        <circle cx="-125" cy="145" r="16" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
        <text x="-125" y="150" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="13">2</text>

        <circle cx="-25" cy="145" r="16" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
        <text x="-25" y="150" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="13">7</text>
      </g>

      <g transform="translate(50, 380)">
        <rect x="0" y="0" width="350" height="65" fill="#FFF5F5" stroke="#E52532" stroke-width="1" rx="8"/>
        <text x="16" y="24" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="13">LCA Rule in BST:</text>
        <text x="16" y="48" fill="#333333" font-family="Courier, monospace" font-size="12">If p &lt; curr and q &lt; curr: go LEFT. Else LCA = curr.</text>
      </g>
    `;
  } else {
    // DP Grid
    diagramContent = `
      <g transform="translate(60, 190)">
        <text x="0" y="-12" fill="#666666" font-family="Courier, monospace" font-size="12">2D DP Decision Table (Knapsack):</text>
        
        <!-- Table Header -->
        <rect x="0" y="0" width="50" height="30" fill="#EAEAEA" stroke="#CCCCCC"/>
        <text x="25" y="20" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="11">W=0</text>

        <rect x="50" y="0" width="50" height="30" fill="#EAEAEA" stroke="#CCCCCC"/>
        <text x="75" y="20" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="11">W=1</text>

        <rect x="100" y="0" width="50" height="30" fill="#EAEAEA" stroke="#CCCCCC"/>
        <text x="125" y="20" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="11">W=2</text>

        <rect x="150" y="0" width="50" height="30" fill="#EAEAEA" stroke="#CCCCCC"/>
        <text x="175" y="20" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="11">W=3</text>

        <rect x="200" y="0" width="50" height="30" fill="#EAEAEA" stroke="#CCCCCC"/>
        <text x="225" y="20" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="11">W=4</text>

        <!-- Row 1 -->
        <rect x="0" y="30" width="50" height="30" fill="#FFFFFF" stroke="#CCCCCC"/>
        <text x="25" y="50" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="12">0</text>
        <rect x="50" y="30" width="50" height="30" fill="#FFFFFF" stroke="#CCCCCC"/>
        <text x="75" y="50" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="12">1</text>
        <rect x="100" y="30" width="50" height="30" fill="#FFFFFF" stroke="#CCCCCC"/>
        <text x="125" y="50" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="12">1</text>
        <rect x="150" y="30" width="50" height="30" fill="#FFFFFF" stroke="#CCCCCC"/>
        <text x="175" y="50" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="12">1</text>
        <rect x="200" y="30" width="50" height="30" fill="#FFFFFF" stroke="#CCCCCC"/>
        <text x="225" y="50" text-anchor="middle" fill="#111111" font-family="Courier, monospace" font-size="12">1</text>

        <!-- Highlight Cell -->
        <rect x="100" y="60" width="50" height="30" fill="#FFF5F5" stroke="#E52532" stroke-width="2.5"/>
        <text x="125" y="80" text-anchor="middle" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="13">7 ★</text>
      </g>

      <g transform="translate(50, 310)">
        <rect x="0" y="0" width="350" height="135" fill="#FAFAFA" stroke="#CCCCCC" stroke-width="1.5" rx="8"/>
        <text x="16" y="25" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="13">State Transition Equation:</text>
        <text x="16" y="50" fill="#E52532" font-family="Courier, monospace" font-size="12">dp[i][w] = max(not_take, take)</text>
        <text x="16" y="75" fill="#555555" font-family="Courier, monospace" font-size="12">not_take = dp[i-1][w]</text>
        <text x="16" y="98" fill="#555555" font-family="Courier, monospace" font-size="12">take = val[i] + dp[i-1][w - wt[i]]</text>
        <text x="16" y="120" fill="#111111" font-family="Courier, monospace" font-weight="bold" font-size="12">Space Optimization: 1D array backwards</text>
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 560" width="100%" height="100%">
  <defs>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.12"/>
    </filter>
    <pattern id="dotPattern" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#E5E7EB"/>
    </pattern>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#E52532"/>
    </marker>
  </defs>

  <!-- Clean White Page Card -->
  <rect x="15" y="15" width="420" height="530" rx="16" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1.5" filter="url(#cardShadow)"/>
  
  <!-- Dot Grid Paper Background -->
  <rect x="25" y="25" width="400" height="510" rx="12" fill="url(#dotPattern)"/>

  <!-- Left Notebook Spiral Border -->
  <line x1="38" y1="25" x2="38" y2="535" stroke="#E52532" stroke-width="1.5" stroke-dasharray="4,6"/>

  <!-- Header Strip -->
  <g transform="translate(50, 45)">
    <rect x="0" y="0" width="80" height="22" rx="4" fill="#FFF1F2" stroke="#E52532" stroke-width="1"/>
    <text x="40" y="15" text-anchor="middle" fill="#E52532" font-family="Courier, monospace" font-weight="bold" font-size="10">${tag}</text>
    
    <text x="0" y="46" fill="#111111" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="18">${title}</text>
    <text x="0" y="66" fill="#666666" font-family="system-ui, -apple-system, sans-serif" font-size="12">${subtitle}</text>
  </g>

  <line x1="50" y1="130" x2="400" y2="130" stroke="#EEEEEE" stroke-width="1"/>

  <!-- Diagram Content -->
  ${diagramContent}

  <!-- Footer Watermark / Verified -->
  <g transform="translate(50, 510)">
    <text x="0" y="0" fill="#999999" font-family="Courier, monospace" font-size="10">BEENEXT HANDWRITTEN DSA ARCHIVE • VERIFIED</text>
  </g>
</svg>`;
}

function generatePrintedMockupSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 650" width="100%" height="100%">
  <defs>
    <filter id="mockupShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
    <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1A1A"/>
      <stop offset="50%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#080808"/>
    </linearGradient>
    <linearGradient id="spineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#333333"/>
      <stop offset="50%" stop-color="#E52532"/>
      <stop offset="100%" stop-color="#99151D"/>
    </linearGradient>
    <linearGradient id="pageEdge" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E5E5E5"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#D4D4D4"/>
    </linearGradient>
  </defs>

  <!-- Background Base Shadow -->
  <ellipse cx="300" cy="590" rx="220" ry="25" fill="#000000" opacity="0.6" filter="blur(8px)"/>

  <!-- Page Thickness Behind Book -->
  <path d="M 140 100 L 510 100 L 490 560 L 120 560 Z" fill="url(#pageEdge)" stroke="#CCCCCC" stroke-width="1"/>
  <line x1="490" y1="100" x2="490" y2="560" stroke="#BBBBBB" stroke-width="1.5"/>
  <line x1="500" y1="100" x2="500" y2="560" stroke="#DDDDDD" stroke-width="1"/>

  <!-- Book Main Cover -->
  <rect x="100" y="80" width="380" height="480" rx="16" fill="url(#coverGrad)" stroke="#333333" stroke-width="2" filter="url(#mockupShadow)"/>

  <!-- Book Spine Strip -->
  <rect x="100" y="80" width="42" height="480" rx="8" fill="url(#spineGrad)"/>
  
  <!-- Spiral Wire Rings -->
  ${Array.from({ length: 14 }).map((_, i) => {
    const y = 110 + i * 32;
    return `
      <rect x="92" y="${y}" width="22" height="8" rx="4" fill="#CCCCCC" stroke="#444444" stroke-width="1"/>
      <circle cx="92" cy="${y + 4}" r="3" fill="#111111"/>
      <circle cx="114" cy="${y + 4}" r="3" fill="#111111"/>
    `;
  }).join("")}

  <!-- Cover Content -->
  <g transform="translate(170, 140)">
    <!-- Brand Badge -->
    <rect x="0" y="0" width="120" height="26" rx="6" fill="#E52532"/>
    <text x="60" y="17" text-anchor="middle" fill="#FFFFFF" font-family="Courier, monospace" font-weight="bold" font-size="11">BEENEXT OFFICIAL</text>

    <!-- Main Title -->
    <text x="0" y="65" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24">STRIVER'S A2Z</text>
    <text x="0" y="95" fill="#E52532" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="22">DSA HANDWRITTEN</text>
    <text x="0" y="125" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20">BLUEPRINTS</text>

    <!-- Divider -->
    <line x1="0" y1="145" x2="270" y2="145" stroke="#333333" stroke-width="1.5"/>

    <!-- Spec Pills -->
    <g transform="translate(0, 165)">
      <circle cx="6" cy="6" r="3" fill="#E52532"/>
      <text x="18" y="10" fill="#CCCCCC" font-family="Courier, monospace" font-size="12">400+ Printed Heavyweight Pages</text>

      <circle cx="6" cy="32" r="3" fill="#E52532"/>
      <text x="18" y="36" fill="#CCCCCC" font-family="Courier, monospace" font-size="12">100 GSM Anti-Ink Bleed Paper</text>

      <circle cx="6" cy="58" r="3" fill="#E52532"/>
      <text x="18" y="62" fill="#CCCCCC" font-family="Courier, monospace" font-size="12">Matte Hard Lamination Cover</text>

      <circle cx="6" cy="84" r="3" fill="#E52532"/>
      <text x="18" y="88" fill="#CCCCCC" font-family="Courier, monospace" font-size="12">All 17 Sheet Topics Complete</text>
    </g>

    <!-- Bottom Stamp -->
    <g transform="translate(0, 310)">
      <rect x="0" y="0" width="170" height="42" rx="8" fill="#1C1C1C" stroke="#E52532" stroke-width="1.5"/>
      <text x="12" y="18" fill="#888888" font-family="Courier, monospace" font-size="10">PHYSICAL DELIVERED EDITION</text>
      <text x="12" y="34" fill="#FFFFFF" font-family="Courier, monospace" font-weight="bold" font-size="15">PRICE: ₹1,499</text>
    </g>
  </g>
</svg>`;
}

async function main() {
  console.log("Seeding homepage sample images and printed product config...");

  const notesDir = path.join(process.cwd(), "public", "notes");
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
  }

  // 1. Generate 4 sample SVGs for the gallery
  fs.writeFileSync(
    path.join(notesDir, "sample-slot-1.svg"),
    generateSampleSlotSVG("Sorting Techniques", "Merge Sort & Recurrence Tree", "MODULE 02", "#E52532", "SORTING")
  );
  fs.writeFileSync(
    path.join(notesDir, "sample-slot-2.svg"),
    generateSampleSlotSVG("Sliding Window & Pointers", "Shrinking Boundary & Invariants", "MODULE 10", "#E52532", "POINTER")
  );
  fs.writeFileSync(
    path.join(notesDir, "sample-slot-3.svg"),
    generateSampleSlotSVG("Binary Trees & BST", "LCA & Recursive Height Subtrees", "MODULE 13", "#E52532", "TREE")
  );
  fs.writeFileSync(
    path.join(notesDir, "sample-slot-4.svg"),
    generateSampleSlotSVG("Dynamic Programming", "2D Memo Grid & 1D Space Reduction", "MODULE 16", "#E52532", "DP")
  );

  // 2. Generate printed book mockup SVG
  fs.writeFileSync(
    path.join(notesDir, "printed-notebook-mockup.svg"),
    generatePrintedMockupSVG()
  );

  console.log("✓ Sample SVGs & Printed Book Mockup generated.");

  // 3. Upsert PrintedProductConfig
  await prisma.printedProductConfig.upsert({
    where: { id: "default" },
    update: {
      title: "Complete Printed DSA Notes – Striver's A to Z Sheet",
      description: "Get the complete collection of handwritten DSA notes in printed physical format, delivered to your doorstep.",
      price: 1499,
      originalPrice: 3999,
      deliveryCharge: 0,
      isFreeShipping: true,
      isActive: true,
    },
    create: {
      id: "default",
      title: "Complete Printed DSA Notes – Striver's A to Z Sheet",
      description: "Get the complete collection of handwritten DSA notes in printed physical format, delivered to your doorstep.",
      price: 1499,
      originalPrice: 3999,
      deliveryCharge: 0,
      isFreeShipping: true,
      isActive: true,
    },
  });
  console.log("✓ PrintedProductConfig seeded.");

  // 4. Upsert 4 HomepageSampleImage slots
  const slots = [
    {
      slotIndex: 1,
      title: "Sorting Techniques & Invariants",
      caption: "Merge Sort divide-and-conquer recursion tree & recurrence equations",
      imageUrl: "/notes/sample-slot-1.svg",
      order: 1,
    },
    {
      slotIndex: 2,
      title: "Sliding Window & Two Pointers",
      caption: "Dynamic window expansion, shrink conditions & loop invariants",
      imageUrl: "/notes/sample-slot-2.svg",
      order: 2,
    },
    {
      slotIndex: 3,
      title: "Binary Trees & BST Traversals",
      caption: "Lowest Common Ancestor, tree diameter & recursive subproblem states",
      imageUrl: "/notes/sample-slot-3.svg",
      order: 3,
    },
    {
      slotIndex: 4,
      title: "Dynamic Programming Decisions",
      caption: "2D state transition table, base cases & in-place memory optimization",
      imageUrl: "/notes/sample-slot-4.svg",
      order: 4,
    },
  ];

  for (const s of slots) {
    await prisma.homepageSampleImage.upsert({
      where: { slotIndex: s.slotIndex },
      update: {
        title: s.title,
        caption: s.caption,
        imageUrl: s.imageUrl,
        order: s.order,
      },
      create: {
        slotIndex: s.slotIndex,
        title: s.title,
        caption: s.caption,
        imageUrl: s.imageUrl,
        order: s.order,
      },
    });
  }

  console.log("✓ 4 Homepage Sample Image slots seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Seed homepage error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
