# Builder for DP solutions
import os

dp_file = "/Users/skarifahmed/Documents/Files/codes/beenext/scripts/solutions/dp.py"

content = '''from .common import make_sol

DP_SOLUTIONS = {
    "introduction-to-dp": make_sol(
        """public class Solution {
    // Memoization (Top-down)
    public static int fibMemo(int n, int[] dp) {
        if (n <= 1) return n;
        if (dp[n] != -1) return dp[n];
        return dp[n] = fibMemo(n - 1, dp) + fibMemo(n - 2, dp);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    // Tabulation with Space Optimization (Bottom-up)
    public static int fib(int n) {
        if (n <= 1) return n;
        int prev2 = 0, prev = 1;
        for (int i = 2; i <= n; i++) {
            int cur = prev + prev2;
            prev2 = prev;
            prev = cur;
        }
        return prev;
    }
}""", "O(N)", "O(1)"
    ),

    "climbing-stairs": make_sol(
        """public class Solution {
    public int climbStairs(int n) {
        if (n <= 1) return 1;
        return climbStairs(n - 1) + climbStairs(n - 2);
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int climbStairs(int n) {
        if (n <= 1) return 1;
        int prev2 = 1, prev = 1;
        for (int i = 2; i <= n; i++) {
            int cur = prev + prev2;
            prev2 = prev;
            prev = cur;
        }
        return prev;
    }
}""", "O(N)", "O(1)"
    ),

    "frog-jump": make_sol(
        """public class Solution {
    public static int frogJump(int n, int heights[]) {
        return solve(n - 1, heights);
    }
    private static int solve(int ind, int[] h) {
        if (ind == 0) return 0;
        int left = solve(ind - 1, h) + Math.abs(h[ind] - h[ind - 1]);
        int right = Integer.MAX_VALUE;
        if (ind > 1) right = solve(ind - 2, h) + Math.abs(h[ind] - h[ind - 2]);
        return Math.min(left, right);
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static int frogJump(int n, int heights[]) {
        int prev = 0, prev2 = 0;
        for (int i = 1; i < n; i++) {
            int fs = prev + Math.abs(heights[i] - heights[i - 1]);
            int ss = Integer.MAX_VALUE;
            if (i > 1) ss = prev2 + Math.abs(heights[i] - heights[i - 2]);
            int cur = Math.min(fs, ss);
            prev2 = prev;
            prev = cur;
        }
        return prev;
    }
}""", "O(N)", "O(1)"
    ),

    "frog-jump-with-k-distances": make_sol(
        """public class Solution {
    public static int minimizeCost(int n, int k, int[] height) {
        return solve(n - 1, k, height);
    }
    private static int solve(int ind, int k, int[] h) {
        if (ind == 0) return 0;
        int minCost = Integer.MAX_VALUE;
        for (int j = 1; j <= k; j++) {
            if (ind - j >= 0) {
                int cost = solve(ind - j, k, h) + Math.abs(h[ind] - h[ind - j]);
                minCost = Math.min(minCost, cost);
            }
        }
        return minCost;
    }
}""", "O(K^N)", "O(N)",
        """public class Solution {
    public static int minimizeCost(int n, int k, int[] height) {
        int[] dp = new int[n];
        dp[0] = 0;
        for (int i = 1; i < n; i++) {
            int minCost = Integer.MAX_VALUE;
            for (int j = 1; j <= k; j++) {
                if (i - j >= 0) {
                    int jump = dp[i - j] + Math.abs(height[i] - height[i - j]);
                    minCost = Math.min(minCost, jump);
                }
            }
            dp[i] = minCost;
        }
        return dp[n - 1];
    }
}""", "O(N * K)", "O(N)"
    ),

    "maximum-sum-of-non-adjacent-elements": make_sol(
        """import java.util.*;
public class Solution {
    public static int maximumNonAdjacentSum(ArrayList<Integer> nums) {
        return solve(nums.size() - 1, nums);
    }
    private static int solve(int ind, ArrayList<Integer> nums) {
        if (ind == 0) return nums.get(0);
        if (ind < 0) return 0;
        int pick = nums.get(ind) + solve(ind - 2, nums);
        int notPick = solve(ind - 1, nums);
        return Math.max(pick, notPick);
    }
}""", "O(2^N)", "O(N)",
        """import java.util.*;
public class Solution {
    public static int maximumNonAdjacentSum(ArrayList<Integer> nums) {
        int n = nums.size();
        int prev = nums.get(0), prev2 = 0;
        for (int i = 1; i < n; i++) {
            int take = nums.get(i) + (i > 1 ? prev2 : 0);
            int notTake = prev;
            int cur = Math.max(take, notTake);
            prev2 = prev;
            prev = cur;
        }
        return prev;
    }
}""", "O(N)", "O(1)"
    ),

    "house-robber": make_sol(
        """public class Solution {
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        return Math.max(robRange(nums, 0, nums.length - 2), robRange(nums, 1, nums.length - 1));
    }
    private int robRange(int[] nums, int start, int end) {
        return solve(nums, end, start);
    }
    private int solve(int[] nums, int ind, int start) {
        if (ind < start) return 0;
        if (ind == start) return nums[start];
        return Math.max(nums[ind] + solve(nums, ind - 2, start), solve(nums, ind - 1, start));
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        return Math.max(robLinear(nums, 0, nums.length - 2), robLinear(nums, 1, nums.length - 1));
    }
    private int robLinear(int[] nums, int start, int end) {
        int prev = 0, prev2 = 0;
        for (int i = start; i <= end; i++) {
            int cur = Math.max(prev, prev2 + nums[i]);
            prev2 = prev;
            prev = cur;
        }
        return prev;
    }
}""", "O(N)", "O(1)"
    ),

    "ninja's-training": make_sol(
        """public class Solution {
    public static int ninjaTraining(int n, int points[][]) {
        return solve(n - 1, 3, points);
    }
    private static int solve(int day, int last, int[][] points) {
        if (day == 0) {
            int maxi = 0;
            for (int i = 0; i <= 2; i++) {
                if (i != last) maxi = Math.max(maxi, points[0][i]);
            }
            return maxi;
        }
        int maxi = 0;
        for (int i = 0; i <= 2; i++) {
            if (i != last) {
                int point = points[day][i] + solve(day - 1, i, points);
                maxi = Math.max(maxi, point);
            }
        }
        return maxi;
    }
}""", "O(3^N)", "O(N)",
        """public class Solution {
    public static int ninjaTraining(int n, int points[][]) {
        int[] prev = new int[4];
        prev[0] = Math.max(points[0][1], points[0][2]);
        prev[1] = Math.max(points[0][0], points[0][2]);
        prev[2] = Math.max(points[0][0], points[0][1]);
        prev[3] = Math.max(points[0][0], Math.max(points[0][1], points[0][2]));

        for (int day = 1; day < n; day++) {
            int[] temp = new int[4];
            for (int last = 0; last < 4; last++) {
                temp[last] = 0;
                for (int task = 0; task <= 2; task++) {
                    if (task != last) {
                        temp[last] = Math.max(temp[last], points[day][task] + prev[task]);
                    }
                }
            }
            prev = temp;
        }
        return prev[3];
    }
}""", "O(N * 4 * 3)", "O(1)"
    ),

    "grid-unique-paths": make_sol(
        """public class Solution {
    public int uniquePaths(int m, int n) {
        return solve(m - 1, n - 1);
    }
    private int solve(int i, int j) {
        if (i == 0 && j == 0) return 1;
        if (i < 0 || j < 0) return 0;
        return solve(i - 1, j) + solve(i, j - 1);
    }
}""", "O(2^(M+N))", "O(M+N)",
        """public class Solution {
    public int uniquePaths(int m, int n) {
        int N = m + n - 2;
        int r = Math.min(m - 1, n - 1);
        double res = 1;
        for (int i = 1; i <= r; i++) {
            res = res * (N - r + i) / i;
        }
        return (int) Math.round(res);
    }
}""", "O(min(M, N))", "O(1)"
    ),

    "unique-paths-ii": make_sol(
        """public class Solution {
    public int uniquePathsWithObstacles(int[][] grid) {
        return solve(grid.length - 1, grid[0].length - 1, grid);
    }
    private int solve(int i, int j, int[][] grid) {
        if (i < 0 || j < 0 || grid[i][j] == 1) return 0;
        if (i == 0 && j == 0) return 1;
        return solve(i - 1, j, grid) + solve(i, j - 1, grid);
    }
}""", "O(2^(M+N))", "O(M+N)",
        """public class Solution {
    public int uniquePathsWithObstacles(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[] dp = new int[n];
        dp[0] = (grid[0][0] == 0) ? 1 : 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 1) {
                    dp[j] = 0;
                } else if (j > 0) {
                    dp[j] += dp[j - 1];
                }
            }
        }
        return dp[n - 1];
    }
}""", "O(M * N)", "O(N)"
    ),

    "minimum-falling-path-sum": make_sol(
        """public class Solution {
    public int minFallingPathSum(int[][] matrix) {
        int n = matrix.length, ans = Integer.MAX_VALUE;
        for (int j = 0; j < n; j++) {
            ans = Math.min(ans, solve(0, j, matrix));
        }
        return ans;
    }
    private int solve(int i, int j, int[][] mat) {
        if (j < 0 || j >= mat.length) return (int) 1e9;
        if (i == mat.length - 1) return mat[i][j];
        int down = mat[i][j] + solve(i + 1, j, mat);
        int ld = mat[i][j] + solve(i + 1, j - 1, mat);
        int rd = mat[i][j] + solve(i + 1, j + 1, mat);
        return Math.min(down, Math.min(ld, rd));
    }
}""", "O(3^N)", "O(N)",
        """public class Solution {
    public int minFallingPathSum(int[][] matrix) {
        int n = matrix.length;
        int[] prev = matrix[0].clone();
        for (int i = 1; i < n; i++) {
            int[] cur = new int[n];
            for (int j = 0; j < n; j++) {
                int up = prev[j];
                int ld = (j > 0) ? prev[j - 1] : (int) 1e9;
                int rd = (j < n - 1) ? prev[j + 1] : (int) 1e9;
                cur[j] = matrix[i][j] + Math.min(up, Math.min(ld, rd));
            }
            prev = cur;
        }
        int min = Integer.MAX_VALUE;
        for (int val : prev) min = Math.min(min, val);
        return min;
    }
}""", "O(N * N)", "O(N)"
    ),

    "triangle": make_sol(
        """import java.util.*;
public class Solution {
    public int minimumTotal(List<List<Integer>> triangle) {
        return solve(0, 0, triangle);
    }
    private int solve(int i, int j, List<List<Integer>> tri) {
        if (i == tri.size() - 1) return tri.get(i).get(j);
        int down = tri.get(i).get(j) + solve(i + 1, j, tri);
        int diag = tri.get(i).get(j) + solve(i + 1, j + 1, tri);
        return Math.min(down, diag);
    }
}""", "O(2^N)", "O(N)",
        """import java.util.*;
public class Solution {
    public int minimumTotal(List<List<Integer>> triangle) {
        int n = triangle.size();
        int[] dp = new int[n];
        for (int j = 0; j < n; j++) dp[j] = triangle.get(n - 1).get(j);
        for (int i = n - 2; i >= 0; i--) {
            for (int j = 0; j <= i; j++) {
                dp[j] = triangle.get(i).get(j) + Math.min(dp[j], dp[j + 1]);
            }
        }
        return dp[0];
    }
}""", "O(N^2)", "O(N)"
    ),

    "cherry-pickup-ii": make_sol(
        """public class Solution {
    public int cherryPickup(int[][] grid) {
        return solve(0, 0, grid[0].length - 1, grid);
    }
    private int solve(int i, int j1, int j2, int[][] grid) {
        if (j1 < 0 || j1 >= grid[0].length || j2 < 0 || j2 >= grid[0].length) return (int) -1e9;
        if (i == grid.length - 1) {
            return (j1 == j2) ? grid[i][j1] : grid[i][j1] + grid[i][j2];
        }
        int max = (int) -1e9;
        for (int dj1 = -1; dj1 <= 1; dj1++) {
            for (int dj2 = -1; dj2 <= 1; dj2++) {
                int value = (j1 == j2) ? grid[i][j1] : grid[i][j1] + grid[i][j2];
                value += solve(i + 1, j1 + dj1, j2 + dj2, grid);
                max = Math.max(max, value);
            }
        }
        return max;
    }
}""", "O(3^N * 3^N)", "O(N)",
        """public class Solution {
    public int cherryPickup(int[][] grid) {
        int r = grid.length, c = grid[0].length;
        int[][] front = new int[c][c];
        for (int j1 = 0; j1 < c; j1++) {
            for (int j2 = 0; j2 < c; j2++) {
                front[j1][j2] = (j1 == j2) ? grid[r - 1][j1] : grid[r - 1][j1] + grid[r - 1][j2];
            }
        }
        for (int i = r - 2; i >= 0; i--) {
            int[][] cur = new int[c][c];
            for (int j1 = 0; j1 < c; j1++) {
                for (int j2 = 0; j2 < c; j2++) {
                    int max = (int) -1e9;
                    for (int dj1 = -1; dj1 <= 1; dj1++) {
                        for (int dj2 = -1; dj2 <= 1; dj2++) {
                            int nj1 = j1 + dj1, nj2 = j2 + dj2;
                            if (nj1 >= 0 && nj1 < c && nj2 >= 0 && nj2 < c) {
                                int val = (j1 == j2) ? grid[i][j1] : grid[i][j1] + grid[i][j2];
                                max = Math.max(max, val + front[nj1][nj2]);
                            }
                        }
                    }
                    cur[j1][j2] = max;
                }
            }
            front = cur;
        }
        return front[0][c - 1];
    }
}""", "O(R * C * C * 9)", "O(C * C)"
    ),

    "count-square-submatrices-with-all-one": make_sol(
        """public class Solution {
    public int countSquares(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length, count = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 1) {
                    count += countFrom(i, j, matrix);
                }
            }
        }
        return count;
    }
    private int countFrom(int r, int c, int[][] mat) {
        int maxL = Math.min(mat.length - r, mat[0].length - c), cnt = 0;
        for (int len = 1; len <= maxL; len++) {
            boolean valid = true;
            for (int i = r; i < r + len && valid; i++) {
                for (int j = c; j < c + len && valid; j++) {
                    if (mat[i][j] == 0) valid = false;
                }
            }
            if (valid) cnt++;
            else break;
        }
        return cnt;
    }
}""", "O((M * N)^2)", "O(1)",
        """public class Solution {
    public int countSquares(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        int[][] dp = new int[m][n];
        int total = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 1) {
                    if (i == 0 || j == 0) dp[i][j] = 1;
                    else dp[i][j] = 1 + Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
                    total += dp[i][j];
                }
            }
        }
        return total;
    }
}""", "O(M * N)", "O(M * N)"
    ),

    "best-time-to-buy-and-sell-stock": make_sol(
        """public class Solution {
    public int maxProfit(int[] prices) {
        int maxProfit = 0;
        for (int i = 0; i < prices.length; i++) {
            for (int j = i + 1; j < prices.length; j++) {
                maxProfit = Math.max(maxProfit, prices[j] - prices[i]);
            }
        }
        return maxProfit;
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE, maxProfit = 0;
        for (int p : prices) {
            minPrice = Math.min(minPrice, p);
            maxProfit = Math.max(maxProfit, p - minPrice);
        }
        return maxProfit;
    }
}""", "O(N)", "O(1)"
    ),

    "best-time-to-buy-and-sell-stock-ii": make_sol(
        """public class Solution {
    public int maxProfit(int[] prices) {
        return solve(0, 1, prices);
    }
    private int solve(int ind, int buy, int[] p) {
        if (ind == p.length) return 0;
        if (buy == 1) {
            return Math.max(-p[ind] + solve(ind + 1, 0, p), solve(ind + 1, 1, p));
        } else {
            return Math.max(p[ind] + solve(ind + 1, 1, p), solve(ind + 1, 0, p));
        }
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int maxProfit(int[] prices) {
        int profit = 0;
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
        }
        return profit;
    }
}""", "O(N)", "O(1)"
    ),

    "best-time-to-buy-and-sell-stock-iii": make_sol(
        """public class Solution {
    public int maxProfit(int[] prices) {
        return solve(0, 1, 2, prices);
    }
    private int solve(int ind, int buy, int cap, int[] p) {
        if (ind == p.length || cap == 0) return 0;
        if (buy == 1) {
            return Math.max(-p[ind] + solve(ind + 1, 0, cap, p), solve(ind + 1, 1, cap, p));
        } else {
            return Math.max(p[ind] + solve(ind + 1, 1, cap - 1, p), solve(ind + 1, 0, cap, p));
        }
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int maxProfit(int[] prices) {
        int buy1 = Integer.MIN_VALUE, sell1 = 0;
        int buy2 = Integer.MIN_VALUE, sell2 = 0;
        for (int p : prices) {
            buy1 = Math.max(buy1, -p);
            sell1 = Math.max(sell1, buy1 + p);
            buy2 = Math.max(buy2, sell1 - p);
            sell2 = Math.max(sell2, buy2 + p);
        }
        return sell2;
    }
}""", "O(N)", "O(1)"
    ),

    "best-time-to-buy-and-sell-stock-iv": make_sol(
        """public class Solution {
    public int maxProfit(int k, int[] prices) {
        return solve(0, 1, k, prices);
    }
    private int solve(int ind, int buy, int cap, int[] p) {
        if (ind == p.length || cap == 0) return 0;
        if (buy == 1) {
            return Math.max(-p[ind] + solve(ind + 1, 0, cap, p), solve(ind + 1, 1, cap, p));
        } else {
            return Math.max(p[ind] + solve(ind + 1, 1, cap - 1, p), solve(ind + 1, 0, cap, p));
        }
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int maxProfit(int k, int[] prices) {
        int n = prices.length;
        if (n == 0 || k == 0) return 0;
        if (k >= n / 2) {
            int maxP = 0;
            for (int i = 1; i < n; i++) if (prices[i] > prices[i - 1]) maxP += prices[i] - prices[i - 1];
            return maxP;
        }
        int[][] dp = new int[k + 1][n];
        for (int i = 1; i <= k; i++) {
            int maxDiff = -prices[0];
            for (int j = 1; j < n; j++) {
                dp[i][j] = Math.max(dp[i][j - 1], prices[j] + maxDiff);
                maxDiff = Math.max(maxDiff, dp[i - 1][j] - prices[j]);
            }
        }
        return dp[k][n - 1];
    }
}""", "O(K * N)", "O(K * N)"
    ),

    "best-time-to-buy-and-sell-stock-with-cooldown-and-transaction-fees": make_sol(
        """public class Solution {
    public int maxProfit(int[] prices, int fee) {
        return solve(0, 1, prices, fee);
    }
    private int solve(int ind, int buy, int[] p, int fee) {
        if (ind == p.length) return 0;
        if (buy == 1) {
            return Math.max(-p[ind] + solve(ind + 1, 0, p, fee), solve(ind + 1, 1, p, fee));
        } else {
            return Math.max(p[ind] - fee + solve(ind + 1, 1, p, fee), solve(ind + 1, 0, p, fee));
        }
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int maxProfit(int[] prices, int fee) {
        int hold = -prices[0], cash = 0;
        for (int i = 1; i < prices.length; i++) {
            cash = Math.max(cash, hold + prices[i] - fee);
            hold = Math.max(hold, cash - prices[i]);
        }
        return cash;
    }
}""", "O(N)", "O(1)"
    ),

    "best-time-to-buy-and-sell-stock-with-cooldown": make_sol(
        """public class Solution {
    public int maxProfit(int[] prices) {
        return solve(0, 1, prices);
    }
    private int solve(int ind, int buy, int[] p) {
        if (ind >= p.length) return 0;
        if (buy == 1) {
            return Math.max(-p[ind] + solve(ind + 1, 0, p), solve(ind + 1, 1, p));
        } else {
            return Math.max(p[ind] + solve(ind + 2, 1, p), solve(ind + 1, 0, p));
        }
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int maxProfit(int[] prices) {
        int n = prices.length;
        if (n <= 1) return 0;
        int buy = -prices[0], sell = 0, rest = 0;
        for (int i = 1; i < n; i++) {
            int prevSell = sell;
            sell = buy + prices[i];
            buy = Math.max(buy, rest - prices[i]);
            rest = Math.max(rest, prevSell);
        }
        return Math.max(sell, rest);
    }
}""", "O(N)", "O(1)"
    ),

    "subset-sum-equals-to-target": make_sol(
        """public class Solution {
    public static boolean subsetSumToK(int n, int k, int arr[]) {
        return solve(n - 1, k, arr);
    }
    private static boolean solve(int ind, int target, int[] arr) {
        if (target == 0) return true;
        if (ind == 0) return arr[0] == target;
        boolean notTaken = solve(ind - 1, target, arr);
        boolean taken = false;
        if (arr[ind] <= target) taken = solve(ind - 1, target - arr[ind], arr);
        return notTaken || taken;
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static boolean subsetSumToK(int n, int k, int arr[]) {
        boolean[] prev = new boolean[k + 1];
        prev[0] = true;
        if (arr[0] <= k) prev[arr[0]] = true;
        for (int ind = 1; ind < n; ind++) {
            boolean[] cur = new boolean[k + 1];
            cur[0] = true;
            for (int target = 1; target <= k; target++) {
                boolean notTaken = prev[target];
                boolean taken = false;
                if (arr[ind] <= target) taken = prev[target - arr[ind]];
                cur[target] = notTaken || taken;
            }
            prev = cur;
        }
        return prev[k];
    }
}""", "O(N * Target)", "O(Target)"
    ),

    "partition-equal-subset-sum": make_sol(
        """public class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 != 0) return false;
        return solve(nums.length - 1, sum / 2, nums);
    }
    private boolean solve(int ind, int target, int[] nums) {
        if (target == 0) return true;
        if (ind == 0) return nums[0] == target;
        boolean notTake = solve(ind - 1, target, nums);
        boolean take = false;
        if (nums[ind] <= target) take = solve(ind - 1, target - nums[ind], nums);
        return take || notTake;
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if (sum % 2 != 0) return false;
        int target = sum / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;
        for (int num : nums) {
            for (int t = target; t >= num; t--) {
                dp[t] = dp[t] || dp[t - num];
            }
        }
        return dp[target];
    }
}""", "O(N * Sum/2)", "O(Sum/2)"
    ),

    "partition-a-set-into-two-subsets-with-minimum-absolute-sum-difference": make_sol(
        """public class Solution {
    public static int minSubsetSumDifference(int[] arr, int n) {
        int totSum = 0;
        for (int x : arr) totSum += x;
        return solve(n - 1, 0, totSum, arr);
    }
    private static int solve(int ind, int curSum, int totSum, int[] arr) {
        if (ind < 0) return Math.abs((totSum - curSum) - curSum);
        return Math.min(solve(ind - 1, curSum + arr[ind], totSum, arr), solve(ind - 1, curSum, totSum, arr));
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static int minSubsetSumDifference(int[] arr, int n) {
        int totSum = 0;
        for (int x : arr) totSum += x;
        boolean[] dp = new boolean[totSum / 2 + 1];
        dp[0] = true;
        for (int num : arr) {
            for (int j = totSum / 2; j >= num; j--) {
                dp[j] = dp[j] || dp[j - num];
            }
        }
        int minDiff = Integer.MAX_VALUE;
        for (int s1 = 0; s1 <= totSum / 2; s1++) {
            if (dp[s1]) minDiff = Math.min(minDiff, Math.abs(totSum - 2 * s1));
        }
        return minDiff;
    }
}""", "O(N * TotSum)", "O(TotSum)"
    ),

    "count-subsets-with-sum-k": make_sol(
        """public class Solution {
    public static int findWays(int num[], int tar) {
        return solve(num.length - 1, tar, num);
    }
    private static int solve(int ind, int target, int[] num) {
        if (ind == 0) {
            if (target == 0 && num[0] == 0) return 2;
            if (target == 0 || target == num[0]) return 1;
            return 0;
        }
        int notTake = solve(ind - 1, target, num);
        int take = 0;
        if (num[ind] <= target) take = solve(ind - 1, target - num[ind], num);
        return notTake + take;
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static int findWays(int num[], int tar) {
        int[] dp = new int[tar + 1];
        dp[0] = 1;
        for (int val : num) {
            for (int t = tar; t >= val; t--) {
                dp[t] = (dp[t] + dp[t - val]) % 1000000007;
            }
        }
        return dp[tar];
    }
}""", "O(N * Target)", "O(Target)"
    ),

    "count-partitions-with-given-difference": make_sol(
        """public class Solution {
    public static int countPartitions(int n, int d, int[] arr) {
        int tot = 0;
        for (int x : arr) tot += x;
        if (tot - d < 0 || (tot - d) % 2 != 0) return 0;
        return countSubsets(arr, (tot - d) / 2);
    }
    private static int countSubsets(int[] arr, int target) {
        int[] dp = new int[target + 1];
        dp[0] = 1;
        for (int val : arr) {
            for (int t = target; t >= val; t--) {
                dp[t] = (dp[t] + dp[t - val]) % 1000000007;
            }
        }
        return dp[target];
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static int countPartitions(int n, int d, int[] arr) {
        int tot = 0;
        for (int x : arr) tot += x;
        if (tot - d < 0 || (tot - d) % 2 != 0) return 0;
        int target = (tot - d) / 2;
        int[] dp = new int[target + 1];
        dp[0] = 1;
        for (int val : arr) {
            for (int t = target; t >= val; t--) {
                dp[t] = (dp[t] + dp[t - val]) % 1000000007;
            }
        }
        return dp[target];
    }
}""", "O(N * Target)", "O(Target)"
    ),

    "0-and-1-knapsack": make_sol(
        """public class Solution {
    public static int knapsack(int[] weight, int[] value, int n, int maxWeight) {
        return solve(n - 1, maxWeight, weight, value);
    }
    private static int solve(int ind, int W, int[] wt, int[] val) {
        if (ind == 0) return (wt[0] <= W) ? val[0] : 0;
        int notTake = solve(ind - 1, W, wt, val);
        int take = Integer.MIN_VALUE;
        if (wt[ind] <= W) take = val[ind] + solve(ind - 1, W - wt[ind], wt, val);
        return Math.max(notTake, take);
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static int knapsack(int[] weight, int[] value, int n, int maxWeight) {
        int[] dp = new int[maxWeight + 1];
        for (int i = 0; i < n; i++) {
            for (int w = maxWeight; w >= weight[i]; w--) {
                dp[w] = Math.max(dp[w], value[i] + dp[w - weight[i]]);
            }
        }
        return dp[maxWeight];
    }
}""", "O(N * W)", "O(W)"
    ),

    "minimum-coins": make_sol(
        """public class Solution {
    public int coinChange(int[] coins, int amount) {
        int res = solve(coins.length - 1, amount, coins);
        return (res >= (int) 1e9) ? -1 : res;
    }
    private int solve(int ind, int T, int[] coins) {
        if (ind == 0) {
            return (T % coins[0] == 0) ? T / coins[0] : (int) 1e9;
        }
        int notTake = solve(ind - 1, T, coins);
        int take = (int) 1e9;
        if (coins[ind] <= T) take = 1 + solve(ind, T - coins[ind], coins);
        return Math.min(notTake, take);
    }
}""", "O(2^Amount)", "O(Amount)",
        """import java.util.Arrays;
public class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}""", "O(N * Amount)", "O(Amount)"
    ),

    "target-sum": make_sol(
        """public class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        return solve(0, 0, target, nums);
    }
    private int solve(int ind, int curSum, int target, int[] nums) {
        if (ind == nums.length) return (curSum == target) ? 1 : 0;
        return solve(ind + 1, curSum + nums[ind], target, nums) + solve(ind + 1, curSum - nums[ind], target, nums);
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int totSum = 0;
        for (int x : nums) totSum += x;
        if (totSum - target < 0 || (totSum - target) % 2 != 0) return 0;
        int s2 = (totSum - target) / 2;
        int[] dp = new int[s2 + 1];
        dp[0] = 1;
        for (int val : nums) {
            for (int t = s2; t >= val; t--) {
                dp[t] += dp[t - val];
            }
        }
        return dp[s2];
    }
}""", "O(N * Target)", "O(Target)"
    ),

    "coin-change-ii": make_sol(
        """public class Solution {
    public int change(int amount, int[] coins) {
        return solve(coins.length - 1, amount, coins);
    }
    private int solve(int ind, int T, int[] coins) {
        if (ind == 0) return (T % coins[0] == 0) ? 1 : 0;
        int notTake = solve(ind - 1, T, coins);
        int take = 0;
        if (coins[ind] <= T) take = solve(ind, T - coins[ind], coins);
        return notTake + take;
    }
}""", "O(2^Amount)", "O(Amount)",
        """public class Solution {
    public int change(int amount, int[] coins) {
        int[] dp = new int[amount + 1];
        dp[0] = 1;
        for (int coin : coins) {
            for (int t = coin; t <= amount; t++) {
                dp[t] += dp[t - coin];
            }
        }
        return dp[amount];
    }
}""", "O(N * Amount)", "O(Amount)"
    ),

    "unbounded-knapsack": make_sol(
        """public class Solution {
    public static int unboundedKnapsack(int n, int w, int[] val, int[] wt) {
        return solve(n - 1, w, val, wt);
    }
    private static int solve(int ind, int W, int[] val, int[] wt) {
        if (ind == 0) return (W / wt[0]) * val[0];
        int notTake = solve(ind - 1, W, val, wt);
        int take = 0;
        if (wt[ind] <= W) take = val[ind] + solve(ind, W - wt[ind], val, wt);
        return Math.max(notTake, take);
    }
}""", "O(2^W)", "O(W)",
        """public class Solution {
    public static int unboundedKnapsack(int n, int w, int[] val, int[] wt) {
        int[] dp = new int[w + 1];
        for (int i = 0; i < n; i++) {
            for (int cap = wt[i]; cap <= w; cap++) {
                dp[cap] = Math.max(dp[cap], val[i] + dp[cap - wt[i]]);
            }
        }
        return dp[w];
    }
}""", "O(N * W)", "O(W)"
    ),

    "rod-cutting-problem": make_sol(
        """public class Solution {
    public static int cutRod(int price[], int n) {
        return solve(n - 1, n, price);
    }
    private static int solve(int ind, int N, int[] price) {
        if (ind == 0) return N * price[0];
        int notTake = solve(ind - 1, N, price);
        int take = Integer.MIN_VALUE;
        int rodLength = ind + 1;
        if (rodLength <= N) take = price[ind] + solve(ind, N - rodLength, price);
        return Math.max(notTake, take);
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static int cutRod(int price[], int n) {
        int[] dp = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) {
                dp[i] = Math.max(dp[i], price[j - 1] + dp[i - j]);
            }
        }
        return dp[n];
    }
}""", "O(N^2)", "O(N)"
    ),

    "longest-increasing-subsequence": make_sol(
        """public class Solution {
    public int lengthOfLIS(int[] nums) {
        return solve(0, -1, nums);
    }
    private int solve(int ind, int prevInd, int[] nums) {
        if (ind == nums.length) return 0;
        int notTake = solve(ind + 1, prevInd, nums);
        int take = 0;
        if (prevInd == -1 || nums[ind] > nums[prevInd]) {
            take = 1 + solve(ind + 1, ind, nums);
        }
        return Math.max(notTake, take);
    }
}""", "O(2^N)", "O(N)",
        """import java.util.*;
public class Solution {
    public int lengthOfLIS(int[] nums) {
        List<Integer> tails = new ArrayList<>();
        for (int x : nums) {
            int idx = Collections.binarySearch(tails, x);
            if (idx < 0) idx = -(idx + 1);
            if (idx == tails.size()) tails.add(x);
            else tails.set(idx, x);
        }
        return tails.size();
    }
}""", "O(N log N)", "O(N)"
    ),

    "print-longest-increasing-subsequence": make_sol(
        """import java.util.*;
public class Solution {
    public static ArrayList<Integer> printingLongestIncreasingSubsequence(int[] arr, int x) {
        int n = arr.length;
        int[] dp = new int[n];
        int[] hash = new int[n];
        Arrays.fill(dp, 1);
        int maxL = 1, lastIndex = 0;
        for (int i = 0; i < n; i++) {
            hash[i] = i;
            for (int prev = 0; prev < i; prev++) {
                if (arr[prev] < arr[i] && 1 + dp[prev] > dp[i]) {
                    dp[i] = 1 + dp[prev];
                    hash[i] = prev;
                }
            }
            if (dp[i] > maxL) {
                maxL = dp[i];
                lastIndex = i;
            }
        }
        ArrayList<Integer> res = new ArrayList<>();
        res.add(arr[lastIndex]);
        while (hash[lastIndex] != lastIndex) {
            lastIndex = hash[lastIndex];
            res.add(arr[lastIndex]);
        }
        Collections.reverse(res);
        return res;
    }
}""", "O(N^2)", "O(N)",
        """import java.util.*;
public class Solution {
    public static ArrayList<Integer> printingLongestIncreasingSubsequence(int[] arr, int x) {
        int n = arr.length;
        int[] dp = new int[n];
        int[] hash = new int[n];
        Arrays.fill(dp, 1);
        int maxL = 1, lastIndex = 0;
        for (int i = 0; i < n; i++) {
            hash[i] = i;
            for (int prev = 0; prev < i; prev++) {
                if (arr[prev] < arr[i] && 1 + dp[prev] > dp[i]) {
                    dp[i] = 1 + dp[prev];
                    hash[i] = prev;
                }
            }
            if (dp[i] > maxL) {
                maxL = dp[i];
                lastIndex = i;
            }
        }
        ArrayList<Integer> res = new ArrayList<>();
        res.add(arr[lastIndex]);
        while (hash[lastIndex] != lastIndex) {
            lastIndex = hash[lastIndex];
            res.add(arr[lastIndex]);
        }
        Collections.reverse(res);
        return res;
    }
}""", "O(N^2)", "O(N)"
    ),

    "largest-divisible-subset": make_sol(
        """import java.util.*;
public class Solution {
    public List<Integer> largestDivisibleSubset(int[] nums) {
        Arrays.sort(nums);
        int n = nums.length;
        int[] dp = new int[n];
        int[] hash = new int[n];
        Arrays.fill(dp, 1);
        int maxL = 1, lastIdx = 0;
        for (int i = 0; i < n; i++) {
            hash[i] = i;
            for (int prev = 0; prev < i; prev++) {
                if (nums[i] % nums[prev] == 0 && 1 + dp[prev] > dp[i]) {
                    dp[i] = 1 + dp[prev];
                    hash[i] = prev;
                }
            }
            if (dp[i] > maxL) {
                maxL = dp[i];
                lastIdx = i;
            }
        }
        List<Integer> res = new ArrayList<>();
        res.add(nums[lastIdx]);
        while (hash[lastIdx] != lastIdx) {
            lastIdx = hash[lastIdx];
            res.add(nums[lastIdx]);
        }
        return res;
    }
}""", "O(N^2)", "O(N)",
        """import java.util.*;
public class Solution {
    public List<Integer> largestDivisibleSubset(int[] nums) {
        Arrays.sort(nums);
        int n = nums.length;
        int[] dp = new int[n];
        int[] hash = new int[n];
        Arrays.fill(dp, 1);
        int maxL = 1, lastIdx = 0;
        for (int i = 0; i < n; i++) {
            hash[i] = i;
            for (int prev = 0; prev < i; prev++) {
                if (nums[i] % nums[prev] == 0 && 1 + dp[prev] > dp[i]) {
                    dp[i] = 1 + dp[prev];
                    hash[i] = prev;
                }
            }
            if (dp[i] > maxL) {
                maxL = dp[i];
                lastIdx = i;
            }
        }
        List<Integer> res = new ArrayList<>();
        res.add(nums[lastIdx]);
        while (hash[lastIdx] != lastIdx) {
            lastIdx = hash[lastIdx];
            res.add(nums[lastIdx]);
        }
        return res;
    }
}""", "O(N^2)", "O(N)"
    ),

    "longest-string-chain": make_sol(
        """import java.util.*;
public class Solution {
    public int longestStrChain(String[] words) {
        Arrays.sort(words, (a, b) -> a.length() - b.length());
        int n = words.length, maxL = 1;
        int[] dp = new int[n];
        Arrays.fill(dp, 1);
        for (int i = 0; i < n; i++) {
            for (int prev = 0; prev < i; prev++) {
                if (checkPossible(words[i], words[prev]) && 1 + dp[prev] > dp[i]) {
                    dp[i] = 1 + dp[prev];
                }
            }
            maxL = Math.max(maxL, dp[i]);
        }
        return maxL;
    }
    private boolean checkPossible(String s1, String s2) {
        if (s1.length() != s2.length() + 1) return false;
        int first = 0, second = 0;
        while (first < s1.length()) {
            if (second < s2.length() && s1.charAt(first) == s2.charAt(second)) {
                first++; second++;
            } else {
                first++;
            }
        }
        return first == s1.length() && second == s2.length();
    }
}""", "O(N^2 * L)", "O(N)",
        """import java.util.*;
public class Solution {
    public int longestStrChain(String[] words) {
        Arrays.sort(words, (a, b) -> a.length() - b.length());
        Map<String, Integer> dp = new HashMap<>();
        int res = 1;
        for (String w : words) {
            int best = 1;
            for (int i = 0; i < w.length(); i++) {
                String prev = w.substring(0, i) + w.substring(i + 1);
                best = Math.max(best, dp.getOrDefault(prev, 0) + 1);
            }
            dp.put(w, best);
            res = Math.max(res, best);
        }
        return res;
    }
}""", "O(N * L^2)", "O(N)"
    ),

    "longest-bitonic-subsequence": make_sol(
        """import java.util.Arrays;
public class Solution {
    public static int longestBitonicSequence(int[] arr, int n) {
        int[] dp1 = new int[n];
        int[] dp2 = new int[n];
        Arrays.fill(dp1, 1);
        Arrays.fill(dp2, 1);
        for (int i = 0; i < n; i++) {
            for (int prev = 0; prev < i; prev++) {
                if (arr[prev] < arr[i] && 1 + dp1[prev] > dp1[i]) dp1[i] = 1 + dp1[prev];
            }
        }
        for (int i = n - 1; i >= 0; i--) {
            for (int prev = n - 1; prev > i; prev--) {
                if (arr[prev] < arr[i] && 1 + dp2[prev] > dp2[i]) dp2[i] = 1 + dp2[prev];
            }
        }
        int maxi = 0;
        for (int i = 0; i < n; i++) maxi = Math.max(maxi, dp1[i] + dp2[i] - 1);
        return maxi;
    }
}""", "O(N^2)", "O(N)",
        """import java.util.Arrays;
public class Solution {
    public static int longestBitonicSequence(int[] arr, int n) {
        int[] dp1 = new int[n];
        int[] dp2 = new int[n];
        Arrays.fill(dp1, 1);
        Arrays.fill(dp2, 1);
        for (int i = 0; i < n; i++) {
            for (int prev = 0; prev < i; prev++) {
                if (arr[prev] < arr[i] && 1 + dp1[prev] > dp1[i]) dp1[i] = 1 + dp1[prev];
            }
        }
        for (int i = n - 1; i >= 0; i--) {
            for (int prev = n - 1; prev > i; prev--) {
                if (arr[prev] < arr[i] && 1 + dp2[prev] > dp2[i]) dp2[i] = 1 + dp2[prev];
            }
        }
        int maxi = 0;
        for (int i = 0; i < n; i++) maxi = Math.max(maxi, dp1[i] + dp2[i] - 1);
        return maxi;
    }
}""", "O(N^2)", "O(N)"
    ),

    "number-of-longest-increasing-subsequences": make_sol(
        """import java.util.Arrays;
public class Solution {
    public int findNumberOfLIS(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n];
        int[] count = new int[n];
        Arrays.fill(dp, 1);
        Arrays.fill(count, 1);
        int maxL = 1;
        for (int i = 0; i < n; i++) {
            for (int prev = 0; prev < i; prev++) {
                if (nums[prev] < nums[i]) {
                    if (dp[prev] + 1 > dp[i]) {
                        dp[i] = dp[prev] + 1;
                        count[i] = count[prev];
                    } else if (dp[prev] + 1 == dp[i]) {
                        count[i] += count[prev];
                    }
                }
            }
            maxL = Math.max(maxL, dp[i]);
        }
        int nos = 0;
        for (int i = 0; i < n; i++) {
            if (dp[i] == maxL) nos += count[i];
        }
        return nos;
    }
}""", "O(N^2)", "O(N)",
        """import java.util.Arrays;
public class Solution {
    public int findNumberOfLIS(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n];
        int[] count = new int[n];
        Arrays.fill(dp, 1);
        Arrays.fill(count, 1);
        int maxL = 1;
        for (int i = 0; i < n; i++) {
            for (int prev = 0; prev < i; prev++) {
                if (nums[prev] < nums[i]) {
                    if (dp[prev] + 1 > dp[i]) {
                        dp[i] = dp[prev] + 1;
                        count[i] = count[prev];
                    } else if (dp[prev] + 1 == dp[i]) {
                        count[i] += count[prev];
                    }
                }
            }
            maxL = Math.max(maxL, dp[i]);
        }
        int nos = 0;
        for (int i = 0; i < n; i++) {
            if (dp[i] == maxL) nos += count[i];
        }
        return nos;
    }
}""", "O(N^2)", "O(N)"
    ),

    "longest-common-subsequence": make_sol(
        """public class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        return solve(text1.length() - 1, text2.length() - 1, text1, text2);
    }
    private int solve(int i, int j, String s1, String s2) {
        if (i < 0 || j < 0) return 0;
        if (s1.charAt(i) == s2.charAt(j)) return 1 + solve(i - 1, j - 1, s1, s2);
        return Math.max(solve(i - 1, j, s1, s2), solve(i, j - 1, s1, s2));
    }
}""", "O(2^(N+M))", "O(N+M)",
        """public class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int n = text1.length(), m = text2.length();
        int[] prev = new int[m + 1];
        for (int i = 1; i <= n; i++) {
            int[] cur = new int[m + 1];
            for (int j = 1; j <= m; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                    cur[j] = 1 + prev[j - 1];
                } else {
                    cur[j] = Math.max(prev[j], cur[j - 1]);
                }
            }
            prev = cur;
        }
        return prev[m];
    }
}""", "O(N * M)", "O(M)"
    ),

    "longest-common-substring": make_sol(
        """public class Solution {
    public static int lcs(String str1, String str2) {
        int maxL = 0;
        for (int i = 0; i < str1.length(); i++) {
            for (int j = 0; j < str2.length(); j++) {
                int len = 0;
                while (i + len < str1.length() && j + len < str2.length() && str1.charAt(i + len) == str2.charAt(j + len)) {
                    len++;
                }
                maxL = Math.max(maxL, len);
            }
        }
        return maxL;
    }
}""", "O(N * M * min(N, M))", "O(1)",
        """public class Solution {
    public static int lcs(String str1, String str2) {
        int n = str1.length(), m = str2.length();
        int[] prev = new int[m + 1];
        int maxL = 0;
        for (int i = 1; i <= n; i++) {
            int[] cur = new int[m + 1];
            for (int j = 1; j <= m; j++) {
                if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
                    cur[j] = 1 + prev[j - 1];
                    maxL = Math.max(maxL, cur[j]);
                } else {
                    cur[j] = 0;
                }
            }
            prev = cur;
        }
        return maxL;
    }
}""", "O(N * M)", "O(M)"
    ),

    "longest-palindromic-subsequence": make_sol(
        """public class Solution {
    public int longestPalindromeSubseq(String s) {
        return solve(0, s.length() - 1, s);
    }
    private int solve(int i, int j, String s) {
        if (i == j) return 1;
        if (i > j) return 0;
        if (s.charAt(i) == s.charAt(j)) return 2 + solve(i + 1, j - 1, s);
        return Math.max(solve(i + 1, j, s), solve(i, j - 1, s));
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        String rev = new StringBuilder(s).reverse().toString();
        int[] prev = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            int[] cur = new int[n + 1];
            for (int j = 1; j <= n; j++) {
                if (s.charAt(i - 1) == rev.charAt(j - 1)) {
                    cur[j] = 1 + prev[j - 1];
                } else {
                    cur[j] = Math.max(prev[j], cur[j - 1]);
                }
            }
            prev = cur;
        }
        return prev[n];
    }
}""", "O(N^2)", "O(N)"
    ),

    "minimum-insertions-to-make-string-palindrome": make_sol(
        """public class Solution {
    public int minInsertions(String s) {
        return s.length() - lps(s);
    }
    private int lps(String s) {
        return solve(0, s.length() - 1, s);
    }
    private int solve(int i, int j, String s) {
        if (i >= j) return (i == j) ? 1 : 0;
        if (s.charAt(i) == s.charAt(j)) return 2 + solve(i + 1, j - 1, s);
        return Math.max(solve(i + 1, j, s), solve(i, j - 1, s));
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int minInsertions(String s) {
        int n = s.length();
        String rev = new StringBuilder(s).reverse().toString();
        int[] prev = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            int[] cur = new int[n + 1];
            for (int j = 1; j <= n; j++) {
                if (s.charAt(i - 1) == rev.charAt(j - 1)) cur[j] = 1 + prev[j - 1];
                else cur[j] = Math.max(prev[j], cur[j - 1]);
            }
            prev = cur;
        }
        return n - prev[n];
    }
}""", "O(N^2)", "O(N)"
    ),

    "minimum-insertions-or-deletions-to-convert-string-a-to-b": make_sol(
        """public class Solution {
    public int minDistance(String word1, String word2) {
        int n = word1.length(), m = word2.length();
        int lcs = lcs(word1, word2);
        return (n - lcs) + (m - lcs);
    }
    private int lcs(String s1, String s2) {
        int n = s1.length(), m = s2.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) dp[i][j] = 1 + dp[i - 1][j - 1];
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        return dp[n][m];
    }
}""", "O(N * M)", "O(N * M)",
        """public class Solution {
    public int minDistance(String word1, String word2) {
        int n = word1.length(), m = word2.length();
        int[] prev = new int[m + 1];
        for (int i = 1; i <= n; i++) {
            int[] cur = new int[m + 1];
            for (int j = 1; j <= m; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) cur[j] = 1 + prev[j - 1];
                else cur[j] = Math.max(prev[j], cur[j - 1]);
            }
            prev = cur;
        }
        return (n + m) - 2 * prev[m];
    }
}""", "O(N * M)", "O(M)"
    ),

    "shortest-common-supersequence": make_sol(
        """public class Solution {
    public String shortestCommonSupersequence(String str1, String str2) {
        int n = str1.length(), m = str2.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (str1.charAt(i - 1) == str2.charAt(j - 1)) dp[i][j] = 1 + dp[i - 1][j - 1];
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        int i = n, j = m;
        StringBuilder sb = new StringBuilder();
        while (i > 0 && j > 0) {
            if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
                sb.append(str1.charAt(i - 1));
                i--; j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                sb.append(str1.charAt(i - 1));
                i--;
            } else {
                sb.append(str2.charAt(j - 1));
                j--;
            }
        }
        while (i > 0) { sb.append(str1.charAt(i - 1)); i--; }
        while (j > 0) { sb.append(str2.charAt(j - 1)); j--; }
        return sb.reverse().toString();
    }
}""", "O(N * M)", "O(N * M)",
        """public class Solution {
    public String shortestCommonSupersequence(String str1, String str2) {
        int n = str1.length(), m = str2.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (str1.charAt(i - 1) == str2.charAt(j - 1)) dp[i][j] = 1 + dp[i - 1][j - 1];
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        int i = n, j = m;
        StringBuilder sb = new StringBuilder();
        while (i > 0 && j > 0) {
            if (str1.charAt(i - 1) == str2.charAt(j - 1)) {
                sb.append(str1.charAt(i - 1));
                i--; j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                sb.append(str1.charAt(i - 1));
                i--;
            } else {
                sb.append(str2.charAt(j - 1));
                j--;
            }
        }
        while (i > 0) { sb.append(str1.charAt(i - 1)); i--; }
        while (j > 0) { sb.append(str2.charAt(j - 1)); j--; }
        return sb.reverse().toString();
    }
}""", "O(N * M)", "O(N * M)"
    ),

    "distinct-subsequences": make_sol(
        """public class Solution {
    public int numDistinct(String s, String t) {
        return solve(s.length() - 1, t.length() - 1, s, t);
    }
    private int solve(int i, int j, String s, String t) {
        if (j < 0) return 1;
        if (i < 0) return 0;
        if (s.charAt(i) == t.charAt(j)) {
            return solve(i - 1, j - 1, s, t) + solve(i - 1, j, s, t);
        }
        return solve(i - 1, j, s, t);
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int numDistinct(String s, String t) {
        int n = s.length(), m = t.length();
        int[] dp = new int[m + 1];
        dp[0] = 1;
        for (int i = 1; i <= n; i++) {
            for (int j = m; j >= 1; j--) {
                if (s.charAt(i - 1) == t.charAt(j - 1)) {
                    dp[j] = dp[j] + dp[j - 1];
                }
            }
        }
        return dp[m];
    }
}""", "O(N * M)", "O(M)"
    ),

    "edit-distance": make_sol(
        """public class Solution {
    public int minDistance(String word1, String word2) {
        return solve(word1.length() - 1, word2.length() - 1, word1, word2);
    }
    private int solve(int i, int j, String s1, String s2) {
        if (i < 0) return j + 1;
        if (j < 0) return i + 1;
        if (s1.charAt(i) == s2.charAt(j)) return solve(i - 1, j - 1, s1, s2);
        return 1 + Math.min(solve(i, j - 1, s1, s2), Math.min(solve(i - 1, j, s1, s2), solve(i - 1, j - 1, s1, s2)));
    }
}""", "O(3^(N+M))", "O(N+M)",
        """public class Solution {
    public int minDistance(String word1, String word2) {
        int n = word1.length(), m = word2.length();
        int[] prev = new int[m + 1];
        for (int j = 0; j <= m; j++) prev[j] = j;
        for (int i = 1; i <= n; i++) {
            int[] cur = new int[m + 1];
            cur[0] = i;
            for (int j = 1; j <= m; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    cur[j] = prev[j - 1];
                } else {
                    cur[j] = 1 + Math.min(cur[j - 1], Math.min(prev[j], prev[j - 1]));
                }
            }
            prev = cur;
        }
        return prev[m];
    }
}""", "O(N * M)", "O(M)"
    ),

    "wildcard-matching": make_sol(
        """public class Solution {
    public boolean isMatch(String s, String p) {
        return solve(s.length() - 1, p.length() - 1, s, p);
    }
    private boolean solve(int i, int j, String s, String p) {
        if (i < 0 && j < 0) return true;
        if (j < 0 && i >= 0) return false;
        if (i < 0 && j >= 0) {
            for (int k = 0; k <= j; k++) if (p.charAt(k) != '*') return false;
            return true;
        }
        if (s.charAt(i) == p.charAt(j) || p.charAt(j) == '?') return solve(i - 1, j - 1, s, p);
        if (p.charAt(j) == '*') return solve(i - 1, j, s, p) || solve(i, j - 1, s, p);
        return false;
    }
}""", "O(2^(N+M))", "O(N+M)",
        """public class Solution {
    public boolean isMatch(String s, String p) {
        int m = s.length(), n = p.length();
        boolean[] prev = new boolean[n + 1];
        prev[0] = true;
        for (int j = 1; j <= n; j++) {
            if (p.charAt(j - 1) == '*') prev[j] = prev[j - 1];
        }
        for (int i = 1; i <= m; i++) {
            boolean[] cur = new boolean[n + 1];
            for (int j = 1; j <= n; j++) {
                if (p.charAt(j - 1) == '*') {
                    cur[j] = cur[j - 1] || prev[j];
                } else if (p.charAt(j - 1) == '?' || s.charAt(i - 1) == p.charAt(j - 1)) {
                    cur[j] = prev[j - 1];
                }
            }
            prev = cur;
        }
        return prev[n];
    }
}""", "O(M * N)", "O(N)"
    ),

    "word-break": make_sol(
        """import java.util.*;
public class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> set = new HashSet<>(wordDict);
        return solve(0, s, set);
    }
    private boolean solve(int start, String s, Set<String> set) {
        if (start == s.length()) return true;
        for (int end = start + 1; end <= s.length(); end++) {
            if (set.contains(s.substring(start, end)) && solve(end, s, set)) return true;
        }
        return false;
    }
}""", "O(2^N)", "O(N)",
        """import java.util.*;
public class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> set = new HashSet<>(wordDict);
        int n = s.length();
        boolean[] dp = new boolean[n + 1];
        dp[0] = true;
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && set.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[n];
    }
}""", "O(N^2 * L)", "O(N)"
    ),

    "count-palindromic-subsequences": make_sol(
        """public class Solution {
    public static int countPalindromicSubsequences(String s) {
        return solve(0, s.length() - 1, s);
    }
    private static int solve(int i, int j, String s) {
        if (i > j) return 0;
        if (i == j) return 1;
        if (s.charAt(i) == s.charAt(j)) {
            return solve(i + 1, j, s) + solve(i, j - 1, s) + 1;
        }
        return solve(i + 1, j, s) + solve(i, j - 1, s) - solve(i + 1, j - 1, s);
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static int countPalindromicSubsequences(String s) {
        int n = s.length();
        long[][] dp = new long[n][n];
        long MOD = 1000000007;
        for (int i = 0; i < n; i++) dp[i][i] = 1;
        for (int len = 2; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                if (s.charAt(i) == s.charAt(j)) {
                    dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] + 1) % MOD;
                } else {
                    dp[i][j] = (dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1] + MOD) % MOD;
                }
            }
        }
        return (int) dp[0][n - 1];
    }
}""", "O(N^2)", "O(N^2)"
    ),

    "matrix-chain-multiplication": make_sol(
        """public class Solution {
    public static int matrixMultiplication(int[] arr, int N) {
        return solve(1, N - 1, arr);
    }
    private static int solve(int i, int j, int[] arr) {
        if (i == j) return 0;
        int mini = Integer.MAX_VALUE;
        for (int k = i; k < j; k++) {
            int steps = arr[i - 1] * arr[k] * arr[j] + solve(i, k, arr) + solve(k + 1, j, arr);
            mini = Math.min(mini, steps);
        }
        return mini;
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static int matrixMultiplication(int[] arr, int N) {
        int[][] dp = new int[N][N];
        for (int len = 2; len < N; len++) {
            for (int i = 1; i < N - len + 1; i++) {
                int j = i + len - 1;
                dp[i][j] = Integer.MAX_VALUE;
                for (int k = i; k < j; k++) {
                    int steps = arr[i - 1] * arr[k] * arr[j] + dp[i][k] + dp[k + 1][j];
                    dp[i][j] = Math.min(dp[i][j], steps);
                }
            }
        }
        return dp[1][N - 1];
    }
}""", "O(N^3)", "O(N^2)"
    ),

    "burst-balloons": make_sol(
        """public class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] a = new int[n + 2];
        a[0] = 1; a[n + 1] = 1;
        for (int i = 0; i < n; i++) a[i + 1] = nums[i];
        return solve(1, n, a);
    }
    private int solve(int i, int j, int[] a) {
        if (i > j) return 0;
        int max = 0;
        for (int ind = i; ind <= j; ind++) {
            int cost = a[i - 1] * a[ind] * a[j + 1] + solve(i, ind - 1, a) + solve(ind + 1, j, a);
            max = Math.max(max, cost);
        }
        return max;
    }
}""", "O(N!)", "O(N)",
        """public class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] a = new int[n + 2];
        a[0] = 1; a[n + 1] = 1;
        for (int i = 0; i < n; i++) a[i + 1] = nums[i];
        int[][] dp = new int[n + 2][n + 2];
        for (int len = 1; len <= n; len++) {
            for (int i = 1; i <= n - len + 1; i++) {
                int j = i + len - 1;
                for (int ind = i; ind <= j; ind++) {
                    int cost = a[i - 1] * a[ind] * a[j + 1] + dp[i][ind - 1] + dp[ind + 1][j];
                    dp[i][j] = Math.max(dp[i][j], cost);
                }
            }
        }
        return dp[1][n];
    }
}""", "O(N^3)", "O(N^2)"
    ),

    "palindrome-partitioning-ii-": make_sol(
        """public class Solution {
    public int minCut(String s) {
        return solve(0, s) - 1;
    }
    private int solve(int i, String s) {
        if (i == s.length()) return 0;
        int minCost = Integer.MAX_VALUE;
        for (int j = i; j < s.length(); j++) {
            if (isPalindrome(i, j, s)) {
                int cost = 1 + solve(j + 1, s);
                minCost = Math.min(minCost, cost);
            }
        }
        return minCost;
    }
    private boolean isPalindrome(int i, int j, String s) {
        while (i < j) {
            if (s.charAt(i++) != s.charAt(j--)) return false;
        }
        return true;
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int minCut(String s) {
        int n = s.length();
        boolean[][] isPal = new boolean[n][n];
        for (int len = 1; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                if (s.charAt(i) == s.charAt(j)) {
                    isPal[i][j] = (len <= 2) || isPal[i + 1][j - 1];
                }
            }
        }
        int[] dp = new int[n + 1];
        dp[n] = 0;
        for (int i = n - 1; i >= 0; i--) {
            int minCost = Integer.MAX_VALUE;
            for (int j = i; j < n; j++) {
                if (isPal[i][j]) {
                    minCost = Math.min(minCost, 1 + dp[j + 1]);
                }
            }
            dp[i] = minCost;
        }
        return dp[0] - 1;
    }
}""", "O(N^2)", "O(N^2)"
    ),

    "partition-array-for-maximum-sum": make_sol(
        """public class Solution {
    public int maxSumAfterPartitioning(int[] arr, int k) {
        return solve(0, arr, k);
    }
    private int solve(int ind, int[] arr, int k) {
        if (ind == arr.length) return 0;
        int len = 0, maxi = Integer.MIN_VALUE, maxAns = Integer.MIN_VALUE;
        for (int j = ind; j < Math.min(arr.length, ind + k); j++) {
            len++;
            maxi = Math.max(maxi, arr[j]);
            int sum = len * maxi + solve(j + 1, arr, k);
            maxAns = Math.max(maxAns, sum);
        }
        return maxAns;
    }
}""", "O(K^N)", "O(N)",
        """public class Solution {
    public int maxSumAfterPartitioning(int[] arr, int k) {
        int n = arr.length;
        int[] dp = new int[n + 1];
        for (int i = n - 1; i >= 0; i--) {
            int len = 0, maxi = Integer.MIN_VALUE, maxAns = Integer.MIN_VALUE;
            for (int j = i; j < Math.min(n, i + k); j++) {
                len++;
                maxi = Math.max(maxi, arr[j]);
                int sum = len * maxi + dp[j + 1];
                maxAns = Math.max(maxAns, sum);
            }
            dp[i] = maxAns;
        }
        return dp[0];
    }
}""", "O(N * K)", "O(N)"
    ),

    "minimum-cost-to-cut-the-stick": make_sol(
        """import java.util.*;
public class Solution {
    public int minCost(int n, int[] cuts) {
        List<Integer> list = new ArrayList<>();
        list.add(0);
        for (int c : cuts) list.add(c);
        list.add(n);
        Collections.sort(list);
        return solve(1, cuts.length, list);
    }
    private int solve(int i, int j, List<Integer> cuts) {
        if (i > j) return 0;
        int mini = Integer.MAX_VALUE;
        for (int ind = i; ind <= j; ind++) {
            int cost = cuts.get(j + 1) - cuts.get(i - 1) + solve(i, ind - 1, cuts) + solve(ind + 1, j, cuts);
            mini = Math.min(mini, cost);
        }
        return mini;
    }
}""", "O(C!)", "O(C)",
        """import java.util.*;
public class Solution {
    public int minCost(int n, int[] cuts) {
        int c = cuts.length;
        int[] arr = new int[c + 2];
        arr[0] = 0; arr[c + 1] = n;
        for (int i = 0; i < c; i++) arr[i + 1] = cuts[i];
        Arrays.sort(arr);
        int[][] dp = new int[c + 2][c + 2];
        for (int len = 1; len <= c; len++) {
            for (int i = 1; i <= c - len + 1; i++) {
                int j = i + len - 1;
                int mini = Integer.MAX_VALUE;
                for (int ind = i; ind <= j; ind++) {
                    int cost = arr[j + 1] - arr[i - 1] + dp[i][ind - 1] + dp[ind + 1][j];
                    mini = Math.min(mini, cost);
                }
                dp[i][j] = mini;
            }
        }
        return dp[1][c];
    }
}""", "O(C^3)", "O(C^2)"
    ),

    "different-ways-to-evaluate-a-boolean-expression": make_sol(
        """public class Solution {
    public static int evaluateExp(String exp) {
        return (int) solve(0, exp.length() - 1, 1, exp);
    }
    private static long solve(int i, int j, int isTrue, String exp) {
        if (i > j) return 0;
        if (i == j) {
            if (isTrue == 1) return exp.charAt(i) == 'T' ? 1 : 0;
            else return exp.charAt(i) == 'F' ? 1 : 0;
        }
        long ways = 0;
        for (int ind = i + 1; ind <= j - 1; ind += 2) {
            long lT = solve(i, ind - 1, 1, exp);
            long lF = solve(i, ind - 1, 0, exp);
            long rT = solve(ind + 1, j, 1, exp);
            long rF = solve(ind + 1, j, 0, exp);
            char op = exp.charAt(ind);
            if (op == '&') {
                if (isTrue == 1) ways += lT * rT;
                else ways += lF * rT + lT * rF + lF * rF;
            } else if (op == '|') {
                if (isTrue == 1) ways += lT * rT + lF * rT + lT * rF;
                else ways += lF * rF;
            } else if (op == '^') {
                if (isTrue == 1) ways += lT * rF + lF * rT;
                else ways += lT * rT + lF * rF;
            }
        }
        return ways % 1000000007;
    }
}""", "O(3^N)", "O(N)",
        """public class Solution {
    public static int evaluateExp(String exp) {
        int n = exp.length();
        long[][][] dp = new long[n][n][2];
        long MOD = 1000000007;
        for (int i = 0; i < n; i += 2) {
            dp[i][i][1] = (exp.charAt(i) == 'T') ? 1 : 0;
            dp[i][i][0] = (exp.charAt(i) == 'F') ? 1 : 0;
        }
        for (int len = 3; len <= n; len += 2) {
            for (int i = 0; i <= n - len; i += 2) {
                int j = i + len - 1;
                for (int ind = i + 1; ind < j; ind += 2) {
                    long lT = dp[i][ind - 1][1], lF = dp[i][ind - 1][0];
                    long rT = dp[ind + 1][j][1], rF = dp[ind + 1][j][0];
                    char op = exp.charAt(ind);
                    if (op == '&') {
                        dp[i][j][1] = (dp[i][j][1] + lT * rT) % MOD;
                        dp[i][j][0] = (dp[i][j][0] + lF * rT + lT * rF + lF * rF) % MOD;
                    } else if (op == '|') {
                        dp[i][j][1] = (dp[i][j][1] + lT * rT + lF * rT + lT * rF) % MOD;
                        dp[i][j][0] = (dp[i][j][0] + lF * rF) % MOD;
                    } else if (op == '^') {
                        dp[i][j][1] = (dp[i][j][1] + lT * rF + lF * rT) % MOD;
                        dp[i][j][0] = (dp[i][j][0] + lT * rT + lF * rF) % MOD;
                    }
                }
            }
        }
        return (int) dp[0][n - 1][1];
    }
}""", "O(N^3)", "O(N^2)"
    )
}
'''

with open(dp_file, "w") as f:
    f.write(content)
print(f"Wrote {dp_file}")
