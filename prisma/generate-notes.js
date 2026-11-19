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

const noteFiles = [
  {
    filename: "quicksort-p1.svg",
    title: "Quick Sort [Page 1/2] — Lomuto Partition Visualizer",
    subtitle: "Divide & Conquer Pivot Strategy",
    topic: "Sorting",
    steps: [
      {
        title: "1. Pivot Selection & Pointers Setup",
        code: "pivot = arr[high]; i = low - 1;",
        note: "Pointer 'i' tracks the boundary of elements strictly smaller than pivot.",
        badge: "STEP 1"
      },
      {
        title: "2. Scanning Array with Pointer 'j'",
        code: "for (j = low; j < high; j++) if (arr[j] <= pivot) swap(++i, j)",
        note: "Elements <= pivot are moved into the left partition window.",
        badge: "PARTITION"
      },
      {
        title: "3. Place Pivot in Final Ordered Slot",
        code: "swap(arr[i + 1], arr[high]); return i + 1;",
        note: "Pivot is now at its true global sorted position!",
        badge: "CONQUER"
      },
      {
        title: "4. Recurse on Left & Right Sub-arrays",
        code: "quickSort(arr, low, pi - 1); quickSort(arr, pi + 1, high);",
        note: "Sub-problems are independent; no extra merge step required.",
        badge: "DIVIDE"
      },
      {
        title: "5. Base Condition Guard",
        code: "if (low >= high) return;",
        note: "Single element or invalid bounds terminate recursion instantly.",
        badge: "BASE CASE"
      }
    ],
    complexities: {
      best: "O(N log N)",
      avg: "O(N log N)",
      worst: "O(N^2) [Sorted array with last element pivot]",
      space: "O(log N) [Call stack]",
      inPlace: true,
      stable: false
    },
    extraNotes: [
      "TIP: Always randomize pivot choice in production to avoid O(N^2) killer sequences.",
      "KEY ADVANTAGE: Cache-friendly locality of reference outperforms Merge Sort in RAM."
    ]
  },
  {
    filename: "quicksort-p2.svg",
    title: "Quick Sort [Page 2/2] — Hoare vs Lomuto & Call Stack",
    subtitle: "Recursion Depth & Space Invariants",
    topic: "Sorting",
    steps: [
      {
        title: "1. Recursion Tree Depth Invariant",
        code: "Balanced Partition: Depth = log2(N) | Unbalanced: Depth = N",
        note: "Each recursion level processes O(N) operations across all sub-arrays.",
        badge: "TREE DEPTH"
      },
      {
        title: "2. Hoare Partition Alternative",
        code: "Two pointers converge from low and high towards the center",
        note: "Hoare does 3x fewer swaps on average than Lomuto partition.",
        badge: "HOARE"
      },
      {
        title: "3. Tail Call Optimization",
        code: "Recurse on smaller half first; loop on larger half",
        note: "Guarantees maximum O(log N) stack frames even in worst case!",
        badge: "TAIL CALL"
      },
      {
        title: "4. 3-Way Partitioning (Dutch National Flag)",
        code: "arr[i] < pivot, arr[i] == pivot, arr[i] > pivot",
        note: "Handles arrays with massive duplicate counts in linear O(N) time.",
        badge: "DUPLICATES"
      },
      {
        title: "5. Production Dual-Pivot (Java Arrays.sort)",
        code: "Uses 2 pivots (P1, P2) dividing array into 3 partitions",
        note: "Dual-pivot Quicksort by Yaroslavskiy improves cache behavior significantly.",
        badge: "DUAL PIVOT"
      }
    ],
    complexities: {
      best: "O(N log N)",
      avg: "O(N log N)",
      worst: "O(N log N) [With randomized pivot]",
      space: "O(log N) auxiliary call stack",
      inPlace: true,
      stable: false
    },
    extraNotes: [
      "PRO-TIP: Switch to Insertion Sort when sub-array size falls below 16-27 elements.",
      "QUESTION: Is Quicksort stable? No, swaps jump elements across long distances."
    ]
  },
  {
    filename: "mergesort-p1.svg",
    title: "Merge Sort [Page 1/2] — Divide & Conquer Tree",
    subtitle: "Guaranteed O(N log N) Stable Sort",
    topic: "Sorting",
    steps: [
      {
        title: "1. Mid-Point Calculation",
        code: "int mid = low + (high - low) / 2;",
        note: "Avoid integer overflow: never write (low + high) / 2 directly.",
        badge: "BISECTION"
      },
      {
        title: "2. Recurse to Atomic Base Leaves",
        code: "mergeSort(arr, low, mid); mergeSort(arr, mid + 1, high);",
        note: "Halves input array recursively until arrays have length 1.",
        badge: "DIVIDE"
      },
      {
        title: "3. Merge Subroutine: Two Pointers",
        code: "while (p1 <= mid && p2 <= high) arr[k++] = left[p1] <= right[p2] ? ...",
        note: "Compare elements from both halves and pick the smaller in order.",
        badge: "MERGE"
      },
      {
        title: "4. Drain Residual Elements",
        code: "while (p1 <= mid) temp[k++] = arr[p1++]; while (p2 <= high) ...",
        note: "Copy remaining elements from left or right half without comparisons.",
        badge: "DRAIN"
      },
      {
        title: "5. Write Back to Original Array",
        code: "System.arraycopy(temp, 0, arr, low, length);",
        note: "Copies sorted merged slice back into the master array segment.",
        badge: "WRITEBACK"
      }
    ],
    complexities: {
      best: "O(N log N)",
      avg: "O(N log N)",
      worst: "O(N log N) [Guaranteed]",
      space: "O(N) [Temporary buffer]",
      inPlace: false,
      stable: true
    },
    extraNotes: [
      "WHY STABLE? 'left[p1] <= right[p2]' ensures earlier duplicates keep original order.",
      "APPLICATION: Ideal for sorting Linked Lists because no contiguous buffer needed!"
    ]
  },
  {
    filename: "mergesort-p2.svg",
    title: "Merge Sort [Page 2/2] — Inversion Count & Linked Lists",
    subtitle: "Advanced Applications of Merge Step",
    topic: "Sorting",
    steps: [
      {
        title: "1. Counting Inversions Technique",
        code: "if (arr[p1] > arr[p2]) inversions += (mid - p1 + 1);",
        note: "Whenever right half element is smaller, it is smaller than all remaining left elements!",
        badge: "INVERSIONS"
      },
      {
        title: "2. Fast & Slow Pointers for Linked Lists",
        code: "ListNode slow = head, fast = head.next; while(fast != null && fast.next != null)",
        note: "Finds the exact middle of a singly linked list in O(N/2) single pass.",
        badge: "LINKED LIST"
      },
      {
        title: "3. O(1) Space Linked List Merge",
        code: "Rewire .next pointers directly without allocating new nodes",
        note: "Solves LeetCode 148: Sort List in O(N log N) time and O(1) memory!",
        badge: "O(1) SPACE"
      },
      {
        title: "4. Bottom-Up Iterative Merge Sort",
        code: "for (int sz = 1; sz < n; sz *= 2) for (int lo = 0; lo < n - sz; lo += 2 * sz)",
        note: "Eliminates recursion call stack completely; ideal for external sorting.",
        badge: "ITERATIVE"
      },
      {
        title: "5. Timsort Hybrid (Python & Java standard)",
        code: "Identifies natural sorted runs, merges with minimal comparisons",
        note: "Achieves O(N) best case on real-world partially sorted arrays.",
        badge: "TIMSORT"
      }
    ],
    complexities: {
      best: "O(N log N) [O(N) with Timsort]",
      avg: "O(N log N)",
      worst: "O(N log N)",
      space: "O(N) arrays / O(1) linked lists",
      inPlace: false,
      stable: true
    },
    extraNotes: [
      "CRITICAL: LeetCode 315 'Count of Smaller Numbers After Self' uses this exact merge tree.",
      "MEMORY NOTE: Java uses Timsort for Objects (stable) and Dual-Pivot Quicksort for primitives."
    ]
  },
  {
    filename: "bubblesort.svg",
    title: "Bubble Sort — Adjacent Comparison & Optimization",
    subtitle: "Bubbling Max Elements to the Right",
    topic: "Sorting",
    steps: [
      {
        title: "1. Outer Pass Loop (0 to N-1)",
        code: "for (int i = 0; i < n - 1; i++) { boolean swapped = false; ... }",
        note: "After pass 'i', the largest 'i' elements are locked in their final positions.",
        badge: "OUTER PASS"
      },
      {
        title: "2. Inner Adjacent Pairs Comparison",
        code: "for (int j = 0; j < n - i - 1; j++) if (arr[j] > arr[j + 1]) swap(j, j+1)",
        note: "Compare side-by-side neighbors and bubble the heavier element forward.",
        badge: "COMPARE"
      },
      {
        title: "3. Swap Detection & Early Exit",
        code: "if (!swapped) break;",
        note: "Optimization: If no swaps occurred in a pass, array is already sorted! O(N) best case.",
        badge: "EARLY EXIT"
      },
      {
        title: "4. Redundant Comparison Reduction",
        code: "Limit inner loop to n - i - 1 instead of n - 1",
        note: "Never re-check the sorted right suffix.",
        badge: "EFFICIENCY"
      },
      {
        title: "5. Stability Check",
        code: "if (arr[j] > arr[j + 1]) vs arr[j] >= arr[j + 1]",
        note: "Strict inequality '>' preserves relative ordering of equal values.",
        badge: "STABILITY"
      }
    ],
    complexities: {
      best: "O(N) [With swapped flag optimization]",
      avg: "O(N^2)",
      worst: "O(N^2) [Reverse sorted]",
      space: "O(1) [Auxiliary space]",
      inPlace: true,
      stable: true
    },
    extraNotes: [
      "REAL-WORLD USE: Primarily educational; occasionally used when data is nearly sorted.",
      "WATCH OUT: Without the 'swapped' flag, best case degrades unnecessarily to O(N^2)."
    ]
  },
  {
    filename: "selectionsort.svg",
    title: "Selection Sort — Minimum Selection Invariant",
    subtitle: "Minimizing Total Array Swaps (At Most N Swaps)",
    topic: "Sorting",
    steps: [
      {
        title: "1. Define Sorted vs Unsorted Boundary",
        code: "for (int i = 0; i < n - 1; i++) int minIdx = i;",
        note: "Left segment [0..i-1] is strictly sorted; right segment [i..n-1] is unsorted.",
        badge: "INVARIANT"
      },
      {
        title: "2. Scan Right Segment for Minimum",
        code: "for (int j = i + 1; j < n; j++) if (arr[j] < arr[minIdx]) minIdx = j;",
        note: "Finds index of the absolute minimum element in the remaining subarray.",
        badge: "FIND MIN"
      },
      {
        title: "3. Swap Minimum into Slot 'i'",
        code: "if (minIdx != i) swap(arr, i, minIdx);",
        note: "Requires AT MOST 1 swap per outer iteration! Exactly O(N) total swaps.",
        badge: "SINGLE SWAP"
      },
      {
        title: "4. Total Comparison Count",
        code: "(N-1) + (N-2) + ... + 1 = N * (N - 1) / 2 comparisons",
        note: "Always executes O(N^2) comparisons regardless of input distribution.",
        badge: "COMPARE COUNT"
      },
      {
        title: "5. Instability Demonstration",
        code: "Input [4a, 4b, 2] -> 2 swaps with 4a -> [2, 4b, 4a]",
        note: "Long-range swap causes 4a to jump past 4b, breaking stability.",
        badge: "NOT STABLE"
      }
    ],
    complexities: {
      best: "O(N^2)",
      avg: "O(N^2)",
      worst: "O(N^2)",
      space: "O(1) auxiliary",
      inPlace: true,
      stable: false
    },
    extraNotes: [
      "NICHE ADVANTAGE: Useful when memory write operations are heavily expensive (e.g., EEPROM flash).",
      "COMPARISON: Bubble sort may perform O(N^2) swaps; Selection sort performs at most N swaps."
    ]
  },
  {
    filename: "insertionsort.svg",
    title: "Insertion Sort — Playing Card Mental Model",
    subtitle: "Adaptive Linear Time for Nearly Sorted Data",
    topic: "Sorting",
    steps: [
      {
        title: "1. Assume First Element is Sorted Hand",
        code: "for (int i = 1; i < n; i++) int key = arr[i]; int j = i - 1;",
        note: "Extract the next card 'key' to be inserted into the sorted hand on the left.",
        badge: "KEY EXTRACTION"
      },
      {
        title: "2. Shift Greater Elements Rightwards",
        code: "while (j >= 0 && arr[j] > key) { arr[j + 1] = arr[j]; j--; }",
        note: "Shift cards right one-by-one to create an empty vacancy slot.",
        badge: "SHIFT"
      },
      {
        title: "3. Insert Key into Created Slot",
        code: "arr[j + 1] = key;",
        note: "Drop the key into its precise sorted position.",
        badge: "INSERT"
      },
      {
        title: "4. Adaptive Early Termination",
        code: "If arr[j] <= key, inner loop immediately halts on first comparison!",
        note: "If array is already sorted, runs in blazing O(N) total time.",
        badge: "ADAPTIVE"
      },
      {
        title: "5. Online Algorithm Feature",
        code: "Can sort streaming data in real-time as numbers arrive",
        note: "No need to know total size N in advance.",
        badge: "ONLINE"
      }
    ],
    complexities: {
      best: "O(N) [Already sorted]",
      avg: "O(N^2)",
      worst: "O(N^2) [Reverse sorted]",
      space: "O(1) auxiliary",
      inPlace: true,
      stable: true
    },
    extraNotes: [
      "WHY SO POPULAR IN MODERN LIBS? Fast cache performance makes it the sub-sorter for small arrays (N <= 20).",
      "BINARY INSERTION SORT: Binary search can find insertion slot in O(log N), but shifting still takes O(N)."
    ]
  },
  {
    filename: "heapsort.svg",
    title: "Heap Sort — Complete Binary Heap & Heapify",
    subtitle: "Guaranteed O(N log N) In-Place Sorting",
    topic: "Sorting",
    steps: [
      {
        title: "1. Array as Implicit Binary Tree",
        code: "Left Child = 2*i + 1 | Right Child = 2*i + 2 | Parent = (i - 1) / 2",
        note: "No pointers needed! Stored sequentially in contiguous memory.",
        badge: "HEAP INDEX"
      },
      {
        title: "2. Build Max-Heap Bottom-Up in O(N)",
        code: "for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);",
        note: "Starts at last non-leaf parent node. Total work sums to O(N), not O(N log N)!",
        badge: "BUILD HEAP"
      },
      {
        title: "3. Extract Maximum to Array End",
        code: "swap(arr[0], arr[i]); heapify(arr, i, 0);",
        note: "Top of heap is largest element. Swap with last slot, shrink heap boundary.",
        badge: "EXTRACT"
      },
      {
        title: "4. Sift-Down / Heapify Subroutine",
        code: "Find largest among root, left, right; swap and recurse down",
        note: "Restores max-heap invariant down through at most log(N) levels.",
        badge: "HEAPIFY"
      },
      {
        title: "5. Comparison with Quicksort",
        code: "Heapsort guarantees O(N log N) worst-case without extra O(N) memory",
        note: "However, jumpy memory access patterns yield slightly higher constant factors.",
        badge: "ANALYSIS"
      }
    ],
    complexities: {
      best: "O(N log N)",
      avg: "O(N log N)",
      worst: "O(N log N) [Guaranteed]",
      space: "O(1) [Zero extra memory]",
      inPlace: true,
      stable: false
    },
    extraNotes: [
      "INTRO-SORT: C++ std::sort starts with Quicksort and switches to Heapsort if recursion exceeds 2*log(N).",
      "LEETCODE 215: Kth Largest Element can be solved in O(N) using Max-Heap build."
    ]
  },
  {
    filename: "countingsort.svg",
    title: "Counting Sort — Non-Comparison Integer Sort",
    subtitle: "Breaking the O(N log N) Comparison Barrier to O(N + K)",
    topic: "Sorting",
    steps: [
      {
        title: "1. Determine Range (Min & Max)",
        code: "int k = max - min + 1; int[] count = new int[k];",
        note: "Count array size 'k' is proportional to the range of input values.",
        badge: "RANGE"
      },
      {
        title: "2. Frequency Count Histogram",
        code: "for (int num : arr) count[num - min]++;",
        note: "Tally how many times each number appears in the input.",
        badge: "TALLY"
      },
      {
        title: "3. Prefix Sum Accumulation",
        code: "for (int i = 1; i < k; i++) count[i] += count[i - 1];",
        note: "count[i] now stores the exact final ending index of value 'i'!",
        badge: "PREFIX SUM"
      },
      {
        title: "4. Stable Output Placement (Traverse Backwards)",
        code: "for (int i = n - 1; i >= 0; i--) output[--count[arr[i] - min]] = arr[i];",
        note: "Traversing right-to-left guarantees stability for duplicate values.",
        badge: "STABLE PLACEMENT"
      },
      {
        title: "5. Write Back to Original",
        code: "System.arraycopy(output, 0, arr, 0, n);",
        note: "Done in linear time O(N + K).",
        badge: "FINISH"
      }
    ],
    complexities: {
      best: "O(N + K)",
      avg: "O(N + K)",
      worst: "O(N + K) [K = range of elements]",
      space: "O(N + K) [Requires auxiliary count and output]",
      inPlace: false,
      stable: true
    },
    extraNotes: [
      "WHEN TO USE: Extremely fast when K <= N (e.g., sorting ages, exam scores, character frequencies).",
      "BUILDING BLOCK: Counting Sort is the stable inner subroutine that powers Radix Sort."
    ]
  },
  {
    filename: "radixsort.svg",
    title: "Radix Sort — Digit-by-Digit Linear Sort",
    subtitle: "LSD (Least Significant Digit) Multi-Pass Sorting",
    topic: "Sorting",
    steps: [
      {
        title: "1. Find Maximum Element",
        code: "int max = getMax(arr); // Number of digits D = log10(max) + 1",
        note: "The maximum number determines how many digit passes 'D' are needed.",
        badge: "DIGIT PASSES"
      },
      {
        title: "2. Loop Over Digit Place Values",
        code: "for (int exp = 1; max / exp > 0; exp *= 10) countSortByDigit(arr, exp);",
        note: "Pass 1: Units (1s) -> Pass 2: Tens (10s) -> Pass 3: Hundreds (100s)...",
        badge: "LSD LOOP"
      },
      {
        title: "3. Extract Current Digit",
        code: "int digit = (arr[i] / exp) % 10; // Range 0 to 9",
        note: "K is fixed at 10 for decimal numbers; count array is always size 10.",
        badge: "DIGIT EXTRACTION"
      },
      {
        title: "4. Stable Counting Sort on Digit",
        code: "Must be STABLE so earlier digit order is preserved!",
        note: "If digit is equal, previous lower digits maintain their relative order.",
        badge: "STABILITY CRUCIAL"
      },
      {
        title: "5. Final Sorted Array",
        code: "After D passes, the entire array is fully sorted in O(D * (N + K)) time.",
        note: "For 32-bit integers with base 256 (byte), D=4 passes total!",
        badge: "COMPLETION"
      }
    ],
    complexities: {
      best: "O(D * (N + K))",
      avg: "O(D * (N + K))",
      worst: "O(D * (N + K)) [D = number of digits, K = base (10)]",
      space: "O(N + K)",
      inPlace: false,
      stable: true
    },
    extraNotes: [
      "MSD vs LSD: LSD is simpler and iterative; MSD (Most Significant Digit) works top-down recursively.",
      "KEY ADVANTAGE: Outperforms comparison sorts for huge datasets of fixed-length integers or strings."
    ]
  },
  {
    filename: "twosum.svg",
    title: "Two Sum — One-Pass Hash Map Technique",
    subtitle: "Transforming O(N^2) to O(N) Time",
    topic: "Arrays",
    steps: [
      {
        title: "1. Hash Map Initialization",
        code: "Map<Integer, Integer> map = new HashMap<>(); // Value -> Index",
        note: "Store visited numbers as keys and their array indices as values.",
        badge: "DATA STRUCTURE"
      },
      {
        title: "2. Iterate Once and Calculate Complement",
        code: "int complement = target - nums[i];",
        note: "Instead of searching for partner later, compute exactly what number is needed.",
        badge: "LOOKUP"
      },
      {
        title: "3. Check Complement in Map",
        code: "if (map.containsKey(complement)) return new int[] { map.get(complement), i };",
        note: "Hash Map lookup takes O(1) average time, resolving pair immediately.",
        badge: "O(1) MATCH"
      },
      {
        title: "4. Store Current Element & Move Forward",
        code: "map.put(nums[i], i);",
        note: "If complement not yet found, register current element for future numbers.",
        badge: "INSERT"
      },
      {
        title: "5. Edge Cases & Constraints",
        code: "Negative numbers, duplicates, and 0 are handled naturally by Map.",
        note: "Does not require sorted input unlike Two Pointers.",
        badge: "CONSTRAINTS"
      }
    ],
    complexities: {
      best: "O(1) [Pair at beginning]",
      avg: "O(N)",
      worst: "O(N) [Hash collisions negligible]",
      space: "O(N) [Hash Map storage]",
      inPlace: false,
      stable: true
    },
    extraNotes: [
      "TRADE-OFF: Sacrifices O(N) extra memory to achieve blazing fast O(N) runtime.",
      "ALTERNATIVE: Two Pointers approach requires O(N log N) sorting first."
    ]
  },
  {
    filename: "knapsack.svg",
    title: "0/1 Knapsack — 2D DP Table & State Equations",
    subtitle: "Optimal Substructure & Overlapping Subproblems",
    topic: "Dynamic Programming",
    steps: [
      {
        title: "1. State Definition",
        code: "dp[i][w] = Maximum profit using first 'i' items with knapsack capacity 'w'",
        note: "Two dimensions: Item choices (0..N) and capacity levels (0..W).",
        badge: "DP STATE"
      },
      {
        title: "2. Base Case Initialization",
        code: "dp[0][w] = 0; dp[i][0] = 0;",
        note: "Zero items yields 0 profit; zero capacity can hold 0 items.",
        badge: "BASE CASES"
      },
      {
        title: "3. Decision Tree: Exclude Item 'i'",
        code: "excludeProfit = dp[i - 1][w];",
        note: "If we don't take item 'i', best profit is simply using previous items.",
        badge: "EXCLUDE"
      },
      {
        title: "4. Decision Tree: Include Item 'i' (If wt <= w)",
        code: "includeProfit = val[i - 1] + dp[i - 1][w - wt[i - 1]];",
        note: "Gain item profit plus best profit for the remaining capacity (w - wt).",
        badge: "INCLUDE"
      },
      {
        title: "5. Transition Equation",
        code: "dp[i][w] = Math.max(excludeProfit, includeProfit);",
        note: "Pick the optimal strategy at each state.",
        badge: "TRANSITION"
      }
    ],
    complexities: {
      best: "O(N * W)",
      avg: "O(N * W)",
      worst: "O(N * W) [Pseudo-polynomial]",
      space: "O(N * W) [Can be optimized to O(W) with 1D array]",
      inPlace: false,
      stable: true
    },
    extraNotes: [
      "SPACE OPTIMIZATION: Notice dp[i][w] only depends on row (i-1); reduce to 1D array traversing backwards!",
      "WHY BACKWARDS? Right-to-left traversal prevents using the same item multiple times in 0/1."
    ]
  }
];

noteFiles.forEach((n) => {
  const svg = createNoteSvg(n);
  fs.writeFileSync(path.join(notesDir, n.filename), svg, "utf8");
  console.log(`Generated note SVG: ${n.filename}`);
});
