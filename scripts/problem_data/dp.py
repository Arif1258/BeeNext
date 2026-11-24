from .common import make_prob

DP_DATA = {
    "introduction-to-dp": make_prob(
        description="Learn the foundations of Dynamic Programming (DP): Overlapping Subproblems and Optimal Substructure. Master the two core approaches: Top-Down DP with Memoization (caching recursive subproblem answers in an array or map) and Bottom-Up DP with Tabulation (iteratively building solutions from base cases). Learn how to optimize space complexity by keeping only the necessary previous states (e.g. `prev` and `prev2` for Fibonacci).",
        input_format="An integer `n`.",
        output_format="Return the n-th Fibonacci number computed via dynamic programming.",
        constraints="0 <= n <= 45",
        examples=[
            {
                "input": "n = 5",
                "output": "5",
                "explanation": "Fibonacci sequence: 0, 1, 1, 2, 3, 5."
            },
            {
                "input": "n = 2",
                "output": "1",
                "explanation": "Fib(2) = Fib(1) + Fib(0) = 1 + 0 = 1."
            }
        ]
    ),

    "climbing-stairs": make_prob(
        description="You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top? Solve in O(N) time and O(1) space using recurrence: `ways(n) = ways(n - 1) + ways(n - 2)`.",
        input_format="An integer `n`.",
        output_format="Return the number of distinct ways to climb to the top.",
        constraints="1 <= n <= 45",
        examples=[
            {
                "input": "n = 2",
                "output": "2",
                "explanation": "Two ways: 1 step + 1 step, or 2 steps."
            },
            {
                "input": "n = 3",
                "output": "3",
                "explanation": "Three ways: 1+1+1, 1+2, 2+1."
            }
        ]
    ),

    "frog-jump": make_prob(
        description="Given an array of heights of `n` stairs. A frog is initially at the 1st stair (index 0). At any stair `i`, the frog can jump to either stair `i + 1` or stair `i + 2`. The energy lost in jumping from stair `i` to `j` is `|height[i] - height[j]|`. Find the minimum total energy lost by the frog to reach the `n`-th stair (index n - 1). Solve in O(N) time and O(1) space.",
        input_format="An integer array `height` of length `n`.",
        output_format="Return the minimum energy spent as an integer.",
        constraints="1 <= height.length <= 10^5\n0 <= height[i] <= 10^4",
        examples=[
            {
                "input": "height = [10, 20, 30, 10]",
                "output": "20",
                "explanation": "Jump from 0 to 1 (energy 10) and 1 to 3 (energy 10). Total = 20."
            },
            {
                "input": "height = [10, 50, 10]",
                "output": "0",
                "explanation": "Jump directly from 0 to 2 with energy |10 - 10| = 0."
            }
        ]
    ),

    "frog-jump-with-k-distances": make_prob(
        description="This is a follow-up problem to Frog Jump. Now, from stair `i`, the frog can jump up to `k` steps ahead (i.e. to `i + 1`, `i + 2`, ..., `i + k`). Find the minimum total energy lost by the frog to reach the `n`-th stair. Solve in O(N * K) time with O(K) space.",
        input_format="An integer array `height` of length `n` and an integer `k`.",
        output_format="Return the minimum energy spent.",
        constraints="1 <= height.length <= 10^5\n1 <= k <= 100\n0 <= height[i] <= 10^4",
        examples=[
            {
                "input": "height = [10, 30, 40, 50, 20], k = 3",
                "output": "30",
                "explanation": "Jump from index 0 to 1 (cost 20), then 1 to 4 (cost 10). Total = 30."
            },
            {
                "input": "height = [10, 20, 10], k = 1",
                "output": "20",
                "explanation": "Must jump 1 step each time: 10 + 10 = 20."
            }
        ]
    ),

    "maximum-sum-of-non-adjacent-elements": make_prob(
        description="Given an array of integers `nums`, find the maximum sum of a subsequence such that no two elements in the subsequence are adjacent in the array. Solve in O(N) time and O(1) space maintaining `pick` and `notPick` states.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the maximum non-adjacent sum.",
        constraints="1 <= nums.length <= 10^5\n0 <= nums[i] <= 10^4",
        examples=[
            {
                "input": "nums = [2, 1, 4, 9]",
                "output": "11",
                "explanation": "Choose 2 and 9 for maximum sum 11."
            },
            {
                "input": "nums = [1, 2, 4]",
                "output": "5",
                "explanation": "Choose 1 and 4. Sum = 5."
            }
        ]
    ),

    "house-robber": make_prob(
        description="You are a professional robber planning to rob houses along a circular street. Each house has a certain amount of money stashed. Since adjacent houses have security systems connected, you cannot rob two adjacent houses. Furthermore, the first and last house are neighbors! Return the maximum amount of money you can rob tonight without alerting the police. Solve using two passes of Maximum Sum of Non-Adjacent Elements: `max(rob(0..n-2), rob(1..n-1))`.",
        input_format="An integer array `nums` representing cash in each circular house.",
        output_format="Return the maximum stolen cash.",
        constraints="1 <= nums.length <= 100\n0 <= nums[i] <= 1000",
        examples=[
            {
                "input": "nums = [2, 3, 2]",
                "output": "3",
                "explanation": "Cannot rob house 1 (money 2) and house 3 (money 2) because they are adjacent in a circle. Max is 3."
            },
            {
                "input": "nums = [1, 2, 3, 1]",
                "output": "4",
                "explanation": "Rob house 1 (money 1) and house 3 (money 3). Total = 4."
            }
        ]
    ),

    "ninja's-training": make_prob(
        description="Ninja is planning this `n` days-long training schedule. Each day he can perform any one of 3 activities: Running (0), Fighting (1), or Learning (2). Each activity on day `i` earns him points given by `points[i][0]`, `points[i][1]`, and `points[i][2]`. Ninja cannot perform the same activity on two consecutive days. Find the maximum merit points Ninja can earn. Solve in O(N * 3 * 3) time with O(1) space.",
        input_format="An `n x 3` 2D array `points`.",
        output_format="Return the maximum merit points Ninja can achieve.",
        constraints="1 <= n <= 10^5\n1 <= points[i][j] <= 100",
        examples=[
            {
                "input": "points = [[10, 40, 70], [20, 50, 80], [30, 60, 90]]",
                "output": "210",
                "explanation": "Day 1: Activity 2 (70), Day 2: Activity 1 (50), Day 3: Activity 2 (90). Total = 210."
            },
            {
                "input": "points = [[1, 2, 5], [3, 1, 1], [3, 3, 3]]",
                "output": "11",
                "explanation": "Day 1: 5, Day 2: 3, Day 3: 3. Total = 11."
            }
        ]
    ),

    "grid-unique-paths": make_prob(
        description="There is a robot on an `m x n` grid. The robot is initially located at the top-left corner `(0, 0)` and wants to reach the bottom-right corner `(m - 1, n - 1)`. The robot can only move either down or right at any point in time. Given the two integers `m` and `n`, return the number of possible unique paths. Solve using 2D DP `dp[i][j] = dp[i-1][j] + dp[i][j-1]` in O(m * n) time and O(n) space, or using combinations `(m+n-2) C (m-1)` in O(min(m, n)).",
        input_format="Two positive integers `m` and `n`.",
        output_format="Return the number of unique paths as an integer.",
        constraints="1 <= m, n <= 100",
        examples=[
            {
                "input": "m = 3, n = 7",
                "output": "28",
                "explanation": "From (0, 0) to (2, 6) there are 28 unique down/right paths."
            },
            {
                "input": "m = 3, n = 2",
                "output": "3",
                "explanation": "Three unique paths: Right->Down->Down, Down->Down->Right, Down->Right->Down."
            }
        ]
    ),

    "unique-paths-ii": make_prob(
        description="You are given an `m x n` integer array `obstacleGrid`. There is a robot initially at `(0, 0)`. The robot tries to move to `(m - 1, n - 1)`. It can only move either down or right. An obstacle and space are marked as 1 or 0 respectively in `obstacleGrid`. A path cannot include any square that is an obstacle. Return the number of possible unique paths.",
        input_format="An `m x n` 2D grid containing 0s and 1s.",
        output_format="Return the number of obstacle-free unique paths.",
        constraints="m == obstacleGrid.length\nn == obstacleGrid[i].length\n1 <= m, n <= 100\nobstacleGrid[i][j] is 0 or 1.",
        examples=[
            {
                "input": "obstacleGrid = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]",
                "output": "2",
                "explanation": "There is one obstacle in the middle of the 3x3 grid. Two unique paths reach bottom-right."
            },
            {
                "input": "obstacleGrid = [[0, 1], [0, 0]]",
                "output": "1",
                "explanation": "One path exists."
            }
        ]
    ),

    "minimum-falling-path-sum": make_prob(
        description="Given an `n x n` array of integers `matrix`, return the minimum sum of any falling path through `matrix`. A falling path starts at any element in the first row and chooses the element in the next row that is either directly below or diagonally left/right. Solve in O(n^2) time and O(n) space using bottom-up DP.",
        input_format="An `n x n` 2D integer matrix.",
        output_format="Return the minimum falling path sum.",
        constraints="n == matrix.length == matrix[i].length\n1 <= n <= 100\n-100 <= matrix[i][j] <= 100",
        examples=[
            {
                "input": "matrix = [[2, 1, 3], [6, 5, 4], [7, 8, 9]]",
                "output": "13",
                "explanation": "Falling path: 1 -> 5 -> 7 with minimum sum 1 + 5 + 7 = 13."
            },
            {
                "input": "matrix = [[-19, 57], [-40, -5]]",
                "output": "-59",
                "explanation": "-19 -> -40 = -59."
            }
        ]
    ),

    "triangle": make_prob(
        description="Given a `triangle` array, return the minimum path sum from top to bottom. For each step, you may move to an adjacent number of the row below. More formally, if you are on index `i` on the current row, you may move to either index `i` or index `i + 1` on the next row. Solve in O(N^2) time and O(N) space using bottom-up DP.",
        input_format="A list of lists of integers representing a triangle.",
        output_format="Return the minimum path sum from apex to base.",
        constraints="1 <= triangle.length <= 200\ntriangle[0].length == 1\ntriangle[i].length == triangle[i - 1].length + 1\n-10^4 <= triangle[i][j] <= 10^4",
        examples=[
            {
                "input": "triangle = [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]",
                "output": "11",
                "explanation": "The minimum path sum from top to bottom is 2 + 3 + 5 + 1 = 11."
            },
            {
                "input": "triangle = [[-10]]",
                "output": "-10",
                "explanation": "Single element."
            }
        ]
    ),

    "cherry-pickup-ii": make_prob(
        description="You are given a `rows x cols` matrix `grid` representing a field of cherries where `grid[i][j]` represents the number of cherries in that cell. You have two robots: Robot #1 is at `(0, 0)` and Robot #2 is at `(0, cols - 1)`. In each step, both robots move down to row `i + 1` and can shift column by -1, 0, or +1. If both are at the same cell, only one takes the cherries. Return the maximum cherries collected. Solve in O(rows * cols^2) using 3D DP `dp[i][j1][j2]`.",
        input_format="A 2D integer matrix `grid`.",
        output_format="Return the maximum cherries collected by both robots.",
        constraints="rows == grid.length\ncols == grid[i].length\n2 <= rows, cols <= 70\n0 <= grid[i][j] <= 100",
        examples=[
            {
                "input": "grid = [[3, 1, 1], [2, 5, 1], [1, 5, 5], [2, 1, 1]]",
                "output": "24",
                "explanation": "Path of robot 1 and 2 maximizes total cherries collected to 24."
            },
            {
                "input": "grid = [[1, 0, 0, 0, 0, 0, 1], [2, 0, 0, 0, 0, 3, 0], [2, 0, 9, 0, 0, 0, 0], [0, 3, 0, 5, 4, 0, 0], [1, 0, 2, 3, 0, 0, 6]]",
                "output": "28",
                "explanation": "Max cherries collected = 28."
            }
        ]
    ),

    "count-square-submatrices-with-all-one": make_prob(
        description="Given a `m x n` matrix of ones and zeros, return how many square submatrices have all ones. DP relation: if `matrix[i][j] == 1`, `dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])`. Summing all `dp[i][j]` yields total square submatrices in O(m * n) time.",
        input_format="An `m x n` 2D binary matrix.",
        output_format="Return the total count of square submatrices with all 1s.",
        constraints="1 <= m, n <= 300\nmatrix[i][j] is 0 or 1.",
        examples=[
            {
                "input": "matrix = [[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]]",
                "output": "15",
                "explanation": "Squares of side 1: 10; squares of side 2: 4; square of side 3: 1. Total = 15."
            },
            {
                "input": "matrix = [[1, 0, 1], [1, 1, 0], [1, 1, 0]]",
                "output": "7",
                "explanation": "Squares of side 1: 6; square of side 2: 1. Total = 7."
            }
        ]
    ),

    "best-time-to-buy-and-sell-stock": make_prob(
        description="You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve. Solve in O(N) time and O(1) space tracking the minimum price seen so far.",
        input_format="An integer array `prices`.",
        output_format="Return the maximum achievable profit.",
        constraints="1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
        examples=[
            {
                "input": "prices = [7, 1, 5, 3, 6, 4]",
                "output": "5",
                "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."
            },
            {
                "input": "prices = [7, 6, 4, 3, 1]",
                "output": "0",
                "explanation": "Prices continuously fall, no positive profit achievable."
            }
        ]
    ),

    "best-time-to-buy-and-sell-stock-ii": make_prob(
        description="You are given an integer array `prices` where `prices[i]` is the price of a given stock on the `i`-th day. On each day, you may decide to buy and/or sell the stock. You can only hold at most one share of the stock at any time. Find and return the maximum profit you can achieve. Solve in O(N) time using DP or greedy accumulation of all positive price differences.",
        input_format="An integer array `prices`.",
        output_format="Return the maximum profit achievable with unlimited transactions.",
        constraints="1 <= prices.length <= 3 * 10^4\n0 <= prices[i] <= 10^4",
        examples=[
            {
                "input": "prices = [7, 1, 5, 3, 6, 4]",
                "output": "7",
                "explanation": "Buy on day 2 (price 1) and sell on day 3 (price 5), profit = 4. Buy on day 4 (price 3) and sell on day 5 (price 6), profit = 3. Total profit = 4 + 3 = 7."
            },
            {
                "input": "prices = [1, 2, 3, 4, 5]",
                "output": "4",
                "explanation": "Buy on day 1 and sell on day 5, profit = 4."
            }
        ]
    ),

    "best-time-to-buy-and-sell-stock-iii": make_prob(
        description="Find the maximum profit you can achieve from a stock prices array with at most two transactions. You may not engage in multiple transactions simultaneously. Solve in O(N) time and O(1) space using 4 states: `buy1`, `sell1`, `buy2`, `sell2` or DP `dp[i][buy][cap]`.",
        input_format="An integer array `prices`.",
        output_format="Return the maximum profit with at most 2 transactions.",
        constraints="1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^5",
        examples=[
            {
                "input": "prices = [3, 3, 5, 0, 0, 3, 1, 4]",
                "output": "6",
                "explanation": "Buy on day 4 (price 0) and sell on day 6 (price 3), profit = 3. Buy on day 7 (price 1) and sell on day 8 (price 4), profit = 3. Total = 6."
            },
            {
                "input": "prices = [1, 2, 3, 4, 5]",
                "output": "4",
                "explanation": "Single transaction buy day 1, sell day 5 gives 4."
            }
        ]
    ),

    "best-time-to-buy-and-sell-stock-iv": make_prob(
        description="You are given an integer array `prices` where `prices[i]` is the price of a given stock on the `i`-th day, and an integer `k`. Find the maximum profit you can achieve. You may complete at most `k` transactions. Solve in O(N * K) time and O(K) space using DP.",
        input_format="An integer `k` and an integer array `prices`.",
        output_format="Return the maximum profit with at most `k` transactions.",
        constraints="1 <= k <= 100\n1 <= prices.length <= 1000\n0 <= prices[i] <= 1000",
        examples=[
            {
                "input": "k = 2, prices = [2, 4, 1]",
                "output": "2",
                "explanation": "Buy on day 1 (price 2) and sell on day 2 (price 4), profit = 2."
            },
            {
                "input": "k = 2, prices = [3, 2, 6, 5, 0, 3]",
                "output": "7",
                "explanation": "Buy day 2 sell day 3 (profit 4); buy day 5 sell day 6 (profit 3). Total = 7."
            }
        ]
    ),

    "best-time-to-buy-and-sell-stock-with-cooldown-and-transaction-fees": make_prob(
        description="You are given an array `prices` representing stock prices and an integer `fee` representing a transaction fee. You may complete as many transactions as you like, but you need to pay the transaction fee for each transaction. Return the maximum profit you can achieve. Solve in O(N) time and O(1) space.",
        input_format="An integer array `prices` and an integer `fee`.",
        output_format="Return maximum profit after fees.",
        constraints="1 <= prices.length <= 5 * 10^4\n1 <= prices[i] <= 5 * 10^4\n0 <= fee <= 5 * 10^4",
        examples=[
            {
                "input": "prices = [1, 3, 2, 8, 4, 9], fee = 2",
                "output": "8",
                "explanation": "Buy at 1, sell at 8 (profit 8-1-2 = 5). Buy at 4, sell at 9 (profit 9-4-2 = 3). Total = 8."
            },
            {
                "input": "prices = [1, 3, 7, 5, 10, 3], fee = 3",
                "output": "6",
                "explanation": "Max profit is 6."
            }
        ]
    ),

    "best-time-to-buy-and-sell-stock-with-cooldown": make_prob(
        description="You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day. Find the maximum profit you can achieve. After you sell your stock, you cannot buy stock on the next day (i.e., cooldown one day). Solve in O(N) time and O(1) space with 3 states: `buy`, `sell`, and `cooldown`.",
        input_format="An integer array `prices`.",
        output_format="Return maximum profit with cooldown.",
        constraints="1 <= prices.length <= 5000\n0 <= prices[i] <= 1000",
        examples=[
            {
                "input": "prices = [1, 2, 3, 0, 2]",
                "output": "3",
                "explanation": "Transactions: [buy, sell, cooldown, buy, sell]."
            },
            {
                "input": "prices = [1]",
                "output": "0",
                "explanation": "Cannot sell single day stock."
            }
        ]
    ),

    "subset-sum-equals-to-target": make_prob(
        description="Given an array of non-negative integers `nums` and a value `target`, determine if there is a subset of the given array with sum equal to given `target`. Solve in O(N * target) time and O(target) space using dynamic programming: `dp[j] = dp[j] || dp[j - nums[i]]`.",
        input_format="An integer array `nums` and integer `target`.",
        output_format="Return boolean `true` if subset sum equals target, else `false`.",
        constraints="1 <= nums.length <= 100\n1 <= nums[i] <= 1000\n1 <= target <= 10^4",
        examples=[
            {
                "input": "nums = [3, 34, 4, 12, 5, 2], target = 9",
                "output": "true",
                "explanation": "Subset [4, 5] sums to 9."
            },
            {
                "input": "nums = [1, 2, 3], target = 7",
                "output": "false",
                "explanation": "No subset sums to 7."
            }
        ]
    ),

    "partition-equal-subset-sum": make_prob(
        description="Given an integer array `nums`, return `true` if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or `false` otherwise. If `totalSum` is odd, return `false`. Otherwise, reduce to finding a subset with sum `totalSum / 2`.",
        input_format="An integer array `nums`.",
        output_format="Return boolean `true` if equal partition exists, else `false`.",
        constraints="1 <= nums.length <= 200\n1 <= nums[i] <= 100",
        examples=[
            {
                "input": "nums = [1, 5, 11, 5]",
                "output": "true",
                "explanation": "The array can be partitioned as [1, 5, 5] and [11]."
            },
            {
                "input": "nums = [1, 2, 3, 5]",
                "output": "false",
                "explanation": "Total sum is 11 (odd), cannot be partitioned equally."
            }
        ]
    ),

    "partition-a-set-into-two-subsets-with-minimum-absolute-sum-difference": make_prob(
        description="Given an integer array `nums`, partition it into two non-empty subsets such that the absolute difference between their sums is minimized. Return the minimum absolute sum difference. Solve in O(N * totalSum) using the last row of the subset-sum DP table.",
        input_format="An integer array `nums`.",
        output_format="Return the minimum absolute sum difference.",
        constraints="1 <= nums.length <= 100\n1 <= nums[i] <= 1000",
        examples=[
            {
                "input": "nums = [1, 6, 11, 5]",
                "output": "1",
                "explanation": "Subset 1: [1, 5, 6] (sum 12), Subset 2: [11] (sum 11). Difference = |12 - 11| = 1."
            },
            {
                "input": "nums = [1, 4]",
                "output": "3",
                "explanation": "|4 - 1| = 3."
            }
        ]
    ),

    "count-subsets-with-sum-k": make_prob(
        description="Given an array `nums` of non-negative integers and an integer `k`, count the number of subsets with sum equal to `k`. Since the answer may be large, return it modulo 10^9 + 7. Be mindful of zeros in the input which double the number of valid subsets.",
        input_format="An integer array `nums` and target integer `k`.",
        output_format="Return the total count of subsets modulo 10^9 + 7.",
        constraints="1 <= nums.length <= 1000\n0 <= nums[i] <= 1000\n0 <= k <= 1000",
        examples=[
            {
                "input": "nums = [1, 2, 2, 3], k = 3",
                "output": "3",
                "explanation": "Subsets: [1, 2], [1, 2], and [3]."
            },
            {
                "input": "nums = [0, 0, 1], k = 1",
                "output": "4",
                "explanation": "Four subsets due to inclusion/exclusion of zeros."
            }
        ]
    ),

    "count-partitions-with-given-difference": make_prob(
        description="Given an array `nums` of `n` integers and an integer `d`. Find the number of ways to partition the array into two subsets `S1` and `S2` such that `sum(S1) >= sum(S2)` and `sum(S1) - sum(S2) = d`. Formula: `sum(S1) = (totalSum + d) / 2`. If `(totalSum + d)` is odd or `totalSum < d`, return 0.",
        input_format="An integer array `nums` and integer difference `d`.",
        output_format="Return the number of partitions modulo 10^9 + 7.",
        constraints="1 <= nums.length <= 1000\n0 <= nums[i] <= 1000\n0 <= d <= 1000",
        examples=[
            {
                "input": "nums = [5, 2, 6, 4], d = 3",
                "output": "1",
                "explanation": "Total sum = 17. (17 + 3) / 2 = 10. Only [6, 4] sums to 10."
            },
            {
                "input": "nums = [1, 1, 1, 1], d = 0",
                "output": "6",
                "explanation": "Six ways to partition into two equal subsets of sum 2."
            }
        ]
    ),

    "0-and-1-knapsack": make_prob(
        description="You are given weights and values of `N` items, put these items in a knapsack of capacity `W` to get the maximum total value in the knapsack. Note that we have only one quantity of each item (0/1 choice). Solve in O(N * W) time and O(W) space using dynamic programming: `dp[w] = max(dp[w], val[i] + dp[w - wt[i]])` traversed in reverse.",
        input_format="An integer `W` (capacity), array `val` of values, and array `wt` of weights.",
        output_format="Return the maximum achievable value.",
        constraints="1 <= N <= 1000\n1 <= W <= 1000\n1 <= val[i], wt[i] <= 1000",
        examples=[
            {
                "input": "W = 4, val = [1, 2, 3], wt = [4, 5, 1]",
                "output": "3",
                "explanation": "Select the 3rd item with weight 1 and value 3."
            },
            {
                "input": "W = 3, val = [1, 2, 3], wt = [4, 5, 6]",
                "output": "0",
                "explanation": "No item fits into knapsack."
            }
        ]
    ),

    "minimum-coins": make_prob(
        description="You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1. You may assume that you have an infinite number of each kind of coin. Solve in O(N * amount) using unbounded knapsack DP.",
        input_format="An integer array `coins` and integer `amount`.",
        output_format="Return the minimum coin count, or -1.",
        constraints="1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4",
        examples=[
            {
                "input": "coins = [1, 2, 5], amount = 11",
                "output": "3",
                "explanation": "11 = 5 + 5 + 1 (3 coins)."
            },
            {
                "input": "coins = [2], amount = 3",
                "output": "-1",
                "explanation": "3 cannot be formed using only 2."
            }
        ]
    ),

    "target-sum": make_prob(
        description="You are given an integer array `nums` and an integer `target`. You want to build an expression out of nums by adding one of the symbols `'+'` and `'-'` before each integer in nums. Return the number of different expressions that evaluate to `target`. Note: equivalent to partitioning into two subsets `S1` and `S2` with difference `target`.",
        input_format="An integer array `nums` and integer `target`.",
        output_format="Return the number of ways to reach target.",
        constraints="1 <= nums.length <= 20\n0 <= nums[i] <= 1000\n-1000 <= target <= 1000",
        examples=[
            {
                "input": "nums = [1, 1, 1, 1, 1], target = 3",
                "output": "5",
                "explanation": "There are 5 ways to assign signs to make sum 3."
            },
            {
                "input": "nums = [1], target = 1",
                "output": "1",
                "explanation": "+1 = 1."
            }
        ]
    ),

    "coin-change-ii": make_prob(
        description="You are given an integer array `coins` representing coins of different denominations and an integer `amount`. Return the number of combinations that make up that amount. If that amount cannot be made up, return 0. You have an infinite number of each kind of coin. Solve in O(N * amount) time and O(amount) space.",
        input_format="An integer array `coins` and integer `amount`.",
        output_format="Return total combination count.",
        constraints="1 <= coins.length <= 300\n1 <= coins[i] <= 5000\n0 <= amount <= 5000",
        examples=[
            {
                "input": "amount = 5, coins = [1, 2, 5]",
                "output": "4",
                "explanation": "Four ways: 5, 2+2+1, 2+1+1+1, 1+1+1+1+1."
            },
            {
                "input": "amount = 3, coins = [2]",
                "output": "0",
                "explanation": "Cannot form 3 using only 2."
            }
        ]
    ),

    "unbounded-knapsack": make_prob(
        description="Given a set of `N` items, each with a weight and a value, represented by the array `wt` and `val` respectively. Also, a knapsack with weight limit `W`. The task is to fill the knapsack in such a way that we can get the maximum profit. Return the maximum profit. Note: each item can be taken any number of times (unbounded).",
        input_format="Integer `W` (capacity), arrays `val` and `wt`.",
        output_format="Return maximum value achievable.",
        constraints="1 <= N, W <= 1000\n1 <= val[i], wt[i] <= 1000",
        examples=[
            {
                "input": "W = 10, val = [1, 30], wt = [1, 3]",
                "output": "100",
                "explanation": "Pick item 2 three times (weight 9, value 90) and item 1 once (weight 1, value 1). Or pick item 2 with 30/3 = 10 ratio 3 times."
            },
            {
                "input": "W = 3, val = [1, 1], wt = [2, 1]",
                "output": "3",
                "explanation": "Pick item 2 three times: 3 * 1 = 3."
            }
        ]
    ),

    "rod-cutting-problem": make_prob(
        description="Given a rod of length `N` inches and an array of prices `price` that includes prices of all pieces of size smaller than or equal to `N`. Determine the maximum value obtainable by cutting up the rod and selling the pieces. Unbounded knapsack model where piece size `i` has profit `price[i - 1]`.",
        input_format="An integer array `price` and integer `n`.",
        output_format="Return maximum revenue as an integer.",
        constraints="1 <= n <= 1000\n1 <= price[i] <= 10^5",
        examples=[
            {
                "input": "price = [1, 5, 8, 9, 10, 17, 17, 20], n = 8",
                "output": "22",
                "explanation": "Cut into pieces of lengths 2 and 6 for price 5 + 17 = 22."
            },
            {
                "input": "price = [3, 5, 8, 9, 10, 17, 17, 20], n = 8",
                "output": "24",
                "explanation": "Cut into 8 pieces of length 1 for 8 * 3 = 24."
            }
        ]
    ),

    "longest-increasing-subsequence": make_prob(
        description="Given an integer array `nums`, return the length of the longest strictly increasing subsequence. Solve in O(N^2) time using dynamic programming, or in O(N log N) time using patience sorting with binary search (`lower_bound`).",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the length of the longest increasing subsequence.",
        constraints="1 <= nums.length <= 2500\n-10^4 <= nums[i] <= 10^4",
        examples=[
            {
                "input": "nums = [10, 9, 2, 5, 3, 7, 101, 18]",
                "output": "4",
                "explanation": "The longest increasing subsequence is [2, 3, 7, 101], therefore the length is 4."
            },
            {
                "input": "nums = [0, 1, 0, 3, 2, 3]",
                "output": "4",
                "explanation": "The LIS is [0, 1, 2, 3]."
            }
        ]
    ),

    "print-longest-increasing-subsequence": make_prob(
        description="Given an integer array `nums`, find and print the actual elements forming the Longest Increasing Subsequence. Solve in O(N^2) time using an array `parent[]` to backtrack the chosen sequence.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the list of integers forming the LIS.",
        constraints="1 <= nums.length <= 1000\n-10^5 <= nums[i] <= 10^5",
        examples=[
            {
                "input": "nums = [10, 22, 9, 33, 21, 50, 41, 60, 80]",
                "output": "[10, 22, 33, 50, 60, 80]",
                "explanation": "Length is 6 and the sequence is strictly increasing."
            },
            {
                "input": "nums = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15]",
                "output": "[0, 4, 6, 9, 13, 15]",
                "explanation": "Valid LIS of length 6."
            }
        ]
    ),

    "largest-divisible-subset": make_prob(
        description="Given a set of distinct positive integers `nums`, return the largest subset `answer` such that every pair `(answer[i], answer[j])` satisfies `answer[i] % answer[j] == 0` or `answer[j] % answer[i] == 0`. Sort the array first and adapt the Longest Increasing Subsequence algorithm using the divisibility condition.",
        input_format="An integer array `nums` of distinct positive integers.",
        output_format="Return a list representing the largest divisible subset.",
        constraints="1 <= nums.length <= 1000\n1 <= nums[i] <= 2 * 10^9\nAll elements are unique.",
        examples=[
            {
                "input": "nums = [1, 2, 3]",
                "output": "[1, 2]",
                "explanation": "[1, 3] is also valid."
            },
            {
                "input": "nums = [1, 2, 4, 8]",
                "output": "[1, 2, 4, 8]",
                "explanation": "Every element divides the subsequent one."
            }
        ]
    ),

    "longest-string-chain": make_prob(
        description="You are given an array of `words` where each word consists of lowercase English letters. `wordA` is a predecessor of `wordB` if and only if we can insert exactly one letter anywhere in `wordA` without changing the order of the other characters to make it equal to `wordB`. Return the length of the longest possible word chain with words chosen from the given list of words.",
        input_format="An array of strings `words`.",
        output_format="Return the integer length of the longest word chain.",
        constraints="1 <= words.length <= 1000\n1 <= words[i].length <= 16\nwords[i] only consists of lowercase English letters.",
        examples=[
            {
                "input": "words = [\"a\", \"b\", \"ba\", \"bca\", \"bda\", \"bdca\"]",
                "output": "4",
                "explanation": "One of the longest word chains is [\"a\", \"ba\", \"bda\", \"bdca\"]."
            },
            {
                "input": "words = [\"xbc\", \"pcxbcf\", \"xb\", \"cxbc\", \"pcxbc\"]",
                "output": "5",
                "explanation": "Chain: \"xb\" -> \"xbc\" -> \"cxbc\" -> \"pcxbc\" -> \"pcxbcf\"."
            }
        ]
    ),

    "longest-bitonic-subsequence": make_prob(
        description="Given an array of positive integers `nums`, find the length of the Longest Bitonic Subsequence. A subsequence is bitonic if it is first strictly increasing, and then strictly decreasing. Solve in O(N^2) time by calculating LIS from left `dp1[]` and LIS from right `dp2[]`, then maximizing `dp1[i] + dp2[i] - 1`.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the maximum length of a bitonic subsequence.",
        constraints="1 <= nums.length <= 1000\n1 <= nums[i] <= 10^4",
        examples=[
            {
                "input": "nums = [1, 2, 5, 3, 2]",
                "output": "5",
                "explanation": "[1, 2, 5, 3, 2] is bitonic with length 5."
            },
            {
                "input": "nums = [1, 11, 2, 10, 4, 5, 2, 1]",
                "output": "6",
                "explanation": "Bitonic sequence: [1, 2, 10, 4, 2, 1] has length 6."
            }
        ]
    ),

    "number-of-longest-increasing-subsequences": make_prob(
        description="Given an integer array `nums`, return the number of longest increasing subsequences. Track both `len[i]` (length of LIS ending at i) and `count[i]` (number of LIS of that length ending at i) in O(N^2) time.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return total count of LIS sequences.",
        constraints="1 <= nums.length <= 2000\n-10^6 <= nums[i] <= 10^6",
        examples=[
            {
                "input": "nums = [1, 3, 5, 4, 7]",
                "output": "2",
                "explanation": "The two LIS of length 4 are [1, 3, 4, 7] and [1, 3, 5, 7]."
            },
            {
                "input": "nums = [2, 2, 2, 2, 2]",
                "output": "5",
                "explanation": "Each element forms an LIS of length 1."
            }
        ]
    ),

    "longest-common-subsequence": make_prob(
        description="Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0. A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters. Solve in O(M * N) time and O(N) space using 2D DP.",
        input_format="Two strings `text1` and `text2`.",
        output_format="Return the length of the longest common subsequence as an integer.",
        constraints="1 <= text1.length, text2.length <= 1000\ntext1 and text2 consist of only lowercase English characters.",
        examples=[
            {
                "input": "text1 = \"abcde\", text2 = \"ace\"",
                "output": "3",
                "explanation": "The longest common subsequence is \"ace\" and its length is 3."
            },
            {
                "input": "text1 = \"abc\", text2 = \"def\"",
                "output": "0",
                "explanation": "There is no such common subsequence, so the result is 0."
            }
        ]
    ),

    "longest-common-substring": make_prob(
        description="Given two strings `s1` and `s2`, find the length of the longest common substring between them (contiguous characters). If `s1[i-1] == s2[j-1]`, then `dp[i][j] = 1 + dp[i-1][j-1]`; otherwise `dp[i][j] = 0`. Track the global maximum in O(M * N) time and O(N) space.",
        input_format="Two strings `s1` and `s2`.",
        output_format="Return the length of the longest common contiguous substring.",
        constraints="1 <= s1.length, s2.length <= 1000\ns1 and s2 consist of lowercase English letters.",
        examples=[
            {
                "input": "s1 = \"ABCDGH\", s2 = \"ACDGHR\"",
                "output": "4",
                "explanation": "The longest common substring is \"CDGH\" with length 4."
            },
            {
                "input": "s1 = \"ABC\", s2 = \"ACB\"",
                "output": "1",
                "explanation": "Longest common substring has length 1."
            }
        ]
    ),

    "longest-palindromic-subsequence": make_prob(
        description="Given a string `s`, find the longest palindromic subsequence's length in `s`. Solve by finding the Longest Common Subsequence between string `s` and its reverse `reverse(s)` in O(N^2) time.",
        input_format="A string `s`.",
        output_format="Return the length of the longest palindromic subsequence.",
        constraints="1 <= s.length <= 1000\ns consists only of lowercase English letters.",
        examples=[
            {
                "input": "s = \"bbbab\"",
                "output": "4",
                "explanation": "One possible longest palindromic subsequence is \"bbbb\"."
            },
            {
                "input": "s = \"cbbd\"",
                "output": "2",
                "explanation": "One possible longest palindromic subsequence is \"bb\"."
            }
        ]
    ),

    "minimum-insertions-to-make-string-palindrome": make_prob(
        description="Given a string `s`. In one step you can insert any character at any index of the string. Return the minimum number of steps to make `s` palindrome. Formula: `n - Longest_Palindromic_Subsequence(s)` in O(N^2) time.",
        input_format="A string `s`.",
        output_format="Return the minimum insertions count.",
        constraints="1 <= s.length <= 500\ns consists of lowercase English letters.",
        examples=[
            {
                "input": "s = \"zzazz\"",
                "output": "0",
                "explanation": "The string \"zzazz\" is already a palindrome we don't need any insertions."
            },
            {
                "input": "s = \"mbadm\"",
                "output": "2",
                "explanation": "Insert 'b' and 'd' to form \"mbdadbm\"."
            }
        ]
    ),

    "minimum-insertions-or-deletions-to-convert-string-a-to-b": make_prob(
        description="Given two strings `word1` and `word2`, return the minimum number of steps required to make `word1` and `word2` the same. In each step, you can delete or insert one character. Formula: `(len(word1) - LCS) + (len(word2) - LCS)`.",
        input_format="Two strings `word1` and `word2`.",
        output_format="Return the minimum operations count.",
        constraints="1 <= word1.length, word2.length <= 500\nword1 and word2 consist of only lowercase English letters.",
        examples=[
            {
                "input": "word1 = \"sea\", word2 = \"eat\"",
                "output": "2",
                "explanation": "Delete 's' from \"sea\" to get \"ea\", insert 't' to get \"eat\"."
            },
            {
                "input": "word1 = \"leetcode\", word2 = \"etco\"",
                "output": "4",
                "explanation": "Delete 'l', 'e', 'd', 'e' from \"leetcode\"."
            }
        ]
    ),

    "shortest-common-supersequence": make_prob(
        description="Given two strings `str1` and `str2`, return the shortest string that has both `str1` and `str2` as subsequences. If there are multiple valid strings, return any of them. Build the LCS DP table, then backtrack to reconstruct the supersequence.",
        input_format="Two strings `str1` and `str2`.",
        output_format="Return the shortest common supersequence string.",
        constraints="1 <= str1.length, str2.length <= 1000\nstr1 and str2 consist of lowercase English letters.",
        examples=[
            {
                "input": "str1 = \"abac\", str2 = \"cab\"",
                "output": "\"cabac\"",
                "explanation": "\"cabac\" contains both \"abac\" and \"cab\" as subsequences."
            },
            {
                "input": "str1 = \"aaaaaaaa\", str2 = \"aaaaaaaa\"",
                "output": "\"aaaaaaaa\"",
                "explanation": "Identical strings."
            }
        ]
    ),

    "distinct-subsequences": make_prob(
        description="Given two strings `s` and `t`, return the number of distinct subsequences of `s` which equals `t`. The test cases are generated so that the answer fits on a 64-bit signed integer. Solve in O(M * N) time and O(N) space using 2D DP.",
        input_format="Two strings `s` and `t`.",
        output_format="Return the count of distinct subsequences matching `t`.",
        constraints="1 <= s.length, t.length <= 1000\ns and t consist of English letters.",
        examples=[
            {
                "input": "s = \"rabbbit\", t = \"rabbit\"",
                "output": "3",
                "explanation": "There are 3 ways to form \"rabbit\" by omitting one of the 'b's."
            },
            {
                "input": "s = \"babgbag\", t = \"bag\"",
                "output": "5",
                "explanation": "There are 5 ways to pick \"bag\"."
            }
        ]
    ),

    "edit-distance": make_prob(
        description="Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`. You have the following three operations permitted on a word: Insert a character, Delete a character, Replace a character. Solve in O(M * N) time and O(N) space using Levenshtein distance DP.",
        input_format="Two strings `word1` and `word2`.",
        output_format="Return the minimum edit distance.",
        constraints="0 <= word1.length, word2.length <= 500\nword1 and word2 consist of lowercase English letters.",
        examples=[
            {
                "input": "word1 = \"horse\", word2 = \"ros\"",
                "output": "3",
                "explanation": "horse -> rorse (replace 'h' with 'r') -> rose (remove 'r') -> ros (remove 'e')."
            },
            {
                "input": "word1 = \"intention\", word2 = \"execution\"",
                "output": "5",
                "explanation": "Five operations to transform intention to execution."
            }
        ]
    ),

    "wildcard-matching": make_prob(
        description="Given an input string `s` and a pattern `p`, implement wildcard pattern matching with support for `'?'` (matches any single character) and `'*'` (matches any sequence of characters, including empty sequence). The matching should cover the entire input string. Solve in O(M * N) time.",
        input_format="A string `s` and a pattern `p`.",
        output_format="Return boolean `true` if match, else `false`.",
        constraints="0 <= s.length, p.length <= 2000\ns contains only lowercase English letters.\np contains only lowercase English letters, '?' or '*'.",
        examples=[
            {
                "input": "s = \"aa\", p = \"*\"",
                "output": "true",
                "explanation": "'*' matches any sequence."
            },
            {
                "input": "s = \"cb\", p = \"?a\"",
                "output": "false",
                "explanation": "'?' matches 'c', but the second letter is 'a' not 'b'."
            }
        ]
    ),

    "word-break": make_prob(
        description="Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words. Note that the same word in the dictionary may be reused multiple times in the segmentation. Solve in O(N^2) time using dynamic programming.",
        input_format="A string `s` and a list of strings `wordDict`.",
        output_format="Return boolean `true` if segmentable, else `false`.",
        constraints="1 <= s.length <= 300\n1 <= wordDict.length <= 1000\n1 <= wordDict[i].length <= 20\nAll words lowercase.",
        examples=[
            {
                "input": "s = \"leetcode\", wordDict = [\"leet\", \"code\"]",
                "output": "true",
                "explanation": "Segmented as \"leet code\"."
            },
            {
                "input": "s = \"applepenapple\", wordDict = [\"apple\", \"pen\"]",
                "output": "true",
                "explanation": "Segmented as \"apple pen apple\"."
            }
        ]
    ),

    "count-palindromic-subsequences": make_prob(
        description="Given a string `s`, return the number of distinct palindromic subsequences in `s`. Since the answer may be very large, return it modulo 10^9 + 7. Solve in O(N^2) using 2D DP based on the boundary matching characters.",
        input_format="A string `s`.",
        output_format="Return the count of palindromic subsequences modulo 10^9 + 7.",
        constraints="1 <= s.length <= 1000\ns consists of lowercase English letters.",
        examples=[
            {
                "input": "s = \"bccb\"",
                "output": "6",
                "explanation": "6 distinct palindromic subsequences: \"b\", \"c\", \"bb\", \"cc\", \"bcb\", \"bccb\"."
            },
            {
                "input": "s = \"abcd\"",
                "output": "4",
                "explanation": "Palindromes of length 1: \"a\", \"b\", \"c\", \"d\"."
            }
        ]
    ),

    "matrix-chain-multiplication": make_prob(
        description="Given a sequence of matrices, find the most efficient way to multiply these matrices together. The problem is not actually to perform the multiplications, but merely to decide in what order to perform the multiplications. Given array `arr[]` where matrix `i` has dimensions `arr[i-1] x arr[i]`, find minimum scalar multiplications. Solve in O(N^3) using Partition DP: `dp[i][j] = min(dp[i][k] + dp[k+1][j] + arr[i-1]*arr[k]*arr[j])`.",
        input_format="An integer array `arr` of matrix dimensions.",
        output_format="Return the minimum scalar multiplications as an integer.",
        constraints="2 <= arr.length <= 100\n1 <= arr[i] <= 500",
        examples=[
            {
                "input": "arr = [40, 20, 30, 10, 30]",
                "output": "26000",
                "explanation": "Optimal parenthesization: (A(BC))D requires 26000 multiplications."
            },
            {
                "input": "arr = [10, 20, 30]",
                "output": "6000",
                "explanation": "Only two matrices: 10 * 20 * 30 = 6000."
            }
        ]
    ),

    "burst-balloons": make_prob(
        description="You are given `n` balloons, indexed from `0` to `n - 1`. Each balloon is painted with a number on it represented by an array `nums`. You are asked to burst all the balloons. If you burst balloon `i` you will get `nums[i - 1] * nums[i] * nums[i + 1]` coins. If `i - 1` or `i + 1` goes out of bounds of the array, then treat it as if there is a balloon with a 1 painted on it. Return the maximum coins you can collect. Solve using reverse Partition DP in O(N^3) time.",
        input_format="An integer array `nums`.",
        output_format="Return the maximum coins collectable.",
        constraints="n == nums.length\n1 <= n <= 300\n0 <= nums[i] <= 100",
        examples=[
            {
                "input": "nums = [3, 1, 5, 8]",
                "output": "167",
                "explanation": "Burst 1 (3*1*5=15), then 5 (3*5*8=120), then 3 (1*3*8=24), then 8 (1*8*1=8). Total = 167."
            },
            {
                "input": "nums = [1, 5]",
                "output": "10",
                "explanation": "Max coins = 10."
            }
        ]
    ),

    "palindrome-partitioning-ii-": make_prob(
        description="Given a string `s`, partition `s` such that every substring of the partition is a palindrome. Return the minimum cuts needed for a palindrome partitioning of `s`. Solve in O(N^2) time using 1D Front Partition DP with a precomputed 2D palindrome lookup table.",
        input_format="A string `s`.",
        output_format="Return the minimum number of cuts.",
        constraints="1 <= s.length <= 2000\ns consists of lowercase English letters only.",
        examples=[
            {
                "input": "s = \"aab\"",
                "output": "1",
                "explanation": "Cut between \"aa\" and \"b\" (1 cut)."
            },
            {
                "input": "s = \"a\"",
                "output": "0",
                "explanation": "Already a palindrome, 0 cuts needed."
            }
        ]
    ),

    "partition-array-for-maximum-sum": make_prob(
        description="Given an integer array `arr`, partition the array into (contiguous) subarrays of length at most `k`. After partitioning, each subarray has their values changed to become the maximum value of that subarray. Return the largest sum of the given array after partitioning. Solve in O(N * K) time using Front Partition DP.",
        input_format="An integer array `arr` and integer `k`.",
        output_format="Return the maximum partitioned sum.",
        constraints="1 <= arr.length <= 500\n0 <= arr[i] <= 10^9\n1 <= k <= arr.length",
        examples=[
            {
                "input": "arr = [1, 15, 7, 9, 2, 5, 10], k = 3",
                "output": "84",
                "explanation": "Partition: [1, 15, 7] -> [15, 15, 15], [9] -> [9], [2, 5, 10] -> [10, 10, 10]. Sum = 45 + 9 + 30 = 84."
            },
            {
                "input": "arr = [1, 4, 1, 5, 7, 3, 6, 1, 9, 9, 3], k = 4",
                "output": "83",
                "explanation": "Maximum partitioned sum is 83."
            }
        ]
    ),

    "minimum-cost-to-cut-the-stick": make_prob(
        description="Given a wooden stick of length `n` units. The stick is labelled from `0` to `n`. Given an integer array `cuts` where `cuts[i]` denotes a position you should perform a cut at. You can change the order of the cuts as you wish. The cost of one cut is the length of the stick to be cut. Return the minimum total cost of the cuts. Solve in O(C^3) using Partition DP.",
        input_format="An integer `n` (stick length) and integer array `cuts`.",
        output_format="Return the minimum total cutting cost.",
        constraints="2 <= n <= 10^6\n1 <= cuts.length <= min(n - 1, 100)\n1 <= cuts[i] <= n - 1\nAll elements in cuts are distinct.",
        examples=[
            {
                "input": "n = 7, cuts = [1, 3, 4, 5]",
                "output": "16",
                "explanation": "Cut at 3 (cost 7), then at 1 (cost 3), then 4 (cost 4), then 5 (cost 2). Total = 7 + 3 + 4 + 2 = 16."
            },
            {
                "input": "n = 9, cuts = [5, 6, 1, 4, 2]",
                "output": "22",
                "explanation": "Minimum cutting cost is 22."
            }
        ]
    ),

    "different-ways-to-evaluate-a-boolean-expression": make_prob(
        description="Given a boolean expression with operands `T` and `F`, and operators `&` (AND), `|` (OR), and `^` (XOR). Find the number of ways to parenthesize the expression such that it evaluates to true. Since the answer can be large, return it modulo 1003. Solve in O(N^3) using 3D Partition DP tracking both true ways and false ways for every subsegment `[i, j]`.",
        input_format="A boolean expression string `s`.",
        output_format="Return the number of ways to evaluate to true modulo 1003.",
        constraints="1 <= s.length <= 100\ns contains only 'T', 'F', '&', '|', '^'.",
        examples=[
            {
                "input": "s = \"T|T&F^T\"",
                "output": "4",
                "explanation": "Four distinct parenthesizations evaluate to true."
            },
            {
                "input": "s = \"T^F|F\"",
                "output": "2",
                "explanation": "Two ways: ((T^F)|F) and (T^(F|F))."
            }
        ]
    ),
}
