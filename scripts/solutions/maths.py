from .common import make_sol

MATHS_SOLUTIONS = {
    "print-all-primes-till-n": make_sol(
        """import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<Integer> primesTillN(int n) {
        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= n; i++) {
            boolean isPrime = true;
            for (int j = 2; j * j <= i; j++) {
                if (i % j == 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) primes.add(i);
        }
        return primes;
    }
}""", "O(N * sqrt(N))", "O(1)",
        """import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Solution {
    public static List<Integer> primesTillN(int n) {
        boolean[] isPrime = new boolean[n + 1];
        Arrays.fill(isPrime, true);
        List<Integer> primes = new ArrayList<>();
        for (int p = 2; p * p <= n; p++) {
            if (isPrime[p]) {
                for (int i = p * p; i <= n; i += p) {
                    isPrime[i] = false;
                }
            }
        }
        for (int i = 2; i <= n; i++) {
            if (isPrime[i]) primes.add(i);
        }
        return primes;
    }
}""", "O(N log(log N))", "O(N)"
    ),

    "prime-factorisation-of-a-number": make_sol(
        """import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<Integer> primeFactors(int n) {
        List<Integer> factors = new ArrayList<>();
        for (int i = 2; i <= n; i++) {
            while (n % i == 0) {
                factors.add(i);
                n /= i;
            }
        }
        return factors;
    }
}""", "O(N)", "O(1)",
        """import java.util.ArrayList;
import java.util.List;

public class Solution {
    public static List<Integer> primeFactors(int n) {
        List<Integer> factors = new ArrayList<>();
        for (int i = 2; i * i <= n; i++) {
            while (n % i == 0) {
                factors.add(i);
                n /= i;
            }
        }
        if (n > 1) factors.add(n);
        return factors;
    }
}""", "O(sqrt(N))", "O(1)"
    ),

    "count-primes-in-range-l-to-r": make_sol(
        """public class Solution {
    public static int countPrimesInRange(int L, int R) {
        int count = 0;
        for (int i = L; i <= R; i++) {
            if (i < 2) continue;
            boolean isPrime = true;
            for (int j = 2; j * j <= i; j++) {
                if (i % j == 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) count++;
        }
        return count;
    }
}""", "O((R - L + 1) * sqrt(R))", "O(1)",
        """import java.util.Arrays;

public class Solution {
    public static int countPrimesInRange(int L, int R) {
        int limit = (int) Math.sqrt(R);
        boolean[] prime = new boolean[limit + 1];
        Arrays.fill(prime, true);
        for (int p = 2; p * p <= limit; p++) {
            if (prime[p]) {
                for (int i = p * p; i <= limit; i += p) {
                    prime[i] = false;
                }
            }
        }

        boolean[] isPrime = new boolean[R - L + 1];
        Arrays.fill(isPrime, true);
        for (int i = 2; i <= limit; i++) {
            if (prime[i]) {
                int base = (L / i) * i;
                if (base < L) base += i;
                for (int j = Math.max(base, i * i); j <= R; j += i) {
                    isPrime[j - L] = false;
                }
            }
        }

        int count = 0;
        for (int i = 0; i < R - L + 1; i++) {
            if (isPrime[i] && (i + L) >= 2) count++;
        }
        return count;
    }
}""", "O((R - L + 1) log(log R) + sqrt(R))", "O(R - L + 1)"
    )
}
