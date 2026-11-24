from .common import make_prob

HEAPS_TRIES_MATHS_DATA = {
    # --- HEAPS (20) ---
    "heaps-theory": make_prob(
        description="Learn the fundamentals of Binary Heaps (Min-Heap and Max-Heap). A binary heap is a Complete Binary Tree represented efficiently as an array: for node at index `i`, left child is at `2*i + 1`, right child is at `2*i + 2`, and parent is at `(i - 1) / 2`. In a Min-Heap, `parent <= children`; in a Max-Heap, `parent >= children`.",
        input_format="Conceptual tree array `nums`.",
        output_format="Determine heap representation and tree properties.",
        constraints="0 <= nodes <= 10^5",
        examples=[
            {
                "input": "nums = [10, 20, 15, 30, 40]",
                "output": "Valid Min-Heap",
                "explanation": "Root 10 is smaller than children 20 and 15; 20 is smaller than 30 and 40."
            },
            {
                "input": "nums = [50, 30, 40, 10, 20]",
                "output": "Valid Max-Heap",
                "explanation": "Root 50 is greater than all descendant values."
            }
        ]
    ),

    "heapify-algorithm": make_prob(
        description="Given an array representing a binary tree and an index `i`, write a function `heapify` that maintains the heap property (either Min-Heapify or Max-Heapify) by sifting down the element at index `i` in O(log N) time.",
        input_format="An integer array `nums` and root index `i` of subtree.",
        output_format="Modify `nums` in-place maintaining the heap invariant.",
        constraints="1 <= nums.length <= 10^5\n0 <= i < nums.length",
        examples=[
            {
                "input": "nums = [4, 10, 3, 5, 1], i = 0 (Max-Heapify)",
                "output": "[10, 5, 3, 4, 1]",
                "explanation": "4 swapped with larger child 10, then with 5 to restore max-heap."
            },
            {
                "input": "nums = [1, 3, 5], i = 0 (Min-Heapify)",
                "output": "[1, 3, 5]",
                "explanation": "Already a valid min-heap."
            }
        ]
    ),

    "build-heap-from-a-given-array": make_prob(
        description="Given an array of `n` integers, build a Max-Heap from the array in O(N) linear time using bottom-up heapification starting from the last non-leaf node `n/2 - 1` down to index `0`.",
        input_format="An unsorted integer array `nums` of length `n`.",
        output_format="Return the array rearranged as a valid Max-Heap.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [4, 10, 3, 5, 1]",
                "output": "[10, 5, 3, 4, 1]",
                "explanation": "Max-heap constructed in O(N) time."
            },
            {
                "input": "nums = [1, 3, 5, 4, 6, 13, 10, 9, 8, 15, 17]",
                "output": "[17, 15, 13, 9, 6, 5, 10, 4, 8, 3, 1]",
                "explanation": "Valid max-heap."
            }
        ]
    ),

    "implement-min-heap": make_prob(
        description="Implement a Min-Heap data structure with methods: `insert(val)` in O(log N) time using sift-up, `extractMin()` in O(log N) time using sift-down, and `getMin()` in O(1) time.",
        input_format="A sequence of heap operations.",
        output_format="Return array of values returned by extractMin queries.",
        constraints="1 <= operations <= 10^5\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "insert(3), insert(2), extractMin(), insert(1), extractMin()",
                "output": "[2, 1]",
                "explanation": "First min is 2. After inserting 1, new min is 1."
            },
            {
                "input": "insert(5), extractMin()",
                "output": "[5]",
                "explanation": "Extracts single element."
            }
        ]
    ),

    "implement-max-heap": make_prob(
        description="Implement a Max-Heap data structure supporting `insert(val)` in O(log N), `extractMax()` in O(log N), and `getMax()` in O(1) time.",
        input_format="A sequence of max-heap operations.",
        output_format="Return values from extractMax queries.",
        constraints="1 <= operations <= 10^5\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "insert(10), insert(30), extractMax(), insert(20), extractMax()",
                "output": "[30, 20]",
                "explanation": "Extracts 30 first, then 20."
            },
            {
                "input": "insert(5), getMax()",
                "output": "5",
                "explanation": "Max is 5."
            }
        ]
    ),

    "check-if-an-array-represents-a-min-heap-": make_prob(
        description="Given an array `arr` of size `n`, check whether it represents a Min-Heap (i.e. every parent node at index `i` satisfies `arr[i] <= arr[2*i + 1]` and `arr[i] <= arr[2*i + 2]`).",
        input_format="An integer array `arr` of size `n`.",
        output_format="Return boolean `true` if valid min-heap, else `false`.",
        constraints="1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
        examples=[
            {
                "input": "arr = [10, 15, 14, 25, 30]",
                "output": "true",
                "explanation": "10 <= 15 and 10 <= 14; 15 <= 25 and 15 <= 30. All parent-child relations valid."
            },
            {
                "input": "arr = [10, 25, 14, 20, 30]",
                "output": "false",
                "explanation": "Parent 25 is greater than child 20 at index 3."
            }
        ]
    ),

    "convert-min-heap-to-max-heap": make_prob(
        description="You are given an array representing a Min-Heap. Convert it into a Max-Heap in O(N) time by running Max-Heapify from index `(n - 2) / 2` down to index `0`.",
        input_format="An integer array `arr` of size `n` representing a min-heap.",
        output_format="Modify `arr` in-place converting it into a valid max-heap.",
        constraints="1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
        examples=[
            {
                "input": "arr = [3, 5, 9, 6, 8, 20, 10, 12, 18, 9]",
                "output": "[20, 18, 10, 12, 9, 9, 3, 5, 6, 8]",
                "explanation": "Converted to valid max-heap."
            },
            {
                "input": "arr = [1, 2, 3]",
                "output": "[3, 2, 1]",
                "explanation": "3 is placed at root."
            }
        ]
    ),

    "heap-sort": make_prob(
        description="Given an array of size `n`, sort the array in non-decreasing order using Heap Sort in O(N log N) time and O(1) extra space. Steps: 1. Build a Max-Heap from the array in O(N). 2. Repeatedly swap the root with the last element, reduce heap size, and Max-Heapify root.",
        input_format="An unsorted integer array `nums` of length `n`.",
        output_format="Return the array sorted in ascending order.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [4, 10, 3, 5, 1]",
                "output": "[1, 3, 4, 5, 10]",
                "explanation": "Sorted using in-place heap sort."
            },
            {
                "input": "nums = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]",
                "output": "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",
                "explanation": "Sorted in non-decreasing order."
            }
        ]
    ),

    "k-th-largest-element-in-an-array": make_prob(
        description="Given an integer array `nums` and an integer `k`, return the `k`-th largest element in the array. Can be solved in O(N log K) time using a Min-Heap of size `k`, or in O(N) average time using Quickselect.",
        input_format="An integer array `nums` and an integer `k`.",
        output_format="Return the `k`-th largest element.",
        constraints="1 <= k <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
        examples=[
            {
                "input": "nums = [3, 2, 1, 5, 6, 4], k = 2",
                "output": "5",
                "explanation": "The sorted order is [1, 2, 3, 4, 5, 6]. The 2nd largest is 5."
            },
            {
                "input": "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4",
                "output": "4",
                "explanation": "4th largest element is 4."
            }
        ]
    ),

    "kth-largest-element-in-a-stream-of-running-integers": make_prob(
        description="Design a class to find the `k`-th largest element in a stream. Note that it is the `k`-th largest element in the sorted order, not the `k`-th distinct element. Implement `KthLargest` class with constructor and `add(val)` method in O(log k) time using a Min-Heap of size `k`.",
        input_format="Constructor `KthLargest(k, nums)` and repeated `add(val)` calls.",
        output_format="Return the current k-th largest element after each insertion.",
        constraints="1 <= k <= 10^4\n0 <= nums.length <= 10^4\n-10^4 <= val <= 10^4\nAt most 10^4 calls to add.",
        examples=[
            {
                "input": "KthLargest(3, [4, 5, 8, 2]), add(3), add(5), add(10), add(9), add(4)",
                "output": "[4, 5, 5, 8, 8]",
                "explanation": "After add(3): [2, 3, 4, 5, 8] -> 3rd largest is 4; add(5): 3rd largest is 5, etc."
            },
            {
                "input": "KthLargest(1, []), add(-3), add(-2), add(-4)",
                "output": "[-3, -2, -2]",
                "explanation": "1st largest is the running maximum."
            }
        ]
    ),

    "sort-a-k-sorted-array": make_prob(
        description="Given an array `arr` of `n` elements, where each element is at most `k` positions away from its target position in the sorted array. Sort the array in O(N log K) time using a Min-Heap of size `k + 1`.",
        input_format="An integer array `arr` and integer `k`.",
        output_format="Return the completely sorted array.",
        constraints="1 <= n <= 10^5\n1 <= k <= n\n-10^9 <= arr[i] <= 10^9",
        examples=[
            {
                "input": "arr = [6, 5, 3, 2, 8, 10, 9], k = 3",
                "output": "[2, 3, 5, 6, 8, 9, 10]",
                "explanation": "Sorted in non-decreasing order."
            },
            {
                "input": "arr = [10, 9, 8, 7, 4, 70, 60, 50], k = 4",
                "output": "[4, 7, 8, 9, 10, 50, 60, 70]",
                "explanation": "Sorted."
            }
        ]
    ),

    "merge-k-sorted-lists": make_prob(
        description="You are given an array of `k` linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it. Solve in O(N log K) time using a Min-Heap of size `k` storing the head node of each list.",
        input_format="An array of `k` sorted linked list heads.",
        output_format="Return the head of the single merged sorted linked list.",
        constraints="k == lists.length\n0 <= k <= 10^4\n0 <= total nodes <= 10^4\n-10^4 <= Node.val <= 10^4",
        examples=[
            {
                "input": "lists = [[1, 4, 5], [1, 3, 4], [2, 6]]",
                "output": "[1, 1, 2, 3, 4, 4, 5, 6]",
                "explanation": "All lists merged into one sorted linked list."
            },
            {
                "input": "lists = []",
                "output": "[]",
                "explanation": "Empty list array."
            }
        ]
    ),

    "replace-elements-by-their-rank": make_prob(
        description="Given an array of `n` integers, replace each element with its rank in the array. The rank of an element is an integer starting from 1. If two elements are equal, they have the same rank, and ranks are consecutive without skipping. Solve in O(N log N) using a Min-Heap or sorting distinct elements.",
        input_format="An integer array `arr` of size `n`.",
        output_format="Return an array of the same size with elements replaced by their ranks.",
        constraints="1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
        examples=[
            {
                "input": "arr = [40, 10, 20, 30]",
                "output": "[4, 1, 2, 3]",
                "explanation": "10 is smallest (rank 1), 20 is 2, 30 is 3, 40 is 4."
            },
            {
                "input": "arr = [100, 100, 100]",
                "output": "[1, 1, 1]",
                "explanation": "Identical elements share rank 1."
            }
        ]
    ),

    "task-scheduler": make_prob(
        description="Given a characters array `tasks`, representing the CPU tasks a processor needs to do, where each letter represents a different task. Tasks could be done in any order. Each task is done in one unit of time. There is a non-negative integer `n` that represents the cooldown period between two same tasks. Return the least number of units of times that the CPU will take to finish all the given tasks. Solve in O(tasks.length) using Max-Heap or math formula `(maxFreq - 1) * (n + 1) + countMaxFreq`.",
        input_format="A character array `tasks` and an integer `n`.",
        output_format="Return the minimum CPU intervals needed.",
        constraints="1 <= tasks.length <= 10^4\ntasks[i] is uppercase English letter.\n0 <= n <= 100",
        examples=[
            {
                "input": "tasks = [\"A\", \"A\", \"A\", \"B\", \"B\", \"B\"], n = 2",
                "output": "8",
                "explanation": "A -> B -> idle -> A -> B -> idle -> A -> B. Total = 8 units."
            },
            {
                "input": "tasks = [\"A\", \"A\", \"A\", \"B\", \"B\", \"B\"], n = 0",
                "output": "6",
                "explanation": "No cooldown needed, total = 6."
            }
        ]
    ),

    "hand-of-straights": make_prob(
        description="Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size `groupSize`, and consists of `groupSize` consecutive cards. Given an integer array `hand` and an integer `groupSize`, return `true` if she can rearrange the cards, or `false` otherwise. Solve in O(N log N) using a TreeMap or Min-Heap with frequency map.",
        input_format="An integer array `hand` and integer `groupSize`.",
        output_format="Return boolean `true` if grouping is possible, else `false`.",
        constraints="1 <= hand.length <= 10^4\n0 <= hand[i] <= 10^9\n1 <= groupSize <= hand.length",
        examples=[
            {
                "input": "hand = [1, 2, 3, 6, 2, 3, 4, 7, 8], groupSize = 3",
                "output": "true",
                "explanation": "Cards can be grouped into [1, 2, 3], [2, 3, 4], and [6, 7, 8]."
            },
            {
                "input": "hand = [1, 2, 3, 4, 5], groupSize = 4",
                "output": "false",
                "explanation": "Cannot divide 5 cards into groups of 4."
            }
        ]
    ),

    "design-twitter": make_prob(
        description="Design a simplified version of Twitter where users can post tweets, follow/unfollow other users, and view the 10 most recent tweets in their news feed. Implement `postTweet(userId, tweetId)`, `getNewsFeed(userId)` (returning 10 most recent tweets from self and followees using a Max-Heap / PriorityQueue of user tweets), `follow(followerId, followeeId)`, and `unfollow(followerId, followeeId)`.",
        input_format="Method calls to Twitter class.",
        output_format="Return lists of tweet IDs for getNewsFeed queries.",
        constraints="1 <= userId, followerId, followeeId <= 500\n0 <= tweetId <= 10^4\nAt most 3 * 10^4 calls.",
        examples=[
            {
                "input": "Twitter(), postTweet(1, 5), getNewsFeed(1), follow(1, 2), postTweet(2, 6), getNewsFeed(1), unfollow(1, 2), getNewsFeed(1)",
                "output": "[null, null, [5], null, null, [6, 5], null, [5]]",
                "explanation": "News feed updates appropriately on tweet and follow actions."
            },
            {
                "input": "postTweet(1, 1), getNewsFeed(1)",
                "output": "[1]",
                "explanation": "Self tweet appears in feed."
            }
        ]
    ),

    "minimum-cost-to-connect-sticks": make_prob(
        description="You have some number of sticks with positive integer lengths. You can connect any two sticks of lengths `x` and `y` into one stick by paying a cost of `x + y`. You perform this until there is only one stick remaining. Return the minimum cost of connecting all the given sticks. Solve in O(N log N) using a Min-Heap (Huffman Coding principle).",
        input_format="An integer array `sticks`.",
        output_format="Return the minimum connection cost as an integer.",
        constraints="1 <= sticks.length <= 10^4\n1 <= sticks[i] <= 10^4",
        examples=[
            {
                "input": "sticks = [2, 4, 3]",
                "output": "14",
                "explanation": "Connect 2 and 3 for cost 5 -> [4, 5]. Connect 4 and 5 for cost 9 -> [9]. Total cost = 5 + 9 = 14."
            },
            {
                "input": "sticks = [1, 8, 3, 5]",
                "output": "30",
                "explanation": "Optimal order: 1+3=4 (cost 4); 4+5=9 (cost 9); 9+8=17 (cost 17). Total = 4 + 9 + 17 = 30."
            }
        ]
    ),

    "maximum-sum-combination": make_prob(
        description="Given two integer arrays `A` and `B` of size `n` each. A sum combination is made by adding one element from `A` and one element from `B`. Return the `c` largest sum combinations sorted in descending order. Solve in O(C log C) time using a Max-Heap of pairs `(A[i] + B[j], i, j)` after sorting `A` and `B` descending.",
        input_format="Two integer arrays `A` and `B`, and integer `c`.",
        output_format="Return a list of `c` integers representing the largest sum combinations.",
        constraints="1 <= n <= 10^5\n1 <= c <= min(n, 1000)\n-10^9 <= A[i], B[j] <= 10^9",
        examples=[
            {
                "input": "A = [3, 2], B = [1, 4], c = 2",
                "output": "[7, 6]",
                "explanation": "Sum combinations: 3+4=7, 2+4=6, 3+1=4, 2+1=3. Largest 2 are 7 and 6."
            },
            {
                "input": "A = [1, 4, 2, 3], B = [2, 5, 1, 6], c = 4",
                "output": "[10, 9, 9, 8]",
                "explanation": "Top 4 sum combinations."
            }
        ]
    ),

    "find-median-from-data-stream": make_prob(
        description="The median is the middle value in an ordered integer list. Implement the `MedianFinder` class supporting `addNum(int num)` and `findMedian()` in O(log N) and O(1) time respectively using two heaps: a Max-Heap `left` for lower half and a Min-Heap `right` for upper half, keeping sizes balanced.",
        input_format="Method calls to MedianFinder.",
        output_format="Return floating-point medians.",
        constraints="-10^5 <= num <= 10^5\nAt most 5 * 10^4 calls will be made to addNum and findMedian.",
        examples=[
            {
                "input": "addNum(1), addNum(2), findMedian(), addNum(3), findMedian()",
                "output": "[null, null, 1.5, null, 2.0]",
                "explanation": "[1, 2] median is 1.5; [1, 2, 3] median is 2.0."
            },
            {
                "input": "addNum(-1), findMedian(), addNum(-2), findMedian()",
                "output": "[-1.0, -1.5]",
                "explanation": "Medians computed accurately."
            }
        ]
    ),

    "top-k-frequent-elements": make_prob(
        description="Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order. Solve in O(N log K) time using a Min-Heap of frequency pairs or in O(N) time using Bucket Sort.",
        input_format="An integer array `nums` and integer `k`.",
        output_format="Return a list of `k` most frequent integers.",
        constraints="1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\nk is in the range [1, the number of unique elements in the array].",
        examples=[
            {
                "input": "nums = [1, 1, 1, 2, 2, 3], k = 2",
                "output": "[1, 2]",
                "explanation": "1 appears 3 times, 2 appears 2 times. Return [1, 2]."
            },
            {
                "input": "nums = [1], k = 1",
                "output": "[1]",
                "explanation": "Single element."
            }
        ]
    ),

    # --- TRIES (7) ---
    "bit-prerequisites-for-trie-problems": make_prob(
        description="Learn bitwise representations required for Bitwise (Binary) Tries: bit testing `(num >> i) & 1`, maximum XOR matching (trying to branch opposite to the current bit to yield 1 in XOR), and inserting 32-bit integers from MSB (bit 31) to LSB (bit 0).",
        input_format="Bitwise operations and binary numbers.",
        output_format="Demonstrate binary trie prefix routing.",
        constraints="0 <= num <= 2^31 - 1",
        examples=[
            {
                "input": "num = 5 (0000...0101)",
                "output": "Path follows bits from MSB to LSB: 0 -> ... -> 1 -> 0 -> 1",
                "explanation": "Binary trie routes bits from MSB down to LSB."
            },
            {
                "input": "XOR matching with bit 1",
                "output": "Prefers branch 0 to maximize XOR",
                "explanation": "1 ^ 0 = 1."
            }
        ]
    ),

    "trie-implementation-and-operations": make_prob(
        description="A trie (pronounced as \"try\") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the `Trie` class with methods: `insert(word)` in O(word.length), `search(word)` in O(word.length), and `startsWith(prefix)` in O(prefix.length).",
        input_format="Method calls to Trie: insert(word), search(word), startsWith(prefix).",
        output_format="Return boolean values for search and startsWith operations.",
        constraints="1 <= word.length, prefix.length <= 2000\nword and prefix consist only of lowercase English letters.\nAt most 3 * 10^4 calls.",
        examples=[
            {
                "input": "Trie(), insert(\"apple\"), search(\"apple\"), search(\"app\"), startsWith(\"app\"), insert(\"app\"), search(\"app\")",
                "output": "[null, null, true, false, true, null, true]",
                "explanation": "All trie operations succeed in linear time proportional to string length."
            },
            {
                "input": "insert(\"cat\"), search(\"car\")",
                "output": "false",
                "explanation": "\"car\" does not exist in trie."
            }
        ]
    ),

    "trie-implementation-and-advanced-operations": make_prob(
        description="Implement an advanced Trie supporting counting operations: `insert(word)` in O(L), `countWordsEqualTo(word)` in O(L), `countWordsStartingWith(prefix)` in O(L), and `erase(word)` in O(L). Each node tracks `countPrefix` and `countEndsWith`.",
        input_format="Method calls to Trie: insert, countWordsEqualTo, countWordsStartingWith, erase.",
        output_format="Return integer counts for search queries.",
        constraints="1 <= word.length <= 1000\nAt most 10^5 calls.",
        examples=[
            {
                "input": "insert(\"apple\"), insert(\"apple\"), insert(\"apps\"), countWordsEqualTo(\"apple\"), countWordsStartingWith(\"app\"), erase(\"apple\"), countWordsEqualTo(\"apple\")",
                "output": "[2, 3, 1]",
                "explanation": "2 \"apple\"s; 3 words start with \"app\"; after erasing one \"apple\", 1 remains."
            },
            {
                "input": "insert(\"code\"), erase(\"code\"), countWordsEqualTo(\"code\")",
                "output": "0",
                "explanation": "Word count is 0 after deletion."
            }
        ]
    ),

    "longest-word-with-all-prefixes": make_prob(
        description="Given an array of strings `words`, find the longest string in `words` such that every prefix of it is also in `words`. If there are multiple strings with the same maximum length, return the lexicographically smallest one. If no such string exists, return an empty string `\"\"`.",
        input_format="An array of strings `words`.",
        output_format="Return the longest string meeting all-prefixes criteria.",
        constraints="1 <= words.length <= 10^5\n1 <= words[i].length <= 100\nwords[i] consists of lowercase English letters.",
        examples=[
            {
                "input": "words = [\"n\", \"ni\", \"nin\", \"ninj\", \"ninja\", \"ninga\"]",
                "output": "\"ninja\"",
                "explanation": "Every prefix of \"ninja\" (\"n\", \"ni\", \"nin\", \"ninj\") is present in words."
            },
            {
                "input": "words = [\"ab\", \"bc\"]",
                "output": "\"\"",
                "explanation": "Neither \"a\" nor \"b\" is in words."
            }
        ]
    ),

    "number-of-distinct-substrings-in-a-string": make_prob(
        description="Given a string of length `n` of lowercase alphabet characters, find the number of distinct substrings in the string. Solve in O(N^2) time using a Trie where each distinct path from root to any node corresponds to a unique substring.",
        input_format="A string `s`.",
        output_format="Return the count of distinct substrings as an integer.",
        constraints="1 <= s.length <= 1000\ns consists of lowercase English letters.",
        examples=[
            {
                "input": "s = \"abab\"",
                "output": "8",
                "explanation": "Distinct substrings: \"\", \"a\", \"b\", \"ab\", \"ba\", \"aba\", \"bab\", \"abab\". Total = 8."
            },
            {
                "input": "s = \"aaa\"",
                "output": "4",
                "explanation": "Distinct substrings: \"\", \"a\", \"aa\", \"aaa\". Total = 4."
            }
        ]
    ),

    "maximum-xor-of-two-numbers-in-an-array": make_prob(
        description="Given an integer array `nums`, return the maximum result of `nums[i] XOR nums[j]`, where `0 <= i <= j < n`. Solve in O(32 * N) time using a Binary Trie by inserting all numbers and querying maximum XOR greedy bit branching.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the maximum XOR value.",
        constraints="1 <= nums.length <= 2 * 10^5\n0 <= nums[i] <= 2^31 - 1",
        examples=[
            {
                "input": "nums = [3, 10, 5, 25, 2, 8]",
                "output": "28",
                "explanation": "The maximum result is 5 ^ 25 = 28."
            },
            {
                "input": "nums = [14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]",
                "output": "127",
                "explanation": "Max XOR combination is 127."
            }
        ]
    ),

    "maximum-xor-with-an-element-from-an-array": make_prob(
        description="You are given an array `nums` and an array `queries` where `queries[i] = [x_i, m_i]`. The answer to the i-th query is the maximum bitwise XOR value of `x_i` with any element of `nums` that does not exceed `m_i`. If all elements exceed `m_i`, answer is -1. Solve in O((N + Q) * log(max) + Q log Q) time using offline query sorting and an incremental Binary Trie.",
        input_format="An integer array `nums` and array of queries `[x, m]`.",
        output_format="Return an array of answers for each query.",
        constraints="1 <= nums.length, queries.length <= 10^5\nqueries[i].length == 2\n0 <= nums[j], x_i, m_i <= 10^9",
        examples=[
            {
                "input": "nums = [0, 1, 2, 3, 4], queries = [[3, 1], [1, 3], [5, 6]]",
                "output": "[3, 3, 7]",
                "explanation": "Query 1: 3 ^ 0 = 3; Query 2: 1 ^ 2 = 3; Query 3: 5 ^ 2 = 7."
            },
            {
                "input": "nums = [5, 2, 4, 6, 6, 3], queries = [[12, 4], [8, 1], [6, 3]]",
                "output": "[15, -1, 5]",
                "explanation": "For [8, 1], no element in nums is <= 1, so answer is -1."
            }
        ]
    ),

    # --- MATHS (3) ---
    "print-all-primes-till-n": make_prob(
        description="Given an integer `n`, generate and return all prime numbers strictly less than or equal to `n` in sorted order. Implement the Sieve of Eratosthenes to achieve O(N log(log N)) time complexity.",
        input_format="A positive integer `n`.",
        output_format="Return a sorted list of all prime numbers <= `n`.",
        constraints="2 <= n <= 10^6",
        examples=[
            {
                "input": "n = 10",
                "output": "[2, 3, 5, 7]",
                "explanation": "Primes up to 10 are 2, 3, 5, and 7."
            },
            {
                "input": "n = 20",
                "output": "[2, 3, 5, 7, 11, 13, 17, 19]",
                "explanation": "All primes up to 20."
            }
        ]
    ),

    "prime-factorisation-of-a-number": make_prob(
        description="Given a number `n`, find all of its prime factors in ascending order. Solve in O(sqrt(N)) time using trial division by 2 and odd numbers up to sqrt(n).",
        input_format="A positive integer `n`.",
        output_format="Return a list of prime factors of `n`.",
        constraints="2 <= n <= 10^9",
        examples=[
            {
                "input": "n = 60",
                "output": "[2, 2, 3, 5]",
                "explanation": "60 = 2 * 2 * 3 * 5."
            },
            {
                "input": "n = 37",
                "output": "[37]",
                "explanation": "37 is already a prime number."
            }
        ]
    ),

    "count-primes-in-range-l-to-r": make_prob(
        description="Given two integers `L` and `R`, find the total count of prime numbers in the range `[L, R]` inclusive. Solve in O(R log(log R)) using prefix prime counts from a precomputed Sieve of Eratosthenes, or Segmented Sieve for large ranges.",
        input_format="Two positive integers `L` and `R` where `L <= R`.",
        output_format="Return the number of prime numbers in range [L, R].",
        constraints="1 <= L <= R <= 10^6",
        examples=[
            {
                "input": "L = 10, R = 20",
                "output": "4",
                "explanation": "Primes in [10, 20] are 11, 13, 17, 19 (4 primes)."
            },
            {
                "input": "L = 1, R = 10",
                "output": "4",
                "explanation": "Primes: 2, 3, 5, 7."
            }
        ]
    ),
}
