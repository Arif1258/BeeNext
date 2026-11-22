from .common import make_sol

BINARY_SEARCH_SOLUTIONS = {
    "search-x-in-sorted-array": make_sol(
        """public class Solution {
    public static int search(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] == target) return i;
        }
        return -1;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}""", "O(log N)", "O(1)"
    ),

    "lower-bound-": make_sol(
        """public class Solution {
    public static int lowerBound(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] >= target) return i;
        }
        return arr.length;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int lowerBound(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        int ans = arr.length;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] >= target) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }
}""", "O(log N)", "O(1)"
    ),

    "upper-bound": make_sol(
        """public class Solution {
    public static int upperBound(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] > target) return i;
        }
        return arr.length;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int upperBound(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        int ans = arr.length;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] > target) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }
}""", "O(log N)", "O(1)"
    ),

    "search-insert-position": make_sol(
        """public class Solution {
    public static int searchInsert(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] >= target) return i;
        }
        return nums.length;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int searchInsert(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        int ans = nums.length;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] >= target) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }
}""", "O(log N)", "O(1)"
    ),

    "floor-and-ceil-in-sorted-array": make_sol(
        """public class Solution {
    public static int[] getFloorAndCeil(int[] a, int n, int x) {
        int floor = -1, ceil = -1;
        for (int i = 0; i < n; i++) {
            if (a[i] <= x) floor = a[i];
            if (a[i] >= x && ceil == -1) ceil = a[i];
        }
        return new int[]{floor, ceil};
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int[] getFloorAndCeil(int[] a, int n, int x) {
        int low = 0, high = n - 1;
        int floor = -1, ceil = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (a[mid] <= x) {
                floor = a[mid];
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        low = 0; high = n - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (a[mid] >= x) {
                ceil = a[mid];
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return new int[]{floor, ceil};
    }
}""", "O(log N)", "O(1)"
    ),

    "first-and-last-occurrence": make_sol(
        """public class Solution {
    public static int[] searchRange(int[] nums, int target) {
        int first = -1, last = -1;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] == target) {
                if (first == -1) first = i;
                last = i;
            }
        }
        return new int[]{first, last};
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int[] searchRange(int[] nums, int target) {
        return new int[]{findBound(nums, target, true), findBound(nums, target, false)};
    }

    private static int findBound(int[] nums, int target, boolean isFirst) {
        int low = 0, high = nums.length - 1, ans = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) {
                ans = mid;
                if (isFirst) high = mid - 1;
                else low = mid + 1;
            } else if (nums[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return ans;
    }
}""", "O(log N)", "O(1)"
    ),

    "search-in-rotated-sorted-array-i": make_sol(
        """public class Solution {
    public static int search(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] == target) return i;
        }
        return -1;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) high = mid - 1;
                else low = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[high]) low = mid + 1;
                else high = mid - 1;
            }
        }
        return -1;
    }
}""", "O(log N)", "O(1)"
    ),

    "search-in-rotated-sorted-array-2": make_sol(
        """public class Solution {
    public static boolean search(int[] nums, int target) {
        for (int num : nums) {
            if (num == target) return true;
        }
        return false;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static boolean search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return true;
            if (nums[low] == nums[mid] && nums[mid] == nums[high]) {
                low++;
                high--;
                continue;
            }
            if (nums[low] <= nums[mid]) {
                if (nums[low] <= target && target < nums[mid]) high = mid - 1;
                else low = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[high]) low = mid + 1;
                else high = mid - 1;
            }
        }
        return false;
    }
}""", "O(log N)", "O(1)"
    ),

    "find-minimum-in-rotated-sorted-array": make_sol(
        """public class Solution {
    public static int findMin(int[] nums) {
        int min = nums[0];
        for (int num : nums) min = Math.min(min, num);
        return min;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int findMin(int[] nums) {
        int low = 0, high = nums.length - 1;
        int ans = Integer.MAX_VALUE;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[low] <= nums[high]) {
                ans = Math.min(ans, nums[low]);
                break;
            }
            if (nums[low] <= nums[mid]) {
                ans = Math.min(ans, nums[low]);
                low = mid + 1;
            } else {
                ans = Math.min(ans, nums[mid]);
                high = mid - 1;
            }
        }
        return ans;
    }
}""", "O(log N)", "O(1)"
    ),

    "find-out-how-many-times-the-array-is-rotated": make_sol(
        """public class Solution {
    public static int findKRotation(int[] arr, int n) {
        int min = arr[0], minIdx = 0;
        for (int i = 0; i < n; i++) {
            if (arr[i] < min) {
                min = arr[i];
                minIdx = i;
            }
        }
        return minIdx;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int findKRotation(int[] arr, int n) {
        int low = 0, high = n - 1;
        int ans = Integer.MAX_VALUE, index = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[low] <= arr[high]) {
                if (arr[low] < ans) {
                    ans = arr[low];
                    index = low;
                }
                break;
            }
            if (arr[low] <= arr[mid]) {
                if (arr[low] < ans) {
                    ans = arr[low];
                    index = low;
                }
                low = mid + 1;
            } else {
                if (arr[mid] < ans) {
                    ans = arr[mid];
                    index = mid;
                }
                high = mid - 1;
            }
        }
        return index;
    }
}""", "O(log N)", "O(1)"
    ),

    "single-element-in-sorted-array": make_sol(
        """public class Solution {
    public static int singleNonDuplicate(int[] nums) {
        int xor = 0;
        for (int num : nums) xor ^= num;
        return xor;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int singleNonDuplicate(int[] nums) {
        int low = 0, high = nums.length - 1;
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (mid % 2 == 1) mid--;
            if (nums[mid] == nums[mid + 1]) {
                low = mid + 2;
            } else {
                high = mid;
            }
        }
        return nums[low];
    }
}""", "O(log N)", "O(1)"
    ),

    "count-occurrences-in-a-sorted-array": make_sol(
        """public class Solution {
    public static int count(int[] arr, int n, int x) {
        int c = 0;
        for (int num : arr) {
            if (num == x) c++;
        }
        return c;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int count(int[] arr, int n, int x) {
        int first = findFirst(arr, n, x);
        if (first == -1) return 0;
        int last = findLast(arr, n, x);
        return last - first + 1;
    }

    private static int findFirst(int[] arr, int n, int x) {
        int low = 0, high = n - 1, ans = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == x) { ans = mid; high = mid - 1; }
            else if (arr[mid] < x) low = mid + 1;
            else high = mid - 1;
        }
        return ans;
    }

    private static int findLast(int[] arr, int n, int x) {
        int low = 0, high = n - 1, ans = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == x) { ans = mid; low = mid + 1; }
            else if (arr[mid] < x) low = mid + 1;
            else high = mid - 1;
        }
        return ans;
    }
}""", "O(log N)", "O(1)"
    ),

    "find-square-root-of-a-number": make_sol(
        """public class Solution {
    public static long floorSqrt(long n) {
        long ans = 1;
        for (long i = 1; i * i <= n; i++) {
            ans = i;
        }
        return ans;
    }
}""", "O(sqrt(N))", "O(1)",
        """public class Solution {
    public static long floorSqrt(long n) {
        long low = 1, high = n, ans = 0;
        while (low <= high) {
            long mid = low + (high - low) / 2;
            if (mid * mid <= n) {
                ans = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return ans;
    }
}""", "O(log N)", "O(1)"
    ),

    "find-nth-root-of-a-number": make_sol(
        """public class Solution {
    public static int NthRoot(int n, int m) {
        for (int i = 1; i <= m; i++) {
            long val = 1;
            for (int j = 0; j < n; j++) {
                val *= i;
                if (val > m) break;
            }
            if (val == m) return i;
            if (val > m) break;
        }
        return -1;
    }
}""", "O(M)", "O(1)",
        """public class Solution {
    public static int NthRoot(int n, int m) {
        int low = 1, high = m;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int midN = check(mid, n, m);
            if (midN == 1) return mid;
            else if (midN == 0) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    private static int check(int mid, int n, int m) {
        long ans = 1;
        for (int i = 1; i <= n; i++) {
            ans *= mid;
            if (ans > m) return 2;
        }
        if (ans == m) return 1;
        return 0;
    }
}""", "O(N log M)", "O(1)"
    ),

    "find-the-smallest-divisor": make_sol(
        """public class Solution {
    public static int smallestDivisor(int[] nums, int threshold) {
        int max = 0;
        for (int x : nums) max = Math.max(max, x);
        for (int d = 1; d <= max; d++) {
            int sum = 0;
            for (int x : nums) sum += (x + d - 1) / d;
            if (sum <= threshold) return d;
        }
        return max;
    }
}""", "O(max * N)", "O(1)",
        """public class Solution {
    public static int smallestDivisor(int[] nums, int threshold) {
        int low = 1, high = 0;
        for (int x : nums) high = Math.max(high, x);
        int ans = high;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int sum = 0;
            for (int x : nums) sum += (x + mid - 1) / mid;
            if (sum <= threshold) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }
}""", "O(N log(max))", "O(1)"
    ),

    "koko-eating-bananas": make_sol(
        """public class Solution {
    public static int minEatingSpeed(int[] piles, int h) {
        int max = 0;
        for (int p : piles) max = Math.max(max, p);
        for (int speed = 1; speed <= max; speed++) {
            long hours = 0;
            for (int p : piles) hours += (p + speed - 1) / speed;
            if (hours <= h) return speed;
        }
        return max;
    }
}""", "O(max * N)", "O(1)",
        """public class Solution {
    public static int minEatingSpeed(int[] piles, int h) {
        int low = 1, high = 0;
        for (int p : piles) high = Math.max(high, p);
        int ans = high;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            long hours = 0;
            for (int p : piles) hours += (p + mid - 1) / mid;
            if (hours <= h) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }
}""", "O(N log(max))", "O(1)"
    ),

    "minimum-days-to-make-m-bouquets": make_sol(
        """public class Solution {
    public static int minDays(int[] bloomDay, int m, int k) {
        if ((long) m * k > bloomDay.length) return -1;
        int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
        for (int val : bloomDay) {
            min = Math.min(min, val);
            max = Math.max(max, val);
        }
        for (int d = min; d <= max; d++) {
            if (canMake(bloomDay, m, k, d)) return d;
        }
        return -1;
    }

    private static boolean canMake(int[] bloomDay, int m, int k, int day) {
        int count = 0, bouquets = 0;
        for (int b : bloomDay) {
            if (b <= day) {
                count++;
                if (count == k) {
                    bouquets++;
                    count = 0;
                }
            } else {
                count = 0;
            }
        }
        return bouquets >= m;
    }
}""", "O((max - min) * N)", "O(1)",
        """public class Solution {
    public static int minDays(int[] bloomDay, int m, int k) {
        if ((long) m * k > bloomDay.length) return -1;
        int low = Integer.MAX_VALUE, high = Integer.MIN_VALUE;
        for (int val : bloomDay) {
            low = Math.min(low, val);
            high = Math.max(high, val);
        }
        int ans = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (canMake(bloomDay, m, k, mid)) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }

    private static boolean canMake(int[] bloomDay, int m, int k, int day) {
        int count = 0, bouquets = 0;
        for (int b : bloomDay) {
            if (b <= day) {
                count++;
                if (count == k) {
                    bouquets++;
                    count = 0;
                }
            } else {
                count = 0;
            }
        }
        return bouquets >= m;
    }
}""", "O(N log(max - min))", "O(1)"
    ),

    "capacity-to-ship-packages-within-d-days": make_sol(
        """public class Solution {
    public static int shipWithinDays(int[] weights, int days) {
        int max = 0, sum = 0;
        for (int w : weights) {
            max = Math.max(max, w);
            sum += w;
        }
        for (int cap = max; cap <= sum; cap++) {
            if (daysNeeded(weights, cap) <= days) return cap;
        }
        return sum;
    }

    private static int daysNeeded(int[] weights, int cap) {
        int d = 1, current = 0;
        for (int w : weights) {
            if (current + w > cap) {
                d++;
                current = w;
            } else {
                current += w;
            }
        }
        return d;
    }
}""", "O((sum - max) * N)", "O(1)",
        """public class Solution {
    public static int shipWithinDays(int[] weights, int days) {
        int low = 0, high = 0;
        for (int w : weights) {
            low = Math.max(low, w);
            high += w;
        }
        int ans = high;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (daysNeeded(weights, mid) <= days) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }

    private static int daysNeeded(int[] weights, int cap) {
        int d = 1, current = 0;
        for (int w : weights) {
            if (current + w > cap) {
                d++;
                current = w;
            } else {
                current += w;
            }
        }
        return d;
    }
}""", "O(N log(sum - max))", "O(1)"
    ),

    "kth-missing-positive-number": make_sol(
        """public class Solution {
    public static int findKthPositive(int[] arr, int k) {
        for (int num : arr) {
            if (num <= k) k++;
            else break;
        }
        return k;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int findKthPositive(int[] arr, int k) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int missing = arr[mid] - (mid + 1);
            if (missing < k) low = mid + 1;
            else high = mid - 1;
        }
        return low + k;
    }
}""", "O(log N)", "O(1)"
    ),

    "painters-partition": make_sol(
        """import java.util.ArrayList;

public class Solution {
    public static int findLargestMinDistance(ArrayList<Integer> boards, int k) {
        int max = 0, sum = 0;
        for (int b : boards) { max = Math.max(max, b); sum += b; }
        for (int time = max; time <= sum; time++) {
            if (countPainters(boards, time) <= k) return time;
        }
        return sum;
    }

    private static int countPainters(ArrayList<Integer> boards, int time) {
        int painters = 1, current = 0;
        for (int b : boards) {
            if (current + b <= time) current += b;
            else { painters++; current = b; }
        }
        return painters;
    }
}""", "O((sum - max) * N)", "O(1)",
        """import java.util.ArrayList;

public class Solution {
    public static int findLargestMinDistance(ArrayList<Integer> boards, int k) {
        int low = 0, high = 0;
        for (int b : boards) { low = Math.max(low, b); high += b; }
        int ans = high;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (countPainters(boards, mid) <= k) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }

    private static int countPainters(ArrayList<Integer> boards, int time) {
        int painters = 1, current = 0;
        for (int b : boards) {
            if (current + b <= time) current += b;
            else { painters++; current = b; }
        }
        return painters;
    }
}""", "O(N log(sum - max))", "O(1)"
    ),

    "aggressive-cows": make_sol(
        """import java.util.Arrays;

public class Solution {
    public static int aggressiveCows(int[] stalls, int k) {
        Arrays.sort(stalls);
        int maxDist = stalls[stalls.length - 1] - stalls[0];
        for (int d = 1; d <= maxDist; d++) {
            if (!canPlace(stalls, d, k)) return d - 1;
        }
        return maxDist;
    }

    private static boolean canPlace(int[] stalls, int dist, int cows) {
        int count = 1, last = stalls[0];
        for (int i = 1; i < stalls.length; i++) {
            if (stalls[i] - last >= dist) {
                count++;
                last = stalls[i];
            }
            if (count >= cows) return true;
        }
        return false;
    }
}""", "O(N log N + (max - min) * N)", "O(1)",
        """import java.util.Arrays;

public class Solution {
    public static int aggressiveCows(int[] stalls, int k) {
        Arrays.sort(stalls);
        int low = 1, high = stalls[stalls.length - 1] - stalls[0];
        int ans = 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (canPlace(stalls, mid, k)) {
                ans = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return ans;
    }

    private static boolean canPlace(int[] stalls, int dist, int cows) {
        int count = 1, last = stalls[0];
        for (int i = 1; i < stalls.length; i++) {
            if (stalls[i] - last >= dist) {
                count++;
                last = stalls[i];
            }
            if (count >= cows) return true;
        }
        return false;
    }
}""", "O(N log N + N log(max - min))", "O(1)"
    ),

    "book-allocation-problem": make_sol(
        """import java.util.ArrayList;

public class Solution {
    public static int findPages(ArrayList<Integer> arr, int n, int m) {
        if (m > n) return -1;
        int max = 0, sum = 0;
        for (int x : arr) { max = Math.max(max, x); sum += x; }
        for (int pages = max; pages <= sum; pages++) {
            if (countStudents(arr, pages) <= m) return pages;
        }
        return -1;
    }

    private static int countStudents(ArrayList<Integer> arr, int pages) {
        int students = 1, current = 0;
        for (int x : arr) {
            if (current + x <= pages) current += x;
            else { students++; current = x; }
        }
        return students;
    }
}""", "O((sum - max) * N)", "O(1)",
        """import java.util.ArrayList;

public class Solution {
    public static int findPages(ArrayList<Integer> arr, int n, int m) {
        if (m > n) return -1;
        int low = 0, high = 0;
        for (int x : arr) { low = Math.max(low, x); high += x; }
        int ans = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (countStudents(arr, mid) <= m) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }

    private static int countStudents(ArrayList<Integer> arr, int pages) {
        int students = 1, current = 0;
        for (int x : arr) {
            if (current + x <= pages) current += x;
            else { students++; current = x; }
        }
        return students;
    }
}""", "O(N log(sum - max))", "O(1)"
    ),

    "find-peak-element": make_sol(
        """public class Solution {
    public static int findPeakElement(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            if ((i == 0 || nums[i] > nums[i - 1]) && (i == n - 1 || nums[i] > nums[i + 1])) {
                return i;
            }
        }
        return 0;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int findPeakElement(int[] nums) {
        int n = nums.length;
        if (n == 1) return 0;
        if (nums[0] > nums[1]) return 0;
        if (nums[n - 1] > nums[n - 2]) return n - 1;
        int low = 1, high = n - 2;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] > nums[mid - 1] && nums[mid] > nums[mid + 1]) return mid;
            if (nums[mid] > nums[mid - 1]) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}""", "O(log N)", "O(1)"
    ),

    "median-of-2-sorted-arrays": make_sol(
        """public class Solution {
    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int n1 = nums1.length, n2 = nums2.length;
        int[] arr = new int[n1 + n2];
        int i = 0, j = 0, k = 0;
        while (i < n1 && j < n2) {
            if (nums1[i] <= nums2[j]) arr[k++] = nums1[i++];
            else arr[k++] = nums2[j++];
        }
        while (i < n1) arr[k++] = nums1[i++];
        while (j < n2) arr[k++] = nums2[j++];
        int n = n1 + n2;
        if (n % 2 == 1) return arr[n / 2];
        return ((double) arr[n / 2] + arr[n / 2 - 1]) / 2.0;
    }
}""", "O(N1 + N2)", "O(N1 + N2)",
        """public class Solution {
    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int n1 = nums1.length, n2 = nums2.length;
        if (n1 > n2) return findMedianSortedArrays(nums2, nums1);
        int low = 0, high = n1, left = (n1 + n2 + 1) / 2;
        int n = n1 + n2;
        while (low <= high) {
            int mid1 = (low + high) / 2;
            int mid2 = left - mid1;
            int l1 = mid1 > 0 ? nums1[mid1 - 1] : Integer.MIN_VALUE;
            int l2 = mid2 > 0 ? nums2[mid2 - 1] : Integer.MIN_VALUE;
            int r1 = mid1 < n1 ? nums1[mid1] : Integer.MAX_VALUE;
            int r2 = mid2 < n2 ? nums2[mid2] : Integer.MAX_VALUE;

            if (l1 <= r2 && l2 <= r1) {
                if (n % 2 == 1) return Math.max(l1, l2);
                return ((double) Math.max(l1, l2) + Math.min(r1, r2)) / 2.0;
            } else if (l1 > r2) {
                high = mid1 - 1;
            } else {
                low = mid1 + 1;
            }
        }
        return 0.0;
    }
}""", "O(log(min(N1, N2)))", "O(1)"
    ),

    "kth-element-of-2-sorted-arrays": make_sol(
        """public class Solution {
    public static long kthElement(int[] arr1, int[] arr2, int n, int m, int k) {
        int i = 0, j = 0, count = 0;
        while (i < n && j < m) {
            if (arr1[i] <= arr2[j]) {
                if (++count == k) return arr1[i];
                i++;
            } else {
                if (++count == k) return arr2[j];
                j++;
            }
        }
        while (i < n) {
            if (++count == k) return arr1[i];
            i++;
        }
        while (j < m) {
            if (++count == k) return arr2[j];
            j++;
        }
        return -1;
    }
}""", "O(K)", "O(1)",
        """public class Solution {
    public static long kthElement(int[] arr1, int[] arr2, int n, int m, int k) {
        if (n > m) return kthElement(arr2, arr1, m, n, k);
        int low = Math.max(0, k - m), high = Math.min(k, n);
        while (low <= high) {
            int cut1 = (low + high) / 2;
            int cut2 = k - cut1;
            int l1 = cut1 == 0 ? Integer.MIN_VALUE : arr1[cut1 - 1];
            int l2 = cut2 == 0 ? Integer.MIN_VALUE : arr2[cut2 - 1];
            int r1 = cut1 == n ? Integer.MAX_VALUE : arr1[cut1];
            int r2 = cut2 == m ? Integer.MAX_VALUE : arr2[cut2];

            if (l1 <= r2 && l2 <= r1) {
                return Math.max(l1, l2);
            } else if (l1 > r2) {
                high = cut1 - 1;
            } else {
                low = cut1 + 1;
            }
        }
        return -1;
    }
}""", "O(log(min(N, M)))", "O(1)"
    ),

    "minimise-max-distance-to-gas-stations": make_sol(
        """public class Solution {
    public static double findSmallestMaxDist(int[] stations, int K) {
        int n = stations.length;
        int[] howMany = new int[n - 1];
        for (int gas = 1; gas <= K; gas++) {
            double maxSection = -1;
            int maxIdx = -1;
            for (int i = 0; i < n - 1; i++) {
                double diff = stations[i + 1] - stations[i];
                double sectionLen = diff / (double) (howMany[i] + 1);
                if (sectionLen > maxSection) {
                    maxSection = sectionLen;
                    maxIdx = i;
                }
            }
            howMany[maxIdx]++;
        }
        double maxAns = -1;
        for (int i = 0; i < n - 1; i++) {
            double diff = stations[i + 1] - stations[i];
            maxAns = Math.max(maxAns, diff / (double) (howMany[i] + 1));
        }
        return maxAns;
    }
}""", "O(K * N)", "O(N)",
        """public class Solution {
    public static double findSmallestMaxDist(int[] stations, int K) {
        int n = stations.length;
        double low = 0, high = 0;
        for (int i = 0; i < n - 1; i++) high = Math.max(high, stations[i + 1] - stations[i]);
        double diff = 1e-6;
        while (high - low > diff) {
            double mid = (low + high) / 2.0;
            if (countStations(stations, mid) <= K) high = mid;
            else low = mid;
        }
        return high;
    }

    private static int countStations(int[] stations, double dist) {
        int count = 0;
        for (int i = 1; i < stations.length; i++) {
            int numInBetween = (int) ((stations[i] - stations[i - 1]) / dist);
            if ((stations[i] - stations[i - 1]) == numInBetween * dist) numInBetween--;
            count += numInBetween;
        }
        return count;
    }
}""", "O(N log(dist / 10^-6))", "O(1)"
    ),

    "split-array---largest-sum": make_sol(
        """public class Solution {
    public static int splitArray(int[] nums, int k) {
        int low = 0, high = 0;
        for (int x : nums) { low = Math.max(low, x); high += x; }
        int ans = high;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (canSplit(nums, mid, k)) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }

    private static boolean canSplit(int[] nums, int maxSum, int k) {
        int pieces = 1, current = 0;
        for (int x : nums) {
            if (current + x <= maxSum) current += x;
            else { pieces++; current = x; }
        }
        return pieces <= k;
    }
}""", "O(N log(sum - max))", "O(1)",
        """public class Solution {
    public static int splitArray(int[] nums, int k) {
        int low = 0, high = 0;
        for (int x : nums) { low = Math.max(low, x); high += x; }
        int ans = high;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (canSplit(nums, mid, k)) {
                ans = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return ans;
    }

    private static boolean canSplit(int[] nums, int maxSum, int k) {
        int pieces = 1, current = 0;
        for (int x : nums) {
            if (current + x <= maxSum) current += x;
            else { pieces++; current = x; }
        }
        return pieces <= k;
    }
}""", "O(N log(sum - max))", "O(1)"
    ),

    "find-row-with-maximum-1's": make_sol(
        """public class Solution {
    public static int rowWithMax1s(int[][] arr, int n, int m) {
        int maxCount = 0, maxRow = -1;
        for (int i = 0; i < n; i++) {
            int count = 0;
            for (int j = 0; j < m; j++) {
                if (arr[i][j] == 1) count++;
            }
            if (count > maxCount) {
                maxCount = count;
                maxRow = i;
            }
        }
        return maxRow;
    }
}""", "O(N * M)", "O(1)",
        """public class Solution {
    public static int rowWithMax1s(int[][] arr, int n, int m) {
        int maxCount = 0, maxRow = -1;
        for (int i = 0; i < n; i++) {
            int first1 = lowerBound(arr[i], m, 1);
            int count = m - first1;
            if (count > maxCount) {
                maxCount = count;
                maxRow = i;
            }
        }
        return maxRow;
    }

    private static int lowerBound(int[] row, int m, int target) {
        int low = 0, high = m - 1, ans = m;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (row[mid] >= target) { ans = mid; high = mid - 1; }
            else low = mid + 1;
        }
        return ans;
    }
}""", "O(N log M)", "O(1)"
    ),

    "search-in-a-2d-matrix": make_sol(
        """public class Solution {
    public static boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == target) return true;
            }
        }
        return false;
    }
}""", "O(M * N)", "O(1)",
        """public class Solution {
    public static boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        int low = 0, high = m * n - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            int r = mid / n, c = mid % n;
            if (matrix[r][c] == target) return true;
            else if (matrix[r][c] < target) low = mid + 1;
            else high = mid - 1;
        }
        return false;
    }
}""", "O(log(M * N))", "O(1)"
    ),

    "search-in-2d-matrix-ii": make_sol(
        """public class Solution {
    public static boolean searchMatrix(int[][] matrix, int target) {
        for (int[] row : matrix) {
            for (int val : row) {
                if (val == target) return true;
            }
        }
        return false;
    }
}""", "O(M * N)", "O(1)",
        """public class Solution {
    public static boolean searchMatrix(int[][] matrix, int target) {
        int row = 0, col = matrix[0].length - 1;
        while (row < matrix.length && col >= 0) {
            if (matrix[row][col] == target) return true;
            else if (matrix[row][col] > target) col--;
            else row++;
        }
        return false;
    }
}""", "O(M + N)", "O(1)"
    ),

    "find-peak-element-ii": make_sol(
        """public class Solution {
    public static int[] findPeakGrid(int[][] mat) {
        int max = Integer.MIN_VALUE, maxR = 0, maxC = 0;
        for (int i = 0; i < mat.length; i++) {
            for (int j = 0; j < mat[0].length; j++) {
                if (mat[i][j] > max) {
                    max = mat[i][j];
                    maxR = i;
                    maxC = j;
                }
            }
        }
        return new int[]{maxR, maxC};
    }
}""", "O(M * N)", "O(1)",
        """public class Solution {
    public static int[] findPeakGrid(int[][] mat) {
        int low = 0, high = mat[0].length - 1;
        while (low <= high) {
            int midCol = low + (high - low) / 2;
            int maxRow = 0;
            for (int i = 0; i < mat.length; i++) {
                if (mat[i][midCol] > mat[maxRow][midCol]) maxRow = i;
            }
            int left = midCol > 0 ? mat[maxRow][midCol - 1] : -1;
            int right = midCol < mat[0].length - 1 ? mat[maxRow][midCol + 1] : -1;
            if (mat[maxRow][midCol] > left && mat[maxRow][midCol] > right) {
                return new int[]{maxRow, midCol};
            } else if (left > mat[maxRow][midCol]) {
                high = midCol - 1;
            } else {
                low = midCol + 1;
            }
        }
        return new int[]{-1, -1};
    }
}""", "O(M log N)", "O(1)"
    ),

    "matrix-median": make_sol(
        """import java.util.*;

public class Solution {
    public static int findMedian(int[][] matrix) {
        List<Integer> list = new ArrayList<>();
        for (int[] row : matrix) {
            for (int val : row) list.add(val);
        }
        Collections.sort(list);
        return list.get(list.size() / 2);
    }
}""", "O(M * N log(M * N))", "O(M * N)",
        """public class Solution {
    public static int findMedian(int[][] matrix) {
        int low = Integer.MAX_VALUE, high = Integer.MIN_VALUE;
        int R = matrix.length, C = matrix[0].length;
        for (int i = 0; i < R; i++) {
            low = Math.min(low, matrix[i][0]);
            high = Math.max(high, matrix[i][C - 1]);
        }
        int desired = (R * C + 1) / 2;
        while (low < high) {
            int mid = low + (high - low) / 2;
            int count = 0;
            for (int i = 0; i < R; i++) {
                count += upperBound(matrix[i], mid);
            }
            if (count < desired) low = mid + 1;
            else high = mid;
        }
        return low;
    }

    private static int upperBound(int[] row, int target) {
        int l = 0, r = row.length;
        while (l < r) {
            int m = (l + r) / 2;
            if (row[m] <= target) l = m + 1;
            else r = m;
        }
        return l;
    }
}""", "O(32 * R log C)", "O(1)"
    )
}
