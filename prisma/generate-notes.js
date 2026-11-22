const fs = require("fs");
const path = require("path");

const notesDir = path.join(__dirname, "../public/notes");
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir, { recursive: true });
}

function createNoteSvg({ title, subtitle, topic, steps, complexities, extraNotes }) {
  const stepsXml = steps
    .map(
      (s, i) => `
    <g transform="translate(40, ${160 + i * 115})">
      <rect x="0" y="0" width="720" height="95" rx="8" fill="#181818" stroke="#2D2D2D" stroke-width="1.5" />
      <circle cx="28" cy="28" r="14" fill="#E52532" />
      <text x="28" y="33" fill="#FFFFFF" font-family="'Courier New', monospace" font-size="13" font-weight="bold" text-anchor="middle">${i + 1}</text>
      <text x="56" y="32" fill="#FFFFFF" font-family="'Segoe UI', -apple-system, sans-serif" font-size="15" font-weight="bold">${s.title}</text>
      <text x="56" y="56" fill="#C5C5C5" font-family="'Courier New', monospace" font-size="13">${s.code || ""}</text>
      <text x="56" y="78" fill="#999999" font-family="'Segoe UI', -apple-system, sans-serif" font-size="12">${s.note}</text>
      ${s.badge ? `<rect x="610" y="14" width="95" height="24" rx="4" fill="#2E1114" stroke="#E52532" stroke-width="1"/>
      <text x="657" y="30" fill="#E52532" font-family="monospace" font-size="11" text-anchor="middle" font-weight="bold">${s.badge}</text>` : ""}
    </g>`
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#222222" stroke-width="1"/>
    </pattern>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1E1E"/>
      <stop offset="100%" stop-color="#131313"/>
    </linearGradient>
  </defs>

  <!-- Dark Engineering Grid Canvas -->
  <rect width="800" height="1000" fill="#111111" />
  <rect width="800" height="1000" fill="url(#grid)" />

  <!-- Top Margin Red Accent Line -->
  <line x1="30" y1="0" x2="30" y2="1000" stroke="#E52532" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"/>

  <!-- Header Card -->
  <g transform="translate(40, 25)">
    <rect width="720" height="110" rx="10" fill="url(#headerGrad)" stroke="#333333" stroke-width="1.5"/>
    <rect x="0" y="0" width="6" height="110" rx="3" fill="#E52532" />
    <text x="25" y="36" fill="#E52532" font-family="'Courier New', monospace" font-size="13" font-weight="bold" letter-spacing="2">[BEENEXT HANDWRITTEN DSA NOTES]</text>
    <text x="25" y="70" fill="#FFFFFF" font-family="'Segoe UI', -apple-system, sans-serif" font-size="24" font-weight="800">${title}</text>
    <text x="25" y="94" fill="#A0A0A0" font-family="'Segoe UI', -apple-system, sans-serif" font-size="14">${subtitle} • Category: ${topic}</text>
  </g>

  <!-- Step By Step Trace Visuals -->
  ${stepsXml}

  <!-- Complexity Summary Box -->
  <g transform="translate(40, 770)">
    <rect width="720" height="95" rx="8" fill="#161616" stroke="#E52532" stroke-width="1.5"/>
    <text x="20" y="32" fill="#E52532" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="bold">⚡ COMPLEXITY &amp; INVARIANTS</text>
    <text x="20" y="60" fill="#FFFFFF" font-family="'Courier New', monospace" font-size="13">Time: Best=${complexities.best} | Avg=${complexities.avg} | Worst=${complexities.worst}</text>
    <text x="20" y="80" fill="#AAAAAA" font-family="'Courier New', monospace" font-size="13">Space: Aux Space=${complexities.space} | In-Place=${complexities.inPlace ? 'YES' : 'NO'} | Stable=${complexities.stable ? 'YES' : 'NO'}</text>
  </g>

  <!-- Handwritten Tips Footer -->
  <g transform="translate(40, 885)">
    <rect width="720" height="85" rx="8" fill="#1C1C1C" stroke="#2E2E2E" stroke-width="1"/>
    <text x="20" y="28" fill="#FFFFFF" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold">💡 KEY INTERVIEW MENTAL MODEL:</text>
    <text x="20" y="52" fill="#C0C0C0" font-family="'Courier New', monospace" font-size="12">${extraNotes[0]}</text>
    <text x="20" y="72" fill="#E52532" font-family="'Courier New', monospace" font-size="12">${extraNotes[1]}</text>
  </g>
</svg>`;
}

const additionalNotes = [
  {
    filename: "recursive-bubblesort.svg",
    title: "Recursive Bubble Sort — Call Stack Reduction",
    subtitle: "Bubbling Elements with Recursive Frame Bounds",
    topic: "Sorting Techniques",
    steps: [
      {
        title: "1. Base Case Formulation",
        code: "if (n == 1) return; // Array of 1 element is sorted",
        note: "Terminates recursion when effective array length reduces to 1.",
        badge: "BASE CASE"
      },
      {
        title: "2. Single Pass Adjacent Bubble",
        code: "for (int i = 0; i < n - 1; i++) if (arr[i] > arr[i+1]) swap(i, i+1);",
        note: "Moves maximum element of current prefix [0..n-1] to index n-1.",
        badge: "ONE PASS"
      },
      {
        title: "3. Recursive Step on Subarray (N - 1)",
        code: "recursiveBubbleSort(arr, n - 1);",
        note: "Largest element fixed; recurse on remaining n-1 elements.",
        badge: "RECURSE"
      },
      {
        title: "4. Stack Frame Invariant",
        code: "Call stack depth is exactly N frames.",
        note: "Simulates outer loop using recursion tree depth.",
        badge: "STACK DEPTH"
      },
      {
        title: "5. Early Exit Detection",
        code: "boolean swapped = false; if (!swapped) return;",
        note: "Optimizes best case to O(N) when array is already sorted.",
        badge: "OPTIMIZATION"
      }
    ],
    complexities: {
      best: "O(N)",
      avg: "O(N^2)",
      worst: "O(N^2)",
      space: "O(N) recursion stack",
      inPlace: true,
      stable: true
    },
    extraNotes: [
      "INTERVIEW TIP: Great question to test conversion of iterative loops into pure recursion.",
      "SPACE TRADE-OFF: Consumes O(N) auxiliary stack frames compared to O(1) iterative version."
    ]
  },
  {
    filename: "recursive-insertionsort.svg",
    title: "Recursive Insertion Sort — Inductive Placement",
    subtitle: "Mathematical Induction on Subarray [0..N-2]",
    topic: "Sorting Techniques",
    steps: [
      {
        title: "1. Base Case: Single Element Subarray",
        code: "if (n <= 1) return;",
        note: "An array of size 0 or 1 is intrinsically sorted.",
        badge: "BASE CASE"
      },
      {
        title: "2. Hypothesis Step: Sort First N - 1 Elements",
        code: "recursiveInsertionSort(arr, n - 1);",
        note: "Assume by induction that prefix arr[0..n-2] is already sorted.",
        badge: "INDUCTION"
      },
      {
        title: "3. Extraction of Last Key Element",
        code: "int last = arr[n - 1]; int j = n - 2;",
        note: "Extract the last card to be inserted into the sorted prefix.",
        badge: "KEY EXTRACT"
      },
      {
        title: "4. Shift Elements Greater Than Key",
        code: "while (j >= 0 && arr[j] > last) { arr[j + 1] = arr[j]; j--; }",
        note: "Shift rightward to create space for the inductive key.",
        badge: "SHIFT"
      },
      {
        title: "5. Final Inductive Insertion",
        code: "arr[j + 1] = last;",
        note: "The entire prefix arr[0..n-1] is now completely sorted.",
        badge: "INSERT"
      }
    ],
    complexities: {
      best: "O(N) [Sorted array]",
      avg: "O(N^2)",
      worst: "O(N^2) [Reverse sorted]",
      space: "O(N) auxiliary call stack",
      inPlace: true,
      stable: true
    },
    extraNotes: [
      "MATHEMATICAL ELEGANCE: Directly mirrors mathematical induction proof steps.",
      "PRACTICAL NOTE: For production, iterative insertion is favored to avoid stack overflow."
    ]
  },
  {
    filename: "count-inversions.svg",
    title: "Count Inversions — Enhanced Merge Sort Step",
    subtitle: "Measuring How Close an Array Is to Being Sorted",
    topic: "Sorting Techniques",
    steps: [
      {
        title: "1. Definition of Inversion Pair",
        code: "i < j AND arr[i] > arr[j]",
        note: "Number of inversions represents minimum adjacent swaps required to sort.",
        badge: "DEFINITION"
      },
      {
        title: "2. Divide Array at Midpoint",
        code: "invCount += mergeSortCount(arr, low, mid); invCount += mergeSortCount(arr, mid + 1, high);",
        note: "Count inversions in left half and right half independently.",
        badge: "DIVIDE"
      },
      {
        title: "3. Cross-Boundary Inversions During Merge",
        code: "if (arr[left] > arr[right]) invCount += (mid - left + 1);",
        note: "Since left half is sorted, if arr[left] > arr[right], all elements from left to mid exceed arr[right]!",
        badge: "KEY INSIGHT"
      },
      {
        title: "4. Standard Two-Pointer Merge",
        code: "temp[k++] = arr[left] <= arr[right] ? arr[left++] : arr[right++];",
        note: "Merge sorted halves in linear O(N) time.",
        badge: "MERGE"
      },
      {
        title: "5. Return Total Combined Count",
        code: "return leftInversions + rightInversions + splitInversions;",
        note: "Achieves O(N log N) total time vs naive O(N^2) double loop.",
        badge: "OPTIMAL"
      }
    ],
    complexities: {
      best: "O(N log N)",
      avg: "O(N log N)",
      worst: "O(N log N) [Reverse sorted]",
      space: "O(N) temporary buffer + O(log N) stack",
      inPlace: false,
      stable: true
    },
    extraNotes: [
      "CLASSIC PROBLEM: LeetCode hard and Google/Amazon frequent interview favorite.",
      "KEY ADVANTAGE: (mid - left + 1) calculates up to N inversions in a single O(1) step!"
    ]
  },
  {
    filename: "binary-search.svg",
    title: "Binary Search — Invariant & Boundary Proofs",
    subtitle: "Search Space Reduction from O(N) to O(log N)",
    topic: "Binary Search",
    steps: [
      {
        title: "1. Monotonic Predicate Invariant",
        code: "low = 0, high = n - 1; // Range where target might exist",
        note: "Requires input to be monotonic (sorted or binary partitioned).",
        badge: "PREDICATE"
      },
      {
        title: "2. Safe Midpoint Calculation",
        code: "int mid = low + (high - low) / 2;",
        note: "Guarantees no 32-bit integer overflow when low + high > 2^31 - 1.",
        badge: "OVERFLOW SAFE"
      },
      {
        title: "3. Direct Match Check",
        code: "if (nums[mid] == target) return mid;",
        note: "Found target index in current search window.",
        badge: "O(1) MATCH"
      },
      {
        title: "4. Discard Half of Search Space",
        code: "if (nums[mid] < target) low = mid + 1; else high = mid - 1;",
        note: "Halves the candidates every single iteration.",
        badge: "HALVING"
      },
      {
        title: "5. Termination Condition",
        code: "while (low <= high)",
        note: "Loop terminates when search window becomes empty (low > high).",
        badge: "CONVERGENCE"
      }
    ],
    complexities: {
      best: "O(1)",
      avg: "O(log N)",
      worst: "O(log N)",
      space: "O(1) iterative",
      inPlace: true,
      stable: true
    },
    extraNotes: [
      "EXPANSION: Lower Bound (first index >= x) and Upper Bound (first index > x).",
      "BINARY SEARCH ON ANSWER: Used in Book Allocation, Koko Eating Bananas, Aggressive Cows."
    ]
  }
];

additionalNotes.forEach((n) => {
  const svg = createNoteSvg(n);
  fs.writeFileSync(path.join(notesDir, n.filename), svg, "utf8");
  console.log(`Generated note SVG: ${n.filename}`);
});

// Generate Notebook Mockup Graphics for Homepage & Catalog
function createNotebookMockupSvg({ title, pageTitle, bullets, tag }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="100%" height="100%">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
    <pattern id="smallGrid" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#222222" stroke-width="0.8"/>
    </pattern>
    <linearGradient id="binding" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1A1A1A"/>
      <stop offset="50%" stop-color="#333333"/>
      <stop offset="100%" stop-color="#1A1A1A"/>
    </linearGradient>
  </defs>

  <!-- Background Shadow & Outer Book Cover -->
  <rect x="25" y="20" width="550" height="710" rx="16" fill="#141414" stroke="#2E2E2E" stroke-width="2" filter="url(#shadow)"/>

  <!-- Left Spiral Binding Rings -->
  <rect x="25" y="20" width="36" height="710" rx="8" fill="url(#binding)"/>
  ${Array.from({ length: 22 })
    .map(
      (_, i) => `
    <rect x="36" y="${40 + i * 31}" width="16" height="6" rx="3" fill="#666666" stroke="#222222"/>
    <circle cx="36" cy="${43 + i * 31}" r="3" fill="#111111"/>
    <circle cx="52" cy="${43 + i * 31}" r="3" fill="#111111"/>
  `
    )
    .join("")}

  <!-- Inner Notebook Page -->
  <rect x="68" y="32" width="495" height="686" rx="8" fill="#161616"/>
  <rect x="68" y="32" width="495" height="686" rx="8" fill="url(#smallGrid)"/>

  <!-- Red Margin Rule Line -->
  <line x1="110" y1="32" x2="110" y2="718" stroke="#E52532" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.8"/>

  <!-- Header Section -->
  <g transform="translate(125, 55)">
    <rect x="0" y="0" width="418" height="34" rx="6" fill="#1F1F1F" stroke="#333333"/>
    <circle cx="16" cy="17" r="6" fill="#E52532"/>
    <text x="32" y="22" fill="#E52532" font-family="'Courier New', monospace" font-size="12" font-weight="bold">${tag}</text>
    <text x="402" y="22" fill="#999999" font-family="'Courier New', monospace" font-size="11" text-anchor="end">PAGE 01</text>
  </g>

  <!-- Page Title Handwritten -->
  <text x="125" y="130" fill="#FFFFFF" font-family="'Segoe UI', -apple-system, sans-serif" font-size="22" font-weight="800">${title}</text>
  <text x="125" y="155" fill="#E52532" font-family="'Courier New', monospace" font-size="13" font-weight="bold">${pageTitle}</text>
  <line x1="125" y1="168" x2="540" y2="168" stroke="#2E2E2E" stroke-width="1"/>

  <!-- Visual Diagram Box -->
  <g transform="translate(125, 185)">
    <rect width="415" height="230" rx="10" fill="#0E0E0E" stroke="#2D2D2D"/>
    <!-- Simulated Tree / Array Graph -->
    <rect x="20" y="20" width="85" height="30" rx="4" fill="#202020" stroke="#E52532" stroke-width="1.5"/>
    <text x="62" y="40" fill="#FFFFFF" font-family="monospace" font-size="12" text-anchor="middle" font-weight="bold">[Root: P]</text>

    <!-- Branch Arrows -->
    <path d="M 62 50 L 62 75 L 35 105" fill="none" stroke="#E52532" stroke-width="1.5"/>
    <path d="M 62 75 L 145 105" fill="none" stroke="#E52532" stroke-width="1.5"/>

    <rect x="10" y="105" width="80" height="30" rx="4" fill="#1C1C1C" stroke="#444444"/>
    <text x="50" y="125" fill="#AAAAAA" font-family="monospace" font-size="11" text-anchor="middle">Left &lt; P</text>

    <rect x="110" y="105" width="80" height="30" rx="4" fill="#1C1C1C" stroke="#444444"/>
    <text x="150" y="125" fill="#AAAAAA" font-family="monospace" font-size="11" text-anchor="middle">Right &gt;= P</text>

    <!-- Handwritten Invariant Box -->
    <rect x="210" y="20" width="185" height="190" rx="8" fill="#181818" stroke="#E52532" stroke-dasharray="3,3"/>
    <text x="225" y="48" fill="#E52532" font-family="'Courier New', monospace" font-size="12" font-weight="bold">// INVARIANT TRACE</text>
    <text x="225" y="75" fill="#FFFFFF" font-family="'Courier New', monospace" font-size="11">low .. i   &lt;= pivot</text>
    <text x="225" y="100" fill="#AAAAAA" font-family="'Courier New', monospace" font-size="11">i+1 .. j-1  &gt; pivot</text>
    <text x="225" y="125" fill="#E52532" font-family="'Courier New', monospace" font-size="11">j .. high-1  unexplored</text>
    <text x="225" y="155" fill="#FFFFFF" font-family="'Courier New', monospace" font-size="11">arr[high]  = pivot</text>
    <rect x="225" y="172" width="155" height="24" rx="4" fill="#2E1114" stroke="#E52532" stroke-width="0.8"/>
    <text x="302" y="188" fill="#E52532" font-family="monospace" font-size="10" text-anchor="middle" font-weight="bold">O(N log N) GUARANTEE</text>
  </g>

  <!-- Key Handwritten Takeaways -->
  <g transform="translate(125, 435)">
    <text x="0" y="20" fill="#FFFFFF" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="bold">Key Algorithmic Takeaways:</text>
    ${bullets
      .map(
        (b, i) => `
      <g transform="translate(0, ${40 + i * 48})">
        <circle cx="8" cy="10" r="4" fill="#E52532"/>
        <text x="22" y="14" fill="#E0E0E0" font-family="'Courier New', monospace" font-size="12">${b}</text>
      </g>
    `
      )
      .join("")}
  </g>

  <!-- Stamp at Bottom Right -->
  <g transform="translate(420, 640)">
    <rect width="125" height="42" rx="6" fill="#1C1C1C" stroke="#E52532" stroke-width="1"/>
    <text x="62" y="20" fill="#E52532" font-family="'Courier New', monospace" font-size="10" text-anchor="middle" font-weight="bold">VERIFIED PROOF</text>
    <text x="62" y="34" fill="#FFFFFF" font-family="'Courier New', monospace" font-size="9" text-anchor="middle">BEENEXT NOTES</text>
  </g>
</svg>`;
}

const notebookMockups = [
  {
    filename: "notebook-preview-1.svg",
    title: "Sorting Techniques — QuickSort Breakdown",
    pageTitle: "Lomuto Partition & Recursion Tree Mental Model",
    tag: "MODULE 02 • FREE NOTEBOOK",
    bullets: [
      "Two-pointer boundary invariant: [low..i] strictly <= pivot.",
      "Partitioning in-place in linear O(N) time without extra RAM.",
      "Randomized pivot defense against worst-case O(N^2) killer sets.",
      "Tail recursion stack optimized to O(log N) depth."
    ]
  },
  {
    filename: "notebook-preview-2.svg",
    title: "Dynamic Programming — 0/1 Knapsack",
    pageTitle: "Optimal Substructure & 1D Space Reduction",
    tag: "MODULE 16 • PREMIUM NOTEBOOK",
    bullets: [
      "State transition: dp[i][w] = max(exclude, include + dp[i-1][w-wt]).",
      "Overlapping subproblems mapped to 2D matrix cells.",
      "1D array space compression traversing capacity backwards.",
      "Time complexity O(N*W) pseudo-polynomial proof."
    ]
  },
  {
    filename: "notebook-preview-3.svg",
    title: "Binary Trees & BST — LCA & Traversals",
    pageTitle: "Lowest Common Ancestor & Tree Diameter Proof",
    tag: "MODULE 13 • PREMIUM NOTEBOOK",
    bullets: [
      "Postorder traversal enables bottom-up state propagation.",
      "LCA invariant: split node where p and q diverge in left/right.",
      "Diameter calculated simultaneously with height in single O(N) pass.",
      "Binary Search Tree validator using (-inf, +inf) range boundaries."
    ]
  }
];

notebookMockups.forEach((m) => {
  const svg = createNotebookMockupSvg(m);
  fs.writeFileSync(path.join(notesDir, m.filename), svg, "utf8");
  console.log(`Generated Notebook Mockup SVG: ${m.filename}`);
});
