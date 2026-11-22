import { PrismaClient, Role, Difficulty, ApproachType, NoteFileType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting BeeNext database seed with Striver A2Z topics...");

  // 1. Admin & Customer Credentials from secure environment configuration
  const adminEmail = (process.env.ADMIN_EMAIL || "supportbeenext@gmail.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "Arif@12588";
  const adminName = process.env.ADMIN_NAME || "BeeNext Administrator";

  const customerEmail = (process.env.CUSTOMER_EMAIL || "arifahmedma490@gmail.com").toLowerCase().trim();
  const customerPassword = process.env.CUSTOMER_PASSWORD || "Arif@12588";
  const customerName = process.env.CUSTOMER_NAME || "Arif Ahmed";

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const customerPasswordHash = await bcrypt.hash(customerPassword, 12);

  // 1a. Ensure Admin Account
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });
  console.log(`✅ Designated Admin verified: ${admin.email} (Role: ${admin.role})`);

  // 1b. Ensure Customer Account (Role: USER, strictly no admin access)
  const customer = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {
      name: customerName,
      passwordHash: customerPasswordHash,
      role: Role.USER,
    },
    create: {
      email: customerEmail,
      name: customerName,
      passwordHash: customerPasswordHash,
      role: Role.USER,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
  });
  console.log(`✅ Customer Account verified: ${customer.email} (Role: ${customer.role})`);

  // 1c. Revoke ADMIN privileges from any other accounts so ONLY supportbeenext@gmail.com retains ADMIN
  const revoked = await prisma.user.updateMany({
    where: {
      email: { not: adminEmail },
      role: Role.ADMIN,
    },
    data: {
      role: Role.USER,
    },
  });
  if (revoked.count > 0) {
    console.log(`🔒 Revoked ADMIN privileges from ${revoked.count} other account(s).`);
  }

  // 2. Bundle Configuration
  await prisma.bundleConfig.upsert({
    where: { id: "default" },
    update: {
      title: "All-Access DSA Handwritten Mastery Bundle",
      description:
        "Complete lifetime access to all 17 DSA topics inspired by Striver's A2Z syllabus, 150+ problems, handwritten notes with step-by-step traces, Java solutions, and future problem additions.",
      price: 1499,
      originalPrice: 4999,
      isActive: true,
    },
    create: {
      id: "default",
      title: "All-Access DSA Handwritten Mastery Bundle",
      description:
        "Complete lifetime access to all 17 DSA topics inspired by Striver's A2Z syllabus, 150+ problems, handwritten notes with step-by-step traces, Java solutions, and future problem additions.",
      price: 1499,
      originalPrice: 4999,
      isActive: true,
    },
  });

  // 3. Define the exact 20 Striver A2Z DSA Topics in requested order
  const categoriesData = [
    {
      title: "Beginner Problems",
      slug: "beginner-problems",
      description:
        "Basic maths, recursion fundamentals, hashing basics, time complexity theory, and Java standard library collections.",
      isFree: false,
      price: 241,
      order: 1,
    },
    {
      title: "Sorting",
      slug: "sorting",
      description:
        "Complete comparison and recursive sorting algorithms with visual traces. Selection, Bubble, Insertion, Merge, Quick Sort & Inversion counts.",
      isFree: false,
      price: 89,
      order: 2,
    },
    {
      title: "Arrays",
      slug: "arrays",
      description:
        "Easy, Medium and Hard array problems. Two Pointers, Sliding Window, Dutch National Flag, Kadane's Algorithm, and Prefix Sums.",
      isFree: false,
      price: 139,
      order: 3,
    },
    {
      title: "Hashing",
      slug: "hashing",
      description:
        "Hashing maps, frequency tables, collision handling, and hash map algorithms.",
      isFree: false,
      price: 87,
      order: 4,
    },
    {
      title: "Binary Search",
      slug: "binary-search",
      description:
        "1D and 2D binary search, search in rotated sorted arrays, binary search on answer space, and monotonic predicates.",
      isFree: false,
      price: 139,
      order: 5,
    },
    {
      title: "Strings (Basic and Medium)",
      slug: "strings-basic-and-medium",
      description:
        "Basic and medium string problems, palindrome checks, anagrams, substring patterns, and manipulation.",
      isFree: false,
      price: 89,
      order: 6,
    },
    {
      title: "Recursion",
      slug: "recursion",
      description:
        "Call stack mental models, generating subsets, combinations, permutations, N-Queens, and Sudoku Solver.",
      isFree: false,
      price: 119,
      order: 7,
    },
    {
      title: "Linked-List",
      slug: "linked-list",
      description:
        "Singly, Doubly, fast & slow pointers, Floyd's cycle detection, reverse in K-groups, and LRU Cache design.",
      isFree: false,
      price: 173,
      order: 8,
    },
    {
      title: "Bit Manipulation",
      slug: "bit-manipulation",
      description:
        "Bitwise AND, OR, XOR, power-of-two tests, Brian Kernighan's count, single number variants, and bitmasking.",
      isFree: false,
      price: 103,
      order: 9,
    },
    {
      title: "Greedy Algorithms",
      slug: "greedy-algorithms",
      description:
        "Activity selection, non-overlapping intervals, Jump Game, fractional knapsack, and shortest job first.",
      isFree: false,
      price: 103,
      order: 10,
    },
    {
      title: "Sliding Window / 2 Pointer",
      slug: "sliding-window-2-pointer",
      description:
        "Constant and dynamic window problems, longest substring without repeating characters, and minimum window substring.",
      isFree: false,
      price: 101,
      order: 11,
    },
    {
      title: "Stack / Queues",
      slug: "stack-queues",
      description:
        "Array/Linked List implementations, monotonic stacks, Next Greater Element, Largest Rectangle in Histogram, and sliding window maximum.",
      isFree: false,
      price: 137,
      order: 12,
    },
    {
      title: "Binary Trees",
      slug: "binary-trees",
      description:
        "Traversals (Inorder, Preorder, Postorder, Level order), diameter, LCA, tree serialization, and Maximum Path Sum.",
      isFree: false,
      price: 139,
      order: 13,
    },
    {
      title: "Binary Search Trees",
      slug: "binary-search-trees",
      description:
        "BST invariants, validation, floor & ceil, node deletion, Kth smallest element, and Two Sum in BST.",
      isFree: false,
      price: 105,
      order: 14,
    },
    {
      title: "Heaps",
      slug: "heaps",
      description:
        "Min/Max binary heaps, heapify down in O(N), Top-K Frequent Elements, Merge K Sorted Lists, and Median from Data Stream.",
      isFree: false,
      price: 115,
      order: 15,
    },
    {
      title: "Graphs",
      slug: "graphs",
      description:
        "BFS, DFS, cycle detection, topological sort (Kahn's), Dijkstra, Bellman-Ford, Floyd-Warshall, and Disjoint Set Union (DSU).",
      isFree: false,
      price: 167,
      order: 16,
    },
    {
      title: "Dynamic Programming",
      slug: "dynamic-programming",
      description:
        "1D/2D grids, 0/1 Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), and Partition DP.",
      isFree: false,
      price: 181,
      order: 17,
    },
    {
      title: "Tries",
      slug: "tries",
      description:
        "Prefix trees, insert/search/startsWith, counting distinct substrings, and Maximum XOR of two numbers in array.",
      isFree: false,
      price: 89,
      order: 18,
    },
    {
      title: "Strings (Advanced Algo)",
      slug: "strings-advanced-algo",
      description:
        "KMP, Rabin-Karp, Z-algorithm, and advanced pattern matching.",
      isFree: false,
      price: 93,
      order: 19,
    },
    {
      title: "Maths",
      slug: "maths",
      description:
        "Number theory, primes, GCD/LCM, modular arithmetic, and combinatorics.",
      isFree: false,
      price: 81,
      order: 20,
    },
  ];

  const categoryMap = new Map<string, string>();

  // Clean old test categories if needed
  await prisma.category.deleteMany({
    where: {
      slug: {
        notIn: categoriesData.map((c) => c.slug).concat(["sorting"]), // keep legacy sorting slug if any
      },
    },
  });

  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        title: cat.title,
        description: cat.description,
        isFree: cat.isFree,
        price: cat.price,
        order: cat.order,
      },
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✅ Upserted all 17 Striver A2Z topics`);

  const sortingCategoryId = categoryMap.get("sorting-techniques")!;
  const basicsCategoryId = categoryMap.get("learn-the-basics")!;
  const arraysCategoryId = categoryMap.get("arrays")!;
  const bsCategoryId = categoryMap.get("binary-search")!;
  const dpCategoryId = categoryMap.get("dynamic-programming")!;
  const treesCategoryId = categoryMap.get("binary-trees")!;

  // 4. Exact 8 Problems in Sorting Techniques
  const sortingProblems = [
    {
      title: "Selection Sort",
      slug: "selection-sort",
      difficulty: Difficulty.EASY,
      order: 1,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Given an unsorted array of size N, use selection sort to sort the array in non-decreasing order. In each pass, identify the minimum element from the unsorted subarray and place it at the beginning.",
      inputFormat: "An integer array `nums` of length `n`.",
      outputFormat: "Return the sorted array.",
      constraints: "1 <= nums.length <= 1,000\n-10^4 <= nums[i] <= 10^4",
      examples: [
        {
          input: "nums = [13, 46, 24, 52, 20, 9]",
          output: "[9, 13, 20, 24, 46, 52]",
          explanation: "At each step, minimum of unsorted portion is swapped into its correct place.",
        },
      ],
      explanation:
        "Selection sort divides the array into a sorted and unsorted region. It finds the minimum in the unsorted region and swaps it with the first unsorted element, ensuring at most O(N) total memory swaps.",
      bruteForce: {
        title: "Standard Selection Sort",
        explanation: "Scans remainder of array and performs swap unconditionally.",
        javaCode: `public class SelectionSort {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            int temp = arr[minIdx];
            arr[minIdx] = arr[i];
            arr[i] = temp;
        }
    }
}`,
        timeComplexity: "O(N^2) in all cases",
        spaceComplexity: "O(1) in-place",
      },
      optimal: {
        title: "Optimized Selection Sort (Redundant Swap Check)",
        explanation: "Skips swap if minimum element is already in slot `i`.",
        javaCode: `public class SelectionSortOptimal {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            if (minIdx != i) {
                int temp = arr[minIdx];
                arr[minIdx] = arr[i];
                arr[i] = temp;
            }
        }
    }
}`,
        timeComplexity: "O(N^2) comparisons, at most N swaps",
        spaceComplexity: "O(1) in-place",
      },
      notes: [
        {
          title: "Selection Sort — Minimum Selection Invariant",
          fileUrl: "/notes/selectionsort.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
      ],
    },
    {
      title: "Bubble Sort",
      slug: "bubble-sort",
      difficulty: Difficulty.EASY,
      order: 2,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Given an integer array nums, sort the array in ascending order using Bubble Sort. Repeatedly swap adjacent elements if they are in the wrong order.",
      inputFormat: "An integer array `nums`.",
      outputFormat: "Return the sorted array in ascending order.",
      constraints: "1 <= nums.length <= 1,000",
      examples: [
        {
          input: "nums = [64, 34, 25, 12, 22, 11, 90]",
          output: "[11, 12, 22, 25, 34, 64, 90]",
          explanation: "Largest elements float to the right end on each outer iteration.",
        },
      ],
      explanation:
        "At the end of pass i, the i-th largest element is guaranteed to be at its final position at the end of the array. An optimization flag can detect when no swaps occur, terminating in O(N) time.",
      bruteForce: {
        title: "Standard Bubble Sort",
        explanation: "Always runs N*(N-1)/2 iterations without early exit.",
        javaCode: `public class BubbleSortBasic {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}`,
        timeComplexity: "O(N^2) all cases",
        spaceComplexity: "O(1) in-place",
      },
      optimal: {
        title: "Optimized Bubble Sort with Swapped Flag",
        explanation: "Detects sorted array after 1 pass and breaks early in O(N) time.",
        javaCode: `public class BubbleSortOptimal {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
}`,
        timeComplexity: "O(N) best case, O(N^2) worst case",
        spaceComplexity: "O(1) in-place",
      },
      notes: [
        {
          title: "Bubble Sort — Adjacent Comparison & Optimization",
          fileUrl: "/notes/bubblesort.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
      ],
    },
    {
      title: "Insertion Sort",
      slug: "insertion-sort",
      difficulty: Difficulty.EASY,
      order: 3,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Given an array nums, sort the array using Insertion Sort. Takes each element from the unsorted segment and inserts it into its correct position in the sorted prefix.",
      inputFormat: "An integer array `nums`.",
      outputFormat: "Return the sorted array.",
      constraints: "1 <= nums.length <= 1,000",
      examples: [
        {
          input: "nums = [12, 11, 13, 5, 6]",
          output: "[5, 6, 11, 12, 13]",
          explanation: "Cards in hand analogy: elements shifted rightwards to insert key.",
        },
      ],
      explanation:
        "Insertion Sort is adaptive: if the input is already sorted, it runs in linear O(N) time with only N-1 comparisons and zero swaps. Default inner sorter in hybrid engines like Timsort.",
      bruteForce: {
        title: "Swap-Based Insertion",
        explanation: "Swaps backward element by element instead of shifting.",
        javaCode: `public class InsertionSortSwaps {
    public static void sort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int j = i;
            while (j > 0 && arr[j - 1] > arr[j]) {
                int temp = arr[j];
                arr[j] = arr[j - 1];
                arr[j - 1] = temp;
                j--;
            }
        }
    }
}`,
        timeComplexity: "O(N^2) average/worst, O(N) best",
        spaceComplexity: "O(1) in-place",
      },
      optimal: {
        title: "Shift-Based Insertion Sort (Key Extraction)",
        explanation: "Shifts elements rightwards and places key directly, cutting write ops.",
        javaCode: `public class InsertionSortOptimal {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }
}`,
        timeComplexity: "O(N) best case, O(N^2) worst case",
        spaceComplexity: "O(1) in-place, stable",
      },
      notes: [
        {
          title: "Insertion Sort — Playing Card Mental Model",
          fileUrl: "/notes/insertionsort.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
      ],
    },
    {
      title: "Merge Sort",
      slug: "merge-sort",
      difficulty: Difficulty.MEDIUM,
      order: 4,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Merge Sort is an efficient, stable, comparison-based divide-and-conquer algorithm. Recursively divides array into two halves, sorts them, and merges the sorted halves.",
      inputFormat: "An integer array `nums` of length `n`.",
      outputFormat: "Return the sorted array in ascending order.",
      constraints: "1 <= nums.length <= 50,000",
      examples: [
        {
          input: "nums = [5, 2, 3, 1]",
          output: "[1, 2, 3, 5]",
          explanation: "Divided to leaves, merged up in O(N log N) guaranteed time.",
        },
      ],
      explanation:
        "Divide at midpoint, sort both halves recursively, and merge two sorted halves using two pointers in O(N) linear time.",
      bruteForce: {
        title: "Standard Top-Down with Repeated Allocations",
        explanation: "Allocates left and right sub-arrays on each recursion frame.",
        javaCode: `import java.util.Arrays;

