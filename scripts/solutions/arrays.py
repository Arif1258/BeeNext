from .common import make_sol

ARRAYS_SOLUTIONS = {
    "linear-search": make_sol(
        """public class Solution {
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i;
            }
        }
        return -1;
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i;
            }
        }
        return -1;
    }
}""", "O(N)", "O(1)"
    ),

    "largest-element": make_sol(
        """import java.util.Arrays;

public class Solution {
    public static int largestElement(int[] arr) {
        Arrays.sort(arr);
        return arr[arr.length - 1];
    }
}""", "O(N log N)", "O(1)",
        """public class Solution {
    public static int largestElement(int[] arr) {
        int max = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
        return max;
    }
}""", "O(N)", "O(1)"
    ),

    "second-largest-element": make_sol(
        """import java.util.Arrays;

public class Solution {
    public static int secondLargest(int[] arr) {
        Arrays.sort(arr);
        int n = arr.length;
        for (int i = n - 2; i >= 0; i--) {
            if (arr[i] != arr[n - 1]) {
                return arr[i];
            }
        }
        return -1;
    }
}""", "O(N log N)", "O(1)",
        """public class Solution {
    public static int secondLargest(int[] arr) {
        int largest = -1;
        int secondLargest = -1;
        for (int x : arr) {
            if (x > largest) {
                secondLargest = largest;
                largest = x;
            } else if (x > secondLargest && x != largest) {
                secondLargest = x;
            }
        }
        return secondLargest;
    }
}""", "O(N)", "O(1)"
    ),

    "maximum-consecutive-ones": make_sol(
        """public class Solution {
    public static int findMaxConsecutiveOnes(int[] nums) {
        int max = 0;
        for (int i = 0; i < nums.length; i++) {
            int current = 0;
            for (int j = i; j < nums.length; j++) {
                if (nums[j] == 1) current++;
                else break;
            }
            max = Math.max(max, current);
        }
        return max;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int findMaxConsecutiveOnes(int[] nums) {
        int maxCount = 0;
        int count = 0;
        for (int num : nums) {
            if (num == 1) {
                count++;
                maxCount = Math.max(maxCount, count);
            } else {
                count = 0;
            }
        }
        return maxCount;
    }
}""", "O(N)", "O(1)"
    ),

    "left-rotate-array-by-one": make_sol(
        """public class Solution {
    public static void rotate(int[] arr) {
        int[] temp = new int[arr.length];
        for (int i = 1; i < arr.length; i++) {
            temp[i - 1] = arr[i];
        }
        temp[arr.length - 1] = arr[0];
        System.arraycopy(temp, 0, arr, 0, arr.length);
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static void rotate(int[] arr) {
        int temp = arr[0];
        for (int i = 1; i < arr.length; i++) {
            arr[i - 1] = arr[i];
        }
        arr[arr.length - 1] = temp;
    }
}""", "O(N)", "O(1)"
    ),

    "left-rotate-array": make_sol(
        """public class Solution {
    public static void rotate(int[] nums, int k) {
        int n = nums.length;
        k %= n;
        int[] temp = new int[k];
        for (int i = 0; i < k; i++) temp[i] = nums[i];
        for (int i = k; i < n; i++) nums[i - k] = nums[i];
        for (int i = 0; i < k; i++) nums[n - k + i] = temp[i];
    }
}""", "O(N)", "O(K)",
        """public class Solution {
    public static void rotate(int[] nums, int k) {
        int n = nums.length;
        k %= n;
        reverse(nums, 0, k - 1);
        reverse(nums, k, n - 1);
        reverse(nums, 0, n - 1);
    }

    private static void reverse(int[] nums, int start, int end) {
        while (start < end) {
            int temp = nums[start];
            nums[start++] = nums[end];
            nums[end--] = temp;
        }
    }
}""", "O(N)", "O(1)"
    ),

    "move-zeros-to-end": make_sol(
        """import java.util.ArrayList;

public class Solution {
    public static void moveZeroes(int[] nums) {
        ArrayList<Integer> temp = new ArrayList<>();
        for (int num : nums) {
            if (num != 0) temp.add(num);
        }
        for (int i = 0; i < temp.size(); i++) {
            nums[i] = temp.get(i);
        }
        for (int i = temp.size(); i < nums.length; i++) {
            nums[i] = 0;
        }
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static void moveZeroes(int[] nums) {
        int j = -1;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] == 0) {
                j = i;
                break;
            }
        }
        if (j == -1) return;
        for (int i = j + 1; i < nums.length; i++) {
            if (nums[i] != 0) {
                int temp = nums[i];
                nums[i] = nums[j];
                nums[j] = temp;
                j++;
            }
        }
    }
}""", "O(N)", "O(1)"
    ),

    "remove-duplicates-from-sorted-array": make_sol(
        """import java.util.HashSet;

public class Solution {
    public static int removeDuplicates(int[] nums) {
        HashSet<Integer> set = new HashSet<>();
        for (int num : nums) set.add(num);
        int index = 0;
        for (int num : set) nums[index++] = num;
        return set.size();
    }
}""", "O(N log N)", "O(N)",
        """public class Solution {
    public static int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;
        int i = 0;
        for (int j = 1; j < nums.length; j++) {
            if (nums[j] != nums[i]) {
                nums[++i] = nums[j];
            }
        }
        return i + 1;
    }
}""", "O(N)", "O(1)"
    ),

    "find-missing-number": make_sol(
        """public class Solution {
    public static int missingNumber(int[] nums) {
        int n = nums.length;
        for (int i = 0; i <= n; i++) {
            boolean found = false;
            for (int num : nums) {
                if (num == i) {
                    found = true;
                    break;
                }
            }
            if (!found) return i;
        }
        return -1;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int missingNumber(int[] nums) {
        int n = nums.length;
        int expectedSum = n * (n + 1) / 2;
        int actualSum = 0;
        for (int num : nums) actualSum += num;
        return expectedSum - actualSum;
    }
}""", "O(N)", "O(1)"
    ),

    "union-of-two-sorted-arrays": make_sol(
        """import java.util.*;

public class Solution {
    public static ArrayList<Integer> findUnion(int[] a, int[] b) {
        TreeSet<Integer> set = new TreeSet<>();
        for (int x : a) set.add(x);
        for (int x : b) set.add(x);
        return new ArrayList<>(set);
    }
}""", "O((M+N) log(M+N))", "O(M+N)",
        """import java.util.ArrayList;

public class Solution {
    public static ArrayList<Integer> findUnion(int[] a, int[] b) {
        ArrayList<Integer> union = new ArrayList<>();
        int i = 0, j = 0;
        int n = a.length, m = b.length;
        while (i < n && j < m) {
            if (a[i] <= b[j]) {
                if (union.isEmpty() || union.get(union.size() - 1) != a[i]) union.add(a[i]);
                i++;
            } else {
                if (union.isEmpty() || union.get(union.size() - 1) != b[j]) union.add(b[j]);
                j++;
            }
        }
        while (i < n) {
            if (union.isEmpty() || union.get(union.size() - 1) != a[i]) union.add(a[i]);
            i++;
        }
        while (j < m) {
            if (union.isEmpty() || union.get(union.size() - 1) != b[j]) union.add(b[j]);
            j++;
        }
        return union;
    }
}""", "O(N + M)", "O(N + M)"
    ),

    "intersection-of-two-sorted-arrays": make_sol(
        """import java.util.ArrayList;

public class Solution {
    public static ArrayList<Integer> intersection(int[] a, int[] b) {
        ArrayList<Integer> res = new ArrayList<>();
        int[] visited = new int[b.length];
        for (int i = 0; i < a.length; i++) {
            for (int j = 0; j < b.length; j++) {
                if (a[i] == b[j] && visited[j] == 0) {
                    res.add(a[i]);
                    visited[j] = 1;
                    break;
                }
                if (b[j] > a[i]) break;
            }
        }
        return res;
    }
}""", "O(N * M)", "O(M)",
        """import java.util.ArrayList;

public class Solution {
    public static ArrayList<Integer> intersection(int[] a, int[] b) {
        ArrayList<Integer> res = new ArrayList<>();
        int i = 0, j = 0;
        while (i < a.length && j < b.length) {
            if (a[i] < b[j]) {
                i++;
            } else if (b[j] < a[i]) {
                j++;
            } else {
                res.add(a[i]);
                i++;
                j++;
            }
        }
        return res;
    }
}""", "O(N + M)", "O(1)"
    ),

    "majority-element-i": make_sol(
        """public class Solution {
    public static int majorityElement(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            int count = 0;
            for (int j = 0; j < n; j++) {
                if (nums[j] == nums[i]) count++;
            }
            if (count > n / 2) return nums[i];
        }
        return -1;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int majorityElement(int[] nums) {
        int count = 0;
        int candidate = 0;
        for (int num : nums) {
            if (count == 0) candidate = num;
            count += (num == candidate) ? 1 : -1;
        }
        return candidate;
    }
}""", "O(N)", "O(1)"
    ),

    "leaders-in-an-array": make_sol(
        """import java.util.ArrayList;

public class Solution {
    public static ArrayList<Integer> leaders(int[] arr) {
        ArrayList<Integer> ans = new ArrayList<>();
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            boolean isLeader = true;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] > arr[i]) {
                    isLeader = false;
                    break;
                }
            }
            if (isLeader) ans.add(arr[i]);
        }
        return ans;
    }
}""", "O(N²)", "O(1)",
        """import java.util.*;

public class Solution {
    public static ArrayList<Integer> leaders(int[] arr) {
        ArrayList<Integer> ans = new ArrayList<>();
        int n = arr.length;
        int max = Integer.MIN_VALUE;
        for (int i = n - 1; i >= 0; i--) {
            if (arr[i] >= max) {
                ans.add(arr[i]);
                max = arr[i];
            }
        }
        Collections.reverse(ans);
        return ans;
    }
}""", "O(N)", "O(N)"
    ),

    "rearrange-array-elements-by-sign": make_sol(
        """import java.util.ArrayList;

public class Solution {
    public static int[] rearrangeArray(int[] nums) {
        ArrayList<Integer> pos = new ArrayList<>();
        ArrayList<Integer> neg = new ArrayList<>();
        for (int num : nums) {
            if (num > 0) pos.add(num);
            else neg.add(num);
        }
        for (int i = 0; i < nums.length / 2; i++) {
            nums[2 * i] = pos.get(i);
            nums[2 * i + 1] = neg.get(i);
        }
        return nums;
    }
}""", "O(N)", "O(N)",
        """public class Solution {
    public static int[] rearrangeArray(int[] nums) {
        int[] ans = new int[nums.length];
        int posIndex = 0, negIndex = 1;
        for (int num : nums) {
            if (num > 0) {
                ans[posIndex] = num;
                posIndex += 2;
            } else {
                ans[negIndex] = num;
                negIndex += 2;
            }
        }
        return ans;
    }
}""", "O(N)", "O(N)"
    ),

    "print-the-matrix-in-spiral-manner": make_sol(
        """import java.util.*;

public class Solution {
    public static List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> result = new ArrayList<>();
        if (matrix.length == 0) return result;
        int top = 0, bottom = matrix.length - 1;
        int left = 0, right = matrix[0].length - 1;

        while (top <= bottom && left <= right) {
            for (int i = left; i <= right; i++) result.add(matrix[top][i]);
            top++;
            for (int i = top; i <= bottom; i++) result.add(matrix[i][right]);
            right--;
            if (top <= bottom) {
                for (int i = right; i >= left; i--) result.add(matrix[bottom][i]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) result.add(matrix[i][left]);
                left++;
            }
        }
        return result;
    }
}""", "O(M * N)", "O(1)",
        """import java.util.*;

public class Solution {
    public static List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> result = new ArrayList<>();
        if (matrix.length == 0) return result;
        int top = 0, bottom = matrix.length - 1;
        int left = 0, right = matrix[0].length - 1;

        while (top <= bottom && left <= right) {
            for (int i = left; i <= right; i++) result.add(matrix[top][i]);
            top++;
            for (int i = top; i <= bottom; i++) result.add(matrix[i][right]);
            right--;
            if (top <= bottom) {
                for (int i = right; i >= left; i--) result.add(matrix[bottom][i]);
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) result.add(matrix[i][left]);
                left++;
            }
        }
        return result;
    }
}""", "O(M * N)", "O(1)"
    ),

    "pascals-triangle-i": make_sol(
        """public class Solution {
    public static long nCr(int n, int r) {
        long res = 1;
        for (int i = 0; i < r; i++) {
            res = res * (n - i);
            res = res / (i + 1);
        }
        return res;
    }

    public static int pascalElement(int r, int c) {
        return (int) nCr(r - 1, c - 1);
    }
}""", "O(C)", "O(1)",
        """public class Solution {
    public static long pascalElement(int r, int c) {
        long res = 1;
        for (int i = 0; i < c - 1; i++) {
            res = res * (r - 1 - i);
            res = res / (i + 1);
        }
        return res;
    }
}""", "O(C)", "O(1)"
    ),

    "pascals-triangle-ii": make_sol(
        """import java.util.*;

public class Solution {
    public static List<Integer> getRow(int rowIndex) {
        List<Integer> row = new ArrayList<>();
        for (int c = 0; c <= rowIndex; c++) {
            long val = 1;
            for (int i = 0; i < c; i++) {
                val = val * (rowIndex - i) / (i + 1);
            }
            row.add((int) val);
        }
        return row;
    }
}""", "O(N²)", "O(1)",
        """import java.util.*;

public class Solution {
    public static List<Integer> getRow(int rowIndex) {
        List<Integer> row = new ArrayList<>();
        long ans = 1;
        row.add((int) ans);
        for (int i = 1; i <= rowIndex; i++) {
            ans = ans * (rowIndex - i + 1) / i;
            row.add((int) ans);
        }
        return row;
    }
}""", "O(N)", "O(1)"
    ),

    "pascals-triangle-iii": make_sol(
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> generate(int numRows) {
        List<List<Integer>> triangle = new ArrayList<>();
        for (int i = 0; i < numRows; i++) {
            List<Integer> row = new ArrayList<>();
            for (int j = 0; j <= i; j++) {
                if (j == 0 || j == i) {
                    row.add(1);
                } else {
                    row.add(triangle.get(i - 1).get(j - 1) + triangle.get(i - 1).get(j));
                }
            }
            triangle.add(row);
        }
        return triangle;
    }
}""", "O(N²)", "O(1)",
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> generate(int numRows) {
        List<List<Integer>> triangle = new ArrayList<>();
        for (int i = 1; i <= numRows; i++) {
            List<Integer> row = new ArrayList<>();
            long ans = 1;
            row.add((int) ans);
            for (int col = 1; col < i; col++) {
                ans = ans * (i - col) / col;
                row.add((int) ans);
            }
            triangle.add(row);
        }
        return triangle;
    }
}""", "O(N²)", "O(1)"
    ),

    "rotate-matrix-by-90-degrees": make_sol(
        """public class Solution {
    public static void rotate(int[][] matrix) {
        int n = matrix.length;
        int[][] rotated = new int[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                rotated[j][n - 1 - i] = matrix[i][j];
            }
        }
        for (int i = 0; i < n; i++) {
            System.arraycopy(rotated[i], 0, matrix[i], 0, n);
        }
    }
}""", "O(N²)", "O(N²)",
        """public class Solution {
    public static void rotate(int[][] matrix) {
        int n = matrix.length;
        // Transpose
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }
        // Reverse each row
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n / 2; j++) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[i][n - 1 - j];
                matrix[i][n - 1 - j] = temp;
            }
        }
    }
}""", "O(N²)", "O(1)"
    ),

    "set-matrix-zeroes": make_sol(
        """public class Solution {
    public static void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        boolean[] row = new boolean[m];
        boolean[] col = new boolean[n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 0) {
                    row[i] = true;
                    col[j] = true;
                }
            }
        }
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (row[i] || col[j]) matrix[i][j] = 0;
            }
        }
    }
}""", "O(M * N)", "O(M + N)",
        """public class Solution {
    public static void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        int col0 = 1;
        for (int i = 0; i < m; i++) {
            if (matrix[i][0] == 0) col0 = 0;
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }
        for (int i = m - 1; i >= 0; i--) {
            for (int j = n - 1; j >= 1; j--) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
            if (col0 == 0) matrix[i][0] = 0;
        }
    }
}""", "O(M * N)", "O(1)"
    ),

    "two-sum": make_sol(
        """public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[]{i, j};
                }
            }
        }
        return new int[]{};
    }
}""", "O(N²)", "O(1)",
        """import java.util.HashMap;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}""", "O(N)", "O(N)"
    ),

    "3-sum": make_sol(
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> threeSum(int[] nums) {
        Set<List<Integer>> set = new HashSet<>();
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                for (int k = j + 1; k < n; k++) {
                    if (nums[i] + nums[j] + nums[k] == 0) {
                        List<Integer> triplet = Arrays.asList(nums[i], nums[j], nums[k]);
                        Collections.sort(triplet);
                        set.add(triplet);
                    }
                }
            }
        }
        return new ArrayList<>(set);
    }
}""", "O(N³)", "O(2 * triplets)",
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        int n = nums.length;
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return res;
    }
}""", "O(N²)", "O(1)"
    ),

    "4-sum": make_sol(
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> fourSum(int[] nums, int target) {
        Set<List<Integer>> set = new HashSet<>();
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                for (int k = j + 1; k < n; k++) {
                    for (int l = k + 1; l < n; l++) {
                        long sum = (long) nums[i] + nums[j] + nums[k] + nums[l];
                        if (sum == target) {
                            List<Integer> quad = Arrays.asList(nums[i], nums[j], nums[k], nums[l]);
                            Collections.sort(quad);
                            set.add(quad);
                        }
                    }
                }
            }
        }
        return new ArrayList<>(set);
    }
}""", "O(N⁴)", "O(2 * quadruplets)",
        """import java.util.*;

