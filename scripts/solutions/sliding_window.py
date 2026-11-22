from .common import make_sol

SLIDING_WINDOW_SOLUTIONS = {
    "theory": make_sol(
        """public class Solution {
    public static int fixedWindowSum(int[] nums, int k) {
        // Standard sliding window demonstration
        int sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        int maxSum = sum;
        for (int i = k; i < nums.length; i++) {
            sum += nums[i] - nums[i - k];
            maxSum = Math.max(maxSum, sum);
        }
        return maxSum;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int fixedWindowSum(int[] nums, int k) {
        int sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        int maxSum = sum;
        for (int i = k; i < nums.length; i++) {
            sum += nums[i] - nums[i - k];
            maxSum = Math.max(maxSum, sum);
        }
        return maxSum;
    }
}""", "O(N)", "O(1)"
    ),

    "maximum-points-you-can-obtain-from-cards-": make_sol(
        """public class Solution {
    public static int maxScore(int[] cardPoints, int k) {
        int lSum = 0, rSum = 0, maxSum = 0;
        for (int i = 0; i < k; i++) lSum += cardPoints[i];
        maxSum = lSum;
        int rightIndex = cardPoints.length - 1;
        for (int i = k - 1; i >= 0; i--) {
            lSum -= cardPoints[i];
            rSum += cardPoints[rightIndex--];
            maxSum = Math.max(maxSum, lSum + rSum);
        }
        return maxSum;
    }
}""", "O(2K)", "O(1)",
        """public class Solution {
    public static int maxScore(int[] cardPoints, int k) {
        int lSum = 0, rSum = 0, maxSum = 0;
        for (int i = 0; i < k; i++) lSum += cardPoints[i];
        maxSum = lSum;
        int rightIndex = cardPoints.length - 1;
        for (int i = k - 1; i >= 0; i--) {
            lSum -= cardPoints[i];
            rSum += cardPoints[rightIndex--];
            maxSum = Math.max(maxSum, lSum + rSum);
        }
        return maxSum;
    }
}""", "O(2K)", "O(1)"
    ),

    "longest-substring-without-repeating-characters": make_sol(
        """import java.util.HashSet;
import java.util.Set;

public class Solution {
    public static int lengthOfLongestSubstring(String s) {
        int max = 0;
        for (int i = 0; i < s.length(); i++) {
            Set<Character> set = new HashSet<>();
            for (int j = i; j < s.length(); j++) {
                if (set.contains(s.charAt(j))) break;
                set.add(s.charAt(j));
                max = Math.max(max, j - i + 1);
            }
        }
        return max;
    }
}""", "O(N²)", "O(N)",
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, max = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c)) {
                left = Math.max(left, map.get(c) + 1);
            }
            map.put(c, right);
            max = Math.max(max, right - left + 1);
        }
        return max;
    }
}""", "O(N)", "O(min(N, 256))"
    ),

    "max-consecutive-ones-iii": make_sol(
        """public class Solution {
    public static int longestOnes(int[] nums, int k) {
        int max = 0;
        for (int i = 0; i < nums.length; i++) {
            int zeros = 0;
            for (int j = i; j < nums.length; j++) {
                if (nums[j] == 0) zeros++;
                if (zeros <= k) max = Math.max(max, j - i + 1);
                else break;
            }
        }
        return max;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int longestOnes(int[] nums, int k) {
        int left = 0, zeros = 0, max = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) zeros++;
            while (zeros > k) {
                if (nums[left] == 0) zeros--;
                left++;
            }
            max = Math.max(max, right - left + 1);
        }
        return max;
    }
}""", "O(N)", "O(1)"
    ),

    "fruit-into-baskets": make_sol(
        """import java.util.HashSet;
import java.util.Set;

