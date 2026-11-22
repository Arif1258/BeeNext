from .common import make_sol

BIT_SOLUTIONS = {
    "introduction-to-bits-and-tricks": make_sol(
        """public class Solution {
    public static void bitTricks(int n, int i) {
        // Basic bit operators demonstration
        int andOp = n & (1 << i);
        int orOp = n | (1 << i);
        int xorOp = n ^ (1 << i);
        int notOp = ~n;
        System.out.println("AND: " + andOp + ", OR: " + orOp + ", XOR: " + xorOp);
    }
}""", "O(1)", "O(1)",
        """public class Solution {
    public static void bitTricks(int n, int i) {
        int andOp = n & (1 << i);
        int orOp = n | (1 << i);
        int xorOp = n ^ (1 << i);
        int notOp = ~n;
        System.out.println("AND: " + andOp + ", OR: " + orOp + ", XOR: " + xorOp);
    }
}""", "O(1)", "O(1)"
    ),

    "check-if-the-i-th-bit-is-set-or-not": make_sol(
        """public class Solution {
    public static boolean checkKthBit(int n, int k) {
        return ((n >> k) & 1) == 1;
    }
}""", "O(1)", "O(1)",
        """public class Solution {
    public static boolean checkKthBit(int n, int k) {
        return (n & (1 << k)) != 0;
    }
}""", "O(1)", "O(1)"
    ),

    "check-if-a-number-is-odd-or-not": make_sol(
        """public class Solution {
    public static String oddEven(int n) {
        return (n % 2 == 1) ? "odd" : "even";
    }
}""", "O(1)", "O(1)",
        """public class Solution {
    public static String oddEven(int n) {
        return ((n & 1) == 1) ? "odd" : "even";
    }
}""", "O(1)", "O(1)"
    ),

    "check-if-a-number-is-power-of-2-or-not": make_sol(
        """public class Solution {
    public static boolean isPowerOfTwo(int n) {
        if (n <= 0) return false;
        while (n % 2 == 0) n /= 2;
        return n == 1;
    }
}""", "O(log N)", "O(1)",
        """public class Solution {
    public static boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
}""", "O(1)", "O(1)"
    ),

    "count-the-number-of-set-bits": make_sol(
        """public class Solution {
    public static int countSetBits(int n) {
        int count = 0;
        while (n > 0) {
            count += (n & 1);
            n >>= 1;
        }
        return count;
    }
}""", "O(log N)", "O(1)",
        """public class Solution {
    public static int countSetBits(int n) {
        int count = 0;
        while (n > 0) {
            n = n & (n - 1);
            count++;
        }
        return count;
    }
}""", "O(number of set bits)", "O(1)"
    ),

    "set-the-rightmost-unset-bit": make_sol(
        """public class Solution {
    public static int setBit(int n) {
        int temp = n, pos = 0;
        while ((temp & 1) != 0) {
            temp >>= 1;
            pos++;
        }
        return n | (1 << pos);
    }
}""", "O(log N)", "O(1)",
        """public class Solution {
    public static int setBit(int n) {
        return n | (n + 1);
    }
}""", "O(1)", "O(1)"
    ),

    "swap-two-numbers": make_sol(
        """import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<Integer> get(int a, int b) {
        int temp = a;
        a = b;
        b = temp;
        List<Integer> list = new ArrayList<>();
        list.add(a);
        list.add(b);
        return list;
    }
}""", "O(1)", "O(1)",
        """import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<Integer> get(int a, int b) {
        a = a ^ b;
        b = a ^ b;
        a = a ^ b;
        List<Integer> list = new ArrayList<>();
        list.add(a);
        list.add(b);
        return list;
    }
}""", "O(1)", "O(1)"
    ),

    "minimum-bit-flips-to-convert-number": make_sol(
        """public class Solution {
    public static int minBitFlips(int start, int goal) {
        int xor = start ^ goal;
        int count = 0;
        while (xor > 0) {
            count += (xor & 1);
            xor >>= 1;
        }
        return count;
    }
}""", "O(log(start ^ goal))", "O(1)",
        """public class Solution {
    public static int minBitFlips(int start, int goal) {
        int xor = start ^ goal;
        int count = 0;
        while (xor > 0) {
            xor = xor & (xor - 1);
            count++;
        }
        return count;
    }
}""", "O(set bits)", "O(1)"
    ),

    "single-number---i": make_sol(
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int singleNumber(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1);
        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            if (entry.getValue() == 1) return entry.getKey();
        }
        return -1;
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static int singleNumber(int[] nums) {
        int xor = 0;
        for (int num : nums) xor ^= num;
        return xor;
    }
}""", "O(N)", "O(1)"
    ),

    "single-number---ii": make_sol(
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int singleNumber(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1);
        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            if (entry.getValue() == 1) return entry.getKey();
        }
        return -1;
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static int singleNumber(int[] nums) {
        int ones = 0, twos = 0;
        for (int num : nums) {
            ones = (ones ^ num) & ~twos;
            twos = (twos ^ num) & ~ones;
        }
        return ones;
    }
}""", "O(N)", "O(1)"
    ),

    "single-number---iii": make_sol(
        """import java.util.HashMap;
import java.util.Map;

public class Solution {
    public static int[] singleNumber(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1);
        int[] res = new int[2];
        int idx = 0;
        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            if (entry.getValue() == 1) res[idx++] = entry.getKey();
        }
        return res;
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static int[] singleNumber(int[] nums) {
        long xor = 0;
        for (int num : nums) xor ^= num;
        long rightmost = xor & -xor;
        int b1 = 0, b2 = 0;
        for (int num : nums) {
            if ((num & rightmost) != 0) b1 ^= num;
            else b2 ^= num;
        }
        return new int[]{b1, b2};
    }
}""", "O(N)", "O(1)"
    ),

    "divide-two-numbers-without-multiplication-and-division": make_sol(
        """public class Solution {
    public static int divide(int dividend, int divisor) {
        if (dividend == Integer.MIN_VALUE && divisor == -1) return Integer.MAX_VALUE;
        long count = 0;
        long a = Math.abs((long) dividend);
        long b = Math.abs((long) divisor);
        while (a >= b) {
            a -= b;
            count++;
        }
        boolean sign = (dividend < 0) ^ (divisor < 0);
        return (int) (sign ? -count : count);
    }
}""", "O(dividend / divisor)", "O(1)",
        """public class Solution {
    public static int divide(int dividend, int divisor) {
        if (dividend == Integer.MIN_VALUE && divisor == -1) return Integer.MAX_VALUE;
        boolean sign = (dividend < 0) ^ (divisor < 0);
        long n = Math.abs((long) dividend);
        long d = Math.abs((long) divisor);
        long ans = 0;
        while (n >= d) {
            int count = 0;
            while (n >= (d << (count + 1))) count++;
            ans += (1L << count);
            n -= (d << count);
        }
        return (int) (sign ? -ans : ans);
    }
}""", "O((log N)²)", "O(1)"
    ),

    "power-set-bit-manipulation": make_sol(
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> ans = new ArrayList<>();
        int n = nums.length;
        for (int i = 0; i < (1 << n); i++) {
            List<Integer> sub = new ArrayList<>();
            for (int j = 0; j < n; j++) {
                if ((i & (1 << j)) != 0) sub.add(nums[j]);
            }
            ans.add(sub);
        }
        return ans;
    }
}""", "O(N * 2^N)", "O(2^N)",
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> ans = new ArrayList<>();
        int n = nums.length;
        for (int i = 0; i < (1 << n); i++) {
            List<Integer> sub = new ArrayList<>();
            for (int j = 0; j < n; j++) {
                if ((i & (1 << j)) != 0) sub.add(nums[j]);
            }
            ans.add(sub);
        }
        return ans;
    }
}""", "O(N * 2^N)", "O(2^N)"
    ),

    "xor-of-numbers-in-a-given-range": make_sol(
        """public class Solution {
    public static int findXOR(int l, int r) {
        int xor = 0;
        for (int i = l; i <= r; i++) xor ^= i;
        return xor;
    }
}""", "O(R - L)", "O(1)",
        """public class Solution {
    public static int findXOR(int l, int r) {
        return xorTill(r) ^ xorTill(l - 1);
    }

    private static int xorTill(int n) {
        if (n % 4 == 1) return 1;
        if (n % 4 == 2) return n + 1;
        if (n % 4 == 3) return 0;
        return n;
    }
}""", "O(1)", "O(1)"
    )
}
