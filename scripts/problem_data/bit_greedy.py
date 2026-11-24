from .common import make_prob

BIT_GREEDY_DATA = {
    # --- BIT MANIPULATION (14) ---
    "introduction-to-bits-and-tricks": make_prob(
        description="Learn fundamental bitwise operations and tricks: Bitwise AND (`&`), OR (`|`), XOR (`^`), NOT (`~`), Left Shift (`<<`), and Right Shift (`>>`). Master testing the i-th bit `(n & (1 << i)) != 0`, setting the i-th bit `n | (1 << i)`, clearing the i-th bit `n & ~(1 << i)`, and toggling the i-th bit `n ^ (1 << i)`.",
        input_format="An integer `n` and bit position `i` (0-indexed).",
        output_format="Return or output the results of testing, setting, clearing, and toggling the i-th bit.",
        constraints="1 <= n <= 10^9\n0 <= i <= 31",
        examples=[
            {
                "input": "n = 13 (binary 1101), i = 2",
                "output": "bit is set (1)",
                "explanation": "2nd bit from right (0-indexed) is 1."
            },
            {
                "input": "n = 13 (binary 1101), i = 1",
                "output": "bit is not set (0)",
                "explanation": "1st bit from right is 0."
            }
        ]
    ),

    "check-if-the-i-th-bit-is-set-or-not": make_prob(
        description="Given two integers `n` and `i`, check whether the `i`-th bit of `n` is set (1) or not (0). Use bitwise left shift `n & (1 << i)` or right shift `(n >> i) & 1`.",
        input_format="Two positive integers `n` and `i` (0-indexed bit position).",
        output_format="Return boolean `true` if the i-th bit is 1, else `false`.",
        constraints="1 <= n <= 10^9\n0 <= i <= 31",
        examples=[
            {
                "input": "n = 4, i = 2",
                "output": "true",
                "explanation": "4 in binary is 100. 2nd bit (0-indexed) is 1."
            },
            {
                "input": "n = 4, i = 0",
                "output": "false",
                "explanation": "0th bit is 0."
            }
        ]
    ),

    "check-if-a-number-is-odd-or-not": make_prob(
        description="Given a positive integer `n`, check whether `n` is odd or even using bitwise operations without using the modulo operator `%`. Note that `(n & 1) == 1` for odd numbers and `0` for even numbers.",
        input_format="A positive integer `n`.",
        output_format="Return boolean `true` if odd, else `false`.",
        constraints="1 <= n <= 10^9",
        examples=[
            {
                "input": "n = 5",
                "output": "true",
                "explanation": "5 in binary is 101; 5 & 1 = 1 (odd)."
            },
            {
                "input": "n = 8",
                "output": "false",
                "explanation": "8 in binary is 1000; 8 & 1 = 0 (even)."
            }
        ]
    ),

    "check-if-a-number-is-power-of-2-or-not": make_prob(
        description="Given an integer `n`, return `true` if it is a power of two. Otherwise, return `false`. A number is a power of two if and only if `n > 0` and `(n & (n - 1)) == 0`.",
        input_format="An integer `n`.",
        output_format="Return boolean `true` if power of two, else `false`.",
        constraints="-2^31 <= n <= 2^31 - 1",
        examples=[
            {
                "input": "n = 16",
                "output": "true",
                "explanation": "16 = 2^4. Also 16 & 15 = 10000 & 01111 = 0."
            },
            {
                "input": "n = 3",
                "output": "false",
                "explanation": "3 is not a power of two."
            }
        ]
    ),

    "count-the-number-of-set-bits": make_prob(
        description="Write a function that takes the binary representation of a positive integer `n` and returns the number of set bits (1s) it has (also known as the Hamming weight). Solve in O(number of set bits) time using Brian Kernighan's algorithm `n = n & (n - 1)`.",
        input_format="A positive integer `n`.",
        output_format="Return the number of set bits (1s).",
        constraints="1 <= n <= 2^31 - 1",
        examples=[
            {
                "input": "n = 11",
                "output": "3",
                "explanation": "11 in binary is 1011, which has 3 set bits."
            },
            {
                "input": "n = 128",
                "output": "1",
                "explanation": "128 in binary is 10000000, having 1 set bit."
            }
        ]
    ),

    "set-the-rightmost-unset-bit": make_prob(
        description="Given an integer `n`, set the rightmost unset bit (0) of `n` to 1. If all bits are already set (e.g. 7 or 15), return `n`. Note that `n | (n + 1)` sets the rightmost unset bit.",
        input_format="A positive integer `n`.",
        output_format="Return the modified integer with rightmost unset bit turned on.",
        constraints="1 <= n <= 10^9",
        examples=[
            {
                "input": "n = 6",
                "output": "7",
                "explanation": "6 is 110 in binary. The rightmost 0 is at bit 0. Setting it yields 111 = 7."
            },
            {
                "input": "n = 15",
                "output": "15",
                "explanation": "All bits are already 1."
            }
        ]
    ),

    "swap-two-numbers": make_prob(
        description="Given two numbers `a` and `b`, swap their values without using a third temporary variable. Use the bitwise XOR property: `a = a ^ b; b = a ^ b; a = a ^ b`.",
        input_format="Two integers `a` and `b`.",
        output_format="Return the swapped pair `[a, b]`.",
        constraints="-10^9 <= a, b <= 10^9",
        examples=[
            {
                "input": "a = 5, b = 10",
                "output": "a = 10, b = 5",
                "explanation": "Values swapped using bitwise XOR."
            },
            {
                "input": "a = -3, b = 7",
                "output": "a = 7, b = -3",
                "explanation": "Values swapped."
            }
        ]
    ),

    "minimum-bit-flips-to-convert-number": make_prob(
        description="A bit flip of a number `x` is choosing a bit in the binary representation of `x` and flipping it from either 0 to 1 or 1 to 0. Given two integers `start` and `goal`, return the minimum number of bit flips to convert `start` to `goal`. Compute the number of set bits in `start ^ goal`.",
        input_format="Two non-negative integers `start` and `goal`.",
        output_format="Return an integer representing the minimum bit flips.",
        constraints="0 <= start, goal <= 10^9",
        examples=[
            {
                "input": "start = 10, goal = 7",
                "output": "3",
                "explanation": "10 is 1010, 7 is 0111. 10 ^ 7 = 1101 (3 set bits). 3 flips needed."
            },
            {
                "input": "start = 3, goal = 4",
                "output": "3",
                "explanation": "3 is 011, 4 is 100. 3 ^ 4 = 111 (3 flips)."
            }
        ]
    ),

    "single-number---i": make_prob(
        description="Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity O(N) and use only constant extra space O(1) by taking the cumulative XOR of all elements.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the single unique integer.",
        constraints="1 <= nums.length <= 3 * 10^4\n-3 * 10^4 <= nums[i] <= 3 * 10^4\nEvery element appears twice except one.",
        examples=[
            {
                "input": "nums = [2, 2, 1]",
                "output": "1",
                "explanation": "2 ^ 2 ^ 1 = 0 ^ 1 = 1."
            },
            {
                "input": "nums = [4, 1, 2, 1, 2]",
                "output": "4",
                "explanation": "All numbers except 4 appear twice."
            }
        ]
    ),

    "single-number---ii": make_prob(
        description="Given an integer array `nums` where every element appears three times except for one, which appears exactly once. Find the single element and return it. You must implement a solution with O(N) runtime complexity and O(1) extra space using bit counters or bit manipulation (`ones` and `twos`).",
        input_format="An integer array `nums`.",
        output_format="Return the integer that appears once.",
        constraints="1 <= nums.length <= 3 * 10^4\n-2^31 <= nums[i] <= 2^31 - 1\nEvery element appears three times except one.",
        examples=[
            {
                "input": "nums = [2, 2, 3, 2]",
                "output": "3",
                "explanation": "3 appears once, 2 appears three times."
            },
            {
                "input": "nums = [0, 1, 0, 1, 0, 1, 99]",
                "output": "99",
                "explanation": "99 appears once."
            }
        ]
    ),

    "single-number---iii": make_prob(
        description="Given an integer array `nums`, in which exactly two elements appear only once and all the other elements appear exactly twice. Find the two elements that appear only once. You can return the answer in any order. Solve in O(N) time and O(1) extra space using XOR partitioning based on the rightmost set bit.",
        input_format="An integer array `nums`.",
        output_format="Return a list of two integers appearing only once.",
        constraints="2 <= nums.length <= 3 * 10^4\n-2^31 <= nums[i] <= 2^31 - 1\nExactly two elements appear once.",
        examples=[
            {
                "input": "nums = [1, 2, 1, 3, 2, 5]",
                "output": "[3, 5]",
                "explanation": "[5, 3] is also valid."
            },
            {
                "input": "nums = [-1, 0]",
                "output": "[-1, 0]",
                "explanation": "Both elements appear once."
            }
        ]
    ),

    "divide-two-numbers-without-multiplication-and-division": make_prob(
        description="Given two integers `dividend` and `divisor`, divide two integers without using multiplication, division, and mod operator. The integer division should truncate toward zero. Return the quotient after dividing dividend by divisor clamped within `[-2^31, 2^31 - 1]`. Solve in O(log^2 N) time using bit shifting.",
        input_format="Two integers `dividend` and `divisor`.",
        output_format="Return the truncated integer quotient.",
        constraints="-2^31 <= dividend, divisor <= 2^31 - 1\ndivisor != 0",
        examples=[
            {
                "input": "dividend = 10, divisor = 3",
                "output": "3",
                "explanation": "10/3 = 3.33333... which is truncated to 3."
            },
            {
                "input": "dividend = 7, divisor = -3",
                "output": "-2",
                "explanation": "7/-3 = -2.33333... which is truncated to -2."
            }
        ]
    ),

    "power-set-bit-manipulation": make_prob(
        description="Given a string or array of unique characters/numbers, generate all subsets (power set) using bit manipulation. Since a set of size `n` has `2^n` subsets, iterate from `0` to `(1 << n) - 1` and inspect the j-th bit `(i & (1 << j))` to decide inclusion.",
        input_format="A string `s` or array `nums` of length `n`.",
        output_format="Return a list of all subsets generated in bitwise sequence.",
        constraints="1 <= n <= 15",
        examples=[
            {
                "input": "s = \"abc\"",
                "output": "[\"\", \"a\", \"b\", \"ab\", \"c\", \"ac\", \"bc\", \"abc\"]",
                "explanation": "Subsets generated for bit masks from 000 to 111."
            },
            {
                "input": "s = \"ab\"",
                "output": "[\"\", \"a\", \"b\", \"ab\"]",
                "explanation": "Bit masks 00, 01, 10, 11."
            }
        ]
    ),

    "xor-of-numbers-in-a-given-range": make_prob(
        description="Given two integers `L` and `R`, find the XOR of all integers in the range `[L, R]` inclusive (`L ^ (L + 1) ^ ... ^ R`). Solve in O(1) time using the pattern of prefix XOR `1 ^ 2 ^ ... ^ N` which repeats with period 4.",
        input_format="Two positive integers `L` and `R` where `L <= R`.",
        output_format="Return the XOR sum of integers from L to R.",
        constraints="1 <= L <= R <= 10^9",
        examples=[
            {
                "input": "L = 4, R = 8",
                "output": "8",
                "explanation": "4 ^ 5 ^ 6 ^ 7 ^ 8 = 8."
            },
            {
                "input": "L = 3, R = 7",
                "output": "3",
                "explanation": "3 ^ 4 ^ 5 ^ 6 ^ 7 = 3."
            }
        ]
    ),

    # --- GREEDY ALGORITHMS (14) ---
    "assign-cookies": make_prob(
        description="Assume you are an awesome parent and want to give your children some cookies. Each child `i` has a greed factor `g[i]`, and each cookie `j` has a size `s[j]`. If `s[j] >= g[i]`, we can assign the cookie `j` to the child `i`. Maximize the number of content children. Solve in O(N log N + M log M) by sorting greed factors and cookie sizes.",
        input_format="Two integer arrays: children greed factors `g` and cookie sizes `s`.",
        output_format="Return the maximum number of children that can be content.",
        constraints="1 <= g.length <= 3 * 10^4\n0 <= s.length <= 3 * 10^4\n1 <= g[i], s[j] <= 2^31 - 1",
        examples=[
            {
                "input": "g = [1, 2, 3], s = [1, 1]",
                "output": "1",
                "explanation": "Only child with greed factor 1 can be satisfied with a cookie of size 1."
            },
            {
                "input": "g = [1, 2], s = [1, 2, 3]",
                "output": "2",
                "explanation": "Both children can be satisfied."
            }
        ]
    ),

    "lemonade-change": make_prob(
        description="At a lemonade stand, each lemonade costs $5. Customers stand in a queue and order one at a time. Each customer will only buy one lemonade and pay with either a $5, $10, or $20 bill. You must provide the correct change to each customer starting with no change. Return `true` if you can provide every customer with correct change, or `false` otherwise. Greedy strategy prefers giving a $10 bill and a $5 bill for $20 over three $5 bills.",
        input_format="An integer array `bills` where `bills[i]` is 5, 10, or 20.",
        output_format="Return boolean `true` if change can be provided to all customers, else `false`.",
        constraints="1 <= bills.length <= 10^5\nbills[i] is either 5, 10, or 20.",
        examples=[
            {
                "input": "bills = [5, 5, 5, 10, 20]",
                "output": "true",
                "explanation": "Collect three $5 bills. For $10, give $5 change. For $20, give $10 + $5 change. Everyone gets change."
            },
            {
                "input": "bills = [5, 5, 10, 10, 20]",
                "output": "false",
                "explanation": "We cannot give $15 change for the last $20 customer because we only have two $10 bills and no $5 bill."
            }
        ]
    ),

    "fractional-knapsack": make_prob(
        description="Given weights and values of `n` items, we need to put these items in a knapsack of capacity `W` to get the maximum total value in the knapsack. In Fractional Knapsack, we can break items for maximizing the total value of the knapsack. Sort items by value-to-weight ratio in descending order and greedily pick items.",
        input_format="An integer `W` (knapsack capacity) and array of items with `{value, weight}`.",
        output_format="Return the maximum achievable total value as a double / float.",
        constraints="1 <= n <= 10^5\n1 <= W <= 10^9\n1 <= value[i], weight[i] <= 10^4",
        examples=[
            {
                "input": "W = 50, items = [{val: 60, wt: 10}, {val: 100, wt: 20}, {val: 120, wt: 30}]",
                "output": "240.00",
                "explanation": "Pick item 1 (10 wt, 60 val), item 2 (20 wt, 100 val), and 2/3 of item 3 (20 wt, 80 val). Total = 240."
            },
            {
                "input": "W = 40, items = [{val: 50, wt: 10}, {val: 100, wt: 20}]",
                "output": "150.00",
                "explanation": "Both items fit entirely. Value = 150."
            }
        ]
    ),

    "jump-game---i": make_prob(
        description="You are given an integer array `nums`. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return `true` if you can reach the last index, or `false` otherwise. Solve in O(N) time by greedily tracking the maximum reachable index.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return boolean `true` if the last index is reachable, else `false`.",
        constraints="1 <= nums.length <= 10^4\n0 <= nums[i] <= 10^5",
        examples=[
            {
                "input": "nums = [2, 3, 1, 1, 4]",
                "output": "true",
                "explanation": "Jump 1 step from index 0 to 1, then 3 steps to the last index."
            },
            {
                "input": "nums = [3, 2, 1, 0, 4]",
                "output": "false",
                "explanation": "You will always arrive at index 3 no matter what. Its maximum jump length is 0, making reaching the end impossible."
            }
        ]
    ),

    "shortest-job-first": make_prob(
        description="Geek is a software engineer. He is assigned with the task of calculating the average waiting time of all the processes using Shortest Job First (SJF) non-preemptive scheduling. You are given an array `bt` of burst times of `n` processes. Return the average waiting time truncated to an integer.",
        input_format="An integer array `bt` representing burst times.",
        output_format="Return an integer representing the average waiting time (floor).",
        constraints="1 <= bt.length <= 10^5\n1 <= bt[i] <= 10^4",
        examples=[
            {
                "input": "bt = [4, 3, 7, 1, 2]",
                "output": "4",
                "explanation": "Sorted burst times: [1, 2, 3, 4, 7]. Waiting times: [0, 1, 3, 6, 10]. Total wait = 20. Avg = 20 / 5 = 4."
            },
            {
                "input": "bt = [1, 2, 3, 4]",
                "output": "2",
                "explanation": "Waiting times: [0, 1, 3, 6]. Total = 10 / 4 = 2."
            }
        ]
    ),

    "job-sequencing-problem": make_prob(
        description="Given a set of `n` jobs where each job `i` has a deadline `deadline[i]` and profit `profit[i]` associated with it. Each job takes 1 unit of time to complete and only one job can be scheduled at a time. A job earns profit only if completed on or before its deadline. Find the number of jobs completed and maximum profit earned.",
        input_format="An array of jobs where each job has `(id, deadline, profit)`.",
        output_format="Return `[countOfJobs, maxProfit]`.",
        constraints="1 <= n <= 10^5\n1 <= deadline[i] <= 100\n1 <= profit[i] <= 500",
        examples=[
            {
                "input": "Jobs = [(1, 4, 20), (2, 1, 10), (3, 1, 40), (4, 1, 30)]",
                "output": "[2, 60]",
                "explanation": "Job 3 (deadline 1, profit 40) on day 1 and Job 1 (deadline 4, profit 20) on day 2. Total = 2 jobs, 60 profit."
            },
            {
                "input": "Jobs = [(1, 2, 100), (2, 1, 19), (3, 2, 27), (4, 1, 25), (5, 1, 15)]",
                "output": "[2, 127]",
                "explanation": "Jobs 1 and 3 scheduled for maximum profit 127."
            }
        ]
    ),

    "n-meetings-in-one-room": make_prob(
        description="There is one meeting room in a firm. There are `n` meetings in the form of `(start[i], end[i])`. Find the maximum number of meetings that can be accommodated in the meeting room, assuming that the meeting room can only hold one meeting at a time. An existing meeting must strictly end before the next meeting can start.",
        input_format="Two integer arrays `start` and `end` of size `n`.",
        output_format="Return the maximum number of meetings that can be held.",
        constraints="1 <= n <= 10^5\n0 <= start[i] < end[i] <= 10^5",
        examples=[
            {
                "input": "start = [1, 3, 0, 5, 8, 5], end = [2, 4, 6, 7, 9, 9]",
                "output": "4",
                "explanation": "Meetings can be held: (1, 2), (3, 4), (5, 7), (8, 9). Total 4 meetings."
            },
            {
                "input": "start = [10, 12, 20], end = [20, 25, 30]",
                "output": "1",
                "explanation": "Only 1 meeting can be scheduled without overlap."
            }
        ]
    ),

    "non-overlapping-intervals": make_prob(
        description="Given an array of intervals `intervals` where `intervals[i] = [start_i, end_i]`, return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping. Greedily sort intervals by end time.",
        input_format="A 2D integer array `intervals`.",
        output_format="Return the minimum number of interval removals.",
        constraints="1 <= intervals.length <= 10^5\nintervals[i].length == 2\n-5 * 10^4 <= start_i < end_i <= 5 * 10^4",
        examples=[
            {
                "input": "intervals = [[1, 2], [2, 3], [3, 4], [1, 3]]",
                "output": "1",
                "explanation": "[1, 3] can be removed and the rest of the intervals are non-overlapping."
            },
            {
                "input": "intervals = [[1, 2], [1, 2], [1, 2]]",
                "output": "2",
                "explanation": "You need to remove two [1, 2] to make the rest non-overlapping."
            }
        ]
    ),

    "insert-interval": make_prob(
        description="You are given an array of non-overlapping intervals `intervals` where `intervals[i] = [start_i, end_i]` sorted in ascending order by `start_i`. You are also given an interval `newInterval = [start, end]`. Insert `newInterval` into `intervals` such that `intervals` is still sorted and non-overlapping (merging overlapping intervals if necessary).",
        input_format="A sorted list of disjoint intervals and a `newInterval`.",
        output_format="Return the updated sorted interval list.",
        constraints="0 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= start_i <= end_i <= 10^5\nnewInterval.length == 2",
        examples=[
            {
                "input": "intervals = [[1, 3], [6, 9]], newInterval = [2, 5]",
                "output": "[[1, 5], [6, 9]]",
                "explanation": "The new interval overlaps with [1, 3] creating [1, 5]."
            },
            {
                "input": "intervals = [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval = [4, 8]",
                "output": "[[1, 2], [3, 10], [12, 16]]",
                "explanation": "[4, 8] overlaps with [3, 5], [6, 7], [8, 10]."
            }
        ]
    ),

    "merge-intervals": make_prob(
        description="Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input. Sort intervals by start time and extend boundary.",
        input_format="A 2D integer array `intervals`.",
        output_format="Return a list of merged non-overlapping intervals.",
        constraints="1 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= start_i <= end_i <= 10^4",
        examples=[
            {
                "input": "intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]",
                "output": "[[1, 6], [8, 10], [15, 18]]",
                "explanation": "Since intervals [1, 3] and [2, 6] overlap, merge them into [1, 6]."
            },
            {
                "input": "intervals = [[1, 4], [4, 5]]",
                "output": "[[1, 5]]",
                "explanation": "Intervals [1, 4] and [4, 5] are considered overlapping."
            }
        ]
    ),

    "minimum-number-of-platforms-required-for-a-railway": make_prob(
        description="Given arrival and departure times of all trains that reach a railway station. Find the minimum number of platforms required for the railway station so that no train is kept waiting. Consider that all trains arrive on the same day and leave on the same day.",
        input_format="Two arrays: arrival times `arr` and departure times `dep` of size `n`.",
        output_format="Return the minimum number of platforms required.",
        constraints="1 <= n <= 10^5\n0000 <= arr[i] <= dep[i] <= 2359",
        examples=[
            {
                "input": "arr = [900, 940, 950, 1100, 1500, 1800], dep = [910, 1200, 1120, 1130, 1900, 2000]",
                "output": "3",
                "explanation": "Minimum 3 platforms are needed to accommodate all trains without conflict."
            },
            {
                "input": "arr = [900, 1100, 1235], dep = [1000, 1200, 1240]",
                "output": "1",
                "explanation": "Only 1 platform is needed since timings do not overlap."
            }
        ]
    ),

    "valid-paranthesis-checker": make_prob(
        description="Given a string `s` containing only three types of characters: `'('`, `')'` and `'*'`, return `true` if `s` is valid. The asterisk `'*'` could be treated as a single right parenthesis `')'`, a single left parenthesis `'('`, or an empty string `\"\"`.",
        input_format="A string `s` containing '(', ')', and '*'.",
        output_format="Return boolean `true` if string can be valid, else `false`.",
        constraints="1 <= s.length <= 100\ns[i] is '(', ')', or '*'.",
        examples=[
            {
                "input": "s = \"()\"",
                "output": "true",
                "explanation": "Standard balanced parenthesis."
            },
            {
                "input": "s = \"(*))\"",
                "output": "true",
                "explanation": "'*' acts as '(' to make \"(())\"."
            }
        ]
    ),

    "candy": make_prob(
        description="There are `n` children standing in a line. Each child is assigned a rating value given in the integer array `ratings`. You must give each child at least one candy. Children with a higher rating get more candies than their immediate neighbors. Return the minimum number of candies you need to have to distribute the candies to the children. Solve in O(N) time with O(N) space using left and right passes.",
        input_format="An integer array `ratings` of length `n`.",
        output_format="Return the minimum total candies needed.",
        constraints="n == ratings.length\n1 <= n <= 2 * 10^4\n0 <= ratings[i] <= 2 * 10^4",
        examples=[
            {
                "input": "ratings = [1, 0, 2]",
                "output": "5",
                "explanation": "You can allocate to the first, second and third child with 2, 1, 2 candies respectively."
            },
            {
                "input": "ratings = [1, 2, 2]",
                "output": "4",
                "explanation": "You can allocate 1, 2, 1 candies. The third child gets 1 candy because it satisfies the above two conditions."
            }
        ]
    ),

    "jump-game-ii": make_prob(
        description="You are given a 0-indexed array of integers `nums` of length `n`. You are initially positioned at `nums[0]`. Each element `nums[i]` represents the maximum length of a forward jump from index `i`. Return the minimum number of jumps to reach `nums[n - 1]`. You may assume that you can always reach the last index. Solve in O(N) time using BFS/greedy window approach.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the minimum jump count.",
        constraints="1 <= nums.length <= 10^4\n0 <= nums[i] <= 1000\nIt's guaranteed that you can reach nums[n - 1].",
        examples=[
            {
                "input": "nums = [2, 3, 1, 1, 4]",
                "output": "2",
                "explanation": "Jump 1 step from index 0 to 1, then 3 steps to the last index. Minimum jumps = 2."
            },
            {
                "input": "nums = [2, 3, 0, 1, 4]",
                "output": "2",
                "explanation": "Jump from 0 to 1, then 1 to 4."
            }
        ]
    ),
}
