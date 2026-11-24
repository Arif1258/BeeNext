from .common import make_prob

BINARY_SEARCH_DATA = {
    "search-x-in-sorted-array": make_prob(
        description="Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
        input_format="A sorted integer array `nums` of length `n` and an integer `target`.",
        output_format="Return the 0-based index of `target`, or -1 if not found.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i], target <= 10^9\nAll elements in nums are unique and sorted in ascending order.",
        examples=[
            {
                "input": "nums = [-1, 0, 3, 5, 9, 12], target = 9",
                "output": "4",
                "explanation": "9 exists in nums and its index is 4."
            },
            {
                "input": "nums = [-1, 0, 3, 5, 9, 12], target = 2",
                "output": "-1",
                "explanation": "2 does not exist in nums so return -1."
            }
        ]
    ),

    "lower-bound-": make_prob(
        description="Given a sorted array `nums` of `n` integers and an integer `x`, find the lower bound of `x`. The lower bound is the smallest index `i` such that `nums[i] >= x`. If all elements are smaller than `x`, the lower bound is `n` (the length of the array). Solve in O(log n) time.",
        input_format="A sorted integer array `nums` and an integer `x`.",
        output_format="Return the lower bound index `i` (0 <= i <= n).",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i], x <= 10^9\nnums is sorted in non-decreasing order.",
        examples=[
            {
                "input": "nums = [1, 2, 8, 10, 11, 12, 19], x = 5",
                "output": "2",
                "explanation": "Smallest index where element >= 5 is index 2 (element 8)."
            },
            {
                "input": "nums = [1, 2, 8, 10, 11, 12, 19], x = 20",
                "output": "7",
                "explanation": "All elements are smaller than 20, so return index n = 7."
            }
        ]
    ),

    "upper-bound": make_prob(
        description="Given a sorted array `nums` of `n` integers and an integer `x`, find the upper bound of `x`. The upper bound algorithm finds the first or smallest index in a sorted array where the value is strictly greater than `x` (`nums[i] > x`). If all elements are less than or equal to `x`, return `n`. Solve in O(log n) time.",
        input_format="A sorted integer array `nums` and an integer `x`.",
        output_format="Return the smallest index `i` such that `nums[i] > x`.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i], x <= 10^9\nnums is sorted in non-decreasing order.",
        examples=[
            {
                "input": "nums = [2, 3, 6, 7, 8, 8, 11, 11, 11, 12], x = 6",
                "output": "3",
                "explanation": "Smallest index where nums[i] > 6 is index 3 (element 7)."
            },
            {
                "input": "nums = [2, 3, 6, 7, 8, 8, 11, 11, 11, 12], x = 12",
                "output": "10",
                "explanation": "No element is strictly greater than 12, so return n = 10."
            }
        ]
    ),

    "search-insert-position": make_prob(
        description="Given a sorted array of distinct integers `nums` and a target value `target`, return the index if the target is found. If not, return the index where it would be if it were inserted in order. You must write an algorithm with O(log n) runtime complexity.",
        input_format="A sorted distinct integer array `nums` and an integer `target`.",
        output_format="Return the insertion position index.",
        constraints="1 <= nums.length <= 10^4\n-10^4 <= nums[i], target <= 10^4\nnums contains distinct values sorted in ascending order.",
        examples=[
            {
                "input": "nums = [1, 3, 5, 6], target = 5",
                "output": "2",
                "explanation": "5 is found at index 2."
            },
            {
                "input": "nums = [1, 3, 5, 6], target = 2",
                "output": "1",
                "explanation": "2 should be inserted at index 1."
            }
        ]
    ),

    "floor-and-ceil-in-sorted-array": make_prob(
        description="Given a sorted array `nums` and an integer `x`, find the Floor and Ceiling of `x` in `nums`. The floor of `x` is the largest element in the array smaller than or equal to `x` (`nums[i] <= x`). The ceiling of `x` is the smallest element in the array greater than or equal to `x` (`nums[i] >= x`). If floor or ceil does not exist, return -1 for that value. Return `[floor, ceil]`.",
        input_format="A sorted integer array `nums` and an integer `x`.",
        output_format="Return an array of two integers `[floor, ceil]`.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i], x <= 10^9",
        examples=[
            {
                "input": "nums = [3, 4, 4, 7, 8, 10], x = 5",
                "output": "[4, 7]",
                "explanation": "Largest element <= 5 is 4; smallest element >= 5 is 7."
            },
            {
                "input": "nums = [3, 4, 4, 7, 8, 10], x = 2",
                "output": "[-1, 3]",
                "explanation": "No element <= 2 exists, so floor is -1. Ceil is 3."
            }
        ]
    ),

    "first-and-last-occurrence": make_prob(
        description="Given an array of integers `nums` sorted in non-decreasing order, find the starting and ending position of a given `target` value. If `target` is not found in the array, return `[-1, -1]`. You must write an algorithm with O(log n) runtime complexity using two binary searches.",
        input_format="A sorted integer array `nums` and target integer `target`.",
        output_format="Return `[firstIndex, lastIndex]`.",
        constraints="0 <= nums.length <= 10^5\n-10^9 <= nums[i], target <= 10^9\nnums is sorted in non-decreasing order.",
        examples=[
            {
                "input": "nums = [5, 7, 7, 8, 8, 10], target = 8",
                "output": "[3, 4]",
                "explanation": "Target 8 appears first at index 3 and last at index 4."
            },
            {
                "input": "nums = [5, 7, 7, 8, 8, 10], target = 6",
                "output": "[-1, -1]",
                "explanation": "Target 6 is not in the array."
            }
        ]
    ),

    "search-in-rotated-sorted-array-i": make_prob(
        description="There is an integer array `nums` sorted in ascending order with distinct values. Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or -1 if it is not in `nums`. You must write an algorithm with O(log n) runtime complexity.",
        input_format="An integer array `nums` rotated at an unknown pivot, and integer `target`.",
        output_format="Return the index of `target`, or -1.",
        constraints="1 <= nums.length <= 5000\n-10^4 <= nums[i], target <= 10^4\nAll values of nums are unique.",
        examples=[
            {
                "input": "nums = [4, 5, 6, 7, 0, 1, 2], target = 0",
                "output": "4",
                "explanation": "0 is found at index 4."
            },
            {
                "input": "nums = [4, 5, 6, 7, 0, 1, 2], target = 3",
                "output": "-1",
                "explanation": "3 does not exist in the array."
            }
        ]
    ),

    "search-in-rotated-sorted-array-2": make_prob(
        description="There is an integer array `nums` sorted in non-decreasing order (not necessarily distinct values). Given the rotated array `nums` and an integer `target`, return `true` if `target` is in `nums`, or `false` if it is not in `nums`. Handle duplicates where `nums[low] == nums[mid] == nums[high]` by trimming search boundaries.",
        input_format="A rotated sorted array `nums` that may contain duplicate values, and integer `target`.",
        output_format="Return boolean `true` if target exists, else `false`.",
        constraints="1 <= nums.length <= 5000\n-10^4 <= nums[i], target <= 10^4",
        examples=[
            {
                "input": "nums = [2, 5, 6, 0, 0, 1, 2], target = 0",
                "output": "true",
                "explanation": "0 is present in the array."
            },
            {
                "input": "nums = [2, 5, 6, 0, 0, 1, 2], target = 3",
                "output": "false",
                "explanation": "3 is not in the array."
            }
        ]
    ),

    "find-minimum-in-rotated-sorted-array": make_prob(
        description="Suppose an array of length `n` sorted in ascending order with unique elements is rotated between 1 and `n` times. Given the sorted rotated array `nums` of unique elements, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.",
        input_format="An integer array `nums` of unique elements sorted and rotated.",
        output_format="Return the minimum integer element in `nums`.",
        constraints="n == nums.length\n1 <= n <= 5000\n-5000 <= nums[i] <= 5000\nAll values are unique.",
        examples=[
            {
                "input": "nums = [3, 4, 5, 1, 2]",
                "output": "1",
                "explanation": "The original array was [1, 2, 3, 4, 5] rotated 3 times. The minimum is 1."
            },
            {
                "input": "nums = [4, 5, 6, 7, 0, 1, 2]",
                "output": "0",
                "explanation": "The minimum element is 0."
            }
        ]
    ),

    "find-out-how-many-times-the-array-is-rotated": make_prob(
        description="Given an integer array `nums` of distinct elements which was initially sorted in ascending order and then rotated an unknown number of times clockwise, find the rotation count. The rotation count is equal to the index of the minimum element in the array. Solve in O(log n) time.",
        input_format="A rotated sorted array `nums` of distinct integers.",
        output_format="Return an integer representing the rotation count.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\nAll elements are distinct.",
        examples=[
            {
                "input": "nums = [5, 1, 2, 3, 4]",
                "output": "1",
                "explanation": "The minimum element is 1 at index 1, meaning the array was rotated 1 time."
            },
            {
                "input": "nums = [1, 2, 3, 4, 5]",
                "output": "0",
                "explanation": "The array is completely sorted without rotation, so rotation count is 0."
            }
        ]
    ),

    "single-element-in-sorted-array": make_prob(
        description="You are given a sorted array consisting of only integers where every element appears exactly twice, except for one element which appears exactly once. Return the single element that appears only once. Your solution must run in O(log n) time and O(1) space.",
        input_format="A sorted integer array `nums` where all elements appear twice except one.",
        output_format="Return the single non-duplicate integer element.",
        constraints="1 <= nums.length <= 10^5\n0 <= nums[i] <= 10^5",
        examples=[
            {
                "input": "nums = [1, 1, 2, 3, 3, 4, 4, 8, 8]",
                "output": "2",
                "explanation": "2 appears only once while all other numbers appear twice."
            },
            {
                "input": "nums = [3, 3, 7, 7, 10, 11, 11]",
                "output": "10",
                "explanation": "10 is the single unique number."
            }
        ]
    ),

    "count-occurrences-in-a-sorted-array": make_prob(
        description="Given a sorted array `nums` of `n` integers and an integer `target`, count the number of occurrences of `target` in the array. Solve in O(log n) time by finding first and last occurrences via binary search and taking `last - first + 1`.",
        input_format="A sorted integer array `nums` and target integer `target`.",
        output_format="Return the count of occurrences of `target` in `nums`.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i], target <= 10^9",
        examples=[
            {
                "input": "nums = [1, 1, 2, 2, 2, 2, 3], target = 2",
                "output": "4",
                "explanation": "2 occurs 4 times in the array."
            },
            {
                "input": "nums = [1, 1, 2, 2, 2, 2, 3], target = 4",
                "output": "0",
                "explanation": "4 does not appear in the array."
            }
        ]
    ),

    "find-square-root-of-a-number": make_prob(
        description="Given a non-negative integer `n`, compute and return the integer square root of `n` (`floor(sqrt(n))`). The return type should be an integer, and since we need floor, the decimal digits are truncated. Do not use any built-in exponent or sqrt functions. Solve in O(log n) time using binary search on answer space `[1, n]`.",
        input_format="A non-negative long integer `n`.",
        output_format="Return the integer floor of the square root of `n`.",
        constraints="0 <= n <= 2^31 - 1",
        examples=[
            {
                "input": "n = 4",
                "output": "2",
                "explanation": "The square root of 4 is 2."
            },
            {
                "input": "n = 8",
                "output": "2",
                "explanation": "The square root of 8 is 2.82842..., and since the decimal part is truncated, 2 is returned."
            }
        ]
    ),

    "find-nth-root-of-a-number": make_prob(
        description="Given two numbers `n` and `m`, find the `n`-th integer root of `m` (i.e., an integer `r` such that `r^n == m`). If no such integer root exists, return -1. Solve in O(n * log m) time using binary search on the answer range `[1, m]`.",
        input_format="Two positive integers `n` and `m`.",
        output_format="Return integer `r` such that `r^n == m`, or -1 if no exact integer root exists.",
        constraints="1 <= n <= 30\n1 <= m <= 10^9",
        examples=[
            {
                "input": "n = 3, m = 27",
                "output": "3",
                "explanation": "3^3 = 27, so the 3rd root of 27 is 3."
            },
            {
                "input": "n = 4, m = 69",
                "output": "-1",
                "explanation": "There is no integer r such that r^4 = 69."
            }
        ]
    ),

    "find-the-smallest-divisor": make_prob(
        description="Given an array of integers `nums` and an integer `threshold`, we will choose a positive integer `divisor`, divide all the array by it, and sum the division's result. Find the smallest `divisor` such that the result mentioned above is less than or equal to `threshold`. Each result of division is rounded up to the nearest integer. Solve in O(N log(max(nums))) time using binary search on answers.",
        input_format="An integer array `nums` and an integer `threshold`.",
        output_format="Return the minimum positive integer divisor.",
        constraints="1 <= nums.length <= 5 * 10^4\n1 <= nums[i] <= 10^6\nnums.length <= threshold <= 10^6",
        examples=[
            {
                "input": "nums = [1, 2, 5, 9], threshold = 6",
                "output": "5",
                "explanation": "If divisor is 5: ceil(1/5) + ceil(2/5) + ceil(5/5) + ceil(9/5) = 1 + 1 + 1 + 2 = 5 <= 6. Divisor 4 gives 7 > 6."
            },
            {
                "input": "nums = [44, 22, 33, 11, 1], threshold = 5",
                "output": "44",
                "explanation": "Divisor 44 yields 1 + 1 + 1 + 1 + 1 = 5 <= 5."
            }
        ]
    ),

    "koko-eating-bananas": make_prob(
        description="Koko loves to eat bananas. There are `n` piles of bananas, the `i`-th pile has `piles[i]` bananas. The guards have gone and will come back in `h` hours. Koko can decide her eating speed of `k` bananas-per-hour. In each hour, she chooses a pile and eats `k` bananas from it. Return the minimum integer `k` such that she can eat all the bananas within `h` hours. Solve using binary search on `k` in range `[1, max(piles)]`.",
        input_format="An integer array `piles` of length `n` and an integer `h`.",
        output_format="Return the minimum integer eating speed `k`.",
        constraints="1 <= piles.length <= 10^4\npiles.length <= h <= 10^9\n1 <= piles[i] <= 10^9",
        examples=[
            {
                "input": "piles = [3, 6, 7, 11], h = 8",
                "output": "4",
                "explanation": "At speed 4: ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1 + 2 + 2 + 3 = 8 hours <= 8."
            },
            {
                "input": "piles = [30, 11, 23, 4, 20], h = 5",
                "output": "30",
                "explanation": "Minimum speed required to finish 5 piles in 5 hours is max(piles) = 30."
            }
        ]
    ),

    "minimum-days-to-make-m-bouquets": make_prob(
        description="You are given an integer array `bloomDay`, an integer `m` and an integer `k`. You want to make `m` bouquets. To make a bouquet, you need to use `k` adjacent flowers from the garden. Return the minimum number of days you need to wait to be able to make `m` bouquets from the garden. If it is impossible, return -1. Solve in O(N log(max(bloomDay))) time.",
        input_format="An integer array `bloomDay`, integer `m` (bouquets), and integer `k` (adjacent flowers per bouquet).",
        output_format="Return the minimum days required, or -1 if impossible.",
        constraints="bloomDay.length == n\n1 <= n <= 10^5\n1 <= bloomDay[i] <= 10^9\n1 <= m <= 10^6\n1 <= k <= n",
        examples=[
            {
                "input": "bloomDay = [1, 10, 3, 10, 2], m = 3, k = 1",
                "output": "3",
                "explanation": "On day 3, flowers bloom as [x, _, x, _, x]. We have 3 flowers ready, each making 1 bouquet."
            },
            {
                "input": "bloomDay = [1, 10, 3, 10, 2], m = 3, k = 2",
                "output": "-1",
                "explanation": "We need 3 * 2 = 6 flowers, but only 5 flowers exist in total."
            }
        ]
    ),

    "capacity-to-ship-packages-within-d-days": make_prob(
        description="A conveyor belt has packages that must be shipped from one port to another within `days` days. The `i`-th package has a weight of `weights[i]`. Each day, we load the ship with packages on the conveyor belt (in order of `weights`). We may not load more weight than the maximum weight capacity of the ship. Return the least weight capacity of the ship that will result in all packages being shipped within `days` days.",
        input_format="An integer array `weights` and integer `days`.",
        output_format="Return the minimum ship weight capacity.",
        constraints="1 <= days <= weights.length <= 5 * 10^4\n1 <= weights[i] <= 500",
        examples=[
            {
                "input": "weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5",
                "output": "15",
                "explanation": "A ship capacity of 15 ships: Day 1: 1, 2, 3, 4, 5 (15); Day 2: 6, 7 (13); Day 3: 8 (8); Day 4: 9 (9); Day 5: 10 (10)."
            },
            {
                "input": "weights = [3, 2, 2, 4, 1, 4], days = 3",
                "output": "6",
                "explanation": "Day 1: 3, 2; Day 2: 2, 4; Day 3: 1, 4. Capacity 6 works."
            }
        ]
    ),

    "kth-missing-positive-number": make_prob(
        description="Given an array `arr` of positive integers sorted in a strictly increasing order, and an integer `k`, return the `k`-th positive integer that is missing from this array. Solve in O(log n) time using binary search on missing counts `arr[mid] - (mid + 1)`.",
        input_format="A sorted positive integer array `arr` and integer `k`.",
        output_format="Return the `k`-th missing positive integer.",
        constraints="1 <= arr.length <= 1000\n1 <= arr[i] <= 1000\n1 <= k <= 1000\narr is strictly increasing.",
        examples=[
            {
                "input": "arr = [2, 3, 4, 7, 11], k = 5",
                "output": "9",
                "explanation": "Missing positive integers are [1, 5, 6, 8, 9, 10, ...]. The 5th missing is 9."
            },
            {
                "input": "arr = [1, 2, 3, 4], k = 2",
                "output": "6",
                "explanation": "Missing positive integers are [5, 6, 7, ...]. The 2nd missing is 6."
            }
        ]
    ),

    "painters-partition": make_prob(
        description="Dilpreet wants to paint his dog's home that has `n` boards with different lengths `arr = [A1, A2, ..., An]`. There are `k` painters available and each painter takes 1 unit of time to paint 1 unit of board. All painters work concurrently on continuous blocks of boards. Find the minimum time required to paint all boards.",
        input_format="An integer array `arr` representing board lengths and an integer `k` representing painters.",
        output_format="Return the minimum maximum time allocated to any painter.",
        constraints="1 <= arr.length <= 10^5\n1 <= k <= arr.length\n1 <= arr[i] <= 10^5",
        examples=[
            {
                "input": "arr = [5, 10, 30, 20, 15], k = 3",
                "output": "35",
                "explanation": "Painter 1: [5, 10, 20] -> continuous blocks allocated: Painter 1: [5, 10] (15), Painter 2: [30] (30), Painter 3: [20, 15] (35). Max = 35."
            },
            {
                "input": "arr = [10, 20, 30, 40], k = 2",
                "output": "60",
                "explanation": "Painter 1 gets [10, 20, 30] (60) and Painter 2 gets [40]. Max time = 60."
            }
        ]
    ),

    "aggressive-cows": make_prob(
        description="You are given an array of integers `stalls` which denotes the position of stalls, and an integer `k` which denotes the number of aggressive cows. Assign stalls to `k` cows such that the minimum distance between any two of them is the maximum possible. Return that maximum possible minimum distance.",
        input_format="An integer array `stalls` of stall positions and integer `k` (number of cows).",
        output_format="Return the maximum possible minimum distance between cows.",
        constraints="2 <= stalls.length <= 10^5\n2 <= k <= stalls.length\n0 <= stalls[i] <= 10^9",
        examples=[
            {
                "input": "stalls = [1, 2, 4, 8, 9], k = 3",
                "output": "3",
                "explanation": "Place cows at stalls 1, 4, and 8 or 9. The minimum distance is min(4-1, 8-4) = 3."
            },
            {
                "input": "stalls = [10, 1, 2, 7, 5], k = 3",
                "output": "4",
                "explanation": "Sorted stalls: [1, 2, 5, 7, 10]. Place cows at 1, 5, 10. Distance = min(4, 5) = 4."
            }
        ]
    ),

    "book-allocation-problem": make_prob(
        description="You have `n` books, each with `arr[i]` pages. You have to allocate books to `m` students such that: each student gets at least one book, each book is allocated to exactly one student, and book allocation is in contiguous order. Minimize the maximum pages allocated to a student. If allocation is impossible (m > n), return -1.",
        input_format="An integer array `arr` of page numbers and an integer `m` (students).",
        output_format="Return the minimized maximum pages allocated, or -1 if impossible.",
        constraints="1 <= arr.length <= 10^5\n1 <= m <= 10^5\n1 <= arr[i] <= 10^9",
        examples=[
            {
                "input": "arr = [12, 34, 67, 90], m = 2",
                "output": "113",
                "explanation": "Student 1 gets books [12, 34, 67] (113 pages) and Student 2 gets [90] (90 pages). Maximum is 113."
            },
            {
                "input": "arr = [25, 46, 28, 49, 24], m = 4",
                "output": "71",
                "explanation": "Allocation: [25, 46] (71), [28], [49], [24]. Max pages allocated is 71."
            }
        ]
    ),

    "find-peak-element": make_prob(
        description="A peak element is an element that is strictly greater than its neighbors. Given a 0-indexed integer array `nums`, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks. You may imagine that `nums[-1] = nums[n] = -∞`. You must write an algorithm that runs in O(log n) time.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the index of any peak element.",
        constraints="1 <= nums.length <= 1000\n-2^31 <= nums[i] <= 2^31 - 1\nnums[i] != nums[i + 1] for all valid i.",
        examples=[
            {
                "input": "nums = [1, 2, 3, 1]",
                "output": "2",
                "explanation": "3 is a peak element and your function should return index 2."
            },
            {
                "input": "nums = [1, 2, 1, 3, 5, 6, 4]",
                "output": "5",
                "explanation": "Your function can return either index 1 (value 2) or index 5 (value 6)."
            }
        ]
    ),

    "median-of-2-sorted-arrays": make_prob(
        description="Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)) using binary search on partition cuts.",
        input_format="Two sorted integer arrays `nums1` and `nums2`.",
        output_format="Return the median as a float / double.",
        constraints="nums1.length == m\nnums2.length == n\n0 <= m, n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6",
        examples=[
            {
                "input": "nums1 = [1, 3], nums2 = [2]",
                "output": "2.00000",
                "explanation": "Merged array = [1, 2, 3] and median is 2."
            },
            {
                "input": "nums1 = [1, 2], nums2 = [3, 4]",
                "output": "2.50000",
                "explanation": "Merged array = [1, 2, 3, 4] and median is (2 + 3) / 2 = 2.5."
            }
        ]
    ),

    "kth-element-of-2-sorted-arrays": make_prob(
        description="Given two sorted arrays `arr1` and `arr2` of sizes `m` and `n` respectively, and an integer `k`, find the element that would be at the `k`-th position in the final combined sorted array. Solve in O(log(min(m, n))) time using binary search partitioning.",
        input_format="Two sorted integer arrays `arr1`, `arr2` and an integer `k` (1-indexed).",
        output_format="Return the `k`-th element of the merged sorted sequence.",
        constraints="1 <= arr1.length, arr2.length <= 10^5\n1 <= k <= arr1.length + arr2.length\n-10^9 <= arr1[i], arr2[j] <= 10^9",
        examples=[
            {
                "input": "arr1 = [2, 3, 6, 7, 9], arr2 = [1, 4, 8, 10], k = 5",
                "output": "6",
                "explanation": "The merged sorted array is [1, 2, 3, 4, 6, 7, 8, 9, 10]. The 5th element is 6."
            },
            {
                "input": "arr1 = [100, 112, 256, 349, 770], arr2 = [72, 86, 113, 119, 265, 445, 892], k = 7",
                "output": "256",
                "explanation": "The 7th element in the sorted combined sequence is 256."
            }
        ]
    ),

    "minimise-max-distance-to-gas-stations": make_prob(
        description="You are given a sorted integer array `stations` of size `n` which represents the positions of gas stations on a coordinate axis. You are also given an integer `k`. You need to add `k` new gas stations. Find the smallest possible value of the maximum distance between adjacent gas stations after adding `k` new stations. Return the answer with precision up to 10^-6.",
        input_format="A sorted integer array `stations` and an integer `k`.",
        output_format="Return the minimized maximum adjacent distance as a floating-point value.",
        constraints="2 <= stations.length <= 10^5\n0 <= stations[i] <= 10^9\n1 <= k <= 10^6",
        examples=[
            {
                "input": "stations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], k = 9",
                "output": "0.500000",
                "explanation": "Placing 9 stations in between existing stations splits each unit segment into 0.5."
            },
            {
                "input": "stations = [1, 13, 17, 23], k = 5",
                "output": "2.400000",
                "explanation": "The maximum distance between adjacent stations is minimized to 2.4."
            }
        ]
    ),

    "split-array---largest-sum": make_prob(
        description="Given an integer array `nums` and an integer `k`, split `nums` into `k` non-empty subarrays such that the largest sum of any subarray is minimized. Return the minimized largest sum among all subarrays. Solve in O(N log(sum(nums))) time using binary search on answer.",
        input_format="An integer array `nums` and integer `k`.",
        output_format="Return the minimized largest subarray sum.",
        constraints="1 <= nums.length <= 1000\n0 <= nums[i] <= 10^6\n1 <= k <= min(50, nums.length)",
        examples=[
            {
                "input": "nums = [7, 2, 5, 10, 8], k = 2",
                "output": "18",
                "explanation": "Split into [7, 2, 5] (sum 14) and [10, 8] (sum 18). Largest sum is 18."
            },
            {
                "input": "nums = [1, 2, 3, 4, 5], k = 2",
                "output": "9",
                "explanation": "Split into [1, 2, 3] and [4, 5]. Largest sum is 9."
            }
        ]
    ),

    "find-row-with-maximum-1's": make_prob(
        description="Given a boolean 2D array `mat` of `n x m` dimensions where each row is sorted, find the 0-based index of the first row that has the maximum number of `1`'s. If no row has any `1`, return -1. Solve in O(n log m) using lower_bound or O(n + m) starting from top-right corner.",
        input_format="An `n x m` 2D binary matrix where each row is sorted in non-decreasing order.",
        output_format="Return the index of the row with the maximum number of 1s.",
        constraints="1 <= n, m <= 1000\nmat[i][j] is either 0 or 1.",
        examples=[
            {
                "input": "mat = [[0, 1, 1, 1], [0, 0, 1, 1], [1, 1, 1, 1], [0, 0, 0, 0]]",
                "output": "2",
                "explanation": "Row 2 has four 1s, which is the maximum."
            },
            {
                "input": "mat = [[0, 0], [0, 0]]",
                "output": "-1",
                "explanation": "No row contains any 1s."
            }
        ]
    ),

    "search-in-a-2d-matrix": make_prob(
        description="You are given an `m x n` integer matrix `matrix` with two properties: each row is sorted in non-decreasing order, and the first integer of each row is greater than the last integer of the previous row. Given an integer `target`, return `true` if `target` is in `matrix` or `false` otherwise. You must write a solution in O(log(m * n)) time by treating the 2D matrix as a virtual 1D sorted array.",
        input_format="An `m x n` integer matrix and integer `target`.",
        output_format="Return boolean `true` if target exists, else `false`.",
        constraints="m == matrix.length\nn == matrix[i].length\n1 <= m, n <= 100\n-10^4 <= matrix[i][j], target <= 10^4",
        examples=[
            {
                "input": "matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 3",
                "output": "true",
                "explanation": "3 exists in the matrix."
            },
            {
                "input": "matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 13",
                "output": "false",
                "explanation": "13 does not exist in the matrix."
            }
        ]
    ),

    "search-in-2d-matrix-ii": make_prob(
        description="Write an efficient algorithm that searches for an integer `target` in an `m x n` integer matrix `matrix`. This matrix has the following properties: integers in each row are sorted in ascending from left to right, and integers in each column are sorted in ascending from top to bottom. Solve in O(m + n) time starting from top-right corner `(0, n - 1)`.",
        input_format="An `m x n` sorted integer matrix and integer `target`.",
        output_format="Return boolean `true` if found, else `false`.",
        constraints="m == matrix.length\nn == matrix[i].length\n1 <= m, n <= 300\n-10^9 <= matrix[i][j], target <= 10^9",
        examples=[
            {
                "input": "matrix = [[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], target = 5",
                "output": "true",
                "explanation": "5 is present at position (1, 1)."
            },
            {
                "input": "matrix = [[1, 4, 7, 11, 15], [2, 5, 8, 12, 19], [3, 6, 9, 16, 22], [10, 13, 14, 17, 24], [18, 21, 23, 26, 30]], target = 20",
                "output": "false",
                "explanation": "20 is not present in the matrix."
            }
        ]
    ),

    "find-peak-element-ii": make_prob(
        description="A peak element in a 2D grid is an element that is strictly greater than all of its adjacent neighbors to the left, right, top, and bottom. Given an `m x n` matrix `mat` where no two adjacent cells are equal, find any peak element `mat[i][j]` and return its coordinates `[i, j]`. Solve in O(m log n) or O(n log m) time using binary search on matrix columns.",
        input_format="An `m x n` 2D integer matrix.",
        output_format="Return `[row, col]` of any peak element.",
        constraints="m == mat.length\nn == mat[0].length\n1 <= m, n <= 500\n1 <= mat[i][j] <= 10^5\nNo two adjacent cells are equal.",
        examples=[
            {
                "input": "mat = [[1, 4], [3, 2]]",
                "output": "[0, 1]",
                "explanation": "4 is greater than its left neighbor 1 and bottom neighbor 2. Peak at [0, 1]."
            },
            {
                "input": "mat = [[10, 20, 15], [21, 30, 14], [7, 16, 32]]",
                "output": "[1, 1]",
                "explanation": "30 is greater than 20, 21, 14, and 16. Another valid peak is [2, 2] with value 32."
            }
        ]
    ),

    "matrix-median": make_prob(
        description="Given a row-wise sorted matrix `matrix` of size `r x c` where `r` and `c` are always odd integers, find the median of the matrix. The median is the element where `(r * c + 1) / 2` elements in the matrix are smaller than or equal to it. Solve in O(32 * r * log c) time using binary search on range `[min_element, max_element]`.",
        input_format="An `r x c` row-wise sorted integer matrix where `r` and `c` are odd.",
        output_format="Return the median integer value.",
        constraints="1 <= r, c <= 500\nr and c are odd numbers.\n1 <= matrix[i][j] <= 10^9",
        examples=[
            {
                "input": "matrix = [[1, 3, 5], [2, 6, 9], [3, 6, 9]]",
                "output": "5",
                "explanation": "Sorted elements: [1, 2, 3, 3, 5, 6, 6, 9, 9]. Median is the 5th element: 5."
            },
            {
                "input": "matrix = [[1, 3, 4], [2, 5, 6], [7, 8, 9]]",
                "output": "5",
                "explanation": "Overall sorted list: [1, 2, 3, 4, 5, 6, 7, 8, 9]. 5th element is 5."
            }
        ]
    ),
}
