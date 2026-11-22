from .common import make_sol

RECURSION_SOLUTIONS = {
    "pow(x,n)": make_sol(
        """public class Solution {
    public static double myPow(double x, int n) {
        long N = n;
        if (N < 0) {
            x = 1 / x;
            N = -N;
        }
        double ans = 1;
        for (long i = 0; i < N; i++) {
            ans = ans * x;
        }
        return ans;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static double myPow(double x, int n) {
        long N = n;
        if (N < 0) {
            x = 1 / x;
            N = -N;
        }
        double ans = 1;
        double currentProduct = x;
        for (long i = N; i > 0; i /= 2) {
            if (i % 2 == 1) ans = ans * currentProduct;
            currentProduct = currentProduct * currentProduct;
        }
        return ans;
    }
}""", "O(log N)", "O(1)"
    ),

    "generate-parentheses": make_sol(
        """import java.util.*;

public class Solution {
    public static List<String> generateParenthesis(int n) {
        List<String> result = new ArrayList<>();
        backtrack(result, "", 0, 0, n);
        return result;
    }

    private static void backtrack(List<String> result, String current, int open, int close, int max) {
        if (current.length() == max * 2) {
            result.add(current);
            return;
        }
        if (open < max) backtrack(result, current + "(", open + 1, close, max);
        if (close < open) backtrack(result, current + ")", open, close + 1, max);
    }
}""", "O(4^N / sqrt(N))", "O(N)",
        """import java.util.*;

public class Solution {
    public static List<String> generateParenthesis(int n) {
        List<String> result = new ArrayList<>();
        backtrack(result, new StringBuilder(), 0, 0, n);
        return result;
    }

    private static void backtrack(List<String> result, StringBuilder current, int open, int close, int max) {
        if (current.length() == max * 2) {
            result.add(current.toString());
            return;
        }
        if (open < max) {
            current.append('(');
            backtrack(result, current, open + 1, close, max);
            current.deleteCharAt(current.length() - 1);
        }
        if (close < open) {
            current.append(')');
            backtrack(result, current, open, close + 1, max);
            current.deleteCharAt(current.length() - 1);
        }
    }
}""", "O(4^N / sqrt(N))", "O(N)"
    ),

    "power-set": make_sol(
        """import java.util.*;

public class Solution {
    public static List<String> AllPossibleStrings(String s) {
        List<String> res = new ArrayList<>();
        int n = s.length();
        for (int i = 1; i < (1 << n); i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < n; j++) {
                if ((i & (1 << j)) != 0) sb.append(s.charAt(j));
            }
            res.add(sb.toString());
        }
        Collections.sort(res);
        return res;
    }
}""", "O(N * 2^N)", "O(2^N)",
        """import java.util.*;

public class Solution {
    public static List<String> AllPossibleStrings(String s) {
        List<String> res = new ArrayList<>();
        solve(0, s, new StringBuilder(), res);
        Collections.sort(res);
        return res;
    }

    private static void solve(int index, String s, StringBuilder current, List<String> res) {
        if (index == s.length()) {
            if (current.length() > 0) res.add(current.toString());
            return;
        }
        current.append(s.charAt(index));
        solve(index + 1, s, current, res);
        current.deleteCharAt(current.length() - 1);
        solve(index + 1, s, current, res);
    }
}""", "O(2^N log(2^N))", "O(N)"
    ),

    "count-good-numbers": make_sol(
        """public class Solution {
    private static final long MOD = 1_000_000_007;

    public static int countGoodNumbers(long n) {
        long even = (n + 1) / 2;
        long odd = n / 2;
        long ans = 1;
        for (long i = 0; i < even; i++) ans = (ans * 5) % MOD;
        for (long i = 0; i < odd; i++) ans = (ans * 4) % MOD;
        return (int) ans;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    private static final long MOD = 1_000_000_007;

    public static int countGoodNumbers(long n) {
        long even = (n + 1) / 2;
        long odd = n / 2;
        long first = power(5, even);
        long second = power(4, odd);
        return (int) ((first * second) % MOD);
    }

    private static long power(long base, long exp) {
        long res = 1;
        base %= MOD;
        while (exp > 0) {
            if (exp % 2 == 1) res = (res * base) % MOD;
            base = (base * base) % MOD;
            exp /= 2;
        }
        return res;
    }
}""", "O(log N)", "O(1)"
    ),

    "reverse-a-stack": make_sol(
        """import java.util.Stack;

public class Solution {
    public static void reverse(Stack<Integer> s) {
        int[] arr = new int[s.size()];
        int idx = 0;
        while (!s.isEmpty()) arr[idx++] = s.pop();
        for (int i = 0; i < arr.length; i++) s.push(arr[i]);
    }
}""", "O(N)", "O(N)",
        """import java.util.Stack;

public class Solution {
    public static void reverse(Stack<Integer> s) {
        if (s.isEmpty()) return;
        int top = s.pop();
        reverse(s);
        insertAtBottom(s, top);
    }

    private static void insertAtBottom(Stack<Integer> s, int x) {
        if (s.isEmpty()) {
            s.push(x);
            return;
        }
        int top = s.pop();
        insertAtBottom(s, x);
        s.push(top);
    }
}""", "O(N²)", "O(N)"
    ),

    "learn-all-patterns-of-subsequences": make_sol(
        """import java.util.*;

public class Solution {
    public static void printSubsequences(int[] arr) {
        // Pattern of Subsequence: Pick / Non-Pick
        solve(0, arr, new ArrayList<>());
    }

    private static void solve(int i, int[] arr, List<Integer> current) {
        if (i == arr.length) {
            System.out.println(current);
            return;
        }
        current.add(arr[i]);
        solve(i + 1, arr, current);
        current.remove(current.size() - 1);
        solve(i + 1, arr, current);
    }
}""", "O(2^N)", "O(N)",
        """import java.util.*;

public class Solution {
    public static void printSubsequences(int[] arr) {
        solve(0, arr, new ArrayList<>());
    }

    private static void solve(int i, int[] arr, List<Integer> current) {
        if (i == arr.length) {
            System.out.println(current);
            return;
        }
        current.add(arr[i]);
        solve(i + 1, arr, current);
        current.remove(current.size() - 1);
        solve(i + 1, arr, current);
    }
}""", "O(2^N)", "O(N)"
    ),

    "check-if-there-exists-a-subsequence-with-sum-k": make_sol(
        """public class Solution {
    public static boolean checkSubsequenceSum(int n, int[] arr, int k) {
        return solve(0, arr, 0, k);
    }

    private static boolean solve(int idx, int[] arr, int sum, int k) {
        if (idx == arr.length) return sum == k;
        if (solve(idx + 1, arr, sum + arr[idx], k)) return true;
        return solve(idx + 1, arr, sum, k);
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static boolean checkSubsequenceSum(int n, int[] arr, int k) {
        return solve(0, arr, 0, k);
    }

    private static boolean solve(int idx, int[] arr, int sum, int k) {
        if (sum == k) return true;
        if (idx == arr.length || sum > k) return false;
        if (solve(idx + 1, arr, sum + arr[idx], k)) return true;
        return solve(idx + 1, arr, sum, k);
    }
}""", "O(2^N)", "O(N)"
    ),

    "count-all-subsequences-with-sum-k": make_sol(
        """public class Solution {
    public static int countSubsequences(int[] arr, int k) {
        return solve(0, arr, 0, k);
    }

    private static int solve(int idx, int[] arr, int sum, int k) {
        if (idx == arr.length) return sum == k ? 1 : 0;
        int take = solve(idx + 1, arr, sum + arr[idx], k);
        int notTake = solve(idx + 1, arr, sum, k);
        return take + notTake;
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public static int countSubsequences(int[] arr, int k) {
        int[] dp = new int[k + 1];
        dp[0] = 1;
        for (int num : arr) {
            for (int j = k; j >= num; j--) {
                dp[j] = (dp[j] + dp[j - num]) % 1_000_000_007;
            }
        }
        return dp[k];
    }
}""", "O(N * K)", "O(K)"
    ),

    "generate-binary-strings-without-consecutive-1s": make_sol(
        """import java.util.*;

public class Solution {
    public static List<String> generateBinaryStrings(int n) {
        List<String> res = new ArrayList<>();
        solve(n, "", res);
        return res;
    }

    private static void solve(int n, String curr, List<String> res) {
        if (curr.length() == n) {
            res.add(curr);
            return;
        }
        solve(n, curr + "0", res);
        if (curr.isEmpty() || curr.charAt(curr.length() - 1) != '1') {
            solve(n, curr + "1", res);
        }
    }
}""", "O(2^N)", "O(N)",
        """import java.util.*;

public class Solution {
    public static List<String> generateBinaryStrings(int n) {
        List<String> res = new ArrayList<>();
        solve(n, new StringBuilder(), res);
        return res;
    }

    private static void solve(int n, StringBuilder curr, List<String> res) {
        if (curr.length() == n) {
            res.add(curr.toString());
            return;
        }
        curr.append('0');
        solve(n, curr, res);
        curr.deleteCharAt(curr.length() - 1);
        if (curr.length() == 0 || curr.charAt(curr.length() - 1) != '1') {
            curr.append('1');
            solve(n, curr, res);
            curr.deleteCharAt(curr.length() - 1);
        }
    }
}""", "O(Fibonacci(N))", "O(N)"
    ),

    "combination-sum": make_sol(
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> ans = new ArrayList<>();
        findCombinations(0, candidates, target, ans, new ArrayList<>());
        return ans;
    }

    private static void findCombinations(int ind, int[] arr, int target, List<List<Integer>> ans, List<Integer> ds) {
        if (ind == arr.length) {
            if (target == 0) ans.add(new ArrayList<>(ds));
            return;
        }
        if (arr[ind] <= target) {
            ds.add(arr[ind]);
            findCombinations(ind, arr, target - arr[ind], ans, ds);
            ds.remove(ds.size() - 1);
        }
        findCombinations(ind + 1, arr, target, ans, ds);
    }
}""", "O(2^t * k)", "O(k * x)",
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> ans = new ArrayList<>();
        Arrays.sort(candidates);
        findCombinations(0, candidates, target, ans, new ArrayList<>());
        return ans;
    }

    private static void findCombinations(int ind, int[] arr, int target, List<List<Integer>> ans, List<Integer> ds) {
        if (target == 0) {
            ans.add(new ArrayList<>(ds));
            return;
        }
        for (int i = ind; i < arr.length; i++) {
            if (arr[i] > target) break;
            ds.add(arr[i]);
            findCombinations(i, arr, target - arr[i], ans, ds);
            ds.remove(ds.size() - 1);
        }
    }
}""", "O(2^t * k)", "O(k * x)"
    ),

    "combination-sum-ii": make_sol(
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        Set<List<Integer>> ans = new HashSet<>();
        findCombinations(0, candidates, target, ans, new ArrayList<>());
        return new ArrayList<>(ans);
    }

    private static void findCombinations(int ind, int[] arr, int target, Set<List<Integer>> ans, List<Integer> ds) {
        if (target == 0) {
            ans.add(new ArrayList<>(ds));
            return;
        }
        if (ind == arr.length || target < 0) return;
        ds.add(arr[ind]);
        findCombinations(ind + 1, arr, target - arr[ind], ans, ds);
        ds.remove(ds.size() - 1);
        findCombinations(ind + 1, arr, target, ans, ds);
    }
}""", "O(2^N * k log(ans))", "O(k * x)",
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> combinationSum2(int[] candidates, int target) {
        List<List<Integer>> ans = new ArrayList<>();
        Arrays.sort(candidates);
        findCombinations(0, candidates, target, ans, new ArrayList<>());
        return ans;
    }

    private static void findCombinations(int ind, int[] arr, int target, List<List<Integer>> ans, List<Integer> ds) {
        if (target == 0) {
            ans.add(new ArrayList<>(ds));
            return;
        }
        for (int i = ind; i < arr.length; i++) {
            if (i > ind && arr[i] == arr[i - 1]) continue;
            if (arr[i] > target) break;
            ds.add(arr[i]);
            findCombinations(i + 1, arr, target - arr[i], ans, ds);
            ds.remove(ds.size() - 1);
        }
    }
}""", "O(2^N * k)", "O(k * x)"
    ),

    "subsets-i": make_sol(
        """import java.util.*;

public class Solution {
    public static ArrayList<Integer> subsetSums(int[] arr, int n) {
        ArrayList<Integer> subsetSum = new ArrayList<>();
        for (int i = 0; i < (1 << n); i++) {
            int sum = 0;
            for (int j = 0; j < n; j++) {
                if ((i & (1 << j)) != 0) sum += arr[j];
            }
            subsetSum.add(sum);
        }
        Collections.sort(subsetSum);
        return subsetSum;
    }
}""", "O(2^N * N)", "O(2^N)",
        """import java.util.*;

public class Solution {
    public static ArrayList<Integer> subsetSums(int[] arr, int n) {
        ArrayList<Integer> subsetSum = new ArrayList<>();
        helper(0, 0, arr, n, subsetSum);
        Collections.sort(subsetSum);
        return subsetSum;
    }

    private static void helper(int ind, int sum, int[] arr, int n, ArrayList<Integer> subsetSum) {
        if (ind == n) {
            subsetSum.add(sum);
            return;
        }
        helper(ind + 1, sum + arr[ind], arr, n, subsetSum);
        helper(ind + 1, sum, arr, n, subsetSum);
    }
}""", "O(2^N + 2^N log(2^N))", "O(2^N)"
    ),

    "subsets-ii": make_sol(
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        Set<List<Integer>> ans = new HashSet<>();
        helper(0, nums, new ArrayList<>(), ans);
        return new ArrayList<>(ans);
    }

    private static void helper(int ind, int[] nums, List<Integer> ds, Set<List<Integer>> ans) {
        if (ind == nums.length) {
            ans.add(new ArrayList<>(ds));
            return;
        }
        ds.add(nums[ind]);
        helper(ind + 1, nums, ds, ans);
        ds.remove(ds.size() - 1);
        helper(ind + 1, nums, ds, ans);
    }
}""", "O(2^N * N log(ans))", "O(2^N * N)",
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> ans = new ArrayList<>();
        findSubsets(0, nums, new ArrayList<>(), ans);
        return ans;
    }

    private static void findSubsets(int ind, int[] nums, List<Integer> ds, List<List<Integer>> ans) {
        ans.add(new ArrayList<>(ds));
        for (int i = ind; i < nums.length; i++) {
            if (i != ind && nums[i] == nums[i - 1]) continue;
            ds.add(nums[i]);
            findSubsets(i + 1, nums, ds, ans);
            ds.remove(ds.size() - 1);
        }
    }
}""", "O(2^N * N)", "O(2^N * N)"
    ),

    "combination-sum-iii": make_sol(
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> combinationSum3(int k, int n) {
        List<List<Integer>> ans = new ArrayList<>();
        backtrack(1, k, n, new ArrayList<>(), ans);
        return ans;
    }

    private static void backtrack(int start, int k, int n, List<Integer> current, List<List<Integer>> ans) {
        if (current.size() == k) {
            if (n == 0) ans.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i <= 9; i++) {
            if (i > n) break;
            current.add(i);
            backtrack(i + 1, k, n - i, current, ans);
            current.remove(current.size() - 1);
        }
    }
}""", "O(C(9, k))", "O(k)",
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> combinationSum3(int k, int n) {
        List<List<Integer>> ans = new ArrayList<>();
        backtrack(1, k, n, new ArrayList<>(), ans);
        return ans;
    }

    private static void backtrack(int start, int k, int n, List<Integer> current, List<List<Integer>> ans) {
        if (current.size() == k) {
            if (n == 0) ans.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i <= 9; i++) {
            if (i > n) break;
            current.add(i);
            backtrack(i + 1, k, n - i, current, ans);
            current.remove(current.size() - 1);
        }
    }
}""", "O(C(9, k))", "O(k)"
    ),

    "letter-combinations-of-a-phone-number": make_sol(
        """import java.util.*;

public class Solution {
    public static List<String> letterCombinations(String digits) {
        List<String> res = new ArrayList<>();
        if (digits.isEmpty()) return res;
        String[] mapping = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
        backtrack(0, digits, new StringBuilder(), res, mapping);
        return res;
    }

    private static void backtrack(int index, String digits, StringBuilder curr, List<String> res, String[] map) {
        if (index == digits.length()) {
            res.add(curr.toString());
            return;
        }
        String letters = map[digits.charAt(index) - '0'];
        for (char c : letters.toCharArray()) {
            curr.append(c);
            backtrack(index + 1, digits, curr, res, map);
            curr.deleteCharAt(curr.length() - 1);
        }
    }
}""", "O(4^N * N)", "O(N)",
        """import java.util.*;

public class Solution {
    public static List<String> letterCombinations(String digits) {
        List<String> res = new ArrayList<>();
        if (digits.isEmpty()) return res;
        String[] mapping = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
        backtrack(0, digits, new StringBuilder(), res, mapping);
        return res;
    }

    private static void backtrack(int index, String digits, StringBuilder curr, List<String> res, String[] map) {
        if (index == digits.length()) {
            res.add(curr.toString());
            return;
        }
        String letters = map[digits.charAt(index) - '0'];
        for (char c : letters.toCharArray()) {
            curr.append(c);
            backtrack(index + 1, digits, curr, res, map);
            curr.deleteCharAt(curr.length() - 1);
        }
    }
}""", "O(4^N * N)", "O(N)"
    ),

    "palindrome-partitioning": make_sol(
        """import java.util.*;

public class Solution {
    public static List<List<String>> partition(String s) {
        List<List<String>> res = new ArrayList<>();
        List<String> path = new ArrayList<>();
        func(0, s, path, res);
        return res;
    }

    private static void func(int index, String s, List<String> path, List<List<String>> res) {
        if (index == s.length()) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = index; i < s.length(); ++i) {
            if (isPalindrome(s, index, i)) {
                path.add(s.substring(index, i + 1));
                func(i + 1, s, path, res);
                path.remove(path.size() - 1);
            }
        }
    }

    private static boolean isPalindrome(String s, int start, int end) {
        while (start <= end) {
            if (s.charAt(start++) != s.charAt(end--)) return false;
        }
        return true;
    }
}""", "O(2^N * N)", "O(N)",
        """import java.util.*;

public class Solution {
    public static List<List<String>> partition(String s) {
        List<List<String>> res = new ArrayList<>();
        List<String> path = new ArrayList<>();
        func(0, s, path, res);
        return res;
    }

    private static void func(int index, String s, List<String> path, List<List<String>> res) {
        if (index == s.length()) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = index; i < s.length(); ++i) {
            if (isPalindrome(s, index, i)) {
                path.add(s.substring(index, i + 1));
                func(i + 1, s, path, res);
                path.remove(path.size() - 1);
            }
        }
    }

    private static boolean isPalindrome(String s, int start, int end) {
        while (start <= end) {
            if (s.charAt(start++) != s.charAt(end--)) return false;
        }
        return true;
    }
}""", "O(2^N * N)", "O(N)"
    ),

    "word-search": make_sol(
        """public class Solution {
    public static boolean exist(char[][] board, String word) {
        int m = board.length, n = board[0].length;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (dfs(board, word, i, j, 0)) return true;
            }
        }
        return false;
    }

    private static boolean dfs(char[][] board, String word, int r, int c, int k) {
        if (k == word.length()) return true;
        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(k)) {
            return false;
        }
        char temp = board[r][c];
        board[r][c] = '#';
        boolean found = dfs(board, word, r + 1, c, k + 1) ||
                        dfs(board, word, r - 1, c, k + 1) ||
                        dfs(board, word, r, c + 1, k + 1) ||
                        dfs(board, word, r, c - 1, k + 1);
        board[r][c] = temp;
        return found;
    }
}""", "O(M * N * 4^L)", "O(L)",
        """public class Solution {
    public static boolean exist(char[][] board, String word) {
        int m = board.length, n = board[0].length;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (dfs(board, word, i, j, 0)) return true;
            }
        }
        return false;
    }

    private static boolean dfs(char[][] board, String word, int r, int c, int k) {
        if (k == word.length()) return true;
        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(k)) {
            return false;
        }
        char temp = board[r][c];
        board[r][c] = '#';
        boolean found = dfs(board, word, r + 1, c, k + 1) ||
                        dfs(board, word, r - 1, c, k + 1) ||
                        dfs(board, word, r, c + 1, k + 1) ||
                        dfs(board, word, r, c - 1, k + 1);
        board[r][c] = temp;
        return found;
    }
}""", "O(M * N * 4^L)", "O(L)"
    ),

    "n-queen": make_sol(
        """import java.util.*;

public class Solution {
    public static List<List<String>> solveNQueens(int n) {
        char[][] board = new char[n][n];
        for (char[] row : board) Arrays.fill(row, '.');
        List<List<String>> res = new ArrayList<>();
        dfs(0, board, res);
        return res;
    }

    private static void dfs(int col, char[][] board, List<List<String>> res) {
        if (col == board.length) {
            List<String> list = new ArrayList<>();
            for (char[] row : board) list.add(new String(row));
            res.add(list);
            return;
        }
        for (int row = 0; row < board.length; row++) {
            if (validate(board, row, col)) {
                board[row][col] = 'Q';
                dfs(col + 1, board, res);
                board[row][col] = '.';
            }
        }
    }

    private static boolean validate(char[][] board, int row, int col) {
        for (int c = 0; c < col; c++) if (board[row][c] == 'Q') return false;
        for (int r = row, c = col; r >= 0 && c >= 0; r--, c--) if (board[r][c] == 'Q') return false;
        for (int r = row, c = col; r < board.length && c >= 0; r++, c--) if (board[r][c] == 'Q') return false;
        return true;
    }
}""", "O(N! * N)", "O(N²)",
        """import java.util.*;

public class Solution {
    public static List<List<String>> solveNQueens(int n) {
        char[][] board = new char[n][n];
        for (char[] row : board) Arrays.fill(row, '.');
        List<List<String>> res = new ArrayList<>();
        int[] leftRow = new int[n];
        int[] upperDiagonal = new int[2 * n - 1];
        int[] lowerDiagonal = new int[2 * n - 1];
        solve(0, board, res, leftRow, lowerDiagonal, upperDiagonal);
        return res;
    }

    private static void solve(int col, char[][] board, List<List<String>> res, int[] leftRow, int[] lowerDiagonal, int[] upperDiagonal) {
        if (col == board.length) {
            List<String> list = new ArrayList<>();
            for (char[] row : board) list.add(new String(row));
            res.add(list);
            return;
        }
        for (int row = 0; row < board.length; row++) {
            if (leftRow[row] == 0 && lowerDiagonal[row + col] == 0 && upperDiagonal[board.length - 1 + col - row] == 0) {
                board[row][col] = 'Q';
                leftRow[row] = 1;
                lowerDiagonal[row + col] = 1;
                upperDiagonal[board.length - 1 + col - row] = 1;
                solve(col + 1, board, res, leftRow, lowerDiagonal, upperDiagonal);
                board[row][col] = '.';
                leftRow[row] = 0;
                lowerDiagonal[row + col] = 0;
                upperDiagonal[board.length - 1 + col - row] = 0;
            }
        }
    }
}""", "O(N!)", "O(N)"
    ),

    "rat-in-a-maze": make_sol(
        """import java.util.*;

public class Solution {
    public static ArrayList<String> findPath(int[][] m, int n) {
        ArrayList<String> ans = new ArrayList<>();
        int[][] vis = new int[n][n];
        if (m[0][0] == 1) solve(0, 0, m, n, ans, "", vis);
        return ans;
    }

    private static void solve(int i, int j, int[][] a, int n, ArrayList<String> ans, String move, int[][] vis) {
        if (i == n - 1 && j == n - 1) {
            ans.add(move);
            return;
        }
        // Down
        if (i + 1 < n && vis[i + 1][j] == 0 && a[i + 1][j] == 1) {
            vis[i][j] = 1;
            solve(i + 1, j, a, n, ans, move + 'D', vis);
            vis[i][j] = 0;
        }
        // Left
        if (j - 1 >= 0 && vis[i][j - 1] == 0 && a[i][j - 1] == 1) {
            vis[i][j] = 1;
            solve(i, j - 1, a, n, ans, move + 'L', vis);
            vis[i][j] = 0;
        }
        // Right
        if (j + 1 < n && vis[i][j + 1] == 0 && a[i][j + 1] == 1) {
            vis[i][j] = 1;
            solve(i, j + 1, a, n, ans, move + 'R', vis);
            vis[i][j] = 0;
        }
        // Up
        if (i - 1 >= 0 && vis[i - 1][j] == 0 && a[i - 1][j] == 1) {
            vis[i][j] = 1;
            solve(i - 1, j, a, n, ans, move + 'U', vis);
            vis[i][j] = 0;
        }
    }
}""", "O(4^(N*M))", "O(N * M)",
        """import java.util.*;

public class Solution {
    public static ArrayList<String> findPath(int[][] m, int n) {
        ArrayList<String> ans = new ArrayList<>();
        int[][] vis = new int[n][n];
        int[] di = {+1, 0, 0, -1};
        int[] dj = {0, -1, 1, 0};
        if (m[0][0] == 1) solve(0, 0, m, n, ans, "", vis, di, dj);
        return ans;
    }

    private static void solve(int i, int j, int[][] a, int n, ArrayList<String> ans, String move, int[][] vis, int[] di, int[] dj) {
        if (i == n - 1 && j == n - 1) {
            ans.add(move);
            return;
        }
        String dir = "DLRU";
        for (int ind = 0; ind < 4; ind++) {
            int nexti = i + di[ind];
            int nextj = j + dj[ind];
            if (nexti >= 0 && nextj >= 0 && nexti < n && nextj < n && vis[nexti][nextj] == 0 && a[nexti][nextj] == 1) {
                vis[i][j] = 1;
                solve(nexti, nextj, a, n, ans, move + dir.charAt(ind), vis, di, dj);
                vis[i][j] = 0;
            }
        }
    }
}""", "O(4^(N*M))", "O(N * M)"
    ),

    "m-coloring-problem": make_sol(
        """import java.util.*;

public class Solution {
    public static boolean graphColoring(boolean[][] graph, int m, int n) {
        int[] color = new int[n];
        return solve(0, graph, color, m, n);
    }

    private static boolean solve(int node, boolean[][] graph, int[] color, int m, int n) {
        if (node == n) return true;
        for (int i = 1; i <= m; i++) {
            if (isSafe(node, graph, color, n, i)) {
                color[node] = i;
                if (solve(node + 1, graph, color, m, n)) return true;
                color[node] = 0;
            }
        }
        return false;
    }

    private static boolean isSafe(int node, boolean[][] graph, int[] color, int n, int col) {
        for (int k = 0; k < n; k++) {
            if (k != node && graph[k][node] && color[k] == col) return false;
        }
        return true;
    }
}""", "O(M^N)", "O(N)",
        """import java.util.*;

public class Solution {
    public static boolean graphColoring(boolean[][] graph, int m, int n) {
        int[] color = new int[n];
        return solve(0, graph, color, m, n);
    }

    private static boolean solve(int node, boolean[][] graph, int[] color, int m, int n) {
        if (node == n) return true;
        for (int i = 1; i <= m; i++) {
            if (isSafe(node, graph, color, n, i)) {
                color[node] = i;
                if (solve(node + 1, graph, color, m, n)) return true;
                color[node] = 0;
            }
        }
        return false;
    }

    private static boolean isSafe(int node, boolean[][] graph, int[] color, int n, int col) {
        for (int k = 0; k < n; k++) {
            if (k != node && graph[k][node] && color[k] == col) return false;
        }
        return true;
    }
}""", "O(M^N)", "O(N)"
    ),

    "sudoko-solver": make_sol(
        """public class Solution {
    public static void solveSudoku(char[][] board) {
        solve(board);
    }

    private static boolean solve(char[][] board) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') {
                    for (char c = '1'; c <= '9'; c++) {
                        if (isValid(board, i, j, c)) {
                            board[i][j] = c;
                            if (solve(board)) return true;
                            board[i][j] = '.';
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    private static boolean isValid(char[][] board, int row, int col, char c) {
        for (int i = 0; i < 9; i++) {
            if (board[i][col] == c) return false;
            if (board[row][i] == c) return false;
            if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == c) return false;
        }
        return true;
    }
}""", "O(9^(empty cells))", "O(1)",
        """public class Solution {
    public static void solveSudoku(char[][] board) {
        solve(board);
    }

    private static boolean solve(char[][] board) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') {
                    for (char c = '1'; c <= '9'; c++) {
                        if (isValid(board, i, j, c)) {
                            board[i][j] = c;
                            if (solve(board)) return true;
                            board[i][j] = '.';
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    private static boolean isValid(char[][] board, int row, int col, char c) {
        for (int i = 0; i < 9; i++) {
            if (board[i][col] == c) return false;
            if (board[row][i] == c) return false;
            if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == c) return false;
        }
        return true;
    }
}""", "O(9^(empty cells))", "O(1)"
    ),

    "expression-add-operators": make_sol(
        """import java.util.*;

public class Solution {
    public static List<String> addOperators(String num, int target) {
        List<String> res = new ArrayList<>();
        if (num.isEmpty()) return res;
        backtrack(0, "", 0, 0, num, target, res);
        return res;
    }

    private static void backtrack(int pos, String path, long eval, long multed, String num, int target, List<String> res) {
        if (pos == num.length()) {
            if (eval == target) res.add(path);
            return;
        }
        for (int i = pos; i < num.length(); i++) {
            if (i != pos && num.charAt(pos) == '0') break;
            long cur = Long.parseLong(num.substring(pos, i + 1));
            if (pos == 0) {
                backtrack(i + 1, path + cur, cur, cur, num, target, res);
            } else {
                backtrack(i + 1, path + "+" + cur, eval + cur, cur, num, target, res);
                backtrack(i + 1, path + "-" + cur, eval - cur, -cur, num, target, res);
                backtrack(i + 1, path + "*" + cur, eval - multed + multed * cur, multed * cur, num, target, res);
            }
        }
    }
}""", "O(4^N)", "O(N)",
        """import java.util.*;

public class Solution {
    public static List<String> addOperators(String num, int target) {
        List<String> res = new ArrayList<>();
        if (num.isEmpty()) return res;
        backtrack(0, new StringBuilder(), 0, 0, num, target, res);
        return res;
    }

    private static void backtrack(int pos, StringBuilder path, long eval, long multed, String num, int target, List<String> res) {
        if (pos == num.length()) {
            if (eval == target) res.add(path.toString());
            return;
        }
        long cur = 0;
        for (int i = pos; i < num.length(); i++) {
            if (i != pos && num.charAt(pos) == '0') break;
            cur = cur * 10 + (num.charAt(i) - '0');
            int len = path.length();
            if (pos == 0) {
                path.append(cur);
                backtrack(i + 1, path, cur, cur, num, target, res);
                path.setLength(len);
            } else {
                path.append('+').append(cur);
                backtrack(i + 1, path, eval + cur, cur, num, target, res);
                path.setLength(len);

                path.append('-').append(cur);
                backtrack(i + 1, path, eval - cur, -cur, num, target, res);
                path.setLength(len);

                path.append('*').append(cur);
                backtrack(i + 1, path, eval - multed + multed * cur, multed * cur, num, target, res);
                path.setLength(len);
            }
        }
    }
}""", "O(4^N)", "O(N)"
    )
}
