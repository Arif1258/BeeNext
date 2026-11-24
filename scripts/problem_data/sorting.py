from .common import make_prob

SORTING_PROBLEMS = {
    "selection-sort": make_prob(
        "Given an unsorted array of integers `nums`, sort the array in non-decreasing (ascending) order using the Selection Sort algorithm.\n\nIn Selection Sort, the algorithm repeatedly finds the minimum element from the unsorted subarray and swaps it with the first unsorted element, gradually expanding the sorted portion.",
        "First line contains integer n representing array length, followed by n space-separated integers in nums.",
        "Return the array sorted in ascending order.",
        "1 <= nums.length <= 10^4\n-10^5 <= nums[i] <= 10^5",
        [
            {"input": "nums = [13, 46, 24, 52, 20, 9]", "output": "[9, 13, 20, 24, 46, 52]", "explanation": "In round 1, minimum is 9 (swapped with 13). In round 2, minimum is 13 (swapped with 46), and so on."},
            {"input": "nums = [5, 4, 3, 2, 1]", "output": "[1, 2, 3, 4, 5]", "explanation": "The entire array is in reverse order, each step places the smallest remaining integer at the current index."}
        ]
    ),
    "bubble-sort": make_prob(
        "Given an integer array `nums`, sort the array in ascending order using the Bubble Sort algorithm.\n\nBubble sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. You can optimize by stopping early if no swaps occurred in a pass.",
        "First line contains integer n, followed by n space-separated integers in nums.",
        "Return the sorted array in non-decreasing order.",
        "1 <= nums.length <= 10^4\n-10^5 <= nums[i] <= 10^5",
        [
            {"input": "nums = [64, 34, 25, 12, 22, 11, 90]", "output": "[11, 12, 22, 25, 34, 64, 90]", "explanation": "Largest elements bubble up to the right end on each outer iteration."},
            {"input": "nums = [5, 1, 4, 2, 8]", "output": "[1, 2, 4, 5, 8]", "explanation": "Comparing pairs (5,1)->(1,5), (5,4)->(4,5), (5,2)->(2,5), (5,8) gives [1,4,2,5,8], subsequent passes fully sort the array."}
        ]
    ),
    "insertion-sort": make_prob(
        "Given an integer array `nums`, sort the array using the Insertion Sort algorithm.\n\nInsertion Sort works similar to the way you sort playing cards in your hands. Array is virtually split into a sorted and an unsorted part. Values from the unsorted part are picked and placed at the correct position in the sorted part.",
        "An integer array nums.",
        "Return the array sorted in ascending order.",
        "1 <= nums.length <= 10^4\n-10^5 <= nums[i] <= 10^5",
        [
            {"input": "nums = [12, 11, 13, 5, 6]", "output": "[5, 6, 11, 12, 13]", "explanation": "Elements before the current index are shifted rightwards if greater than the key to make room."},
            {"input": "nums = [3, 1, 2]", "output": "[1, 2, 3]", "explanation": "1 is inserted before 3 giving [1,3,2], then 2 is inserted between 1 and 3 giving [1,2,3]."}
        ]
    ),
    "merge-sort": make_prob(
        "Given an array of integers `nums`, sort the array in ascending order using the Merge Sort algorithm.\n\nMerge Sort is an efficient, comparison-based, divide-and-conquer algorithm. It recursively splits the array into two halves until single elements remain, sorts each half, and merges the sorted halves together in O(N log N) time.",
        "An integer array nums.",
        "Return the array sorted in ascending order.",
        "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        [
            {"input": "nums = [5, 2, 3, 1]", "output": "[1, 2, 3, 5]", "explanation": "Splits into [5,2] and [3,1], sorts to [2,5] and [1,3], merges to [1,2,3,5]."},
            {"input": "nums = [5, 1, 1, 2, 0, 0]", "output": "[0, 0, 1, 1, 2, 5]", "explanation": "Duplicate elements are handled stably while sorting in O(N log N)."}
        ]
    ),
    "quick-sort": make_prob(
        "Given an array of integers `nums`, sort the array in ascending order using the Quick Sort algorithm.\n\nQuick Sort is a divide-and-conquer algorithm. It picks an element as a pivot (e.g., first, last, or random element) and partitions the given array around the picked pivot such that smaller elements go left and larger elements go right.",
        "An integer array nums.",
        "Return the array sorted in non-decreasing order.",
        "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        [
            {"input": "nums = [5, 2, 3, 1]", "output": "[1, 2, 3, 5]", "explanation": "Using pivot 5 (or any chosen pivot), partitions and recursively sorts left and right subarrays."},
            {"input": "nums = [10, 7, 8, 9, 1, 5]", "output": "[1, 5, 7, 8, 9, 10]", "explanation": "Recursive partitioning around pivots sorts the sequence efficiently in-place."}
        ]
    ),
    "recursive-bubble-sort": make_prob(
        "Given an array of integers `nums`, sort the array using a recursive implementation of Bubble Sort.\n\nIn recursive Bubble Sort, the base case is when the array size is 1 (already sorted). In the recursive step, perform one complete pass of bubble sort to move the largest element to the end of the current subarray, and recursively sort the first n-1 elements.",
        "An array of integers nums and its length n.",
        "Return the array sorted in ascending order.",
        "1 <= nums.length <= 10^4\n-10^5 <= nums[i] <= 10^5",
        [
            {"input": "nums = [5, 1, 4, 2, 8]", "output": "[1, 2, 4, 5, 8]", "explanation": "Pass 1 moves 8 to index 4. The function then recursively calls itself with array size n-1 (size 4)."},
            {"input": "nums = [64, 25, 12, 22, 11]", "output": "[11, 12, 22, 25, 64]", "explanation": "Each recursive call fixes one largest element at the current tail position."}
        ]
    ),
    "recursive-insertion-sort": make_prob(
        "Given an array of integers `nums`, sort the array using a recursive implementation of Insertion Sort.\n\nBase case: If array size is 1 or less, return immediately. Inductive step: Recursively sort the first n-1 elements, then insert the last element at its correct position in the sorted prefix.",
        "An array of integers nums and its length n.",
        "Return the array sorted in ascending order.",
        "1 <= nums.length <= 10^4\n-10^5 <= nums[i] <= 10^5",
        [
            {"input": "nums = [4, 3, 2, 10, 12, 1, 5, 6]", "output": "[1, 2, 3, 4, 5, 6, 10, 12]", "explanation": "Recursively sorts [0..n-2], then shifts elements rightwards to insert nums[n-1]."},
            {"input": "nums = [5, 4, 3, 2, 1]", "output": "[1, 2, 3, 4, 5]", "explanation": "Prefix of size 1 is sorted, then 4 is inserted, then 3, then 2, then 1."}
        ]
    ),
}
