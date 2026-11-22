from .common import make_sol

HASHING_SOLUTIONS = {
    "basic-hashing": make_sol(
        """import java.util.HashMap;

public class Solution {
    public static void frequencyCount(int[] arr) {
        // Brute force: count frequency using nested loops
        int n = arr.length;
        boolean[] visited = new boolean[n];
        for (int i = 0; i < n; i++) {
            if (visited[i]) continue;
            int count = 1;
            for (int j = i + 1; j < n; j++) {
                if (arr[i] == arr[j]) {
                    visited[j] = true;
                    count++;
                }
            }
            System.out.println(arr[i] + " occurs " + count + " times");
        }
    }
}""", "O(N²)", "O(N)",
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static void frequencyCount(int[] arr) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : arr) {
            map.put(num, map.getOrDefault(num, 0) + 1);
        }
        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + " occurs " + entry.getValue() + " times");
        }
    }
}""", "O(N)", "O(N)"
    ),

    "longest-consecutive-sequence-in-an-array": make_sol(
        """import java.util.Arrays;

public class Solution {
    public static int longestConsecutive(int[] nums) {
        if (nums.length == 0) return 0;
        Arrays.sort(nums);
        int longest = 1, current = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] == nums[i - 1]) continue;
            if (nums[i] == nums[i - 1] + 1) {
                current++;
            } else {
                longest = Math.max(longest, current);
                current = 1;
            }
        }
        return Math.max(longest, current);
    }
}""", "O(N log N)", "O(1)",
        """import java.util.HashSet;
import java.util.Set;

public class Solution {
    public static int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int num : nums) set.add(num);
        int longest = 0;
        for (int num : set) {
            if (!set.contains(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;
                while (set.contains(currentNum + 1)) {
                    currentNum++;
                    currentStreak++;
                }
                longest = Math.max(longest, currentStreak);
            }
        }
        return longest;
    }
}""", "O(N)", "O(N)"
    ),

    "longest-subarray-with-sum-k": make_sol(
        """public class Solution {
    public static int longestSubarray(int[] nums, int k) {
        int maxLen = 0;
        for (int i = 0; i < nums.length; i++) {
            int sum = 0;
            for (int j = i; j < nums.length; j++) {
                sum += nums[j];
                if (sum == k) {
                    maxLen = Math.max(maxLen, j - i + 1);
                }
            }
        }
        return maxLen;
    }
}""", "O(N²)", "O(1)",
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int longestSubarray(int[] nums, int k) {
        Map<Long, Integer> map = new HashMap<>();
        long sum = 0;
        int maxLen = 0;
        for (int i = 0; i < nums.length; i++) {
            sum += nums[i];
            if (sum == k) {
                maxLen = i + 1;
            }
            long rem = sum - k;
            if (map.containsKey(rem)) {
                maxLen = Math.max(maxLen, i - map.get(rem));
            }
            if (!map.containsKey(sum)) {
                map.put(sum, i);
            }
        }
        return maxLen;
    }
}""", "O(N)", "O(N)"
    ),

    "largest-subarray-with-sum-0": make_sol(
        """public class Solution {
    public static int maxLen(int[] arr, int n) {
        int max = 0;
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                sum += arr[j];
                if (sum == 0) {
                    max = Math.max(max, j - i + 1);
                }
            }
        }
        return max;
    }
}""", "O(N²)", "O(1)",
        """import java.util.HashMap;

public class Solution {
    public static int maxLen(int[] arr, int n) {
        HashMap<Integer, Integer> map = new HashMap<>();
        int max = 0, sum = 0;
        for (int i = 0; i < n; i++) {
            sum += arr[i];
            if (sum == 0) {
                max = i + 1;
            } else if (map.containsKey(sum)) {
                max = Math.max(max, i - map.get(sum));
            } else {
                map.put(sum, i);
            }
        }
        return max;
    }
}""", "O(N)", "O(N)"
    ),

    "count-subarrays-with-given-sum": make_sol(
        """public class Solution {
    public static int subarraySum(int[] nums, int k) {
        int count = 0;
        for (int i = 0; i < nums.length; i++) {
            int sum = 0;
            for (int j = i; j < nums.length; j++) {
                sum += nums[j];
                if (sum == k) count++;
            }
        }
        return count;
    }
}""", "O(N²)", "O(1)",
        """import java.util.HashMap;

public class Solution {
    public static int subarraySum(int[] nums, int k) {
        HashMap<Integer, Integer> map = new HashMap<>();
        map.put(0, 1);
        int count = 0, sum = 0;
        for (int num : nums) {
            sum += num;
            if (map.containsKey(sum - k)) {
                count += map.get(sum - k);
            }
            map.put(sum, map.getOrDefault(sum, 0) + 1);
        }
        return count;
    }
}""", "O(N)", "O(N)"
    ),

    "count-subarrays-with-given-xor-k": make_sol(
        """public class Solution {
    public static int solve(int[] A, int B) {
        int count = 0;
        for (int i = 0; i < A.length; i++) {
            int xor = 0;
            for (int j = i; j < A.length; j++) {
                xor ^= A[j];
                if (xor == B) count++;
            }
        }
        return count;
    }
}""", "O(N²)", "O(1)",
        """import java.util.HashMap;

public class Solution {
    public static int solve(int[] A, int B) {
        HashMap<Integer, Integer> map = new HashMap<>();
        int xr = 0, count = 0;
        map.put(0, 1);
        for (int x : A) {
            xr ^= x;
            int target = xr ^ B;
            if (map.containsKey(target)) {
                count += map.get(target);
            }
            map.put(xr, map.getOrDefault(xr, 0) + 1);
        }
        return count;
    }
}""", "O(N)", "O(N)"
    )
}
