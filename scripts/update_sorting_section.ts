import prisma from "../src/lib/prisma";

export async function updateSortingSection() {
  console.log("=== UPDATING SORTING SECTION ===");

  // 1. Locate Sorting category
  const sortingCategory = await prisma.category.findUnique({
    where: { slug: "sorting" },
  });

  if (!sortingCategory) {
    throw new Error("Sorting category not found in database!");
  }

  // 2. Remove count-inversions or any other problem from Sorting
  await prisma.problem.deleteMany({
    where: {
      categoryId: sortingCategory.id,
      slug: { notIn: [
        "selection-sort",
        "bubble-sort",
        "insertion-sort",
        "merge-sort",
        "quick-sort",
        "recursive-bubble-sort",
        "recursive-insertion-sort"
      ]}
    },
  });

  // 3. Define the exact 7 sorting problems
  const sortingData = [
    {
      title: "Selection Sort",
      slug: "selection-sort",
      order: 1,
      youtubeUrl: "https://www.youtube.com/watch?v=HGk_ypEuS24",
      leetcodeUrl: null,
      timeComplexity: "O(N²)",
      spaceComplexity: "O(1)",
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
    },
    {
      title: "Bubble Sort",
      slug: "bubble-sort",
      order: 2,
      youtubeUrl: "https://www.youtube.com/watch?v=HGk_ypEuS24",
      leetcodeUrl: null,
      timeComplexity: "O(N²)",
      spaceComplexity: "O(1)",
      javaCode: `public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = n - 1; i >= 1; i--) {
            boolean didSwap = false;
            for (int j = 0; j <= i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    didSwap = true;
                }
            }
            if (!didSwap) break;
        }
    }
}`,
    },
    {
      title: "Insertion Sort",
      slug: "insertion-sort",
      order: 3,
      youtubeUrl: "https://www.youtube.com/watch?v=HGk_ypEuS24",
      leetcodeUrl: null,
      timeComplexity: "O(N²)",
      spaceComplexity: "O(1)",
      javaCode: `public class InsertionSort {
    public static void insertionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i <= n - 1; i++) {
            int j = i;
            while (j > 0 && arr[j - 1] > arr[j]) {
                int temp = arr[j - 1];
                arr[j - 1] = arr[j];
                arr[j] = temp;
                j--;
            }
        }
    }
}`,
    },
    {
      title: "Merge Sort",
      slug: "merge-sort",
      order: 4,
      youtubeUrl: "https://www.youtube.com/watch?v=ogjf7ORKfd8",
      leetcodeUrl: null,
      timeComplexity: "O(N log N)",
      spaceComplexity: "O(N)",
      javaCode: `import java.util.ArrayList;

public class MergeSort {
    private static void merge(int[] arr, int low, int mid, int high) {
        ArrayList<Integer> temp = new ArrayList<>();
        int left = low;
        int right = mid + 1;

        while (left <= mid && right <= high) {
            if (arr[left] <= arr[right]) {
                temp.add(arr[left]);
                left++;
            } else {
                temp.add(arr[right]);
                right++;
            }
        }

        while (left <= mid) {
            temp.add(arr[left]);
            left++;
        }

        while (right <= high) {
            temp.add(arr[right]);
            right++;
        }

        for (int i = low; i <= high; i++) {
            arr[i] = temp.get(i - low);
        }
    }

    public static void mergeSort(int[] arr, int low, int high) {
        if (low >= high) return;
        int mid = (low + high) / 2;
        mergeSort(arr, low, mid);
        mergeSort(arr, mid + 1, high);
        merge(arr, low, mid, high);
    }
}`,
    },
    {
      title: "Quick Sort",
      slug: "quick-sort",
      order: 5,
      youtubeUrl: "https://www.youtube.com/watch?v=WIrA4YexLRQ",
      leetcodeUrl: null,
      timeComplexity: "O(N log N)",
      spaceComplexity: "O(1)",
      javaCode: `public class QuickSort {
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[low];
        int i = low;
        int j = high;

        while (i < j) {
            while (arr[i] <= pivot && i <= high - 1) {
                i++;
            }
            while (arr[j] > pivot && j >= low + 1) {
                j--;
            }
            if (i < j) {
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[low];
        arr[low] = arr[j];
        arr[j] = temp;
        return j;
    }

    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pIndex = partition(arr, low, high);
            quickSort(arr, low, pIndex - 1);
            quickSort(arr, pIndex + 1, high);
        }
    }
}`,
    },
    {
      title: "Recursive Bubble Sort",
      slug: "recursive-bubble-sort",
      order: 6,
      youtubeUrl: null,
      leetcodeUrl: null,
      timeComplexity: "O(N²)",
      spaceComplexity: "O(N)",
      javaCode: `public class RecursiveBubbleSort {
    public static void bubbleSort(int[] arr, int n) {
        if (n == 1) return;

        boolean didSwap = false;
        for (int j = 0; j <= n - 2; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                didSwap = true;
            }
        }

        if (!didSwap) return;

        bubbleSort(arr, n - 1);
    }
}`,
    },
    {
      title: "Recursive Insertion Sort",
      slug: "recursive-insertion-sort",
      order: 7,
      youtubeUrl: null,
      leetcodeUrl: null,
      timeComplexity: "O(N²)",
      spaceComplexity: "O(N)",
      javaCode: `public class RecursiveInsertionSort {
    public static void insertionSort(int[] arr, int i, int n) {
        if (i == n) return;

        int j = i;
        while (j > 0 && arr[j - 1] > arr[j]) {
            int temp = arr[j - 1];
            arr[j - 1] = arr[j];
            arr[j] = temp;
            j--;
        }

        insertionSort(arr, i + 1, n);
    }
}`,
    },
  ];

  for (const item of sortingData) {
    // 1. Upsert Problem
    const problem = await prisma.problem.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        order: item.order,
        categoryId: sortingCategory.id,
        youtubeUrl: item.youtubeUrl,
        leetcodeUrl: item.leetcodeUrl,
        isFree: true,
        price: 0,
      },
      create: {
        title: item.title,
        slug: item.slug,
        order: item.order,
        categoryId: sortingCategory.id,
        youtubeUrl: item.youtubeUrl,
        leetcodeUrl: item.leetcodeUrl,
        isFree: true,
        price: 0,
        description: `Implementation of ${item.title} in Java.`,
      },
    });

    // 2. Upsert Brute Force Code
    await prisma.problemCode.upsert({
      where: {
        problemId_approachType: {
          problemId: problem.id,
          approachType: "BRUTE_FORCE",
        },
      },
      update: {
        javaCode: item.javaCode,
        timeComplexity: item.timeComplexity,
        spaceComplexity: item.spaceComplexity,
        title: `${item.title} Solution`,
        explanation: "",
      },
      create: {
        problemId: problem.id,
        approachType: "BRUTE_FORCE",
        javaCode: item.javaCode,
        timeComplexity: item.timeComplexity,
        spaceComplexity: item.spaceComplexity,
        title: `${item.title} Solution`,
        explanation: "",
      },
    });

    // 3. Upsert Optimal Code (IDENTICAL to Brute Force)
    await prisma.problemCode.upsert({
      where: {
        problemId_approachType: {
          problemId: problem.id,
          approachType: "OPTIMAL",
        },
      },
      update: {
        javaCode: item.javaCode,
        timeComplexity: item.timeComplexity,
        spaceComplexity: item.spaceComplexity,
        title: `${item.title} Solution`,
        explanation: "",
      },
      create: {
        problemId: problem.id,
        approachType: "OPTIMAL",
        javaCode: item.javaCode,
        timeComplexity: item.timeComplexity,
        spaceComplexity: item.spaceComplexity,
        title: `${item.title} Solution`,
        explanation: "",
      },
    });

    console.log(`✓ Seeded ${item.order}. ${item.title} (YT: ${item.youtubeUrl ? "Active" : "Disabled"}, LC: Disabled)`);
  }

  console.log("=== SORTING SECTION UPDATE COMPLETE ===");
}

if (require.main === module) {
  updateSortingSection()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