public class Solution {
    public static int totalFruits(int[] fruits) {
        int max = 0;
        for (int i = 0; i < fruits.length; i++) {
            Set<Integer> set = new HashSet<>();
            for (int j = i; j < fruits.length; j++) {
                set.add(fruits[j]);
                if (set.size() <= 2) max = Math.max(max, j - i + 1);
                else break;
            }
        }
        return max;
    }
}""", "O(N²)", "O(1)",
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int totalFruits(int[] fruits) {
        Map<Integer, Integer> map = new HashMap<>();
        int left = 0, max = 0;
        for (int right = 0; right < fruits.length; right++) {
            map.put(fruits[right], map.getOrDefault(fruits[right], 0) + 1);
            while (map.size() > 2) {
                map.put(fruits[left], map.get(fruits[left]) - 1);
                if (map.get(fruits[left]) == 0) map.remove(fruits[left]);
                left++;
            }
            max = Math.max(max, right - left + 1);
        }
        return max;
    }
}""", "O(N)", "O(1)"
    ),

    "longest-substring-with-at-most-k-distinct-characters": make_sol(
        """import java.util.HashSet;
import java.util.Set;

public class Solution {
    public static int kDistinctChars(int k, String s) {
        int max = 0;
        for (int i = 0; i < s.length(); i++) {
            Set<Character> set = new HashSet<>();
            for (int j = i; j < s.length(); j++) {
                set.add(s.charAt(j));
                if (set.size() <= k) max = Math.max(max, j - i + 1);
                else break;
            }
        }
        return max;
    }
}""", "O(N²)", "O(K)",
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int kDistinctChars(int k, String s) {
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, max = 0;
        for (int right = 0; right < s.length(); right++) {
            map.put(s.charAt(right), map.getOrDefault(s.charAt(right), 0) + 1);
            while (map.size() > k) {
                map.put(s.charAt(left), map.get(s.charAt(left)) - 1);
                if (map.get(s.charAt(left)) == 0) map.remove(s.charAt(left));
                left++;
            }
            max = Math.max(max, right - left + 1);
        }
        return max;
    }
}""", "O(N)", "O(K)"
    ),

    "longest-repeating-character-replacement": make_sol(
        """public class Solution {
    public static int characterReplacement(String s, int k) {
        int max = 0;
        for (int i = 0; i < s.length(); i++) {
            int[] count = new int[26];
            int maxFreq = 0;
            for (int j = i; j < s.length(); j++) {
                count[s.charAt(j) - 'A']++;
                maxFreq = Math.max(maxFreq, count[s.charAt(j) - 'A']);
                int changes = (j - i + 1) - maxFreq;
                if (changes <= k) max = Math.max(max, j - i + 1);
                else break;
            }
        }
        return max;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0, maxFreq = 0, max = 0;
        for (int right = 0; right < s.length(); right++) {
            count[s.charAt(right) - 'A']++;
            maxFreq = Math.max(maxFreq, count[s.charAt(right) - 'A']);
            if ((right - left + 1) - maxFreq > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }
            max = Math.max(max, right - left + 1);
        }
        return max;
    }
}""", "O(N)", "O(1)"
    ),

    "minimum-window-substring-": make_sol(
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static String minWindow(String s, String t) {
        if (s.length() < t.length()) return "";
        Map<Character, Integer> tMap = new HashMap<>();
        for (char c : t.toCharArray()) tMap.put(c, tMap.getOrDefault(c, 0) + 1);

        String minStr = "";
        int minLen = Integer.MAX_VALUE;
        for (int i = 0; i < s.length(); i++) {
            Map<Character, Integer> sMap = new HashMap<>();
            for (int j = i; j < s.length(); j++) {
                sMap.put(s.charAt(j), sMap.getOrDefault(s.charAt(j), 0) + 1);
                boolean containsAll = true;
                for (char key : tMap.keySet()) {
                    if (sMap.getOrDefault(key, 0) < tMap.get(key)) {
                        containsAll = false;
                        break;
                    }
                }
                if (containsAll && (j - i + 1) < minLen) {
                    minLen = j - i + 1;
                    minStr = s.substring(i, j + 1);
                    break;
                }
            }
        }
        return minStr;
    }
}""", "O(N²)", "O(N + M)",
        """public class Solution {
    public static String minWindow(String s, String t) {
        int[] map = new int[128];
        for (char c : t.toCharArray()) map[c]++;
        int count = t.length(), left = 0, minLen = Integer.MAX_VALUE, start = 0;
        for (int right = 0; right < s.length(); right++) {
            if (map[s.charAt(right)]-- > 0) count--;
            while (count == 0) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    start = left;
                }
                if (++map[s.charAt(left++)] > 0) count++;
            }
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(start, start + minLen);
    }
}""", "O(N)", "O(1)"
    ),

    "minimum-window-subsequence": make_sol(
        """public class Solution {
    public static String minWindow(String s1, String s2) {
        String ans = "";
        int minLen = Integer.MAX_VALUE;
        int m = s1.length(), n = s2.length();
        int j = 0;
        for (int i = 0; i < m; i++) {
            if (s1.charAt(i) == s2.charAt(j)) {
                j++;
                if (j == n) {
                    int end = i + 1;
                    j--;
                    while (j >= 0) {
                        if (s1.charAt(i) == s2.charAt(j)) j--;
                        i--;
                    }
                    i++;
                    j++;
                    if (end - i < minLen) {
                        minLen = end - i;
                        ans = s1.substring(i, end);
                    }
                }
            }
        }
        return ans;
    }
}""", "O(M * N)", "O(1)",
        """public class Solution {
    public static String minWindow(String s1, String s2) {
        String ans = "";
        int minLen = Integer.MAX_VALUE;
        int m = s1.length(), n = s2.length();
        int j = 0;
        for (int i = 0; i < m; i++) {
            if (s1.charAt(i) == s2.charAt(j)) {
                j++;
                if (j == n) {
                    int end = i + 1;
                    j--;
                    while (j >= 0) {
                        if (s1.charAt(i) == s2.charAt(j)) j--;
                        i--;
                    }
                    i++;
                    j++;
                    if (end - i < minLen) {
                        minLen = end - i;
                        ans = s1.substring(i, end);
                    }
                }
            }
        }
        return ans;
    }
}""", "O(M * N)", "O(1)"
    ),

    "number-of-substrings-containing-all-three-characters": make_sol(
        """public class Solution {
    public static int numberOfSubstrings(String s) {
        int count = 0;
        int n = s.length();
        for (int i = 0; i < n; i++) {
            int[] seen = new int[3];
            for (int j = i; j < n; j++) {
                seen[s.charAt(j) - 'a'] = 1;
                if (seen[0] + seen[1] + seen[2] == 3) {
                    count += (n - j);
                    break;
                }
            }
        }
        return count;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int numberOfSubstrings(String s) {
        int[] lastSeen = {-1, -1, -1};
        int count = 0;
        for (int i = 0; i < s.length(); i++) {
            lastSeen[s.charAt(i) - 'a'] = i;
            if (lastSeen[0] != -1 && lastSeen[1] != -1 && lastSeen[2] != -1) {
                count += 1 + Math.min(lastSeen[0], Math.min(lastSeen[1], lastSeen[2]));
            }
        }
        return count;
    }
}""", "O(N)", "O(1)"
    ),

    "binary-subarrays-with-sum": make_sol(
        """public class Solution {
    public static int numSubarraysWithSum(int[] nums, int goal) {
        int count = 0;
        for (int i = 0; i < nums.length; i++) {
            int sum = 0;
            for (int j = i; j < nums.length; j++) {
                sum += nums[j];
                if (sum == goal) count++;
                else if (sum > goal) break;
            }
        }
        return count;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int numSubarraysWithSum(int[] nums, int goal) {
        return atMost(nums, goal) - atMost(nums, goal - 1);
    }

    private static int atMost(int[] nums, int goal) {
        if (goal < 0) return 0;
        int left = 0, sum = 0, count = 0;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum > goal) {
                sum -= nums[left++];
            }
            count += (right - left + 1);
        }
        return count;
    }
}""", "O(N)", "O(1)"
    ),

    "count-number-of-nice-subarrays": make_sol(
        """public class Solution {
    public static int numberOfSubarrays(int[] nums, int k) {
        int count = 0;
        for (int i = 0; i < nums.length; i++) {
            int odds = 0;
            for (int j = i; j < nums.length; j++) {
                if (nums[j] % 2 != 0) odds++;
                if (odds == k) count++;
                else if (odds > k) break;
            }
        }
        return count;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int numberOfSubarrays(int[] nums, int k) {
        return atMost(nums, k) - atMost(nums, k - 1);
    }

    private static int atMost(int[] nums, int k) {
        if (k < 0) return 0;
        int left = 0, count = 0, odds = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] % 2 != 0) odds++;
            while (odds > k) {
                if (nums[left++] % 2 != 0) odds--;
            }
            count += (right - left + 1);
        }
        return count;
    }
}""", "O(N)", "O(1)"
    ),

    "subarrays-with-k-different-integers": make_sol(
        """import java.util.HashSet;
import java.util.Set;

public class Solution {
    public static int subarraysWithKDistinct(int[] nums, int k) {
        int count = 0;
        for (int i = 0; i < nums.length; i++) {
            Set<Integer> set = new HashSet<>();
            for (int j = i; j < nums.length; j++) {
                set.add(nums[j]);
                if (set.size() == k) count++;
                else if (set.size() > k) break;
            }
        }
        return count;
    }
}""", "O(N²)", "O(K)",
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int subarraysWithKDistinct(int[] nums, int k) {
        return atMost(nums, k) - atMost(nums, k - 1);
    }

    private static int atMost(int[] nums, int k) {
        if (k <= 0) return 0;
        Map<Integer, Integer> map = new HashMap<>();
        int left = 0, count = 0;
        for (int right = 0; right < nums.length; right++) {
            map.put(nums[right], map.getOrDefault(nums[right], 0) + 1);
            while (map.size() > k) {
                map.put(nums[left], map.get(nums[left]) - 1);
                if (map.get(nums[left]) == 0) map.remove(nums[left]);
                left++;
            }
            count += (right - left + 1);
        }
        return count;
    }
}""", "O(N)", "O(K)"
    )
}
