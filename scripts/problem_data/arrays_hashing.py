from .common import make_prob

ARRAYS_HASHING_DATA = {
    "linear-search": make_prob(
        description="Given an array of integers `nums` and an integer `target`, write a function to search for `target` in `nums`. If `target` exists, return its 0-based index. Otherwise, return -1. You must iterate linearly through the array elements.",
        input_format="An integer array `nums` of length `n` and a target integer `target`.",
        output_format="Return the 0-based index of the first occurrence of `target` in `nums`, or -1 if not found.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
        examples=[
            {
                "input": "nums = [2, 3, 4, 10, 40], target = 10",
                "output": "3",
                "explanation": "Element 10 is present at index 3."
            },
            {
                "input": "nums = [1, 2, 3, 4, 5], target = 7",
                "output": "-1",
                "explanation": "Element 7 is not present in the array."
            }
        ]
    ),

    "largest-element": make_prob(
        description="Given an array of integers `nums`, find and return the largest element present in the array. You should solve this problem in O(N) time with O(1) auxiliary space.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the maximum integer value found in `nums`.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [3, 2, 1, 56, 10000, 167]",
                "output": "10000",
                "explanation": "The largest element in the array is 10000."
            },
            {
                "input": "nums = [1, 8, 7, 56, 90]",
                "output": "90",
                "explanation": "The maximum number among all elements is 90."
            }
        ]
    ),

    "second-largest-element": make_prob(
        description="Given an array of integers `nums`, find the second largest distinct element in the array. If no second largest distinct element exists (e.g. all elements are equal or length is less than 2), return -1. Strive to solve this in a single traversal (O(N) time) without sorting.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the second largest distinct integer, or -1 if it does not exist.",
        constraints="2 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [12, 35, 1, 10, 34, 1]",
                "output": "34",
                "explanation": "The largest element is 35 and the second largest distinct element is 34."
            },
            {
                "input": "nums = [10, 10, 10]",
                "output": "-1",
                "explanation": "All elements are equal, so no second largest distinct element exists."
            }
        ]
    ),

    "maximum-consecutive-ones": make_prob(
        description="Given a binary array `nums`, return the maximum number of consecutive `1`s appearing consecutively in the array.",
        input_format="A binary integer array `nums` containing only 0s and 1s.",
        output_format="Return an integer representing the maximum count of consecutive 1s.",
        constraints="1 <= nums.length <= 10^5\nnums[i] is either 0 or 1.",
        examples=[
            {
                "input": "nums = [1, 1, 0, 1, 1, 1]",
                "output": "3",
                "explanation": "The first two digits or the last three digits are consecutive 1s. The maximum number of consecutive 1s is 3."
            },
            {
                "input": "nums = [1, 0, 1, 1, 0, 1]",
                "output": "2",
                "explanation": "The maximum sequence of 1s has length 2."
            }
        ]
    ),

    "left-rotate-array-by-one": make_prob(
        description="Given an array of integers `nums`, rotate the array to the left by one position in-place. The first element moves to the last index and all other elements shift left by one.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return or modify in-place the array after rotating left by one position.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 2, 3, 4, 5]",
                "output": "[2, 3, 4, 5, 1]",
                "explanation": "After rotating left by one, 1 moves to the end and 2 becomes the first element."
            },
            {
                "input": "nums = [3]",
                "output": "[3]",
                "explanation": "A single-element array rotated by 1 remains unchanged."
            }
        ]
    ),

    "left-rotate-array": make_prob(
        description="Given an integer array `nums`, rotate the array to the left by `k` steps, where `k` is non-negative. Implement this in-place using O(1) extra memory (e.g. reversal algorithm).",
        input_format="An integer array `nums` of length `n` and a non-negative integer `k`.",
        output_format="Return or modify in-place the array after rotating left by `k` positions.",
        constraints="1 <= nums.length <= 10^5\n0 <= k <= 10^9\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 2, 3, 4, 5, 6, 7], k = 3",
                "output": "[4, 5, 6, 7, 1, 2, 3]",
                "explanation": "Rotate left 1 step: [2, 3, 4, 5, 6, 7, 1]. Rotate 2 steps: [3, 4, 5, 6, 7, 1, 2]. Rotate 3 steps: [4, 5, 6, 7, 1, 2, 3]."
            },
            {
                "input": "nums = [-1, -100, 3, 99], k = 2",
                "output": "[3, 99, -1, -100]",
                "explanation": "After rotating left by 2 positions, the array becomes [3, 99, -1, -100]."
            }
        ]
    ),

    "move-zeros-to-end": make_prob(
        description="Given an integer array `nums`, move all `0`s to the end of it while maintaining the relative order of the non-zero elements. You must do this in-place without making a copy of the array.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Modify the array in-place so all zeros are shifted to the end.",
        constraints="1 <= nums.length <= 10^5\n-2^31 <= nums[i] <= 2^31 - 1",
        examples=[
            {
                "input": "nums = [0, 1, 0, 3, 12]",
                "output": "[1, 3, 12, 0, 0]",
                "explanation": "All non-zero elements [1, 3, 12] maintain their original relative order while all zeros are shifted to the end."
            },
            {
                "input": "nums = [0]",
                "output": "[0]",
                "explanation": "Array contains only zero, so no modification needed."
            }
        ]
    ),

    "remove-duplicates-from-sorted-array": make_prob(
        description="Given an integer array `nums` sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Return the number of unique elements `k`.",
        input_format="A sorted integer array `nums` in non-decreasing order.",
        output_format="Return integer `k`, the count of unique elements, with the first `k` elements of `nums` holding the unique values.",
        constraints="1 <= nums.length <= 3 * 10^4\n-100 <= nums[i] <= 100\nnums is sorted in non-decreasing order.",
        examples=[
            {
                "input": "nums = [1, 1, 2]",
                "output": "2, nums = [1, 2, _]",
                "explanation": "Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively."
            },
            {
                "input": "nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]",
                "output": "5, nums = [0, 1, 2, 3, 4, _, _, _, _, _]",
                "explanation": "Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4."
            }
        ]
    ),

    "find-missing-number": make_prob(
        description="Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array. Solve in O(N) time and O(1) auxiliary space (using sum formula or bitwise XOR).",
        input_format="An integer array `nums` of length `n` containing distinct numbers in range `[0, n]`.",
        output_format="Return the single integer from `[0, n]` missing from `nums`.",
        constraints="n == nums.length\n1 <= n <= 10^5\n0 <= nums[i] <= n\nAll the numbers of nums are unique.",
        examples=[
            {
                "input": "nums = [3, 0, 1]",
                "output": "2",
                "explanation": "n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number in the range since it does not appear in nums."
            },
            {
                "input": "nums = [0, 1]",
                "output": "2",
                "explanation": "n = 2 since there are 2 numbers, so all numbers are in the range [0,2]. 2 is missing."
            }
        ]
    ),

    "union-of-two-sorted-arrays": make_prob(
        description="Given two sorted arrays `a` and `b`, find the union of the two arrays. The union contains all distinct elements from both arrays in sorted order.",
        input_format="Two sorted integer arrays `a` of length `n` and `b` of length `m`.",
        output_format="Return a sorted list of unique integers appearing in either `a` or `b`.",
        constraints="1 <= a.length, b.length <= 10^5\n-10^9 <= a[i], b[j] <= 10^9",
        examples=[
            {
                "input": "a = [1, 2, 3, 4, 5], b = [1, 2, 3, 6, 7]",
                "output": "[1, 2, 3, 4, 5, 6, 7]",
                "explanation": "Distinct elements including both arrays in sorted order are 1, 2, 3, 4, 5, 6, 7."
            },
            {
                "input": "a = [2, 2, 3, 4, 5], b = [1, 1, 2, 3, 4]",
                "output": "[1, 2, 3, 4, 5]",
                "explanation": "The union of both arrays without duplicate entries is [1, 2, 3, 4, 5]."
            }
        ]
    ),

    "intersection-of-two-sorted-arrays": make_prob(
        description="Given two sorted integer arrays `a` and `b`, find the intersection of the two arrays. Each element in the result must appear as many times as it shows in both arrays, and the result should be sorted.",
        input_format="Two sorted integer arrays `a` and `b`.",
        output_format="Return an array representing the intersection of `a` and `b`.",
        constraints="1 <= a.length, b.length <= 10^5\n-10^9 <= a[i], b[j] <= 10^9",
        examples=[
            {
                "input": "a = [1, 2, 2, 3, 4], b = [2, 2, 4, 6, 7]",
                "output": "[2, 2, 4]",
                "explanation": "Elements 2 appears twice in both, and 4 appears once in both."
            },
            {
                "input": "a = [1, 2, 3], b = [4, 5, 6]",
                "output": "[]",
                "explanation": "No common elements between the two arrays."
            }
        ]
    ),

    "majority-element-i": make_prob(
        description="Given an array `nums` of size `n`, return the majority element. The majority element is the element that appears more than `⌊n / 2⌋` times. You may assume that the majority element always exists in the array. Solve in O(N) time and O(1) space using Moore's Voting Algorithm.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the majority integer element.",
        constraints="n == nums.length\n1 <= n <= 5 * 10^4\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [3, 2, 3]",
                "output": "3",
                "explanation": "3 appears 2 times in an array of size 3, which is > 3/2 = 1.5."
            },
            {
                "input": "nums = [2, 2, 1, 1, 1, 2, 2]",
                "output": "2",
                "explanation": "2 appears 4 times in an array of size 7, which is > 7/2 = 3.5."
            }
        ]
    ),

    "leaders-in-an-array": make_prob(
        description="Given an integer array `nums`, find all the leaders in the array. An element is considered a leader if it is strictly greater than all elements to its right. The rightmost element is always a leader. Return the leaders in the order they appear from left to right.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return a list of leaders in the array.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [16, 17, 4, 3, 5, 2]",
                "output": "[17, 5, 2]",
                "explanation": "17 is greater than all elements to its right [4, 3, 5, 2]. 5 is greater than [2]. 2 is the rightmost element."
            },
            {
                "input": "nums = [1, 2, 3, 4, 0]",
                "output": "[4, 0]",
                "explanation": "4 is greater than 0, and 0 is the rightmost element."
            }
        ]
    ),

    "rearrange-array-elements-by-sign": make_prob(
        description="You are given a 0-indexed integer array `nums` of even length consisting of an equal number of positive and negative integers. Rearrange the elements of `nums` such that the modified array follows the pattern: every consecutive pair has opposite signs, it begins with a positive integer, and the relative order of positive and negative integers is preserved.",
        input_format="An integer array `nums` of even length `n` containing equal count of positive and negative integers.",
        output_format="Return the rearranged array starting with positive integer and alternating signs.",
        constraints="2 <= nums.length <= 2 * 10^5\nnums.length is even.\n1 <= |nums[i]| <= 10^5\nEqual number of positive and negative integers.",
        examples=[
            {
                "input": "nums = [3, 1, -2, -5, 2, -4]",
                "output": "[3, -2, 1, -5, 2, -4]",
                "explanation": "Positives: [3, 1, 2], Negatives: [-2, -5, -4]. Alternated: [3, -2, 1, -5, 2, -4]."
            },
            {
                "input": "nums = [-1, 1]",
                "output": "[1, -1]",
                "explanation": "The positive integer 1 must come first, followed by -1."
            }
        ]
    ),

    "print-the-matrix-in-spiral-manner": make_prob(
        description="Given an `m x n` matrix, return all elements of the matrix in spiral order (traversing top row left-to-right, right column top-to-bottom, bottom row right-to-left, and left column bottom-to-top repeatedly).",
        input_format="A 2D integer matrix `matrix` with `m` rows and `n` columns.",
        output_format="Return a list of integers containing all elements in clockwise spiral traversal order.",
        constraints="m == matrix.length\nn == matrix[i].length\n1 <= m, n <= 100\n-100 <= matrix[i][j] <= 100",
        examples=[
            {
                "input": "matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
                "output": "[1, 2, 3, 6, 9, 8, 7, 4, 5]",
                "explanation": "Spiral path travels: 1 -> 2 -> 3 -> 6 -> 9 -> 8 -> 7 -> 4 -> 5."
            },
            {
                "input": "matrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]",
                "output": "[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]",
                "explanation": "Traversing the perimeter boundary inwards yields the sequence."
            }
        ]
    ),

    "pascals-triangle-i": make_prob(
        description="Given row number `r` and column number `c`, return the element present at position `(r, c)` in Pascal's triangle (1-indexed). Note that element at `(r, c)` is given by formula `(r-1) C (c-1)`.",
        input_format="Two positive integers `r` and `c` representing row and column (1-indexed).",
        output_format="Return the integer value at position (r, c) of Pascal's triangle.",
        constraints="1 <= c <= r <= 30",
        examples=[
            {
                "input": "r = 5, c = 3",
                "output": "6",
                "explanation": "In 5th row of Pascal's triangle [1, 4, 6, 4, 1], the 3rd element is 6."
            },
            {
                "input": "r = 4, c = 2",
                "output": "3",
                "explanation": "In 4th row [1, 3, 3, 1], 2nd element is 3."
            }
        ]
    ),

    "pascals-triangle-ii": make_prob(
        description="Given an integer `rowIndex`, return the `rowIndex`-th (1-indexed or 0-indexed as specified) row of Pascal's triangle in O(N) time and O(1) extra auxiliary space.",
        input_format="An integer `n` representing the desired row of Pascal's triangle.",
        output_format="Return a list of integers containing the values of row `n`.",
        constraints="1 <= n <= 30",
        examples=[
            {
                "input": "n = 4",
                "output": "[1, 3, 3, 1]",
                "explanation": "The 4th row of Pascal's triangle contains 1, 3, 3, 1."
            },
            {
                "input": "n = 5",
                "output": "[1, 4, 6, 4, 1]",
                "explanation": "The 5th row of Pascal's triangle contains 1, 4, 6, 4, 1."
            }
        ]
    ),

    "pascals-triangle-iii": make_prob(
        description="Given an integer `numRows`, return the first `numRows` of Pascal's triangle. In Pascal's triangle, each number is the sum of the two numbers directly above it.",
        input_format="An integer `numRows` representing the number of rows to generate.",
        output_format="Return a list of lists of integers representing Pascal's triangle up to `numRows`.",
        constraints="1 <= numRows <= 30",
        examples=[
            {
                "input": "numRows = 5",
                "output": "[[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]",
                "explanation": "First 5 rows of Pascal's triangle generated systematically."
            },
            {
                "input": "numRows = 1",
                "output": "[[1]]",
                "explanation": "Only row 1 is requested, containing [1]."
            }
        ]
    ),

    "rotate-matrix-by-90-degrees": make_prob(
        description="You are given an `n x n` 2D matrix representing an image, rotate the image clockwise by 90 degrees in-place. You have to rotate the image in-place without allocating another 2D matrix (accomplished by transposing the matrix and reversing each row).",
        input_format="An `n x n` 2D integer matrix.",
        output_format="Modify the matrix in-place rotated 90 degrees clockwise.",
        constraints="n == matrix.length == matrix[i].length\n1 <= n <= 200\n-1000 <= matrix[i][j] <= 1000",
        examples=[
            {
                "input": "matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
                "output": "[[7, 4, 1], [8, 5, 2], [9, 6, 3]]",
                "explanation": "Rotating 90 degrees clockwise transforms row 1 into column 3, row 2 into column 2, and row 3 into column 1."
            },
            {
                "input": "matrix = [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]",
                "output": "[[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]]",
                "explanation": "The 4x4 matrix is rotated clockwise in place."
            }
        ]
    ),

    "set-matrix-zeroes": make_prob(
        description="Given an `m x n` integer matrix `matrix`, if an element is `0`, set its entire row and column to `0`'s. You must do it in-place using O(1) extra auxiliary space by utilizing the first row and column as state markers.",
        input_format="An `m x n` 2D integer matrix.",
        output_format="Modify the matrix in-place such that corresponding rows and columns are zeroed.",
        constraints="m == matrix.length\nn == matrix[0].length\n1 <= m, n <= 200\n-2^31 <= matrix[i][j] <= 2^31 - 1",
        examples=[
            {
                "input": "matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]",
                "output": "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]",
                "explanation": "Element at (1, 1) is 0, so entire row 1 and column 1 are zeroed."
            },
            {
                "input": "matrix = [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]",
                "output": "[[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]",
                "explanation": "Zeros at (0, 0) and (0, 3) cause row 0, col 0, and col 3 to be zeroed."
            }
        ]
    ),

    "two-sum": make_prob(
        description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order. Solve in O(N) time using a hash map.",
        input_format="An integer array `nums` and an integer `target`.",
        output_format="Return a list of two integers representing indices [i, j].",
        constraints="2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
        examples=[
            {
                "input": "nums = [2, 7, 11, 15], target = 9",
                "output": "[0, 1]",
                "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                "input": "nums = [3, 2, 4], target = 6",
                "output": "[1, 2]",
                "explanation": "nums[1] + nums[2] = 2 + 4 = 6. Return [1, 2]."
            }
        ]
    ),

    "3-sum": make_prob(
        description="Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`. Notice that the solution set must not contain duplicate triplets. Solve in O(N^2) time using sorting and two pointers.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return a list of all unique triplets that sum to 0.",
        constraints="3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
        examples=[
            {
                "input": "nums = [-1, 0, 1, 2, -1, -4]",
                "output": "[[-1, -1, 2], [-1, 0, 1]]",
                "explanation": "The distinct triplets that sum to 0 are [-1, 0, 1] and [-1, -1, 2]."
            },
            {
                "input": "nums = [0, 1, 1]",
                "output": "[]",
                "explanation": "The only possible triplet does not sum up to 0."
            }
        ]
    ),

    "4-sum": make_prob(
        description="Given an array `nums` of `n` integers, return an array of all the unique quadruplets `[nums[a], nums[b], nums[c], nums[d]]` such that `a`, `b`, `c`, and `d` are distinct indices and `nums[a] + nums[b] + nums[c] + nums[d] == target`. The solution set must not contain duplicate quadruplets.",
        input_format="An integer array `nums` of length `n` and an integer `target`.",
        output_format="Return a list of unique quadruplets summing to target.",
        constraints="1 <= nums.length <= 200\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
        examples=[
            {
                "input": "nums = [1, 0, -1, 0, -2, 2], target = 0",
                "output": "[[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]",
                "explanation": "Three unique quadruplets sum up to 0."
            },
            {
                "input": "nums = [2, 2, 2, 2, 2], target = 8",
                "output": "[[2, 2, 2, 2]]",
                "explanation": "Only one unique quadruplet can be formed."
            }
        ]
    ),

    "sort-an-array-of-0's-1's-and-2's": make_prob(
        description="Given an array `nums` with `n` objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue (represented as 0, 1, and 2 respectively). You must solve this in O(N) time with O(1) extra space using the Dutch National Flag algorithm.",
        input_format="An integer array `nums` containing only values 0, 1, and 2.",
        output_format="Sort the array in-place in non-decreasing order.",
        constraints="n == nums.length\n1 <= n <= 300\nnums[i] is either 0, 1, or 2.",
        examples=[
            {
                "input": "nums = [2, 0, 2, 1, 1, 0]",
                "output": "[0, 0, 1, 1, 2, 2]",
                "explanation": "The array is partitioned into 0s first, 1s next, and 2s last."
            },
            {
                "input": "nums = [2, 0, 1]",
                "output": "[0, 1, 2]",
                "explanation": "Sorted in non-decreasing order."
            }
        ]
    ),

    "kadane's-algorithm": make_prob(
        description="Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. Solve in O(N) time using Kadane's dynamic programming algorithm.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the maximum subarray sum as an integer.",
        constraints="1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
        examples=[
            {
                "input": "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
                "output": "6",
                "explanation": "The subarray [4, -1, 2, 1] has the largest sum 6."
            },
            {
                "input": "nums = [5, 4, -1, 7, 8]",
                "output": "23",
                "explanation": "The entire array [5, 4, -1, 7, 8] has the largest sum 23."
            }
        ]
    ),

    "next-permutation": make_prob(
        description="A permutation of an array of integers is an arrangement of its members into a sequence or linear order. Find the next lexicographically greater permutation of its numbers. If no such arrangement is possible (it is the largest possible permutation), rearrange it as the lowest possible order (sorted in ascending order). The replacement must be in-place using O(1) extra memory.",
        input_format="An integer array `nums`.",
        output_format="Rearrange `nums` into its lexicographical next permutation in-place.",
        constraints="1 <= nums.length <= 100\n0 <= nums[i] <= 100",
        examples=[
            {
                "input": "nums = [1, 2, 3]",
                "output": "[1, 3, 2]",
                "explanation": "The next lexicographical arrangement after 123 is 132."
            },
            {
                "input": "nums = [3, 2, 1]",
                "output": "[1, 2, 3]",
                "explanation": "321 is the highest permutation, so it wraps around to the lowest [1, 2, 3]."
            }
        ]
    ),

    "majority-element-ii": make_prob(
        description="Given an integer array of size `n`, find all elements that appear more than `⌊ n/3 ⌋` times. Solve this in O(N) time and O(1) space using extended Boyer-Moore Voting Algorithm. Note that at most two such elements can exist.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return a list of integers appearing more than n/3 times.",
        constraints="1 <= nums.length <= 5 * 10^4\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [3, 2, 3]",
                "output": "[3]",
                "explanation": "3 appears 2 times, which is strictly greater than 3/3 = 1."
            },
            {
                "input": "nums = [1, 2]",
                "output": "[1, 2]",
                "explanation": "Both 1 and 2 appear 1 time, which is strictly greater than 2/3 = 0.67."
            }
        ]
    ),

    "find-the-repeating-and-missing-number": make_prob(
        description="You are given a read-only array of `n` integers with values between `1` and `n`. Each integer appears exactly once, except `A` which appears twice and `B` which is missing. Return `[A, B]` representing the repeating and missing numbers. Solve in O(N) time and O(1) extra space using mathematics or XOR.",
        input_format="An integer array `nums` of length `n` containing numbers from `1` to `n`.",
        output_format="Return a pair/array `[repeating, missing]`.",
        constraints="2 <= nums.length <= 10^5\n1 <= nums[i] <= nums.length",
        examples=[
            {
                "input": "nums = [3, 1, 2, 5, 3]",
                "output": "[3, 4]",
                "explanation": "3 repeats twice and 4 is missing from range [1, 5]."
            },
            {
                "input": "nums = [3, 1, 3]",
                "output": "[3, 2]",
                "explanation": "3 is repeated and 2 is missing from range [1, 3]."
            }
        ]
    ),

    "count-inversions": make_prob(
        description="Given an integer array `nums`, return the number of inversions in the array. Two elements `nums[i]` and `nums[j]` form an inversion if `nums[i] > nums[j]` and `i < j`. Solve in O(N log N) time using modified Merge Sort.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the total number of inversions as a long integer.",
        constraints="1 <= nums.length <= 10^5\n1 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [2, 4, 1, 3, 5]",
                "output": "3",
                "explanation": "The three inversions are (2, 1), (4, 1), and (4, 3)."
            },
            {
                "input": "nums = [5, 4, 3, 2, 1]",
                "output": "10",
                "explanation": "Every pair forms an inversion in a reverse sorted array. Total = 5*4/2 = 10."
            }
        ]
    ),

    "reverse-pairs": make_prob(
        description="Given an integer array `nums`, return the number of reverse pairs in the array. A reverse pair is a pair `(i, j)` where `0 <= i < j < nums.length` and `nums[i] > 2 * nums[j]`. Solve in O(N log N) time using modified Merge Sort count.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the total count of reverse pairs as an integer.",
        constraints="1 <= nums.length <= 5 * 10^4\n-2^31 <= nums[i] <= 2^31 - 1",
        examples=[
            {
                "input": "nums = [1, 3, 2, 3, 1]",
                "output": "2",
                "explanation": "The two reverse pairs are (1, 4) since nums[1] = 3 > 2*1, and (3, 4) since nums[3] = 3 > 2*1."
            },
            {
                "input": "nums = [2, 4, 3, 5, 1]",
                "output": "3",
                "explanation": "The reverse pairs are (1, 4): 4 > 2*1; (2, 4): 3 > 2*1; (3, 4): 5 > 2*1."
            }
        ]
    ),

    "maximum-product-subarray-in-an-array": make_prob(
        description="Given an integer array `nums`, find a contiguous non-empty subarray within the array that has the largest product, and return the product. Be mindful of negative numbers and zeros. Solve in O(N) time with O(1) space.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the maximum product of a contiguous subarray.",
        constraints="1 <= nums.length <= 2 * 10^4\n-10 <= nums[i] <= 10\nThe product of any prefix or suffix fits in a 32-bit integer.",
        examples=[
            {
                "input": "nums = [2, 3, -2, 4]",
                "output": "6",
                "explanation": "[2, 3] has the largest product 6."
            },
            {
                "input": "nums = [-2, 0, -1]",
                "output": "0",
                "explanation": "The result cannot be 2, because [-2, -1] is not a contiguous subarray."
            }
        ]
    ),

    "merge-two-sorted-arrays-without-extra-space": make_prob(
        description="You are given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively. Merge them such that the first `m` elements in sorted order are stored in `nums1` and the next `n` elements are stored in `nums2`, without using any extra auxiliary space (O(1) extra space).",
        input_format="Two sorted integer arrays `nums1` of length `m` and `nums2` of length `n`.",
        output_format="Modify both arrays in-place so all elements are sorted across `nums1` followed by `nums2`.",
        constraints="1 <= m, n <= 10^5\n-10^9 <= nums1[i], nums2[j] <= 10^9",
        examples=[
            {
                "input": "nums1 = [1, 4, 8, 10], nums2 = [2, 3, 9]",
                "output": "nums1 = [1, 2, 3, 4], nums2 = [8, 9, 10]",
                "explanation": "All elements across both arrays are sorted in place without allocating additional memory."
            },
            {
                "input": "nums1 = [1, 5, 9], nums2 = [2, 4, 6]",
                "output": "nums1 = [1, 2, 4], nums2 = [5, 6, 9]",
                "explanation": "Elements sorted in ascending order."
            }
        ]
    ),

    # --- HASHING ---
    "basic-hashing": make_prob(
        description="Learn the fundamentals of Hashing: direct index mapping, hash functions, collision resolution mechanisms (chaining vs. open addressing), and frequency counting. Given an array of integers `nums` and a list of queries `queries`, for each query integer count how many times it appears in `nums` in O(1) query time using a hash map.",
        input_format="An integer array `nums` of length `n` and an array of query integers `queries` of length `q`.",
        output_format="Return a list of integers containing frequency counts for each query.",
        constraints="1 <= n, q <= 10^5\n-10^9 <= nums[i], queries[j] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 3, 2, 1, 3], queries = [1, 4, 2, 3]",
                "output": "[2, 0, 1, 2]",
                "explanation": "1 appears 2 times, 4 appears 0 times, 2 appears 1 time, and 3 appears 2 times."
            },
            {
                "input": "nums = [5, 5, 5], queries = [5, 10]",
                "output": "[3, 0]",
                "explanation": "5 appears 3 times and 10 appears 0 times."
            }
        ]
    ),

    "longest-consecutive-sequence-in-an-array": make_prob(
        description="Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(N) time complexity using a HashSet to verify sequence boundaries.",
        input_format="An unsorted integer array `nums` of length `n`.",
        output_format="Return the maximum length of a consecutive sequence of numbers.",
        constraints="0 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [100, 4, 200, 1, 3, 2]",
                "output": "4",
                "explanation": "The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4."
            },
            {
                "input": "nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]",
                "output": "9",
                "explanation": "The consecutive sequence spans from 0 to 8: [0, 1, 2, 3, 4, 5, 6, 7, 8], having length 9."
            }
        ]
    ),

    "longest-subarray-with-sum-k": make_prob(
        description="Given an array of integers `nums` and an integer `k`, find the length of the longest subarray that sums to `k`. If no such subarray exists, return 0. Handle both positive and negative elements using prefix sum and hash map.",
        input_format="An integer array `nums` of length `n` and target sum `k`.",
        output_format="Return the length of the longest contiguous subarray with sum equal to `k`.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\n-10^9 <= k <= 10^9",
        examples=[
            {
                "input": "nums = [10, 5, 2, 7, 1, 9], k = 15",
                "output": "4",
                "explanation": "The subarray [5, 2, 7, 1] has sum 15 and length 4."
            },
            {
                "input": "nums = [-1, 2, 3], k = 6",
                "output": "0",
                "explanation": "No subarray sums to 6."
            }
        ]
    ),

    "largest-subarray-with-sum-0": make_prob(
        description="Given an array `nums` having both positive and negative integers, compute the length of the largest subarray with sum equal to 0. Use a hash map storing the earliest prefix sum occurrence to solve in O(N) time.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the length of the largest subarray with sum 0.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [15, -2, 2, -8, 1, 7, 10, 23]",
                "output": "5",
                "explanation": "The largest subarray with sum 0 is [-2, 2, -8, 1, 7] with length 5."
            },
            {
                "input": "nums = [1, 2, 3]",
                "output": "0",
                "explanation": "No subarray has sum 0."
            }
        ]
    ),

    "count-subarrays-with-given-sum": make_prob(
        description="Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`. Use prefix sum frequencies in a hash map to solve in O(N) time.",
        input_format="An integer array `nums` of length `n` and an integer `k`.",
        output_format="Return total count of subarrays with sum `k`.",
        constraints="1 <= nums.length <= 2 * 10^4\n-1000 <= nums[i] <= 1000\n-10^7 <= k <= 10^7",
        examples=[
            {
                "input": "nums = [1, 1, 1], k = 2",
                "output": "2",
                "explanation": "Subarrays [nums[0..1]] and [nums[1..2]] each sum to 2."
            },
            {
                "input": "nums = [1, 2, 3], k = 3",
                "output": "2",
                "explanation": "Subarrays [1, 2] and [3] sum to 3."
            }
        ]
    ),

    "count-subarrays-with-given-xor-k": make_prob(
        description="Given an array of integers `nums` and an integer `k`, find the total number of subarrays having bitwise XOR of their elements equal to `k`. Solve in O(N) time using prefix XOR frequencies in a hash map.",
        input_format="An integer array `nums` and an integer `k`.",
        output_format="Return the number of subarrays with bitwise XOR equal to `k`.",
        constraints="1 <= nums.length <= 10^5\n0 <= nums[i], k <= 10^9",
        examples=[
            {
                "input": "nums = [4, 2, 2, 6, 4], k = 6",
                "output": "4",
                "explanation": "The subarrays with XOR 6 are [4, 2], [4, 2, 2, 6, 4], [2, 2, 6], and [6]."
            },
            {
                "input": "nums = [5, 6, 7, 8, 9], k = 5",
                "output": "2",
                "explanation": "The subarrays with XOR 5 are [5] and [5, 6, 7, 8, 9]."
            }
        ]
    ),
}
