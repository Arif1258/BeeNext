from .common import make_sol

BEGINNER_SOLUTIONS = {
    # --- Fundamentals of Programming ---
    "breaking-the-myth": make_sol(
        """public class Solution {
    // Foundational programming mindsets: step-by-step logic
    public static void main(String[] args) {
        System.out.println("DSA is problem solving, not memorization.");
    }
}""", "O(1)", "O(1)",
        """public class Solution {
    public static void main(String[] args) {
        System.out.println("DSA is problem solving, not memorization.");
    }
}""", "O(1)", "O(1)"
    ),

    "programming-and-what-are-computers": make_sol(
        """public class Solution {
    public static void compute(int a, int b) {
        int sum = a + b;
        System.out.println("CPU computation sum: " + sum);
    }
}""", "O(1)", "O(1)",
        """public class Solution {
    public static void compute(int a, int b) {
        System.out.println("CPU computation sum: " + (a + b));
    }
}""", "O(1)", "O(1)"
    ),

    "how-to-think-like-a-programmer": make_sol(
        """public class Solution {
    // Problem decomposition: break down big problem into sub-problems
    public static int solve(int n) {
        int total = 0;
        for (int i = 1; i <= n; i++) {
            total += i;
        }
        return total;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    // Formula based deduction
    public static int solve(int n) {
        return (n * (n + 1)) / 2;
    }
}""", "O(1)", "O(1)"
    ),

    "flowcharts-and-pseudocode": make_sol(
        """public class Solution {
    public static boolean isEven(int n) {
        // Flowchart decision block: n % 2 == 0
        if (n % 2 == 0) return true;
        else return false;
    }
}""", "O(1)", "O(1)",
        """public class Solution {
    public static boolean isEven(int n) {
        return (n & 1) == 0;
    }
}""", "O(1)", "O(1)"
    ),

    "flowchart-problem-solving": make_sol(
        """public class Solution {
    public static int findMax(int a, int b, int c) {
        if (a >= b && a >= c) return a;
        else if (b >= a && b >= c) return b;
        else return c;
    }
}""", "O(1)", "O(1)",
        """public class Solution {
    public static int findMax(int a, int b, int c) {
        return Math.max(a, Math.max(b, c));
    }
}""", "O(1)", "O(1)"
    ),

    "dry-runs-edge-cases-and-debugging": make_sol(
        """public class Solution {
    public static int safeDivide(int a, int b) {
        // Check edge cases: zero division
        if (b == 0) return -1;
        return a / b;
    }
}""", "O(1)", "O(1)",
        """public class Solution {
    public static int safeDivide(int a, int b) {
        if (b == 0) throw new ArithmeticException("Division by zero");
        return a / b;
    }
}""", "O(1)", "O(1)"
    ),

    "programming-languages-and-choosing-a-path": make_sol(
        """public class Solution {
    public static void main(String[] args) {
        System.out.println("Java: Robust, object-oriented, strongly-typed");
    }
}""", "O(1)", "O(1)",
        """public class Solution {
    public static void main(String[] args) {
        System.out.println("Java: Robust, object-oriented, strongly-typed");
    }
}""", "O(1)", "O(1)"
    ),

    # --- Language Basics ---
    "learn-cpp": make_sol(
        """public class Solution {
    // Equivalent Java IO demonstration
    public static void demoIO(int x) {
        System.out.println("Input value: " + x);
    }
}""", "O(1)", "O(1)",
        """public class Solution {
    public static void demoIO(int x) {
        System.out.println("Input value: " + x);
    }
}""", "O(1)", "O(1)"
    ),

    "learn-java": make_sol(
        """import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int val = sc.nextInt();
            System.out.println("Read: " + val);
        }
    }
}""", "O(1)", "O(1)",
        """import java.io.*;
import java.util.StringTokenizer;
public class Solution {
    // Fast IO template in Java
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line != null) System.out.println("Read: " + line.trim());
    }
}""", "O(1)", "O(1)"
    ),

    "learn-python": make_sol(
        """public class Solution {
    public static void printList(int[] arr) {
        for (int x : arr) System.out.print(x + " ");
        System.out.println();
    }
}""", "O(N)", "O(1)",
        """import java.util.Arrays;
public class Solution {
    public static void printList(int[] arr) {
        System.out.println(Arrays.toString(arr));
    }
}""", "O(N)", "O(N)"
    ),

    # --- Logic Building (Patterns) ---
    "easy-and-medium": make_sol(
        """public class Solution {
    public static void printGrid(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void printGrid(int n) {
        StringBuilder row = new StringBuilder();
        for (int j = 0; j < n; j++) row.append("* ");
        for (int i = 0; i < n; i++) System.out.println(row);
    }
}""", "O(N^2)", "O(N)"
    ),

    "hard": make_sol(
        """public class Solution {
    public static void printComplexPattern(int n) {
        for (int i = 0; i < 2 * n - 1; i++) {
            for (int j = 0; j < 2 * n - 1; j++) {
                int top = i, left = j, right = (2 * n - 2) - j, down = (2 * n - 2) - i;
                System.out.print((n - Math.min(Math.min(top, down), Math.min(left, right))) + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void printComplexPattern(int n) {
        for (int i = 0; i < 2 * n - 1; i++) {
            for (int j = 0; j < 2 * n - 1; j++) {
                int top = i, left = j, right = (2 * n - 2) - j, down = (2 * n - 2) - i;
                System.out.print((n - Math.min(Math.min(top, down), Math.min(left, right))) + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    # --- Patterns 1 to 22 ---
    "pattern-1": make_sol(
        """public class Solution {
    public static void pattern1(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) System.out.print("* ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern1(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) System.out.print("* ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-2": make_sol(
        """public class Solution {
    public static void pattern2(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j <= i; j++) System.out.print("* ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern2(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j <= i; j++) System.out.print("* ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-3": make_sol(
        """public class Solution {
    public static void pattern3(int n) {
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) System.out.print(j + " ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern3(int n) {
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) System.out.print(j + " ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-4": make_sol(
        """public class Solution {
    public static void pattern4(int n) {
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) System.out.print(i + " ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern4(int n) {
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) System.out.print(i + " ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-5": make_sol(
        """public class Solution {
    public static void pattern5(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i; j++) System.out.print("* ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern5(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i; j++) System.out.print("* ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-6": make_sol(
        """public class Solution {
    public static void pattern6(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 1; j <= n - i; j++) System.out.print(j + " ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern6(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 1; j <= n - i; j++) System.out.print(j + " ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-7": make_sol(
        """public class Solution {
    public static void pattern7(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) System.out.print(" ");
            for (int j = 0; j < 2 * i + 1; j++) System.out.print("*");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern7(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) System.out.print(" ");
            for (int j = 0; j < 2 * i + 1; j++) System.out.print("*");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-8": make_sol(
        """public class Solution {
    public static void pattern8(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) System.out.print(" ");
            for (int j = 0; j < 2 * (n - i) - 1; j++) System.out.print("*");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern8(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) System.out.print(" ");
            for (int j = 0; j < 2 * (n - i) - 1; j++) System.out.print("*");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-9": make_sol(
        """public class Solution {
    public static void pattern9(int n) {
        // Upper pyramid
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) System.out.print(" ");
            for (int j = 0; j < 2 * i + 1; j++) System.out.print("*");
            System.out.println();
        }
        // Inverted pyramid
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) System.out.print(" ");
            for (int j = 0; j < 2 * (n - i) - 1; j++) System.out.print("*");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern9(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) System.out.print(" ");
            for (int j = 0; j < 2 * i + 1; j++) System.out.print("*");
            System.out.println();
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) System.out.print(" ");
            for (int j = 0; j < 2 * (n - i) - 1; j++) System.out.print("*");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-10": make_sol(
        """public class Solution {
    public static void pattern10(int n) {
        for (int i = 1; i <= 2 * n - 1; i++) {
            int stars = i <= n ? i : 2 * n - i;
            for (int j = 1; j <= stars; j++) System.out.print("* ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern10(int n) {
        for (int i = 1; i <= 2 * n - 1; i++) {
            int stars = i <= n ? i : 2 * n - i;
            for (int j = 1; j <= stars; j++) System.out.print("* ");
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-11": make_sol(
        """public class Solution {
    public static void pattern11(int n) {
        int start = 1;
        for (int i = 0; i < n; i++) {
            start = (i % 2 == 0) ? 1 : 0;
            for (int j = 0; j <= i; j++) {
                System.out.print(start + " ");
                start = 1 - start;
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern11(int n) {
        for (int i = 0; i < n; i++) {
            int start = (i % 2 == 0) ? 1 : 0;
            for (int j = 0; j <= i; j++) {
                System.out.print(start + " ");
                start = 1 - start;
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-12": make_sol(
        """public class Solution {
    public static void pattern12(int n) {
        int spaces = 2 * (n - 1);
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) System.out.print(j);
            for (int j = 1; j <= spaces; j++) System.out.print(" ");
            for (int j = i; j >= 1; j--) System.out.print(j);
            System.out.println();
            spaces -= 2;
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern12(int n) {
        int spaces = 2 * (n - 1);
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) System.out.print(j);
            for (int j = 1; j <= spaces; j++) System.out.print(" ");
            for (int j = i; j >= 1; j--) System.out.print(j);
            System.out.println();
            spaces -= 2;
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-13": make_sol(
        """public class Solution {
    public static void pattern13(int n) {
        int num = 1;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(num + " ");
                num++;
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern13(int n) {
        int num = 1;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(num + " ");
                num++;
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-14": make_sol(
        """public class Solution {
    public static void pattern14(int n) {
        for (int i = 0; i < n; i++) {
            for (char ch = 'A'; ch <= 'A' + i; ch++) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern14(int n) {
        for (int i = 0; i < n; i++) {
            for (char ch = 'A'; ch <= 'A' + i; ch++) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-15": make_sol(
        """public class Solution {
    public static void pattern15(int n) {
        for (int i = 0; i < n; i++) {
            for (char ch = 'A'; ch <= 'A' + (n - i - 1); ch++) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern15(int n) {
        for (int i = 0; i < n; i++) {
            for (char ch = 'A'; ch <= 'A' + (n - i - 1); ch++) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-16": make_sol(
        """public class Solution {
    public static void pattern16(int n) {
        for (int i = 0; i < n; i++) {
            char ch = (char) ('A' + i);
            for (int j = 0; j <= i; j++) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern16(int n) {
        for (int i = 0; i < n; i++) {
            char ch = (char) ('A' + i);
            for (int j = 0; j <= i; j++) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-17": make_sol(
        """public class Solution {
    public static void pattern17(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) System.out.print(" ");
            char ch = 'A';
            int breakpoint = (2 * i + 1) / 2;
            for (int j = 1; j <= 2 * i + 1; j++) {
                System.out.print(ch);
                if (j <= breakpoint) ch++;
                else ch--;
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern17(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) System.out.print(" ");
            char ch = 'A';
            int breakpoint = (2 * i + 1) / 2;
            for (int j = 1; j <= 2 * i + 1; j++) {
                System.out.print(ch);
                if (j <= breakpoint) ch++;
                else ch--;
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-18": make_sol(
        """public class Solution {
    public static void pattern18(int n) {
        for (int i = 0; i < n; i++) {
            for (char ch = (char) ('A' + n - 1); ch >= (char) ('A' + n - 1 - i); ch--) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern18(int n) {
        for (int i = 0; i < n; i++) {
            for (char ch = (char) ('A' + n - 1); ch >= (char) ('A' + n - 1 - i); ch--) {
                System.out.print(ch + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-19": make_sol(
        """public class Solution {
    public static void pattern19(int n) {
        int iniS = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 1; j <= n - i; j++) System.out.print("*");
            for (int j = 0; j < iniS; j++) System.out.print(" ");
            for (int j = 1; j <= n - i; j++) System.out.print("*");
            iniS += 2;
            System.out.println();
        }
        iniS = 2 * n - 2;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) System.out.print("*");
            for (int j = 0; j < iniS; j++) System.out.print(" ");
            for (int j = 1; j <= i; j++) System.out.print("*");
            iniS -= 2;
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern19(int n) {
        int iniS = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 1; j <= n - i; j++) System.out.print("*");
            for (int j = 0; j < iniS; j++) System.out.print(" ");
            for (int j = 1; j <= n - i; j++) System.out.print("*");
            iniS += 2;
            System.out.println();
        }
        iniS = 2 * n - 2;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) System.out.print("*");
            for (int j = 0; j < iniS; j++) System.out.print(" ");
            for (int j = 1; j <= i; j++) System.out.print("*");
            iniS -= 2;
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-20": make_sol(
        """public class Solution {
    public static void pattern20(int n) {
        int spaces = 2 * n - 2;
        for (int i = 1; i <= 2 * n - 1; i++) {
            int stars = i <= n ? i : 2 * n - i;
            for (int j = 1; j <= stars; j++) System.out.print("*");
            for (int j = 1; j <= spaces; j++) System.out.print(" ");
            for (int j = 1; j <= stars; j++) System.out.print("*");
            System.out.println();
            if (i < n) spaces -= 2;
            else spaces += 2;
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern20(int n) {
        int spaces = 2 * n - 2;
        for (int i = 1; i <= 2 * n - 1; i++) {
            int stars = i <= n ? i : 2 * n - i;
            for (int j = 1; j <= stars; j++) System.out.print("*");
            for (int j = 1; j <= spaces; j++) System.out.print(" ");
            for (int j = 1; j <= stars; j++) System.out.print("*");
            System.out.println();
            if (i < n) spaces -= 2;
            else spaces += 2;
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-21": make_sol(
        """public class Solution {
    public static void pattern21(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == 0 || j == 0 || i == n - 1 || j == n - 1) System.out.print("*");
                else System.out.print(" ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern21(int n) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == 0 || j == 0 || i == n - 1 || j == n - 1) System.out.print("*");
                else System.out.print(" ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    "pattern-22": make_sol(
        """public class Solution {
    public static void pattern22(int n) {
        for (int i = 0; i < 2 * n - 1; i++) {
            for (int j = 0; j < 2 * n - 1; j++) {
                int top = i, left = j, right = (2 * n - 2) - j, down = (2 * n - 2) - i;
                System.out.print((n - Math.min(Math.min(top, down), Math.min(left, right))) + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static void pattern22(int n) {
        for (int i = 0; i < 2 * n - 1; i++) {
            for (int j = 0; j < 2 * n - 1; j++) {
                int top = i, left = j, right = (2 * n - 2) - j, down = (2 * n - 2) - i;
                System.out.print((n - Math.min(Math.min(top, down), Math.min(left, right))) + " ");
            }
            System.out.println();
        }
    }
}""", "O(N^2)", "O(1)"
    ),

    # --- Time Complexity ---
    "theory-with-examples": make_sol(
        """public class Solution {
    // Demonstration of linear vs quadratic complexity
    public static int linearSum(int[] arr) {
        int sum = 0;
        for (int x : arr) sum += x;
        return sum;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int linearSum(int[] arr) {
        int sum = 0;
        for (int x : arr) sum += x;
        return sum;
    }
}""", "O(N)", "O(1)"
    ),

    # --- Standard Libraries & Collections ---
    "stl": make_sol(
        """import java.util.*;
public class Solution {
    public static void demoCollections() {
        List<Integer> list = new ArrayList<>();
        list.add(3); list.add(1); list.add(2);
        Collections.sort(list);
        System.out.println(list);
    }
}""", "O(N log N)", "O(N)",
        """import java.util.*;
public class Solution {
    public static void demoCollections() {
        List<Integer> list = new ArrayList<>(Arrays.asList(3, 1, 2));
        Collections.sort(list);
        System.out.println(list);
    }
}""", "O(N log N)", "O(N)"
    ),

    "java-collections": make_sol(
        """import java.util.*;
public class Solution {
    public static void demoMapAndSet() {
        Set<Integer> set = new HashSet<>();
        set.add(10); set.add(20);
        Map<String, Integer> map = new HashMap<>();
        map.put("A", 1);
        System.out.println("Set size: " + set.size() + ", Map: " + map);
    }
}""", "O(1)", "O(N)",
        """import java.util.*;
public class Solution {
    public static void demoMapAndSet() {
        Set<Integer> set = new HashSet<>(Arrays.asList(10, 20));
        Map<String, Integer> map = new HashMap<>();
        map.put("A", 1);
        System.out.println("Set size: " + set.size() + ", Map: " + map);
    }
}""", "O(1)", "O(N)"
    ),

    "python-libraries-part-1": make_sol(
        """import java.util.*;
public class Solution {
    public static void demoHeap() {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.offer(5); pq.offer(1); pq.offer(3);
        while (!pq.isEmpty()) System.out.print(pq.poll() + " ");
    }
}""", "O(N log N)", "O(N)",
        """import java.util.*;
public class Solution {
    public static void demoHeap() {
        PriorityQueue<Integer> pq = new PriorityQueue<>(Arrays.asList(5, 1, 3));
        while (!pq.isEmpty()) System.out.print(pq.poll() + " ");
    }
}""", "O(N log N)", "O(N)"
    ),

    "python-libraries-part-2": make_sol(
        """import java.util.*;
public class Solution {
    public static void demoDeque() {
        Deque<Integer> dq = new ArrayDeque<>();
        dq.addFirst(1); dq.addLast(2);
        System.out.println(dq.pollFirst() + " " + dq.pollLast());
    }
}""", "O(1)", "O(N)",
        """import java.util.*;
public class Solution {
    public static void demoDeque() {
        Deque<Integer> dq = new ArrayDeque<>();
        dq.addFirst(1); dq.addLast(2);
        System.out.println(dq.pollFirst() + " " + dq.pollLast());
    }
}""", "O(1)", "O(N)"
    ),

    # --- Concept Basics ---
    "basic-maths": make_sol(
        """public class Solution {
    public static int countDigits(int n) {
        int cnt = 0;
        while (n > 0) {
            cnt++;
            n /= 10;
        }
        return cnt;
    }
}""", "O(log10 N)", "O(1)",
        """public class Solution {
    public static int countDigits(int n) {
        if (n == 0) return 1;
        return (int) Math.log10(n) + 1;
    }
}""", "O(1)", "O(1)"
    ),

    "basic-arrays-hashing-and-strings": make_sol(
        """public class Solution {
    public static int arraySum(int[] arr) {
        int s = 0;
        for (int x : arr) s += x;
        return s;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int arraySum(int[] arr) {
        int s = 0;
        for (int x : arr) s += x;
        return s;
    }
}""", "O(N)", "O(1)"
    ),

    "basic-hashing": make_sol(
        """import java.util.HashMap;
public class Solution {
    public static void frequency(int[] arr) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int x : arr) map.put(x, map.getOrDefault(x, 0) + 1);
        System.out.println(map);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static void frequency(int[] arr) {
        int max = 0;
        for (int x : arr) max = Math.max(max, x);
        int[] hash = new int[max + 1];
        for (int x : arr) hash[x]++;
    }
}""", "O(N + maxVal)", "O(maxVal)"
    ),

    "beginner-basic-hashing": make_sol(
        """import java.util.HashMap;
public class Solution {
    public static void frequency(int[] arr) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int x : arr) map.put(x, map.getOrDefault(x, 0) + 1);
        System.out.println(map);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static void frequency(int[] arr) {
        int max = 0;
        for (int x : arr) max = Math.max(max, x);
        int[] hash = new int[max + 1];
        for (int x : arr) hash[x]++;
    }
}""", "O(N + maxVal)", "O(maxVal)"
    ),

    "basic-string": make_sol(
        """public class Solution {
    public static boolean isPalindrome(String s) {
        String rev = "";
        for (int i = s.length() - 1; i >= 0; i--) rev += s.charAt(i);
        return s.equals(rev);
    }
}""", "O(N^2)", "O(N)",
        """public class Solution {
    public static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left++) != s.charAt(right--)) return false;
        }
        return true;
    }
}""", "O(N)", "O(1)"
    ),

    # --- Basic Maths ---
    "count-all-digits-of-a-number": make_sol(
        """public class Solution {
    public static int countDigit(int n) {
        int cnt = 0;
        while (n > 0) {
            cnt++;
            n /= 10;
        }
        return cnt;
    }
}""", "O(log10 N)", "O(1)",
        """public class Solution {
    public static int countDigit(int n) {
        if (n == 0) return 1;
        return (int) Math.log10(n) + 1;
    }
}""", "O(1)", "O(1)"
    ),

    "count-number-of-odd-digits-in-a-number": make_sol(
        """public class Solution {
    public static int countOddDigits(int n) {
        int cnt = 0;
        while (n > 0) {
            int digit = n % 10;
            if (digit % 2 != 0) cnt++;
            n /= 10;
        }
        return cnt;
    }
}""", "O(log10 N)", "O(1)",
        """public class Solution {
    public static int countOddDigits(int n) {
        int cnt = 0;
        while (n > 0) {
            if ((n % 10) % 2 != 0) cnt++;
            n /= 10;
        }
        return cnt;
    }
}""", "O(log10 N)", "O(1)"
    ),

    "reverse-a-number": make_sol(
        """public class Solution {
    public int reverse(int x) {
        long rev = 0;
        while (x != 0) {
            rev = rev * 10 + x % 10;
            x /= 10;
        }
        if (rev > Integer.MAX_VALUE || rev < Integer.MIN_VALUE) return 0;
        return (int) rev;
    }
}""", "O(log10 N)", "O(1)",
        """public class Solution {
    public int reverse(int x) {
        int rev = 0;
        while (x != 0) {
            int pop = x % 10;
            x /= 10;
            if (rev > Integer.MAX_VALUE / 10 || (rev == Integer.MAX_VALUE / 10 && pop > 7)) return 0;
            if (rev < Integer.MIN_VALUE / 10 || (rev == Integer.MIN_VALUE / 10 && pop < -8)) return 0;
            rev = rev * 10 + pop;
        }
        return rev;
    }
}""", "O(log10 N)", "O(1)"
    ),

    "palindrome-number": make_sol(
        """public class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0) return false;
        String s = Integer.toString(x);
        String rev = new StringBuilder(s).reverse().toString();
        return s.equals(rev);
    }
}""", "O(log10 N)", "O(log10 N)",
        """public class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) return false;
        int revertedNumber = 0;
        while (x > revertedNumber) {
            revertedNumber = revertedNumber * 10 + x % 10;
            x /= 10;
        }
        return x == revertedNumber || x == revertedNumber / 10;
    }
}""", "O(log10 N)", "O(1)"
    ),

    "return-the-largest-digit-in-a-number": make_sol(
        """public class Solution {
    public static int largestDigit(int n) {
        int maxD = 0;
        while (n > 0) {
            maxD = Math.max(maxD, n % 10);
            n /= 10;
        }
        return maxD;
    }
}""", "O(log10 N)", "O(1)",
        """public class Solution {
    public static int largestDigit(int n) {
        int maxD = 0;
        while (n > 0) {
            int d = n % 10;
            if (d == 9) return 9;
            if (d > maxD) maxD = d;
            n /= 10;
        }
        return maxD;
    }
}""", "O(log10 N)", "O(1)"
    ),

    "factorial-of-a-given-number-i": make_sol(
        """public class Solution {
    public static long factorial(int n) {
        long ans = 1;
        for (int i = 1; i <= n; i++) ans *= i;
        return ans;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static long factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}""", "O(N)", "O(N)"
    ),

    "check-if-the-number-if-armstrong": make_sol(
        """public class Solution {
    public static boolean checkArmstrong(int n) {
        int temp = n, sum = 0, k = String.valueOf(n).length();
        while (temp > 0) {
            int ld = temp % 10;
            sum += Math.pow(ld, k);
            temp /= 10;
        }
        return sum == n;
    }
}""", "O(log10 N)", "O(1)",
        """public class Solution {
    public static boolean checkArmstrong(int n) {
        int count = 0, temp = n;
        while (temp > 0) { count++; temp /= 10; }
        temp = n;
        int sum = 0;
        while (temp > 0) {
            int ld = temp % 10;
            int pow = 1;
            for (int i = 0; i < count; i++) pow *= ld;
            sum += pow;
            temp /= 10;
        }
        return sum == n;
    }
}""", "O(log10 N)", "O(1)"
    ),

    "check-for-perfect-number": make_sol(
        """public class Solution {
    public boolean checkPerfectNumber(int num) {
        if (num <= 1) return false;
        int sum = 0;
        for (int i = 1; i < num; i++) {
            if (num % i == 0) sum += i;
        }
        return sum == num;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public boolean checkPerfectNumber(int num) {
        if (num <= 1) return false;
        int sum = 1;
        for (int i = 2; i * i <= num; i++) {
            if (num % i == 0) {
                sum += i;
                if (i * i != num) sum += num / i;
            }
        }
        return sum == num;
    }
}""", "O(sqrt(N))", "O(1)"
    ),

    "check-for-prime-number": make_sol(
        """public class Solution {
    public static boolean isPrime(int n) {
        if (n <= 1) return false;
        for (int i = 2; i < n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static boolean isPrime(int n) {
        if (n <= 1) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}""", "O(sqrt(N))", "O(1)"
    ),

    "count-of-prime-numbers-till-n": make_sol(
        """public class Solution {
    public int countPrimes(int n) {
        int cnt = 0;
        for (int i = 2; i < n; i++) {
            if (isPrime(i)) cnt++;
        }
        return cnt;
    }
    private boolean isPrime(int x) {
        for (int i = 2; i * i <= x; i++) {
            if (x % i == 0) return false;
        }
        return true;
    }
}""", "O(N * sqrt(N))", "O(1)",
        """import java.util.Arrays;
public class Solution {
    public int countPrimes(int n) {
        if (n <= 2) return 0;
        boolean[] isPrime = new boolean[n];
        Arrays.fill(isPrime, true);
        int cnt = 0;
        for (int p = 2; p * p < n; p++) {
            if (isPrime[p]) {
                for (int i = p * p; i < n; i += p) isPrime[i] = false;
            }
        }
        for (int i = 2; i < n; i++) if (isPrime[i]) cnt++;
        return cnt;
    }
}""", "O(N log log N)", "O(N)"
    ),

    "gcd-of-two-numbers": make_sol(
        """public class Solution {
    public static int gcd(int a, int b) {
        int ans = 1;
        for (int i = 1; i <= Math.min(a, b); i++) {
            if (a % i == 0 && b % i == 0) ans = i;
        }
        return ans;
    }
}""", "O(min(A, B))", "O(1)",
        """public class Solution {
    public static int gcd(int a, int b) {
        while (a > 0 && b > 0) {
            if (a > b) a = a % b;
            else b = b % a;
        }
        return (a == 0) ? b : a;
    }
}""", "O(log(min(A, B)))", "O(1)"
    ),

    "lcm-of-two-numbers": make_sol(
        """public class Solution {
    public static long lcm(long a, long b) {
        long max = Math.max(a, b);
        while (true) {
            if (max % a == 0 && max % b == 0) return max;
            max++;
        }
    }
}""", "O(A * B)", "O(1)",
        """public class Solution {
    public static long lcm(long a, long b) {
        return (a / gcd(a, b)) * b;
    }
    private static long gcd(long a, long b) {
        while (b != 0) {
            long temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
}""", "O(log(min(A, B)))", "O(1)"
    ),

    "divisors-of-a-number": make_sol(
        """import java.util.*;
public class Solution {
    public static List<Integer> printDivisors(int n) {
        List<Integer> list = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (n % i == 0) list.add(i);
        }
        return list;
    }
}""", "O(N)", "O(1)",
        """import java.util.*;
public class Solution {
    public static List<Integer> printDivisors(int n) {
        List<Integer> list = new ArrayList<>();
        for (int i = 1; i * i <= n; i++) {
            if (n % i == 0) {
                list.add(i);
                if (i * i != n) list.add(n / i);
            }
        }
        Collections.sort(list);
        return list;
    }
}""", "O(sqrt(N))", "O(sqrt(N))"
    ),

    # --- Basic Arrays ---
    "sum-of-array-elements": make_sol(
        """public class Solution {
    public static int sum(int[] arr, int n) {
        int s = 0;
        for (int i = 0; i < n; i++) s += arr[i];
        return s;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int sum(int[] arr, int n) {
        int s = 0;
        for (int x : arr) s += x;
        return s;
    }
}""", "O(N)", "O(1)"
    ),

    "count-of-odd-numbers-in-array": make_sol(
        """public class Solution {
    public static int countOdd(int[] arr, int n) {
        int cnt = 0;
        for (int i = 0; i < n; i++) {
            if (arr[i] % 2 != 0) cnt++;
        }
        return cnt;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int countOdd(int[] arr, int n) {
        int cnt = 0;
        for (int x : arr) {
            if ((x & 1) != 0) cnt++;
        }
        return cnt;
    }
}""", "O(N)", "O(1)"
    ),

    "check-if-the-array-is-sorted-i": make_sol(
        """public class Solution {
    public static boolean isSorted(int n, int []a) {
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (a[j] < a[i]) return false;
            }
        }
        return true;
    }
}""", "O(N^2)", "O(1)",
        """public class Solution {
    public static boolean isSorted(int n, int []a) {
        for (int i = 1; i < n; i++) {
            if (a[i] < a[i - 1]) return false;
        }
        return true;
    }
}""", "O(N)", "O(1)"
    ),

    "reverse-an-array": make_sol(
        """public class Solution {
    public static void reverseArray(int arr[]) {
        int n = arr.length;
        int[] temp = new int[n];
        for (int i = 0; i < n; i++) temp[i] = arr[n - 1 - i];
        for (int i = 0; i < n; i++) arr[i] = temp[i];
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static void reverseArray(int arr[]) {
        int left = 0, right = arr.length - 1;
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++; right--;
        }
    }
}""", "O(N)", "O(1)"
    ),

    # --- Basic Hashing ---
    "highest-occurring-element-in-an-array": make_sol(
        """public class Solution {
    public static int mostFrequentElement(int[] nums) {
        int maxFreq = 0, ans = nums[0];
        for (int i = 0; i < nums.length; i++) {
            int count = 0;
            for (int j = 0; j < nums.length; j++) {
                if (nums[j] == nums[i]) count++;
            }
            if (count > maxFreq) {
                maxFreq = count;
                ans = nums[i];
            }
        }
        return ans;
    }
}""", "O(N^2)", "O(1)",
        """import java.util.*;
public class Solution {
    public static int mostFrequentElement(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1);
        int maxFreq = 0, ans = nums[0];
        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            if (entry.getValue() > maxFreq || (entry.getValue() == maxFreq && entry.getKey() < ans)) {
                maxFreq = entry.getValue();
                ans = entry.getKey();
            }
        }
        return ans;
    }
}""", "O(N)", "O(N)"
    ),

    "second-highest-occurring-element": make_sol(
        """import java.util.*;
public class Solution {
    public static int secondMostFrequentElement(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1);
        int maxF = 0, secondMaxF = 0;
        for (int freq : map.values()) {
            if (freq > maxF) { secondMaxF = maxF; maxF = freq; }
            else if (freq > secondMaxF && freq < maxF) secondMaxF = freq;
        }
        int ans = -1;
        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            if (entry.getValue() == secondMaxF) {
                if (ans == -1 || entry.getKey() < ans) ans = entry.getKey();
            }
        }
        return ans;
    }
}""", "O(N)", "O(N)",
        """import java.util.*;
public class Solution {
    public static int secondMostFrequentElement(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1);
        int maxF = 0, secondMaxF = 0;
        for (int freq : map.values()) {
            if (freq > maxF) { secondMaxF = maxF; maxF = freq; }
            else if (freq > secondMaxF && freq < maxF) secondMaxF = freq;
        }
        int ans = -1;
        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            if (entry.getValue() == secondMaxF) {
                if (ans == -1 || entry.getKey() < ans) ans = entry.getKey();
            }
        }
        return ans;
    }
}""", "O(N)", "O(N)"
    ),

    "sum-of-highest-and-lowest-frequency": make_sol(
        """import java.util.*;
public class Solution {
    public static int sumHighestAndLowestFreq(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1);
        int maxF = 0, minF = Integer.MAX_VALUE;
        for (int freq : map.values()) {
            maxF = Math.max(maxF, freq);
            minF = Math.min(minF, freq);
        }
        return maxF + minF;
    }
}""", "O(N)", "O(N)",
        """import java.util.*;
public class Solution {
    public static int sumHighestAndLowestFreq(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1);
        int maxF = 0, minF = Integer.MAX_VALUE;
        for (int freq : map.values()) {
            maxF = Math.max(maxF, freq);
            minF = Math.min(minF, freq);
        }
        return maxF + minF;
    }
}""", "O(N)", "O(N)"
    ),

    # --- Basic Strings ---
    "reverse-a-string-ii": make_sol(
        """public class Solution {
    public String reverseStr(String s, int k) {
        char[] a = s.toCharArray();
        for (int start = 0; start < a.length; start += 2 * k) {
            int i = start, j = Math.min(start + k - 1, a.length - 1);
            while (i < j) {
                char tmp = a[i];
                a[i++] = a[j];
                a[j--] = tmp;
            }
        }
        return new String(a);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public String reverseStr(String s, int k) {
        char[] a = s.toCharArray();
        for (int start = 0; start < a.length; start += 2 * k) {
            int i = start, j = Math.min(start + k - 1, a.length - 1);
            while (i < j) {
                char tmp = a[i];
                a[i++] = a[j];
                a[j--] = tmp;
            }
        }
        return new String(a);
    }
}""", "O(N)", "O(N)"
    ),

    "palindrome-check": make_sol(
        """public class Solution {
    public boolean isPalindrome(String s) {
        StringBuilder filtered = new StringBuilder();
        for (char ch : s.toCharArray()) {
            if (Character.isLetterOrDigit(ch)) filtered.append(Character.toLowerCase(ch));
        }
        String orig = filtered.toString();
        String rev = filtered.reverse().toString();
        return orig.equals(rev);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public boolean isPalindrome(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
            while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
            if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;
            i++; j--;
        }
        return true;
    }
}""", "O(N)", "O(1)"
    ),

    "largest-odd-number-in-a-string": make_sol(
        """public class Solution {
    public String largestOddNumber(String num) {
        for (int i = num.length() - 1; i >= 0; i--) {
            int d = num.charAt(i) - '0';
            if (d % 2 != 0) return num.substring(0, i + 1);
        }
        return "";
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public String largestOddNumber(String num) {
        for (int i = num.length() - 1; i >= 0; i--) {
            if ((num.charAt(i) - '0') % 2 != 0) {
                return num.substring(0, i + 1);
            }
        }
        return "";
    }
}""", "O(N)", "O(1)"
    ),

    "longest-common-prefix": make_sol(
        """public class Solution {
    public String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) return "";
        String prefix = strs[0];
        for (int i = 1; i < strs.length; i++) {
            while (strs[i].indexOf(prefix) != 0) {
                prefix = prefix.substring(0, prefix.length() - 1);
                if (prefix.isEmpty()) return "";
            }
        }
        return prefix;
    }
}""", "O(S)", "O(1)",
        """import java.util.Arrays;
public class Solution {
    public String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) return "";
        Arrays.sort(strs);
        String s1 = strs[0], s2 = strs[strs.length - 1];
        int idx = 0;
        while (idx < s1.length() && idx < s2.length() && s1.charAt(idx) == s2.charAt(idx)) {
            idx++;
        }
        return s1.substring(0, idx);
    }
}""", "O(N log N * M)", "O(1)"
    ),

    "isomorphic-string": make_sol(
        """import java.util.HashMap;
public class Solution {
    public boolean isIsomorphic(String s, String t) {
        if (s.length() != t.length()) return false;
        HashMap<Character, Character> m1 = new HashMap<>();
        HashMap<Character, Character> m2 = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char c1 = s.charAt(i), c2 = t.charAt(i);
            if (m1.containsKey(c1) && m1.get(c1) != c2) return false;
            if (m2.containsKey(c2) && m2.get(c2) != c1) return false;
            m1.put(c1, c2);
            m2.put(c2, c1);
        }
        return true;
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public boolean isIsomorphic(String s, String t) {
        int[] m1 = new int[256], m2 = new int[256];
        for (int i = 0; i < s.length(); i++) {
            if (m1[s.charAt(i)] != m2[t.charAt(i)]) return false;
            m1[s.charAt(i)] = i + 1;
            m2[t.charAt(i)] = i + 1;
        }
        return true;
    }
}""", "O(N)", "O(1)"
    ),

    "rotate-string": make_sol(
        """public class Solution {
    public boolean rotateString(String s, String goal) {
        if (s.length() != goal.length()) return false;
        for (int i = 0; i < s.length(); i++) {
            String rotated = s.substring(i) + s.substring(0, i);
            if (rotated.equals(goal)) return true;
        }
        return false;
    }
}""", "O(N^2)", "O(N)",
        """public class Solution {
    public boolean rotateString(String s, String goal) {
        return s.length() == goal.length() && (s + s).contains(goal);
    }
}""", "O(N)", "O(N)"
    ),

    "valid-anagram": make_sol(
        """import java.util.Arrays;
public class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        char[] sArr = s.toCharArray(), tArr = t.toCharArray();
        Arrays.sort(sArr);
        Arrays.sort(tArr);
        return Arrays.equals(sArr, tArr);
    }
}""", "O(N log N)", "O(N)",
        """public class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] counts = new int[26];
        for (int i = 0; i < s.length(); i++) {
            counts[s.charAt(i) - 'a']++;
            counts[t.charAt(i) - 'a']--;
        }
        for (int c : counts) if (c != 0) return false;
        return true;
    }
}""", "O(N)", "O(1)"
    ),

    "sort-characters-by-frequency": make_sol(
        """import java.util.*;
public class Solution {
    public String frequencySort(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) counts.put(c, counts.getOrDefault(c, 0) + 1);
        List<Character> list = new ArrayList<>(counts.keySet());
        list.sort((a, b) -> counts.get(b) - counts.get(a));
        StringBuilder sb = new StringBuilder();
        for (char c : list) {
            int freq = counts.get(c);
            for (int i = 0; i < freq; i++) sb.append(c);
        }
        return sb.toString();
    }
}""", "O(N log K)", "O(N)",
        """import java.util.*;
public class Solution {
    public String frequencySort(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) counts.put(c, counts.getOrDefault(c, 0) + 1);
        List<Character>[] buckets = new List[s.length() + 1];
        for (char c : counts.keySet()) {
            int freq = counts.get(c);
            if (buckets[freq] == null) buckets[freq] = new ArrayList<>();
            buckets[freq].add(c);
        }
        StringBuilder sb = new StringBuilder();
        for (int i = buckets.length - 1; i >= 1; i--) {
            if (buckets[i] != null) {
                for (char c : buckets[i]) {
                    for (int j = 0; j < i; j++) sb.append(c);
                }
            }
        }
        return sb.toString();
    }
}""", "O(N)", "O(N)"
    ),

    # --- Basic Recursion ---
    "recursion-theory": make_sol(
        """public class Solution {
    // Demonstration of base condition and stack unwinding
    public static void print1ToN(int i, int n) {
        if (i > n) return;
        System.out.print(i + " ");
        print1ToN(i + 1, n);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static void print1ToN(int n) {
        for (int i = 1; i <= n; i++) System.out.print(i + " ");
    }
}""", "O(N)", "O(1)"
    ),

    "recursion-concepts-with-parameters": make_sol(
        """public class Solution {
    // Parameterized recursion
    public static void printSum(int i, int sum) {
        if (i < 1) {
            System.out.println(sum);
            return;
        }
        printSum(i - 1, sum + i);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    // Functional recursion
    public static int sumN(int n) {
        if (n == 0) return 0;
        return n + sumN(n - 1);
    }
}""", "O(N)", "O(N)"
    ),

    "sum-of-first-n-numbers": make_sol(
        """public class Solution {
    public static long sumFirstN(long n) {
        if (n == 0) return 0;
        return n + sumFirstN(n - 1);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static long sumFirstN(long n) {
        return (n * (n + 1)) / 2;
    }
}""", "O(1)", "O(1)"
    ),

    "factorial-of-a-given-number-ii": make_sol(
        """public class Solution {
    public static long factorial(long n) {
        long ans = 1;
        for (int i = 1; i <= n; i++) ans *= i;
        return ans;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static long factorial(long n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}""", "O(N)", "O(N)"
    ),

    "sum-of-array-elements-ii": make_sol(
        """public class Solution {
    public static int arraySum(int[] arr, int n) {
        int s = 0;
        for (int x : arr) s += x;
        return s;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int arraySum(int[] arr, int n) {
        return solve(0, arr);
    }
    private static int solve(int i, int[] arr) {
        if (i == arr.length) return 0;
        return arr[i] + solve(i + 1, arr);
    }
}""", "O(N)", "O(N)"
    ),

    "reverse-a-string-i": make_sol(
        """public class Solution {
    public static String reverseString(String s) {
        char[] arr = s.toCharArray();
        int left = 0, right = arr.length - 1;
        while (left < right) {
            char t = arr[left]; arr[left] = arr[right]; arr[right] = t;
            left++; right--;
        }
        return new String(arr);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static String reverseString(String s) {
        char[] arr = s.toCharArray();
        rev(0, arr.length - 1, arr);
        return new String(arr);
    }
    private static void rev(int l, int r, char[] arr) {
        if (l >= r) return;
        char t = arr[l]; arr[l] = arr[r]; arr[r] = t;
        rev(l + 1, r - 1, arr);
    }
}""", "O(N)", "O(N)"
    ),

    "check-if-string-is-palindrome-or-not-": make_sol(
        """public class Solution {
    public static boolean isPalindrome(String s) {
        String rev = new StringBuilder(s).reverse().toString();
        return s.equals(rev);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static boolean isPalindrome(String s) {
        return check(0, s);
    }
    private static boolean check(int i, String s) {
        if (i >= s.length() / 2) return true;
        if (s.charAt(i) != s.charAt(s.length() - i - 1)) return false;
        return check(i + 1, s);
    }
}""", "O(N)", "O(N)"
    ),

    "check-if-a-number-is-prime-or-not": make_sol(
        """public class Solution {
    public static boolean isPrime(int n) {
        if (n <= 1) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}""", "O(sqrt(N))", "O(1)",
        """public class Solution {
    public static boolean isPrime(int n) {
        if (n <= 1) return false;
        return checkPrime(2, n);
    }
    private static boolean checkPrime(int i, int n) {
        if (i * i > n) return true;
        if (n % i == 0) return false;
        return checkPrime(i + 1, n);
    }
}""", "O(sqrt(N))", "O(sqrt(N))"
    ),

    "reverse-an-array-ii": make_sol(
        """public class Solution {
    public static void reverseArray(int[] arr) {
        int l = 0, r = arr.length - 1;
        while (l < r) {
            int t = arr[l]; arr[l] = arr[r]; arr[r] = t;
            l++; r--;
        }
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static void reverseArray(int[] arr) {
        rev(0, arr.length - 1, arr);
    }
    private static void rev(int l, int r, int[] arr) {
        if (l >= r) return;
        int t = arr[l]; arr[l] = arr[r]; arr[r] = t;
        rev(l + 1, r - 1, arr);
    }
}""", "O(N)", "O(N)"
    ),

    "check-if-the-array-is-sorted-ii": make_sol(
        """public class Solution {
    public static boolean isSorted(int[] arr, int n) {
        for (int i = 1; i < n; i++) {
            if (arr[i] < arr[i - 1]) return false;
        }
        return true;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static boolean isSorted(int[] arr, int n) {
        return check(0, arr, n);
    }
    private static boolean check(int i, int[] arr, int n) {
        if (i >= n - 1) return true;
        if (arr[i] > arr[i + 1]) return false;
        return check(i + 1, arr, n);
    }
}""", "O(N)", "O(N)"
    ),

    "sum-of-digits-in-a-given-number": make_sol(
        """public class Solution {
    public static int sumOfDigits(int n) {
        int sum = 0;
        while (n > 0) {
            sum += n % 10;
            n /= 10;
        }
        return sum;
    }
}""", "O(log10 N)", "O(1)",
        """public class Solution {
    public static int sumOfDigits(int n) {
        if (n == 0) return 0;
        return (n % 10) + sumOfDigits(n / 10);
    }
}""", "O(log10 N)", "O(log10 N)"
    ),

    "fibonacci-number": make_sol(
        """public class Solution {
    public int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }
}""", "O(2^N)", "O(N)",
        """public class Solution {
    public int fib(int n) {
        if (n <= 1) return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
}""", "O(N)", "O(1)"
    )
}
