from .common import make_sol

GREEDY_SOLUTIONS = {
    "assign-cookies": make_sol(
        """import java.util.Arrays;

public class Solution {
    public static int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g);
        Arrays.sort(s);
        int i = 0, j = 0;
        while (i < g.length && j < s.length) {
            if (s[j] >= g[i]) i++;
            j++;
        }
        return i;
    }
}""", "O(N log N + M log M)", "O(1)",
        """import java.util.Arrays;

public class Solution {
    public static int findContentChildren(int[] g, int[] s) {
        Arrays.sort(g);
        Arrays.sort(s);
        int i = 0, j = 0;
        while (i < g.length && j < s.length) {
            if (s[j] >= g[i]) i++;
            j++;
        }
        return i;
    }
}""", "O(N log N + M log M)", "O(1)"
    ),

    "lemonade-change": make_sol(
        """public class Solution {
    public static boolean lemonadeChange(int[] bills) {
        int five = 0, ten = 0;
        for (int bill : bills) {
            if (bill == 5) {
                five++;
            } else if (bill == 10) {
                if (five == 0) return false;
                five--;
                ten++;
            } else {
                if (ten > 0 && five > 0) {
                    ten--;
                    five--;
                } else if (five >= 3) {
                    five -= 3;
                } else {
                    return false;
                }
            }
        }
        return true;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static boolean lemonadeChange(int[] bills) {
        int five = 0, ten = 0;
        for (int bill : bills) {
            if (bill == 5) {
                five++;
            } else if (bill == 10) {
                if (five == 0) return false;
                five--;
                ten++;
            } else {
                if (ten > 0 && five > 0) {
                    ten--;
                    five--;
                } else if (five >= 3) {
                    five -= 3;
                } else {
                    return false;
                }
            }
        }
        return true;
    }
}""", "O(N)", "O(1)"
    ),

    "fractional-knapsack": make_sol(
        """import java.util.Arrays;

class Item {
    int value, weight;
    Item(int x, int y){ this.value = x; this.weight = y; }
}

public class Solution {
    public static double fractionalKnapsack(int w, Item[] arr, int n) {
        Arrays.sort(arr, (a, b) -> Double.compare((double) b.value / b.weight, (double) a.value / a.weight));
        double totalValue = 0.0;
        for (Item item : arr) {
            if (item.weight <= w) {
                w -= item.weight;
                totalValue += item.value;
            } else {
                totalValue += ((double) item.value / item.weight) * w;
                break;
            }
        }
        return totalValue;
    }
}""", "O(N log N)", "O(1)",
        """import java.util.Arrays;

class Item {
    int value, weight;
    Item(int x, int y){ this.value = x; this.weight = y; }
}

public class Solution {
    public static double fractionalKnapsack(int w, Item[] arr, int n) {
        Arrays.sort(arr, (a, b) -> Double.compare((double) b.value / b.weight, (double) a.value / a.weight));
        double totalValue = 0.0;
        for (Item item : arr) {
            if (item.weight <= w) {
                w -= item.weight;
                totalValue += item.value;
            } else {
                totalValue += ((double) item.value / item.weight) * w;
                break;
            }
        }
        return totalValue;
    }
}""", "O(N log N)", "O(1)"
    ),

    "jump-game---i": make_sol(
        """public class Solution {
    public static boolean canJump(int[] nums) {
        return canReach(nums, 0);
    }

    private static boolean canReach(int[] nums, int index) {
        if (index >= nums.length - 1) return true;
        int maxJump = nums[index];
        for (int i = 1; i <= maxJump; i++) {
            if (canReach(nums, index + i)) return true;
        }
        return false;
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static boolean canJump(int[] nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false;
            maxReach = Math.max(maxReach, i + nums[i]);
        }
        return true;
    }
}""", "O(N)", "O(1)"
    ),

    "shortest-job-first": make_sol(
        """import java.util.Arrays;

public class Solution {
    public static long solve(int[] bt) {
        Arrays.sort(bt);
        long waitTime = 0, totalTime = 0;
        for (int t : bt) {
            waitTime += totalTime;
            totalTime += t;
        }
        return waitTime / bt.length;
    }
}""", "O(N log N)", "O(1)",
        """import java.util.Arrays;

public class Solution {
    public static long solve(int[] bt) {
        Arrays.sort(bt);
        long waitTime = 0, totalTime = 0;
        for (int t : bt) {
            waitTime += totalTime;
            totalTime += t;
        }
        return waitTime / bt.length;
    }
}""", "O(N log N)", "O(1)"
    ),

    "job-sequencing-problem": make_sol(
        """import java.util.Arrays;

class Job {
    int id, profit, deadline;
    Job(int x, int y, int z){ this.id = x; this.deadline = y; this.profit = z; }
}

public class Solution {
    public static int[] JobScheduling(Job[] arr, int n) {
        Arrays.sort(arr, (a, b) -> b.profit - a.profit);
        int maxDeadline = 0;
        for (Job j : arr) maxDeadline = Math.max(maxDeadline, j.deadline);
        int[] result = new int[maxDeadline + 1];
        Arrays.fill(result, -1);
        int count = 0, totalProfit = 0;
        for (Job j : arr) {
            for (int k = j.deadline; k > 0; k--) {
                if (result[k] == -1) {
                    result[k] = j.id;
                    count++;
                    totalProfit += j.profit;
                    break;
                }
            }
        }
        return new int[]{count, totalProfit};
    }
}""", "O(N log N + N * maxDeadline)", "O(maxDeadline)",
        """import java.util.Arrays;

class Job {
    int id, profit, deadline;
    Job(int x, int y, int z){ this.id = x; this.deadline = y; this.profit = z; }
}

public class Solution {
    public static int[] JobScheduling(Job[] arr, int n) {
        Arrays.sort(arr, (a, b) -> b.profit - a.profit);
        int maxDeadline = 0;
        for (Job j : arr) maxDeadline = Math.max(maxDeadline, j.deadline);
        int[] result = new int[maxDeadline + 1];
        Arrays.fill(result, -1);
        int count = 0, totalProfit = 0;
        for (Job j : arr) {
            for (int k = j.deadline; k > 0; k--) {
                if (result[k] == -1) {
                    result[k] = j.id;
                    count++;
                    totalProfit += j.profit;
                    break;
                }
            }
        }
        return new int[]{count, totalProfit};
    }
}""", "O(N log N + N * maxDeadline)", "O(maxDeadline)"
    ),

    "n-meetings-in-one-room": make_sol(
        """import java.util.*;

class Meeting {
    int start, end;
    Meeting(int s, int e) { this.start = s; this.end = e; }
}

public class Solution {
    public static int maxMeetings(int[] start, int[] end, int n) {
        List<Meeting> list = new ArrayList<>();
        for (int i = 0; i < n; i++) list.add(new Meeting(start[i], end[i]));
        list.sort(Comparator.comparingInt(a -> a.end));
        int count = 1, limit = list.get(0).end;
        for (int i = 1; i < n; i++) {
            if (list.get(i).start > limit) {
                count++;
                limit = list.get(i).end;
            }
        }
        return count;
    }
}""", "O(N log N)", "O(N)",
        """import java.util.*;

class Meeting {
    int start, end;
    Meeting(int s, int e) { this.start = s; this.end = e; }
}

public class Solution {
    public static int maxMeetings(int[] start, int[] end, int n) {
        List<Meeting> list = new ArrayList<>();
        for (int i = 0; i < n; i++) list.add(new Meeting(start[i], end[i]));
        list.sort(Comparator.comparingInt(a -> a.end));
        int count = 1, limit = list.get(0).end;
        for (int i = 1; i < n; i++) {
            if (list.get(i).start > limit) {
                count++;
                limit = list.get(i).end;
            }
        }
        return count;
    }
}""", "O(N log N)", "O(N)"
    ),

    "non-overlapping-intervals": make_sol(
        """import java.util.Arrays;
import java.util.Comparator;

public class Solution {
    public static int eraseOverlapIntervals(int[][] intervals) {
        if (intervals.length == 0) return 0;
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[1]));
        int count = 1, end = intervals[0][1];
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] >= end) {
                count++;
                end = intervals[i][1];
            }
        }
        return intervals.length - count;
    }
}""", "O(N log N)", "O(1)",
        """import java.util.Arrays;
import java.util.Comparator;

public class Solution {
    public static int eraseOverlapIntervals(int[][] intervals) {
        if (intervals.length == 0) return 0;
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[1]));
        int count = 1, end = intervals[0][1];
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] >= end) {
                count++;
                end = intervals[i][1];
            }
        }
        return intervals.length - count;
    }
}""", "O(N log N)", "O(1)"
    ),

    "insert-interval": make_sol(
        """import java.util.*;

public class Solution {
    public static int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> list = new ArrayList<>(Arrays.asList(intervals));
        list.add(newInterval);
        list.sort(Comparator.comparingInt(a -> a[0]));
        List<int[]> merged = new ArrayList<>();
        for (int[] interval : list) {
            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {
                merged.add(interval);
            } else {
                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], interval[1]);
            }
        }
        return merged.toArray(new int[merged.size()][]);
    }
}""", "O(N log N)", "O(N)",
        """import java.util.*;

public class Solution {
    public static int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> result = new ArrayList<>();
        int i = 0, n = intervals.length;
        while (i < n && intervals[i][1] < newInterval[0]) {
            result.add(intervals[i++]);
        }
        while (i < n && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
            newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
            i++;
        }
        result.add(newInterval);
        while (i < n) {
            result.add(intervals[i++]);
        }
        return result.toArray(new int[result.size()][]);
    }
}""", "O(N)", "O(N)"
    ),

    "merge-intervals": make_sol(
        """import java.util.*;

public class Solution {
    public static int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
        List<int[]> ans = new ArrayList<>();
        int n = intervals.length;
        for (int i = 0; i < n; i++) {
            int start = intervals[i][0], end = intervals[i][1];
            if (!ans.isEmpty() && end <= ans.get(ans.size() - 1)[1]) continue;
            for (int j = i + 1; j < n; j++) {
                if (intervals[j][0] <= end) end = Math.max(end, intervals[j][1]);
                else break;
            }
            ans.add(new int[]{start, end});
        }
        return ans.toArray(new int[ans.size()][]);
    }
}""", "O(N²)", "O(N)",
        """import java.util.*;

public class Solution {
    public static int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
        List<int[]> merged = new ArrayList<>();
        for (int[] interval : intervals) {
            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {
                merged.add(interval);
            } else {
                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], interval[1]);
            }
        }
        return merged.toArray(new int[merged.size()][]);
    }
}""", "O(N log N)", "O(N)"
    ),

    "minimum-number-of-platforms-required-for-a-railway": make_sol(
        """public class Solution {
    public static int findPlatform(int[] arr, int[] dep, int n) {
        int maxPlat = 1;
        for (int i = 0; i < n; i++) {
            int plat = 1;
            for (int j = 0; j < n; j++) {
                if (i != j && arr[i] >= arr[j] && dep[j] >= arr[i]) plat++;
            }
            maxPlat = Math.max(maxPlat, plat);
        }
        return maxPlat;
    }
}""", "O(N²)", "O(1)",
        """import java.util.Arrays;

public class Solution {
    public static int findPlatform(int[] arr, int[] dep, int n) {
        Arrays.sort(arr);
        Arrays.sort(dep);
        int plat = 1, maxPlat = 1;
        int i = 1, j = 0;
        while (i < n && j < n) {
            if (arr[i] <= dep[j]) {
                plat++;
                i++;
            } else {
                plat--;
                j++;
            }
            maxPlat = Math.max(maxPlat, plat);
        }
        return maxPlat;
    }
}""", "O(N log N)", "O(1)"
    ),

    "valid-paranthesis-checker": make_sol(
        """public class Solution {
    public static boolean checkValidString(String s) {
        return isValid(s, 0, 0);
    }

    private static boolean isValid(String s, int index, int count) {
        if (count < 0) return false;
        if (index == s.length()) return count == 0;
        char c = s.charAt(index);
        if (c == '(') return isValid(s, index + 1, count + 1);
        if (c == ')') return isValid(s, index + 1, count - 1);
        return isValid(s, index + 1, count + 1) || isValid(s, index + 1, count - 1) || isValid(s, index + 1, count);
    }
}""", "O(3^N)", "O(N)",
        """public class Solution {
    public static boolean checkValidString(String s) {
        int minOpen = 0, maxOpen = 0;
        for (char c : s.toCharArray()) {
            if (c == '(') {
                minOpen++;
                maxOpen++;
            } else if (c == ')') {
                minOpen--;
                maxOpen--;
            } else {
                minOpen--;
                maxOpen++;
            }
            if (maxOpen < 0) return false;
            minOpen = Math.max(minOpen, 0);
        }
        return minOpen == 0;
    }
}""", "O(N)", "O(1)"
    ),

    "candy": make_sol(
        """import java.util.Arrays;

public class Solution {
    public static int candy(int[] ratings) {
        int n = ratings.length;
        int[] left = new int[n];
        int[] right = new int[n];
        Arrays.fill(left, 1);
        Arrays.fill(right, 1);
        for (int i = 1; i < n; i++) {
            if (ratings[i] > ratings[i - 1]) left[i] = left[i - 1] + 1;
        }
        for (int i = n - 2; i >= 0; i--) {
            if (ratings[i] > ratings[i + 1]) right[i] = right[i + 1] + 1;
        }
        int total = 0;
        for (int i = 0; i < n; i++) total += Math.max(left[i], right[i]);
        return total;
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static int candy(int[] ratings) {
        int n = ratings.length;
        int sum = 1, i = 1;
        while (i < n) {
            if (ratings[i] == ratings[i - 1]) {
                sum++;
                i++;
                continue;
            }
            int peak = 1;
            while (i < n && ratings[i] > ratings[i - 1]) {
                peak++;
                sum += peak;
                i++;
            }
            int down = 1;
            while (i < n && ratings[i] < ratings[i - 1]) {
                sum += down;
                down++;
                i++;
            }
            if (down > peak) sum += (down - peak);
        }
        return sum;
    }
}""", "O(N)", "O(1)"
    ),

    "jump-game-ii": make_sol(
        """public class Solution {
    public static int jump(int[] nums) {
        int[] dp = new int[nums.length];
        java.util.Arrays.fill(dp, 100000);
        dp[0] = 0;
        for (int i = 0; i < nums.length; i++) {
            for (int j = 1; j <= nums[i] && i + j < nums.length; j++) {
                dp[i + j] = Math.min(dp[i + j], dp[i] + 1);
            }
        }
        return dp[nums.length - 1];
    }
}""", "O(N²)", "O(N)",
        """public class Solution {
    public static int jump(int[] nums) {
        int jumps = 0, currentEnd = 0, farthest = 0;
        for (int i = 0; i < nums.length - 1; i++) {
            farthest = Math.max(farthest, i + nums[i]);
            if (i == currentEnd) {
                jumps++;
                currentEnd = farthest;
            }
        }
        return jumps;
    }
}""", "O(N)", "O(1)"
    )
}
