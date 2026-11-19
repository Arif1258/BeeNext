import { PrismaClient, Role, Difficulty, ApproachType, NoteFileType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting BeeNext database seed...");

  // 1. Admin & Test User Credentials from environment
  const adminEmail = process.env.ADMIN_EMAIL || "admin@beenext.dev";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminSecurePassword123!";
  const adminName = process.env.ADMIN_NAME || "BeeNext Administrator";

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const testUserPasswordHash = await bcrypt.hash("UserSecurePassword123!", 12);

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
  console.log(`✅ Admin created: ${admin.email}`);

  const testUser = await prisma.user.upsert({
    where: { email: "alex@beenext.dev" },
    update: {
      passwordHash: testUserPasswordHash,
    },
    create: {
      email: "alex@beenext.dev",
      name: "Alex Rivera",
      passwordHash: testUserPasswordHash,
      role: Role.USER,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
  });
  console.log(`✅ Test User created: ${testUser.email}`);

  // 2. Bundle Configuration
  await prisma.bundleConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      title: "All-Access DSA Handwritten Mastery Bundle",
      description:
        "Get instant lifetime access to all 18 DSA categories, 150+ problems, handwritten notes with step-by-step traces, Java solutions, and future algorithm additions.",
      price: 1499,
      originalPrice: 4999,
      isActive: true,
    },
  });

  // 3. Define the 18 DSA Categories
  const categoriesData = [
    {
      title: "Sorting",
      slug: "sorting",
      description:
        "Master comparison and non-comparison sorting algorithms. Includes Quick Sort, Merge Sort, Heap Sort, and linear-time counting techniques with handwritten recursion traces.",
      isFree: true,
      price: 0,
      order: 1,
    },
    {
      title: "Searching",
      slug: "searching",
      description:
        "Binary search paradigms, search space reduction, rotated array lookups, and predicate monotonicity frameworks.",
      isFree: false,
      price: 199,
      order: 2,
    },
    {
      title: "Arrays",
      slug: "arrays",
      description:
        "Two Pointers, Sliding Window, Prefix Sums, Dutch National Flag, and Kadane's Algorithm for maximum subarray problems.",
      isFree: false,
      price: 299,
      order: 3,
    },
    {
      title: "Strings",
      slug: "strings",
      description:
        "Substrings, anagrams, palindrome verifications, Rabin-Karp, and Knuth-Morris-Pratt (KMP) pattern matching.",
      isFree: false,
      price: 249,
      order: 4,
    },
    {
      title: "Linked List",
      slug: "linked-list",
      description:
        "Singly and Doubly Linked Lists, fast & slow Floyd's cycle detection, pointer reversals, and LRU Cache structures.",
      isFree: false,
      price: 249,
      order: 5,
    },
    {
      title: "Stack",
      slug: "stack",
      description:
        "Monotonic stacks, valid parentheses, Next Greater Element, and Largest Rectangle in Histogram handwritten breakdowns.",
      isFree: false,
      price: 249,
      order: 6,
    },
    {
      title: "Queue",
      slug: "queue",
      description:
        "Circular Queues, Double-Ended Queues (Deque), and Sliding Window Maximum with amortized O(1) state transitions.",
      isFree: false,
      price: 199,
      order: 7,
    },
    {
      title: "Binary Trees",
      slug: "binary-trees",
      description:
        "Preorder, Inorder, Postorder traversals, Lowest Common Ancestor, Diameter of Binary Tree, and Maximum Path Sum.",
      isFree: false,
      price: 349,
      order: 8,
    },
    {
      title: "Binary Search Trees",
      slug: "binary-search-trees",
      description:
        "BST invariants, validation, node deletion, AVL balance rotations, and in-order successor/predecessor lookups.",
      isFree: false,
      price: 299,
      order: 9,
    },
    {
      title: "Heaps",
      slug: "heaps",
      description:
        "Min & Max Binary Heaps, array index relations, heapify down in O(N), Top-K Frequent Elements, and Median Stream.",
      isFree: false,
      price: 299,
      order: 10,
    },
    {
      title: "Hashing",
      slug: "hashing",
      description:
        "Hash tables, collision handling (chaining vs open addressing), rolling hash functions, and frequency count patterns.",
      isFree: false,
      price: 249,
      order: 11,
    },
    {
      title: "Recursion",
      slug: "recursion",
      description:
        "Call stack mental models, induction steps, recursion trees, and tail recursion optimizations.",
      isFree: false,
      price: 249,
      order: 12,
    },
    {
      title: "Backtracking",
      slug: "backtracking",
      description:
        "State-space search trees, constraint propagation, N-Queens problem, Sudoku Solver, and Subset Sum generation.",
      isFree: false,
      price: 349,
      order: 13,
    },
    {
      title: "Greedy Algorithms",
      slug: "greedy-algorithms",
      description:
        "Locally optimal choice proofs, Activity Selection, Huffman Coding, and Minimum Spanning Trees (Kruskal/Prim).",
      isFree: false,
      price: 299,
      order: 14,
    },
    {
      title: "Dynamic Programming",
      slug: "dynamic-programming",
      description:
        "1D and 2D DP grids, 0/1 Knapsack, Longest Common Subsequence (LCS), Coin Change, and Matrix Chain Multiplication.",
      isFree: false,
      price: 499,
      order: 15,
    },
    {
      title: "Graphs",
      slug: "graphs",
      description:
        "Adjacency lists, BFS, DFS, Dijkstra shortest path, Bellman-Ford, Kahn's Topological Sort, and Disjoint Set Union (DSU).",
      isFree: false,
      price: 449,
      order: 16,
    },
    {
      title: "Tries",
      slug: "tries",
      description:
        "Prefix trees, autocomplete dictionary lookups, word search matrices, and Maximum XOR pair calculations.",
      isFree: false,
      price: 249,
      order: 17,
    },
    {
      title: "Bit Manipulation",
      slug: "bit-manipulation",
      description:
        "Bitwise AND, OR, XOR tricks, two's complement, power-of-two tests, Brian Kernighan's bit-count algorithm, and bitmasks.",
      isFree: false,
      price: 199,
      order: 18,
    },
  ];

  const categoryMap = new Map<string, string>();

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
  console.log(`✅ Upserted all 18 DSA categories`);

  const sortingCategoryId = categoryMap.get("sorting")!;
  const arraysCategoryId = categoryMap.get("arrays")!;
  const dpCategoryId = categoryMap.get("dynamic-programming")!;

  // 4. Seed Sorting Problems (All 8 requested algorithms)
  const sortingProblems = [
    {
      title: "Quick Sort",
      slug: "quick-sort",
      difficulty: Difficulty.MEDIUM,
      order: 1,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Implement Quick Sort, a divide-and-conquer algorithm that selects a 'pivot' element and partitions the surrounding array such that elements smaller than the pivot are on the left, and elements greater are on the right.",
      inputFormat: "An integer array `nums` of length `n`.",
      outputFormat: "Return the sorted array in ascending order.",
      constraints: "1 <= nums.length <= 50,000\n-50,000 <= nums[i] <= 50,000",
      examples: [
        {
          input: "nums = [5, 2, 3, 1]",
          output: "[1, 2, 3, 5]",
          explanation: "After sorting, the elements appear in strictly non-decreasing order.",
        },
        {
          input: "nums = [5, 1, 1, 2, 0, 0]",
          output: "[0, 0, 1, 1, 2, 5]",
          explanation: "Duplicate elements are clustered together correctly in the sorted array.",
        },
      ],
      explanation:
        "Quick Sort works by choosing a pivot (commonly Lomuto's last element or Hoare's two-pointer method). We partition the array in linear O(N) time so the pivot settles into its exact permanent position. Then, we recursively sort the left and right subsegments.",
      bruteForce: {
        title: "Naive Partition with Extra Arrays",
        explanation:
          "Allocate separate lists for elements smaller than pivot, equal to pivot, and larger than pivot. Concatenate them recursively. Simple conceptually, but consumes heavy O(N) memory per recursion level.",
        javaCode: `import java.util.*;

public class QuickSortBruteForce {
    public static List<Integer> sortArray(List<Integer> nums) {
        if (nums.size() <= 1) return nums;

        int pivot = nums.get(nums.size() - 1);
        List<Integer> left = new ArrayList<>();
        List<Integer> middle = new ArrayList<>();
        List<Integer> right = new ArrayList<>();

        for (int x : nums) {
            if (x < pivot) left.add(x);
            else if (x == pivot) middle.add(x);
            else right.add(x);
        }

        List<Integer> sorted = new ArrayList<>(sortArray(left));
        sorted.addAll(middle);
        sorted.addAll(sortArray(right));
        return sorted;
    }
}`,
        timeComplexity: "O(N log N) average, O(N^2) worst case",
        spaceComplexity: "O(N log N) auxiliary list allocations",
      },
      optimal: {
        title: "In-Place Lomuto Partition with Random Pivot",
        explanation:
          "Pick a random pivot to neutralize the O(N^2) killer sorted input edge case. Partition in-place using two pointers within O(1) extra memory. Tail recursion depth is limited to O(log N).",
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

        // Randomized pivot selection to defend against adversarial sorted inputs
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
            if (arr[j] <= pivot) {
                i++;
                swap(arr, i, j);
            }
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
        timeComplexity: "O(N log N) expected, O(N log N) worst-case with randomized pivot",
        spaceComplexity: "O(log N) auxiliary call stack",
      },
      notes: [
        {
          title: "Quick Sort — Lomuto Partition Visualizer [Page 1/2]",
          fileUrl: "/notes/quicksort-p1.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
        {
          title: "Quick Sort — Hoare vs Lomuto & Call Stack [Page 2/2]",
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
      title: "Merge Sort",
      slug: "merge-sort",
      difficulty: Difficulty.MEDIUM,
      order: 2,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Merge Sort is an efficient, stable, comparison-based divide-and-conquer algorithm. Most implementations produce a stable sort, meaning the implementation preserves the input order of equal elements.",
      inputFormat: "An integer array `nums` of length `n`.",
      outputFormat: "Return the sorted array in ascending order.",
      constraints: "1 <= nums.length <= 50,000\n-50,000 <= nums[i] <= 50,000",
      examples: [
        {
          input: "nums = [5, 2, 3, 1]",
          output: "[1, 2, 3, 5]",
          explanation: "Divide into [5, 2] and [3, 1], sort recursively, then merge.",
        },
      ],
      explanation:
        "The divide step splits the array into two halves at `mid = low + (high - low) / 2`. The conquer step recursively sorts both halves. The combine step merges the two sorted halves into a single sorted array in linear O(N) time.",
      bruteForce: {
        title: "Standard Top-Down Merge Sort with Allocations",
        explanation:
          "Allocate new left and right arrays on every recursive merge step. High GC pressure due to repeated allocation of temporary arrays.",
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
        while (i < a.length && j < b.length) {
            res[k++] = a[i] <= b[j] ? a[i++] : b[j++];
        }
        while (i < a.length) res[k++] = a[i++];
        while (j < b.length) res[k++] = b[j++];
        return res;
    }
}`,
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(N log N) total temporary allocated buffers",
      },
      optimal: {
        title: "Optimized Merge Sort with Single Shared Scratch Buffer",
        explanation:
          "Pre-allocate a single reusable temporary buffer `temp[]` of size N once. Reuse this buffer across all recursion steps to eliminate Garbage Collection overhead. Early exit if `arr[mid] <= arr[mid+1]` (already sorted).",
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

        // Optimization: If two halves are already in order, skip merge!
        if (arr[mid] <= arr[mid + 1]) return;

        merge(arr, low, mid, high, temp);
    }

    private void merge(int[] arr, int low, int mid, int high, int[] temp) {
        int i = low;
        int j = mid + 1;
        int k = low;

        while (i <= mid && j <= high) {
            if (arr[i] <= arr[j]) { // '<=' ensures stability
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
            }
        }
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= high) temp[k++] = arr[j++];

        System.arraycopy(temp, low, arr, low, high - low + 1);
    }
}`,
        timeComplexity: "O(N log N) guaranteed in all cases",
        spaceComplexity: "O(N) single auxiliary array buffer + O(log N) stack frames",
      },
      notes: [
        {
          title: "Merge Sort — Complete Recursion Tree Breakdown [Page 1/2]",
          fileUrl: "/notes/mergesort-p1.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
        {
          title: "Merge Sort — Inversion Count & Linked Lists [Page 2/2]",
          fileUrl: "/notes/mergesort-p2.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 2,
        },
        {
          title: "Merge Sort — Verified Proof & Invariant PDF",
          fileUrl: "/notes/mergesort.pdf",
          fileType: NoteFileType.PDF,
          pageCount: 1,
          isProtected: false,
          order: 3,
        },
      ],
    },
    {
      title: "Bubble Sort",
      slug: "bubble-sort",
      difficulty: Difficulty.EASY,
      order: 3,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.",
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
        title: "Standard Double-Loop Bubble Sort",
        explanation: "Always runs N*(N-1)/2 iterations, even when the array is already sorted.",
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
        timeComplexity: "O(N^2) best, average, and worst case",
        spaceComplexity: "O(1) in-place",
      },
      optimal: {
        title: "Optimized Bubble Sort with Swapped Flag",
        explanation:
          "Introduce a `swapped` boolean. If a pass completes with 0 swaps, break early. Limits inner loop to `n - i - 1` to skip already settled elements.",
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
            if (!swapped) break; // Already sorted! O(N) best case
        }
    }
}`,
        timeComplexity: "O(N) best case, O(N^2) average and worst case",
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
      title: "Selection Sort",
      slug: "selection-sort",
      difficulty: Difficulty.EASY,
      order: 4,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Selection Sort divides the input into two parts: a sorted subarray on the left and an unsorted subarray on the right. In each iteration, it finds the smallest element from the unsorted subarray and swaps it to the front.",
      inputFormat: "An integer array `nums`.",
      outputFormat: "Return the sorted array.",
      constraints: "1 <= nums.length <= 1,000",
      examples: [
        {
          input: "nums = [29, 10, 14, 37, 13]",
          output: "[10, 13, 14, 29, 37]",
          explanation: "Minimum of unsorted segment is repeatedly moved to the sorted boundary.",
        },
      ],
      explanation:
        "Selection Sort has the unique property of performing at most N swaps, making it suitable when memory write operations are significantly more expensive than memory reads.",
      bruteForce: {
        title: "Standard Selection Sort",
        explanation: "Iterates through array, finds minimum, and swaps unconditionally.",
        javaCode: `public class SelectionSort {
    public static void sort(int[] arr) {
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
        timeComplexity: "O(N^2) comparisons in all cases",
        spaceComplexity: "O(1) in-place",
      },
      optimal: {
        title: "Optimized Selection Sort (Redundant Swap Check)",
        explanation:
          "Checks `if (minIdx != i)` before executing write operations to conserve hardware write cycles.",
        javaCode: `public class SelectionSortOptimal {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            if (minIdx != i) {
                int temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
            }
        }
    }
}`,
        timeComplexity: "O(N^2) comparisons, strictly O(N) swaps",
        spaceComplexity: "O(1) auxiliary space",
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
      title: "Insertion Sort",
      slug: "insertion-sort",
      difficulty: Difficulty.EASY,
      order: 5,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Insertion Sort builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort, but excels on small and nearly sorted arrays.",
      inputFormat: "An integer array `nums`.",
      outputFormat: "Return the sorted array.",
      constraints: "1 <= nums.length <= 1,000",
      examples: [
        {
          input: "nums = [12, 11, 13, 5, 6]",
          output: "[5, 6, 11, 12, 13]",
          explanation: "Each element is shifted into its correct position like cards in hand.",
        },
      ],
      explanation:
        "Insertion Sort is adaptive: if the input is already sorted, it runs in linear O(N) time with only N-1 comparisons and zero swaps. That makes it the default inner sorter in modern hybrid algorithms like Timsort.",
      bruteForce: {
        title: "Standard Insertion with Swaps",
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
        explanation:
          "Extract `key = arr[i]`, shift greater elements to the right by assignment `arr[j+1] = arr[j]`, then place `arr[j+1] = key`. Cuts memory writes by half.",
        javaCode: `public class InsertionSortOptimal {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;

            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j]; // Shift right
                j--;
            }
            arr[j + 1] = key; // Insert into vacancy
        }
    }
}`,
        timeComplexity: "O(N) best case (nearly sorted), O(N^2) worst case",
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
      title: "Heap Sort",
      slug: "heap-sort",
      difficulty: Difficulty.MEDIUM,
      order: 6,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Heap Sort is a comparison-based sorting technique based on a Binary Heap data structure. It is similar to selection sort where we first find the maximum element and place the maximum element at the end.",
      inputFormat: "An integer array `nums`.",
      outputFormat: "Return the sorted array in ascending order.",
      constraints: "1 <= nums.length <= 50,000",
      examples: [
        {
          input: "nums = [4, 10, 3, 5, 1]",
          output: "[1, 3, 4, 5, 10]",
          explanation: "Build max-heap in O(N), repeatedly extract root and heapify.",
        },
      ],
      explanation:
        "Heap Sort first converts the array into a Max-Heap in O(N) time bottom-up. Then it swaps the root (maximum) with the last element and restores the heap property in O(log N). Total runtime is guaranteed O(N log N) with O(1) extra space.",
      bruteForce: {
        title: "Using Java PriorityQueue",
        explanation:
          "Push all elements into Java's min-priority queue and poll them out. Takes extra O(N) memory.",
        javaCode: `import java.util.PriorityQueue;

public class HeapSortPQ {
    public static int[] sort(int[] nums) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : nums) pq.offer(x);
        for (int i = 0; i < nums.length; i++) nums[i] = pq.poll();
        return nums;
    }
}`,
        timeComplexity: "O(N log N)",
        spaceComplexity: "O(N) extra memory",
      },
      optimal: {
        title: "In-Place Array Max-Heap Sort",
        explanation:
          "Build max-heap in-place from index `(n/2)-1` down to 0. Extract elements to the end and sift down iteratively.",
        javaCode: `public class HeapSortOptimal {
    public static void sort(int[] arr) {
        int n = arr.length;

        // Step 1: Build max-heap bottom-up in O(N)
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(arr, n, i);
        }

        // Step 2: Extract elements from heap one by one
        for (int i = n - 1; i > 0; i--) {
            int temp = arr[0];
            arr[0] = arr[i];
            arr[i] = temp;

            heapify(arr, i, 0); // Sift root down
        }
    }

    private static void heapify(int[] arr, int n, int i) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;

        if (largest != i) {
            int swap = arr[i];
            arr[i] = arr[largest];
            arr[largest] = swap;

            heapify(arr, n, largest);
        }
    }
}`,
        timeComplexity: "O(N log N) guaranteed best, average, and worst case",
        spaceComplexity: "O(1) auxiliary space (in-place)",
      },
      notes: [
        {
          title: "Heap Sort — Complete Binary Heap & Heapify",
          fileUrl: "/notes/heapsort.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
      ],
    },
    {
      title: "Counting Sort",
      slug: "counting-sort",
      difficulty: Difficulty.MEDIUM,
      order: 7,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Counting Sort is a non-comparison integer sorting algorithm that operates by counting the number of objects that possess distinct key values, then applying prefix sums to determine positions in the output sequence.",
      inputFormat: "An integer array `nums` where values lie in a bounded range `[min, max]`.",
      outputFormat: "Return the sorted array.",
      constraints: "1 <= nums.length <= 100,000\n-50,000 <= nums[i] <= 50,000",
      examples: [
        {
          input: "nums = [4, 2, 2, 8, 3, 3, 1]",
          output: "[1, 2, 2, 3, 3, 4, 8]",
          explanation: "Counts: 1:1, 2:2, 3:2, 4:1, 8:1. Placed in linear O(N+K) time.",
        },
      ],
      explanation:
        "Unlike comparison sorts bounded by Omega(N log N), Counting Sort achieves O(N + K) linear time where K is the range of keys. It is stable when traversed backward from `n-1` down to 0.",
      bruteForce: {
        title: "Direct Overwrite Counting Sort (Unstable)",
        explanation: "Overwrites original array directly from counts. Destroys satellite data.",
        javaCode: `public class CountingSortUnstable {
    public static void sort(int[] arr, int min, int max) {
        int[] count = new int[max - min + 1];
        for (int x : arr) count[x - min]++;
        int idx = 0;
        for (int i = 0; i < count.length; i++) {
            while (count[i]-- > 0) arr[idx++] = i + min;
        }
    }
}`,
        timeComplexity: "O(N + K)",
        spaceComplexity: "O(K) count array",
      },
      optimal: {
        title: "Stable Prefix-Sum Counting Sort",
        explanation:
          "Computes prefix sums of counts to find exact final indexes. Traverses backward to preserve relative order of duplicate elements.",
        javaCode: `public class CountingSortStable {
    public static int[] sort(int[] arr) {
        if (arr.length <= 1) return arr;
        int min = arr[0], max = arr[0];
        for (int x : arr) {
            if (x < min) min = x;
            if (x > max) max = x;
        }

        int k = max - min + 1;
        int[] count = new int[k];
        for (int x : arr) count[x - min]++;

        // Prefix sum accumulation
        for (int i = 1; i < k; i++) count[i] += count[i - 1];

        int[] output = new int[arr.length];
        for (int i = arr.length - 1; i >= 0; i--) {
            output[--count[arr[i] - min]] = arr[i];
        }
        System.arraycopy(output, 0, arr, 0, arr.length);
        return arr;
    }
}`,
        timeComplexity: "O(N + K) where K is the key range",
        spaceComplexity: "O(N + K) output array + count array",
      },
      notes: [
        {
          title: "Counting Sort — Non-Comparison Integer Sort",
          fileUrl: "/notes/countingsort.svg",
          fileType: NoteFileType.IMAGE,
          pageCount: 1,
          isProtected: false,
          order: 1,
        },
      ],
    },
    {
      title: "Radix Sort",
      slug: "radix-sort",
      difficulty: Difficulty.MEDIUM,
      order: 8,
      isFree: true,
      price: 0,
      leetcodeUrl: "https://leetcode.com/problems/sort-an-array/",
      description:
        "Radix Sort sorts data with integer keys by grouping keys by the individual digits which share the same significant position and value (LSD or MSD).",
      inputFormat: "An integer array `nums`.",
      outputFormat: "Return the sorted array in non-decreasing order.",
      constraints: "1 <= nums.length <= 50,000",
      examples: [
        {
          input: "nums = [170, 45, 75, 90, 802, 24, 2, 66]",
          output: "[2, 24, 45, 66, 75, 90, 170, 802]",
          explanation: "Sorted digit-by-digit: 1s place, then 10s place, then 100s place.",
        },
      ],
      explanation:
        "LSD (Least Significant Digit) Radix Sort sorts the numbers starting from the units digit up to the most significant digit using a stable sorting subroutine like Counting Sort for each digit place.",
      bruteForce: {
        title: "Base-10 LSD Radix Sort for Non-Negative Integers",
        explanation: "Processes 10 digits using standard modulo arithmetic.",
        javaCode: `public class RadixSortBase10 {
    public static void sort(int[] arr) {
        int max = 0;
        for (int x : arr) if (x > max) max = x;

        for (int exp = 1; max / exp > 0; exp *= 10) {
            countSort(arr, exp);
        }
    }

    private static void countSort(int[] arr, int exp) {
        int[] output = new int[arr.length];
        int[] count = new int[10];

        for (int x : arr) count[(x / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];

        for (int i = arr.length - 1; i >= 0; i--) {
            int digit = (arr[i] / exp) % 10;
            output[--count[digit]] = arr[i];
        }
        System.arraycopy(output, 0, arr, 0, arr.length);
    }
}`,
        timeComplexity: "O(D * (N + 10)) where D is number of digits",
        spaceComplexity: "O(N) output buffer",
      },
      optimal: {
        title: "Radix Sort Supporting Negative & Positive Integers",
        explanation:
          "Splits array into negative and positive buckets, sorts negative numbers in reverse order by taking absolute values, and combines them in O(N).",
        javaCode: `import java.util.ArrayList;
import java.util.List;

public class RadixSortFull {
    public int[] sortArray(int[] nums) {
        List<Integer> neg = new ArrayList<>();
        List<Integer> pos = new ArrayList<>();

        for (int x : nums) {
            if (x < 0) neg.add(-x);
            else pos.add(x);
        }

        int[] negArr = neg.stream().mapToInt(i -> i).toArray();
        int[] posArr = pos.stream().mapToInt(i -> i).toArray();

        radixSortLSD(negArr);
        radixSortLSD(posArr);

        int idx = 0;
        for (int i = negArr.length - 1; i >= 0; i--) nums[idx++] = -negArr[i];
        for (int x : posArr) nums[idx++] = x;
        return nums;
    }

    private void radixSortLSD(int[] arr) {
        if (arr.length <= 1) return;
        int max = arr[0];
        for (int x : arr) if (x > max) max = x;

        for (int exp = 1; max / exp > 0; exp *= 10) {
            int[] output = new int[arr.length];
            int[] count = new int[10];

            for (int x : arr) count[(x / exp) % 10]++;
            for (int i = 1; i < 10; i++) count[i] += count[i - 1];
            for (int i = arr.length - 1; i >= 0; i--) {
                output[--count[(arr[i] / exp) % 10]] = arr[i];
            }
            System.arraycopy(output, 0, arr, 0, arr.length);
        }
    }
}`,
        timeComplexity: "O(D * (N + K)) where D = log_K(max)",
        spaceComplexity: "O(N + K) auxiliary memory",
      },
      notes: [
        {
          title: "Radix Sort — Digit-by-Digit Linear Sort",
          fileUrl: "/notes/radixsort.svg",
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

    // Create brute force approach
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

    // Create optimal approach
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

    // Create handwritten notes
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
  console.log(`✅ Seeded all 8 Sorting problems with Java codes & notes`);

  // 5. Seed Premium Problem in Arrays Category (Two Sum)
  const twoSumProblem = await prisma.problem.upsert({
    where: { slug: "two-sum" },
    update: {
      categoryId: arraysCategoryId,
      isFree: false,
      price: 49,
    },
    create: {
      title: "Two Sum",
      slug: "two-sum",
      difficulty: Difficulty.EASY,
      order: 1,
      isFree: false,
      price: 49,
      categoryId: arraysCategoryId,
      leetcodeUrl: "https://leetcode.com/problems/two-sum/",
      description:
        "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      inputFormat: "An integer array `nums` and an integer `target`.",
      outputFormat: "Indices of two numbers in array `[i, j]`.",
      constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
      examples: [
        {
          input: "nums = [2, 7, 11, 15], target = 9",
          output: "[0, 1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
        },
      ],
      explanation:
        "By utilizing a Hash Map, we can trade O(N) auxiliary space to achieve an optimal O(N) runtime by looking up the required complement `(target - nums[i])` in O(1) average time.",
    },
  });

  await prisma.problemCode.upsert({
    where: {
      problemId_approachType: {
        problemId: twoSumProblem.id,
        approachType: ApproachType.BRUTE_FORCE,
      },
    },
    update: {},
    create: {
      problemId: twoSumProblem.id,
      approachType: ApproachType.BRUTE_FORCE,
      title: "Brute Force Nested Loops",
      explanation: "Check all pairs `(i, j)` and test if `nums[i] + nums[j] == target`.",
      javaCode: `public class TwoSumBruteForce {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[] { i, j };
                }
            }
        }
        return new int[0];
    }
}`,
      timeComplexity: "O(N^2)",
      spaceComplexity: "O(1)",
    },
  });

  await prisma.problemCode.upsert({
    where: {
      problemId_approachType: {
        problemId: twoSumProblem.id,
        approachType: ApproachType.OPTIMAL,
      },
    },
    update: {},
    create: {
      problemId: twoSumProblem.id,
      approachType: ApproachType.OPTIMAL,
      title: "One-Pass Hash Map Lookup",
      explanation:
        "Iterate through `nums` while keeping track of visited values and their indices in a `HashMap`. Check for `target - nums[i]` on every step.",
      javaCode: `import java.util.HashMap;
import java.util.Map;

public class TwoSumOptimal {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        throw new IllegalArgumentException("No two sum solution found");
    }
}`,
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
    },
  });

  await prisma.handwrittenNote.deleteMany({
    where: { problemId: twoSumProblem.id },
  });

  await prisma.handwrittenNote.create({
    data: {
      problemId: twoSumProblem.id,
      title: "Two Sum — One-Pass Hash Map Technique",
      fileUrl: "/notes/twosum.svg",
      fileType: NoteFileType.IMAGE,
      pageCount: 1,
      isProtected: true,
      order: 1,
    },
  });

  // 6. Seed Premium Problem in DP Category (0/1 Knapsack)
  const knapsackProblem = await prisma.problem.upsert({
    where: { slug: "0-1-knapsack" },
    update: {
      categoryId: dpCategoryId,
      isFree: false,
      price: 69,
    },
    create: {
      title: "0/1 Knapsack Problem",
      slug: "0-1-knapsack",
      difficulty: Difficulty.MEDIUM,
      order: 1,
      isFree: false,
      price: 69,
      categoryId: dpCategoryId,
      leetcodeUrl: "https://leetcode.com/problems/partition-equal-subset-sum/",
      description:
        "Given weights and values of `N` items, put these items in a knapsack of capacity `W` to get the maximum total value in the knapsack. Each item can either be selected once or skipped.",
      inputFormat: "`val[]`, `wt[]`, `W`",
      outputFormat: "Maximum profit achievable without exceeding capacity `W`.",
      constraints: "1 <= N <= 1000\n1 <= W <= 1000",
      examples: [
        {
          input: "val = [60, 100, 120], wt = [10, 20, 30], W = 50",
          output: "220",
          explanation: "Pick 2nd and 3rd items: 100 + 120 = 220, wt = 20 + 30 = 50 <= 50.",
        },
      ],
      explanation:
        "The state `dp[i][w]` represents the maximum profit using a subset of the first `i` items with a knapsack capacity of `w`. At each item, we decide whether to include it or exclude it.",
    },
  });

  await prisma.problemCode.upsert({
    where: {
      problemId_approachType: {
        problemId: knapsackProblem.id,
        approachType: ApproachType.BRUTE_FORCE,
      },
    },
    update: {},
    create: {
      problemId: knapsackProblem.id,
      approachType: ApproachType.BRUTE_FORCE,
      title: "Recursive Exploration (Exhaustive Search)",
      explanation: "Branch into 2 choices (include/exclude) for every item.",
      javaCode: `public class KnapsackRecursive {
    public static int knapSack(int W, int[] wt, int[] val, int n) {
        if (n == 0 || W == 0) return 0;
        if (wt[n - 1] > W) return knapSack(W, wt, val, n - 1);
        return Math.max(
            val[n - 1] + knapSack(W - wt[n - 1], wt, val, n - 1),
            knapSack(W, wt, val, n - 1)
        );
    }
}`,
      timeComplexity: "O(2^N) exponential",
      spaceComplexity: "O(N) recursion stack",
    },
  });

  await prisma.problemCode.upsert({
    where: {
      problemId_approachType: {
        problemId: knapsackProblem.id,
        approachType: ApproachType.OPTIMAL,
      },
    },
    update: {},
    create: {
      problemId: knapsackProblem.id,
      approachType: ApproachType.OPTIMAL,
      title: "1D Array Space-Optimized Dynamic Programming",
      explanation:
        "Traverse capacities backwards `from W down to wt[i]` so that values from previous iterations are not overwritten prematurely.",
      javaCode: `public class KnapsackOptimal {
    public static int knapSack(int W, int[] wt, int[] val, int n) {
        int[] dp = new int[W + 1];

        for (int i = 0; i < n; i++) {
            // Traverse backwards to avoid taking the same item multiple times
            for (int w = W; w >= wt[i]; w--) {
                dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);
            }
        }
        return dp[W];
    }
}`,
      timeComplexity: "O(N * W)",
      spaceComplexity: "O(W) optimized 1D array",
    },
  });

  await prisma.handwrittenNote.deleteMany({
    where: { problemId: knapsackProblem.id },
  });

  await prisma.handwrittenNote.create({
    data: {
      problemId: knapsackProblem.id,
      title: "0/1 Knapsack — 2D DP Table & State Equations",
      fileUrl: "/notes/knapsack.svg",
      fileType: NoteFileType.IMAGE,
      pageCount: 1,
      isProtected: true,
      order: 1,
    },
  });

  await prisma.handwrittenNote.create({
    data: {
      problemId: knapsackProblem.id,
      title: "Dynamic Programming — Handwritten Table Blueprints PDF",
      fileUrl: "/notes/dp-mastery.pdf",
      fileType: NoteFileType.PDF,
      pageCount: 1,
      isProtected: true,
      order: 2,
    },
  });

  console.log("🎉 BeeNext database successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