public class MergeSortStandard {
    public int[] sortArray(int[] nums) {
        if (nums.length <= 1) return nums;
        int mid = nums.length / 2;
        int[] left = sortArray(Arrays.copyOfRange(nums, 0, mid));
        int[] right = sortArray(Arrays.copyOfRange(nums, mid, nums.length));
        return merge(left, right);
    }

    private int[] merge(int[] a, int[] b) {
        int[] res = new int[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (i < a.length && j < b.length) res[k++] = a[i] <= b[j] ? a[i++] : b[j++];
        while (i < a.length) res[k++] = a[i++];
        while (j < b.length) res[k++] = b[j++];
        return res;
    }
}`,
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(N log N) temporary buffers",
      },
      optimal: {
        title: "Optimized Merge Sort with Single Scratch Buffer",
        explanation: "Allocates a single buffer `temp[]` once and reuses across all merges.",
        javaCode: `public class MergeSortOptimal {
    public int[] sortArray(int[] nums) {
        if (nums == null || nums.length <= 1) return nums;
        int[] temp = new int[nums.length];
        mergeSort(nums, 0, nums.length - 1, temp);
        return nums;
    }

    private void mergeSort(int[] arr, int low, int high, int[] temp) {
        if (low >= high) return;
        int mid = low + (high - low) / 2;
        mergeSort(arr, low, mid, temp);
        mergeSort(arr, mid + 1, high, temp);
        if (arr[mid] <= arr[mid + 1]) return;
        merge(arr, low, mid, high, temp);
    }

    private void merge(int[] arr, int low, int mid, int high, int[] temp) {
        int i = low, j = mid + 1, k = low;
        while (i <= mid && j <= high) temp[k++] = arr[i] <= arr[j] ? arr[i++] : arr[j++];
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= high) temp[k++] = arr[j++];
        System.arraycopy(temp, low, arr, low, high - low + 1);
    }
}`,
        timeComplexity: "O(N log N) guaranteed in all cases",
        spaceComplexity: "O(N) single auxiliary array + O(log N) stack",
      },
      notes: [
        {
          title: "Merge Sort — Complete Recursion Tree Breakdown",
          fileUrl: "/notes/mergesort-p1.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
        {
          title: "Merge Sort — Verified Proof & Invariants PDF",
          fileUrl: "/notes/mergesort.pdf",
          fileType: NoteFileType.PDF,
          pageCount: 1,
          isProtected: false,
          order: 2,
        },
      ],
    },
    {
      title: "Recursive Bubble Sort",
      slug: "recursive-bubble-sort",
      difficulty: Difficulty.EASY,
      order: 5,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Implement Bubble Sort recursively. Base case is when array size is 1. Each recursive call places the largest element of current subarray at the end.",
      inputFormat: "An integer array `nums` of length `n`.",
      outputFormat: "Return the sorted array.",
      constraints: "1 <= nums.length <= 1,000",
      examples: [
        {
          input: "nums = [5, 1, 4, 2, 8]",
          output: "[1, 2, 4, 5, 8]",
          explanation: "After 1st pass: [1, 4, 2, 5, 8] (8 settled). Recurse for n-1.",
        },
      ],
      explanation:
        "Recursive Bubble Sort converts the outer iteration into a recursion call stack while maintaining the inner pairwise comparison pass.",
      bruteForce: {
        title: "Standard Recursive Bubble Sort",
        explanation: "Unconditionally recurses for n-1 elements without early termination.",
        javaCode: `public class RecursiveBubbleSort {
    public static void bubbleSort(int[] arr, int n) {
        if (n == 1) return;

        for (int i = 0; i < n - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                int temp = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = temp;
            }
        }
        bubbleSort(arr, n - 1);
    }
}`,
        timeComplexity: "O(N^2)",
        spaceComplexity: "O(N) recursive call stack",
      },
      optimal: {
        title: "Optimized Recursive Bubble Sort with Swapped Guard",
        explanation: "Returns immediately if no swap occurred in the current recursive pass.",
        javaCode: `public class RecursiveBubbleSortOptimal {
    public static void bubbleSort(int[] arr, int n) {
        if (n <= 1) return;

        boolean swapped = false;
        for (int i = 0; i < n - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                int temp = arr[i];
                arr[i] = arr[i + 1];
                arr[i + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) return; // Array already sorted!

        bubbleSort(arr, n - 1);
    }
}`,
        timeComplexity: "O(N) best case, O(N^2) worst case",
        spaceComplexity: "O(N) call stack",
      },
      notes: [
        {
          title: "Recursive Bubble Sort — Call Stack Reduction",
          fileUrl: "/notes/recursive-bubblesort.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
      ],
    },
    {
      title: "Recursive Insertion Sort",
      slug: "recursive-insertion-sort",
      difficulty: Difficulty.EASY,
      order: 6,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Implement Insertion Sort recursively. Inductive step: assume first n-1 elements are sorted, insert the n-th element into its correct position in sorted array.",
      inputFormat: "An integer array `nums` of length `n`.",
      outputFormat: "Return the sorted array.",
      constraints: "1 <= nums.length <= 1,000",
      examples: [
        {
          input: "nums = [4, 3, 2, 10, 12, 1, 5, 6]",
          output: "[1, 2, 3, 4, 5, 6, 10, 12]",
          explanation: "Recursively sorts prefix [0..n-2], then shifts rightward to place last element.",
        },
      ],
      explanation:
        "Recursive Insertion Sort mirrors mathematical induction: base case n<=1, hypothesis that [0..n-2] is sorted, and conclusion that shifts place arr[n-1].",
      bruteForce: {
        title: "Standard Recursive Insertion",
        explanation: "Recurses on n-1, then executes shift loop for key.",
        javaCode: `public class RecursiveInsertionSort {
    public static void insertionSort(int[] arr, int n) {
        if (n <= 1) return;

        insertionSort(arr, n - 1);

        int last = arr[n - 1];
        int j = n - 2;

        while (j >= 0 && arr[j] > last) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = last;
    }
}`,
        timeComplexity: "O(N^2) average/worst, O(N) best",
        spaceComplexity: "O(N) auxiliary call stack",
      },
      optimal: {
        title: "Tail-Optimized Recursive Insertion",
        explanation: "Inductively sorts prefix with minimal redundant comparisons.",
        javaCode: `public class RecursiveInsertionSortOptimal {
    public static void sort(int[] arr, int i, int n) {
        if (i == n) return;

        int key = arr[i];
        int j = i - 1;

        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;

        sort(arr, i + 1, n);
    }
}`,
        timeComplexity: "O(N) best case, O(N^2) worst case",
        spaceComplexity: "O(N) recursion depth",
      },
      notes: [
        {
          title: "Recursive Insertion Sort — Inductive Placement",
          fileUrl: "/notes/recursive-insertionsort.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
      ],
    },
    {
      title: "Quick Sort",
      slug: "quick-sort",
      difficulty: Difficulty.MEDIUM,
      order: 7,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Implement Quick Sort, a divide-and-conquer algorithm that selects a pivot element and partitions the surrounding array such that elements smaller than pivot are on the left, and elements greater are on the right.",
      inputFormat: "An integer array `nums` of length `n`.",
      outputFormat: "Return the sorted array in ascending order.",
      constraints: "1 <= nums.length <= 50,000",
      examples: [
        {
          input: "nums = [5, 2, 3, 1]",
          output: "[1, 2, 3, 5]",
          explanation: "Pivot partitions elements, sorted recursively in O(N log N).",
        },
      ],
      explanation:
        "Quick Sort partitions the array in-place around a pivot. Lomuto or Hoare partitioning guarantees pivot sits in permanent sorted position.",
      bruteForce: {
        title: "Naive Partition with Extra List Allocations",
        explanation: "Allocates left, middle, right lists per recursion level.",
        javaCode: `import java.util.*;

public class QuickSortBruteForce {
    public static List<Integer> sort(List<Integer> nums) {
        if (nums.size() <= 1) return nums;
        int pivot = nums.get(nums.size() - 1);
        List<Integer> left = new ArrayList<>();
        List<Integer> mid = new ArrayList<>();
        List<Integer> right = new ArrayList<>();

        for (int x : nums) {
            if (x < pivot) left.add(x);
            else if (x == pivot) mid.add(x);
            else right.add(x);
        }

        List<Integer> sorted = new ArrayList<>(sort(left));
        sorted.addAll(mid);
        sorted.addAll(sort(right));
        return sorted;
    }
}`,
        timeComplexity: "O(N log N) average, O(N^2) worst",
        spaceComplexity: "O(N log N) extra lists",
      },
      optimal: {
        title: "In-Place Lomuto Partition with Random Pivot",
        explanation: "Random pivot avoids killer sorted inputs; in-place O(1) swap memory.",
        javaCode: `import java.util.Random;

public class QuickSortOptimal {
    private static final Random RAND = new Random();

    public int[] sortArray(int[] nums) {
        if (nums == null || nums.length <= 1) return nums;
        quickSort(nums, 0, nums.length - 1);
        return nums;
    }

    private void quickSort(int[] arr, int low, int high) {
        if (low >= high) return;
        int randIdx = low + RAND.nextInt(high - low + 1);
        swap(arr, randIdx, high);

        int pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }

    private int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) swap(arr, ++i, j);
        }
        swap(arr, i + 1, high);
        return i + 1;
    }

    private void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}`,
        timeComplexity: "O(N log N) expected, O(N log N) worst case with randomized pivot",
        spaceComplexity: "O(log N) auxiliary call stack",
      },
      notes: [
        {
          title: "Quick Sort — Lomuto Partition Visualizer",
          fileUrl: "/notes/quicksort-p1.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
        {
          title: "Quick Sort — Hoare vs Lomuto & Call Stack",
          fileUrl: "/notes/quicksort-p2.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 2,
        },
        {
          title: "Quick Sort — Deep Dive PDF Compendium",
          fileUrl: "/notes/quicksort.pdf",
          fileType: NoteFileType.PDF,
          pageCount: 1,
          isProtected: false,
          order: 3,
        },
      ],
    },
    {
      title: "Count Inversions",
      slug: "count-inversions",
      difficulty: Difficulty.MEDIUM,
      order: 8,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/global-and-local-inversions/",
      description:
        "Given an integer array nums, count the number of inversions. Two elements nums[i] and nums[j] form an inversion if nums[i] > nums[j] and i < j. Inversion count indicates how far the array is from being sorted.",
      inputFormat: "An integer array `nums` of length `n`.",
      outputFormat: "Return the total number of inversions as a long integer.",
      constraints: "1 <= nums.length <= 100,000",
      examples: [
        {
          input: "nums = [2, 4, 1, 3, 5]",
          output: "3",
          explanation: "Inversion pairs: (2, 1), (4, 1), (4, 3). Total = 3.",
        },
        {
          input: "nums = [5, 4, 3, 2, 1]",
          output: "10",
          explanation: "Reverse sorted array has maximum inversions: 5 * 4 / 2 = 10.",
        },
      ],
      explanation:
        "Using an enhanced Merge Sort subroutine: whenever an element from right half is placed before left half, all remaining elements in left half form inversions with it in O(1) time.",
      bruteForce: {
        title: "Naive Double Loop Comparison",
        explanation: "Checks every pair (i, j) with i < j. Takes O(N^2) time.",
        javaCode: `public class CountInversionsNaive {
    public static long countInversions(int[] nums) {
        long count = 0;
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] > nums[j]) count++;
            }
        }
        return count;
    }
}`,
        timeComplexity: "O(N^2)",
        spaceComplexity: "O(1)",
      },
      optimal: {
        title: "Enhanced Merge Sort Divide & Conquer",
        explanation:
          "During merge step: `if (arr[left] > arr[right]) count += (mid - left + 1);` counts all cross-boundary inversions in O(N log N).",
        javaCode: `public class CountInversionsOptimal {
    public static long countInversions(int[] arr) {
        int[] temp = new int[arr.length];
        return mergeSortAndCount(arr, 0, arr.length - 1, temp);
    }

    private static long mergeSortAndCount(int[] arr, int low, int high, int[] temp) {
        long count = 0;
        if (low < high) {
            int mid = low + (high - low) / 2;
            count += mergeSortAndCount(arr, low, mid, temp);
            count += mergeSortAndCount(arr, mid + 1, high, temp);
            count += mergeAndCount(arr, low, mid, high, temp);
        }
        return count;
    }

    private static long mergeAndCount(int[] arr, int low, int mid, int high, int[] temp) {
        int i = low, j = mid + 1, k = low;
        long invCount = 0;

        while (i <= mid && j <= high) {
            if (arr[i] <= arr[j]) {
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
                invCount += (mid - i + 1); // Key insight!
            }
        }
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= high) temp[k++] = arr[j++];
        System.arraycopy(temp, low, arr, low, high - low + 1);
        return invCount;
    }
}`,
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(N) scratch buffer",
      },
      notes: [
        {
          title: "Count Inversions — Enhanced Merge Sort Step",
          fileUrl: "/notes/count-inversions.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
      ],
    },
  ];

  for (const p of sortingProblems) {
    const { bruteForce, optimal, notes, ...problemFields } = p;
    const problem = await prisma.problem.upsert({
      where: { slug: problemFields.slug },
      update: {
        ...problemFields,
        categoryId: sortingCategoryId,
      },
      create: {
        ...problemFields,
        categoryId: sortingCategoryId,
      },
    });

    await prisma.problemCode.upsert({
      where: {
        problemId_approachType: {
          problemId: problem.id,
          approachType: ApproachType.BRUTE_FORCE,
        },
      },
      update: {
        title: bruteForce.title,
        explanation: bruteForce.explanation,
        javaCode: bruteForce.javaCode,
        timeComplexity: bruteForce.timeComplexity,
        spaceComplexity: bruteForce.spaceComplexity,
      },
      create: {
        problemId: problem.id,
        approachType: ApproachType.BRUTE_FORCE,
        title: bruteForce.title,
        explanation: bruteForce.explanation,
        javaCode: bruteForce.javaCode,
        timeComplexity: bruteForce.timeComplexity,
        spaceComplexity: bruteForce.spaceComplexity,
      },
    });

    await prisma.problemCode.upsert({
      where: {
        problemId_approachType: {
          problemId: problem.id,
          approachType: ApproachType.OPTIMAL,
        },
      },
      update: {
        title: optimal.title,
        explanation: optimal.explanation,
        javaCode: optimal.javaCode,
        timeComplexity: optimal.timeComplexity,
        spaceComplexity: optimal.spaceComplexity,
      },
      create: {
        problemId: problem.id,
        approachType: ApproachType.OPTIMAL,
        title: optimal.title,
        explanation: optimal.explanation,
        javaCode: optimal.javaCode,
        timeComplexity: optimal.timeComplexity,
        spaceComplexity: optimal.spaceComplexity,
      },
    });

    await prisma.handwrittenNote.deleteMany({
      where: { problemId: problem.id },
    });

    for (const note of notes) {
      await prisma.handwrittenNote.create({
        data: {
          problemId: problem.id,
          title: note.title,
          fileUrl: note.fileUrl,
          fileType: note.fileType,
          pageCount: note.pageCount,
          isProtected: note.isProtected,
          order: note.order,
        },
      });
    }
  }
  console.log(`✅ Seeded all 8 exact Sorting Techniques problems`);

  // 5. Seed sample problems for other categories (unpublished so other categories stay empty)
  // Learn the Basics
  const basicsProblem = await prisma.problem.upsert({
    where: { slug: "count-digits" },
    update: { categoryId: basicsCategoryId, isPublished: false },
    create: {
      title: "Count Digits in a Number",
      slug: "count-digits",
      difficulty: Difficulty.EASY,
      order: 1,
      isFree: false,
      price: 39,
      isPublished: false,
      categoryId: basicsCategoryId,
      leetcodeUrl: "https://leetcode.com/problems/find-numbers-with-even-number-of-digits/",
      description: "Given an integer N, count the number of digits in N using logarithmic and iterative methods.",
    },
  });

  // Arrays: Two Sum & Kadane
  const twoSum = await prisma.problem.upsert({
    where: { slug: "two-sum" },
    update: { categoryId: arraysCategoryId, isPublished: false },
    create: {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: Difficulty.EASY,
      order: 1,
      isFree: false,
      price: 49,
      isPublished: false,
      categoryId: arraysCategoryId,
      leetcodeUrl: "https://leetcode.com/problems/two-sum/",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    },
  });

  const kadane = await prisma.problem.upsert({
    where: { slug: "kadanes-algorithm-maximum-subarray" },
    update: { categoryId: arraysCategoryId, isPublished: false },
    create: {
      title: "Kadane's Algorithm — Maximum Subarray",
      slug: "kadanes-algorithm-maximum-subarray",
      difficulty: Difficulty.MEDIUM,
      order: 2,
      isFree: false,
      price: 49,
      isPublished: false,
      categoryId: arraysCategoryId,
      leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
      description: "Find the subarray with the largest sum and return its sum.",
    },
  });

  // Binary Search
  const bs = await prisma.problem.upsert({
    where: { slug: "binary-search" },
    update: { categoryId: bsCategoryId, isPublished: false },
    create: {
      title: "Binary Search to Find X in Sorted Array",
      slug: "binary-search",
      difficulty: Difficulty.EASY,
      order: 1,
      isFree: false,
      price: 49,
      isPublished: false,
      categoryId: bsCategoryId,
      leetcodeUrl: "https://leetcode.com/problems/binary-search/",
      description: "Given a sorted array of integers nums and an integer target, return its index or -1 if not found.",
    },
  });

  // Dynamic Programming: 0/1 Knapsack & Climbing Stairs
  const knapsack = await prisma.problem.upsert({
    where: { slug: "0-1-knapsack" },
    update: { categoryId: dpCategoryId, isPublished: false },
    create: {
      title: "0/1 Knapsack Problem",
      slug: "0-1-knapsack",
      difficulty: Difficulty.MEDIUM,
      order: 1,
      isFree: false,
      price: 69,
      isPublished: false,
      categoryId: dpCategoryId,
      leetcodeUrl: "https://leetcode.com/problems/partition-equal-subset-sum/",
      description: "Given weights and values of N items, put these items in a knapsack of capacity W to get maximum value.",
    },
  });

  // Binary Trees
  const treeLCA = await prisma.problem.upsert({
    where: { slug: "lowest-common-ancestor-binary-tree" },
    update: { categoryId: treesCategoryId, isPublished: false },
    create: {
      title: "Lowest Common Ancestor in Binary Tree",
      slug: "lowest-common-ancestor-binary-tree",
      difficulty: Difficulty.MEDIUM,
      order: 1,
      isFree: false,
      price: 59,
      isPublished: false,
      categoryId: treesCategoryId,
      leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
      description: "Find lowest common ancestor (LCA) of two given nodes p and q in a binary tree.",
    },
  });

  console.log("🎉 Complete 17 Striver A2Z topics and problem curriculum successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