public class Solution {
    public static List<List<Integer>> fourSum(int[] nums, int target) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        int n = nums.length;
        for (int i = 0; i < n - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            for (int j = i + 1; j < n - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue;
                int left = j + 1, right = n - 1;
                while (left < right) {
                    long sum = (long) nums[i] + nums[j] + nums[left] + nums[right];
                    if (sum == target) {
                        res.add(Arrays.asList(nums[i], nums[j], nums[left], nums[right]));
                        while (left < right && nums[left] == nums[left + 1]) left++;
                        while (left < right && nums[right] == nums[right - 1]) right--;
                        left++;
                        right--;
                    } else if (sum < target) {
                        left++;
                    } else {
                        right--;
                    }
                }
            }
        }
        return res;
    }
}""", "O(N³)", "O(1)"
    ),

    "sort-an-array-of-0's-1's-and-2's": make_sol(
        """public class Solution {
    public static void sortColors(int[] nums) {
        int c0 = 0, c1 = 0, c2 = 0;
        for (int num : nums) {
            if (num == 0) c0++;
            else if (num == 1) c1++;
            else c2++;
        }
        int idx = 0;
        while (c0-- > 0) nums[idx++] = 0;
        while (c1-- > 0) nums[idx++] = 1;
        while (c2-- > 0) nums[idx++] = 2;
    }
}""", "O(2N)", "O(1)",
        """public class Solution {
    public static void sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                int temp = nums[low];
                nums[low++] = nums[mid];
                nums[mid++] = temp;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int temp = nums[high];
                nums[high--] = nums[mid];
                nums[mid] = temp;
            }
        }
    }
}""", "O(N)", "O(1)"
    ),

    "kadane's-algorithm": make_sol(
        """public class Solution {
    public static int maxSubArray(int[] nums) {
        int max = Integer.MIN_VALUE;
        for (int i = 0; i < nums.length; i++) {
            int sum = 0;
            for (int j = i; j < nums.length; j++) {
                sum += nums[j];
                max = Math.max(max, sum);
            }
        }
        return max;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int maxSubArray(int[] nums) {
        int max = nums[0];
        int sum = 0;
        for (int num : nums) {
            sum += num;
            max = Math.max(max, sum);
            if (sum < 0) sum = 0;
        }
        return max;
    }
}""", "O(N)", "O(1)"
    ),

    "next-permutation": make_sol(
        """import java.util.Arrays;

public class Solution {
    public static void nextPermutation(int[] nums) {
        int n = nums.length;
        int i = n - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;
        if (i >= 0) {
            int j = n - 1;
            while (nums[j] <= nums[i]) j--;
            int temp = nums[i];
            nums[i] = nums[j];
            nums[j] = temp;
        }
        int left = i + 1, right = n - 1;
        while (left < right) {
            int temp = nums[left];
            nums[left++] = nums[right];
            nums[right--] = temp;
        }
    }
}""", "O(N)", "O(1)",
        """public class Solution {
    public static void nextPermutation(int[] nums) {
        int n = nums.length;
        int i = n - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;
        if (i >= 0) {
            int j = n - 1;
            while (nums[j] <= nums[i]) j--;
            int temp = nums[i];
            nums[i] = nums[j];
            nums[j] = temp;
        }
        int left = i + 1, right = n - 1;
        while (left < right) {
            int temp = nums[left];
            nums[left++] = nums[right];
            nums[right--] = temp;
        }
    }
}""", "O(N)", "O(1)"
    ),

    "majority-element-ii": make_sol(
        """import java.util.*;

public class Solution {
    public static List<Integer> majorityElement(int[] nums) {
        List<Integer> res = new ArrayList<>();
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            if (res.contains(nums[i])) continue;
            int count = 0;
            for (int j = 0; j < n; j++) {
                if (nums[j] == nums[i]) count++;
            }
            if (count > n / 3) res.add(nums[i]);
        }
        return res;
    }
}""", "O(N²)", "O(1)",
        """import java.util.*;

