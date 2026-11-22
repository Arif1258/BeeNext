from .common import make_sol

STRINGS_SOLUTIONS = {
    # Basic & Medium Strings
    "remove-outermost-parentheses": make_sol(
        """import java.util.Stack;

public class Solution {
    public static String removeOuterParentheses(String s) {
        StringBuilder sb = new StringBuilder();
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') {
                if (!stack.isEmpty()) sb.append(c);
                stack.push(c);
            } else {
                stack.pop();
                if (!stack.isEmpty()) sb.append(c);
            }
        }
        return sb.toString();
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static String removeOuterParentheses(String s) {
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (char c : s.toCharArray()) {
            if (c == '(' && count++ > 0) sb.append(c);
            if (c == ')' && --count > 0) sb.append(c);
        }
        return sb.toString();
    }
}""", "O(N)", "O(N)"
    ),

    "maximum-nesting-depth-of-the-parentheses": make_sol(
        """import java.util.Stack;

public class Solution {
    public static int maxDepth(String s) {
        int max = 0;
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') {
                stack.push(c);
                max = Math.max(max, stack.size());
            } else if (c == ')') {
                if (!stack.isEmpty()) stack.pop();
            }
        }
        return max;
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static int maxDepth(String s) {
        int max = 0, current = 0;
        for (char c : s.toCharArray()) {
            if (c == '(') {
                current++;
                max = Math.max(max, current);
            } else if (c == ')') {
                current--;
            }
        }
        return max;
    }
}""", "O(N)", "O(1)"
    ),

    "roman-to-integer": make_sol(
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int romanToInt(String s) {
        Map<Character, Integer> map = new HashMap<>();
        map.put('I', 1); map.put('V', 5); map.put('X', 10);
        map.put('L', 50); map.put('C', 100); map.put('D', 500); map.put('M', 100);
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            int current = map.get(s.charAt(i));
            if (i + 1 < s.length() && current < map.get(s.charAt(i + 1))) {
                total -= current;
            } else {
                total += current;
            }
        }
        return total;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int romanToInt(String s) {
        int total = 0, prev = 0;
        for (int i = s.length() - 1; i >= 0; i--) {
            int curr = switch (s.charAt(i)) {
                case 'I' -> 1;
                case 'V' -> 5;
                case 'X' -> 10;
                case 'L' -> 50;
                case 'C' -> 100;
                case 'D' -> 500;
                case 'M' -> 1000;
                default -> 0;
            };
            if (curr < prev) total -= curr;
            else total += curr;
            prev = curr;
        }
        return total;
    }
}""", "O(N)", "O(1)"
    ),

    "string-to-integer-atoi": make_sol(
        """public class Solution {
    public static int myAtoi(String s) {
        s = s.trim();
        if (s.isEmpty()) return 0;
        int sign = 1, i = 0;
        if (s.charAt(0) == '-') { sign = -1; i++; }
        else if (s.charAt(0) == '+') { i++; }
        long num = 0;
        while (i < s.length() && Character.isDigit(s.charAt(i))) {
            num = num * 10 + (s.charAt(i) - '0');
            if (sign == 1 && num > Integer.MAX_VALUE) return Integer.MAX_VALUE;
            if (sign == -1 && -num < Integer.MIN_VALUE) return Integer.MIN_VALUE;
            i++;
        }
        return (int) (sign * num);
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int myAtoi(String s) {
        int i = 0, n = s.length();
        while (i < n && s.charAt(i) == ' ') i++;
        if (i == n) return 0;
        int sign = 1;
        if (s.charAt(i) == '+' || s.charAt(i) == '-') {
            sign = (s.charAt(i) == '-') ? -1 : 1;
            i++;
        }
        int num = 0;
        while (i < n && Character.isDigit(s.charAt(i))) {
            int digit = s.charAt(i) - '0';
            if (num > (Integer.MAX_VALUE - digit) / 10) {
                return sign == 1 ? Integer.MAX_VALUE : Integer.MIN_VALUE;
            }
            num = num * 10 + digit;
            i++;
        }
        return sign * num;
    }
}""", "O(N)", "O(1)"
    ),

    "count-number-of-substring": make_sol(
        """import java.util.HashSet;
import java.util.Set;

public class Solution {
    public static long substrCount(String s, int k) {
        long count = 0;
        int n = s.length();
        for (int i = 0; i < n; i++) {
            Set<Character> distinct = new HashSet<>();
            for (int j = i; j < n; j++) {
                distinct.add(s.charAt(j));
                if (distinct.size() == k) count++;
                else if (distinct.size() > k) break;
            }
        }
        return count;
    }
}""", "O(N²)", "O(K)",
        """public class Solution {
    public static long substrCount(String s, int k) {
        return atMostK(s, k) - atMostK(s, k - 1);
    }

    private static long atMostK(String s, int k) {
        if (k < 0) return 0;
        int[] freq = new int[26];
        long count = 0;
        int left = 0, distinct = 0;
        for (int right = 0; right < s.length(); right++) {
            if (freq[s.charAt(right) - 'a']++ == 0) distinct++;
            while (distinct > k) {
                if (--freq[s.charAt(left) - 'a'] == 0) distinct--;
                left++;
            }
            count += (right - left + 1);
        }
        return count;
    }
}""", "O(N)", "O(1)"
    ),

    "longest-palindromic-substring": make_sol(
        """public class Solution {
    public static String longestPalindrome(String s) {
        String longest = "";
        for (int i = 0; i < s.length(); i++) {
            for (int j = i; j < s.length(); j++) {
                if (isPalindrome(s, i, j) && (j - i + 1) > longest.length()) {
                    longest = s.substring(i, j + 1);
                }
            }
        }
        return longest;
    }

    private static boolean isPalindrome(String s, int i, int j) {
        while (i < j) {
            if (s.charAt(i++) != s.charAt(j--)) return false;
        }
        return true;
    }
}""", "O(N³)", "O(1)",
        """public class Solution {
    public static String longestPalindrome(String s) {
        if (s == null || s.length() < 1) return "";
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            int len1 = expandAroundCenter(s, i, i);
            int len2 = expandAroundCenter(s, i, i + 1);
            int len = Math.max(len1, len2);
            if (len > end - start) {
                start = i - (len - 1) / 2;
                end = i + len / 2;
            }
        }
        return s.substring(start, end + 1);
    }

    private static int expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        return right - left - 1;
    }
}""", "O(N²)", "O(1)"
    ),

    "sum-of-beauty-of-all-substrings": make_sol(
        """public class Solution {
    public static int beautySum(String s) {
        int sum = 0;
        int n = s.length();
        for (int i = 0; i < n; i++) {
            int[] freq = new int[26];
            for (int j = i; j < n; j++) {
                freq[s.charAt(j) - 'a']++;
                int max = 0, min = Integer.MAX_VALUE;
                for (int f : freq) {
                    if (f > 0) {
                        max = Math.max(max, f);
                        min = Math.min(min, f);
                    }
                }
                sum += (max - min);
            }
        }
        return sum;
    }
}""", "O(26 * N²)", "O(1)",
        """public class Solution {
    public static int beautySum(String s) {
        int sum = 0;
        int n = s.length();
        for (int i = 0; i < n; i++) {
            int[] freq = new int[26];
            for (int j = i; j < n; j++) {
                freq[s.charAt(j) - 'a']++;
                int max = 0, min = Integer.MAX_VALUE;
                for (int f : freq) {
                    if (f > 0) {
                        max = Math.max(max, f);
                        min = Math.min(min, f);
                    }
                }
                sum += (max - min);
            }
        }
        return sum;
    }
}""", "O(26 * N²)", "O(1)"
    ),

    # Advanced Strings
    "reverse-every-word-in-a-string": make_sol(
        """public class Solution {
    public static String reverseWords(String s) {
        String[] words = s.trim().split("\\\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) sb.append(" ");
        }
        return sb.toString();
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static String reverseWords(String s) {
        StringBuilder sb = new StringBuilder();
        int n = s.length(), i = n - 1;
        while (i >= 0) {
            while (i >= 0 && s.charAt(i) == ' ') i--;
            if (i < 0) break;
            int j = i;
            while (i >= 0 && s.charAt(i) != ' ') i--;
            if (sb.length() > 0) sb.append(" ");
            sb.append(s, i + 1, j + 1);
        }
        return sb.toString();
    }
}""", "O(N)", "O(N)"
    ),

    "minimum-number-of-bracket-reversals-to-make-an-expression-balanced": make_sol(
        """import java.util.Stack;

public class Solution {
    public static int countRev(String s) {
        if (s.length() % 2 != 0) return -1;
        Stack<Character> st = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '{') st.push(c);
            else {
                if (!st.isEmpty() && st.peek() == '{') st.pop();
                else st.push(c);
            }
        }
        int open = 0, close = 0;
        while (!st.isEmpty()) {
            if (st.pop() == '{') open++;
            else close++;
        }
        return (open + 1) / 2 + (close + 1) / 2;
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static int countRev(String s) {
        if (s.length() % 2 != 0) return -1;
        int open = 0, close = 0;
        for (char c : s.toCharArray()) {
            if (c == '{') {
                open++;
            } else {
                if (open > 0) open--;
                else close++;
            }
        }
        return (open + 1) / 2 + (close + 1) / 2;
    }
}""", "O(N)", "O(1)"
    ),

    "count-and-say": make_sol(
        """public class Solution {
    public static String countAndSay(int n) {
        if (n == 1) return "1";
        String s = "1";
        for (int i = 2; i <= n; i++) {
            StringBuilder sb = new StringBuilder();
            int count = 1;
            for (int j = 1; j < s.length(); j++) {
                if (s.charAt(j) == s.charAt(j - 1)) {
                    count++;
                } else {
                    sb.append(count).append(s.charAt(j - 1));
                    count = 1;
                }
            }
            sb.append(count).append(s.charAt(s.length() - 1));
            s = sb.toString();
        }
        return s;
    }
}""", "O(N * 2^N)", "O(2^N)",
        """public class Solution {
    public static String countAndSay(int n) {
        if (n == 1) return "1";
        String s = "1";
        for (int i = 2; i <= n; i++) {
            StringBuilder sb = new StringBuilder();
            int count = 1;
            for (int j = 1; j < s.length(); j++) {
                if (s.charAt(j) == s.charAt(j - 1)) {
                    count++;
                } else {
                    sb.append(count).append(s.charAt(j - 1));
                    count = 1;
                }
            }
            sb.append(count).append(s.charAt(s.length() - 1));
            s = sb.toString();
        }
        return s;
    }
}""", "O(N * 2^N)", "O(2^N)"
    ),

    "hashing-in-strings-theory": make_sol(
        """public class Solution {
    public static long computeHash(String s) {
        // Polynomial rolling hash baseline
        long hash = 0, p = 31, m = 1_000_000_007L;
        long p_pow = 1;
        for (char c : s.toCharArray()) {
            hash = (hash + (c - 'a' + 1) * p_pow) % m;
            p_pow = (p_pow * p) % m;
        }
        return hash;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static long computeHash(String s) {
        long hash = 0, p = 31, m = 1_000_000_007L;
        long p_pow = 1;
        for (char c : s.toCharArray()) {
            hash = (hash + (c - 'a' + 1) * p_pow) % m;
            p_pow = (p_pow * p) % m;
        }
        return hash;
    }
}""", "O(N)", "O(1)"
    ),

    "rabin-karp-algorithm": make_sol(
        """import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<Integer> search(String pat, String txt) {
        List<Integer> res = new ArrayList<>();
        int m = pat.length(), n = txt.length();
        for (int i = 0; i <= n - m; i++) {
            if (txt.substring(i, i + m).equals(pat)) {
                res.add(i);
            }
        }
        return res;
    }
}""", "O(N * M)", "O(1)",
        """import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<Integer> search(String pat, String txt) {
        List<Integer> res = new ArrayList<>();
        int d = 256, q = 101;
        int m = pat.length(), n = txt.length();
        int p = 0, t = 0, h = 1;
        for (int i = 0; i < m - 1; i++) h = (h * d) % q;
        for (int i = 0; i < m; i++) {
            p = (d * p + pat.charAt(i)) % q;
            t = (d * t + txt.charAt(i)) % q;
        }
        for (int i = 0; i <= n - m; i++) {
            if (p == t) {
                boolean match = true;
                for (int j = 0; j < m; j++) {
                    if (txt.charAt(i + j) != pat.charAt(j)) { match = false; break; }
                }
                if (match) res.add(i);
            }
            if (i < n - m) {
                t = (d * (t - txt.charAt(i) * h) + txt.charAt(i + m)) % q;
                if (t < 0) t += q;
            }
        }
        return res;
    }
}""", "O(N + M)", "O(1)"
    ),

    "z-function": make_sol(
        """public class Solution {
    public static int[] calculateZ(String s) {
        int n = s.length();
        int[] z = new int[n];
        for (int i = 1; i < n; i++) {
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) {
                z[i]++;
            }
        }
        return z;
    }
}""", "O(N²)", "O(N)",
        """public class Solution {
    public static int[] calculateZ(String s) {
        int n = s.length();
        int[] z = new int[n];
        int l = 0, r = 0;
        for (int i = 1; i < n; i++) {
            if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);
            while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
            if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
        }
        return z;
    }
}""", "O(N)", "O(N)"
    ),

    "kmp-algorithm-or-lps-array": make_sol(
        """import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<Integer> search(String pat, String txt) {
        List<Integer> ans = new ArrayList<>();
        int m = pat.length(), n = txt.length();
        for (int i = 0; i <= n - m; i++) {
            if (txt.substring(i, i + m).equals(pat)) ans.add(i);
        }
        return ans;
    }
}""", "O(N * M)", "O(1)",
        """import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<Integer> search(String pat, String txt) {
        List<Integer> ans = new ArrayList<>();
        int[] lps = computeLPS(pat);
        int i = 0, j = 0;
        while (i < txt.length()) {
            if (txt.charAt(i) == pat.charAt(j)) { i++; j++; }
            if (j == pat.length()) {
                ans.add(i - j);
                j = lps[j - 1];
            } else if (i < txt.length() && txt.charAt(i) != pat.charAt(j)) {
                if (j != 0) j = lps[j - 1];
                else i++;
            }
        }
        return ans;
    }

    private static int[] computeLPS(String pat) {
        int[] lps = new int[pat.length()];
        int len = 0, i = 1;
        while (i < pat.length()) {
            if (pat.charAt(i) == pat.charAt(len)) lps[i++] = ++len;
            else if (len != 0) len = lps[len - 1];
            else lps[i++] = 0;
        }
        return lps;
    }
}""", "O(N + M)", "O(M)"
    ),

    "shortest-palindrome": make_sol(
        """public class Solution {
    public static String shortestPalindrome(String s) {
        int i = 0;
        for (int j = s.length() - 1; j >= 0; j--) {
            if (s.charAt(i) == s.charAt(j)) i++;
        }
        if (i == s.length()) return s;
        String suffix = s.substring(i);
        String prefix = new StringBuilder(suffix).reverse().toString();
        return prefix + shortestPalindrome(s.substring(0, i)) + suffix;
    }
}""", "O(N²)", "O(N)",
        """public class Solution {
    public static String shortestPalindrome(String s) {
        String temp = s + "#" + new StringBuilder(s).reverse().toString();
        int[] lps = new int[temp.length()];
        for (int i = 1; i < temp.length(); i++) {
            int len = lps[i - 1];
            while (len > 0 && temp.charAt(i) != temp.charAt(len)) len = lps[len - 1];
            if (temp.charAt(i) == temp.charAt(len)) len++;
            lps[i] = len;
        }
        int longestPrefix = lps[temp.length() - 1];
        String rem = s.substring(longestPrefix);
        return new StringBuilder(rem).reverse().toString() + s;
    }
}""", "O(N)", "O(N)"
    ),

    "longest-happy-prefix": make_sol(
        """public class Solution {
    public static String longestPrefix(String s) {
        int n = s.length();
        for (int len = n - 1; len >= 1; len--) {
            if (s.startsWith(s.substring(n - len))) {
                return s.substring(0, len);
            }
        }
        return "";
    }
}""", "O(N²)", "O(N)",
        """public class Solution {
    public static String longestPrefix(String s) {
        int[] lps = new int[s.length()];
        int len = 0, i = 1;
        while (i < s.length()) {
            if (s.charAt(i) == s.charAt(len)) lps[i++] = ++len;
            else if (len != 0) len = lps[len - 1];
            else lps[i++] = 0;
        }
        return s.substring(0, lps[s.length() - 1]);
    }
}""", "O(N)", "O(N)"
    )
}