public class Solution {
    public static List<Integer> majorityElement(int[] nums) {
        int count1 = 0, count2 = 0;
        int candidate1 = 0, candidate2 = 1;
        for (int num : nums) {
            if (num == candidate1) count1++;
            else if (num == candidate2) count2++;
            else if (count1 == 0) { candidate1 = num; count1 = 1; }
            else if (count2 == 0) { candidate2 = num; count2 = 1; }
            else { count1--; count2--; }
        }
        count1 = 0; count2 = 0;
        for (int num : nums) {
            if (num == candidate1) count1++;
            else if (num == candidate2) count2++;
        }
        List<Integer> res = new ArrayList<>();
        int n = nums.length;
        if (count1 > n / 3) res.add(candidate1);
        if (count2 > n / 3) res.add(candidate2);
        return res;
    }
}""", "O(N)", "O(1)"
    ),

    "find-the-repeating-and-missing-number": make_sol(
        """public class Solution {
    public static int[] findTwoElement(int[] arr) {
        int n = arr.length;
        int repeating = -1, missing = -1;
        for (int i = 1; i <= n; i++) {
            int count = 0;
            for (int j = 0; j < n; j++) {
                if (arr[j] == i) count++;
            }
            if (count == 2) repeating = i;
            else if (count == 0) missing = i;
        }
        return new int[]{repeating, missing};
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int[] findTwoElement(int[] arr) {
        long n = arr.length;
        long SN = n * (n + 1) / 2;
        long S2N = n * (n + 1) * (2 * n + 1) / 6;
        long S = 0, S2 = 0;
        for (int x : arr) {
            S += x;
            S2 += (long) x * x;
        }
        long val1 = S - SN; // x - y
        long val2 = S2 - S2N;
        val2 = val2 / val1; // x + y
        long x = (val1 + val2) / 2;
        long y = x - val1;
        return new int[]{(int) x, (int) y};
    }
}""", "O(N)", "O(1)"
    ),

    "count-inversions": make_sol(
        """public class Solution {
    public static long inversionCount(long[] arr) {
        long count = 0;
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (arr[i] > arr[j]) count++;
            }
        }
        return count;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static long inversionCount(long[] arr) {
        return mergeSort(arr, 0, arr.length - 1);
    }

    private static long mergeSort(long[] arr, int low, int high) {
        long count = 0;
        if (low < high) {
            int mid = (low + high) / 2;
            count += mergeSort(arr, low, mid);
            count += mergeSort(arr, mid + 1, high);
            count += merge(arr, low, mid, high);
        }
        return count;
    }

    private static long merge(long[] arr, int low, int mid, int high) {
        long[] temp = new long[high - low + 1];
        int left = low, right = mid + 1, k = 0;
        long count = 0;
        while (left <= mid && right <= high) {
            if (arr[left] <= arr[right]) {
                temp[k++] = arr[left++];
            } else {
                temp[k++] = arr[right++];
                count += (mid - left + 1);
            }
        }
        while (left <= mid) temp[k++] = arr[left++];
        while (right <= high) temp[k++] = arr[right++];
        System.arraycopy(temp, 0, arr, low, temp.length);
        return count;
    }
}""", "O(N log N)", "O(N)"
    ),

    "reverse-pairs": make_sol(
        """public class Solution {
    public static int reversePairs(int[] nums) {
        int count = 0;
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if ((long) nums[i] > 2L * nums[j]) count++;
            }
        }
        return count;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int reversePairs(int[] nums) {
        return mergeSort(nums, 0, nums.length - 1);
    }

    private static int mergeSort(int[] nums, int low, int high) {
        if (low >= high) return 0;
        int mid = (low + high) / 2;
        int count = mergeSort(nums, low, mid) + mergeSort(nums, mid + 1, high);
        int j = mid + 1;
        for (int i = low; i <= mid; i++) {
            while (j <= high && (long) nums[i] > 2L * nums[j]) j++;
            count += (j - (mid + 1));
        }
        merge(nums, low, mid, high);
        return count;
    }

    private static void merge(int[] nums, int low, int mid, int high) {
        int[] temp = new int[high - low + 1];
        int left = low, right = mid + 1, k = 0;
        while (left <= mid && right <= high) {
            if (nums[left] <= nums[right]) temp[k++] = nums[left++];
            else temp[k++] = nums[right++];
        }
        while (left <= mid) temp[k++] = nums[left++];
        while (right <= high) temp[k++] = nums[right++];
        System.arraycopy(temp, 0, nums, low, temp.length);
    }
}""", "O(N log N)", "O(N)"
    ),

    "maximum-product-subarray-in-an-array": make_sol(
        """public class Solution {
    public static int maxProduct(int[] nums) {
        int max = nums[0];
        for (int i = 0; i < nums.length; i++) {
            int prod = 1;
            for (int j = i; j < nums.length; j++) {
                prod *= nums[j];
                max = Math.max(max, prod);
            }
        }
        return max;
    }
}""", "O(N²)", "O(1)",
        """public class Solution {
    public static int maxProduct(int[] nums) {
        int max = nums[0];
        int prefix = 1, suffix = 1;
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            if (prefix == 0) prefix = 1;
            if (suffix == 0) suffix = 1;
            prefix *= nums[i];
            suffix *= nums[n - 1 - i];
            max = Math.max(max, Math.max(prefix, suffix));
        }
        return max;
    }
}""", "O(N)", "O(1)"
    ),

    "merge-two-sorted-arrays-without-extra-space": make_sol(
        """import java.util.Arrays;

public class Solution {
    public static void merge(long[] a, long[] b) {
        int n = a.length, m = b.length;
        long[] c = new long[n + m];
        System.arraycopy(a, 0, c, 0, n);
        System.arraycopy(b, 0, c, n, m);
        Arrays.sort(c);
        System.arraycopy(c, 0, a, 0, n);
        System.arraycopy(c, n, b, 0, m);
    }
}""", "O((N+M) log(N+M))", "O(N+M)",
        """import java.util.Arrays;

public class Solution {
    public static void merge(long[] a, long[] b) {
        int n = a.length, m = b.length;
        int left = n - 1, right = 0;
        while (left >= 0 && right < m) {
            if (a[left] > b[right]) {
                long temp = a[left];
                a[left] = b[right];
                b[right] = temp;
                left--;
                right++;
            } else {
                break;
            }
        }
        Arrays.sort(a);
        Arrays.sort(b);
    }
}""", "O(min(N, M) + N log N + M log M)", "O(1)"
    )
}
