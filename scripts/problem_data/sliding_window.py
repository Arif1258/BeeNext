from .common import make_prob

SLIDING_WINDOW_DATA = {
    "theory": make_prob(
        description="Master the Sliding Window and Two Pointer techniques. Understand constant-size windows (fixed size `k`), dynamic-size windows (expanding right pointer and shrinking left pointer under condition violations), and prefix counting techniques `count(k) = atMost(k) - atMost(k - 1)`. These patterns reduce brute-force O(N^2) searches to linear O(N) time.",
        input_format="An array `nums` of length `n` and window parameter `k`.",
        output_format="Return or demonstrate window expansion and contraction logic.",
        constraints="1 <= nums.length <= 10^5\n1 <= k <= nums.length",
        examples=[
            {
                "input": "nums = [2, 1, 5, 1, 3, 2], k = 3",
                "output": "9",
                "explanation": "Max sum subarray of fixed size 3 is [5, 1, 3] with sum 9."
            },
            {
                "input": "nums = [2, 3, 4, 1, 5], k = 2",
                "output": "7",
                "explanation": "Subarray [3, 4] gives max sum 7."
            }
        ]
    ),

    "maximum-points-you-can-obtain-from-cards-": make_prob(
        description="There are several cards arranged in a row, and each card has an associated number of points. In one step, you can take one card from the beginning or from the end of the row. You have to take exactly `k` cards. Your score is the sum of the points of the cards you have taken. Return the maximum score you can obtain. Note: taking `k` cards from ends is equivalent to finding a contiguous subarray of length `n - k` with minimum sum.",
        input_format="An integer array `cardPoints` and integer `k`.",
        output_format="Return the maximum score achievable.",
        constraints="1 <= cardPoints.length <= 10^5\n1 <= cardPoints[i] <= 10^4\n1 <= k <= cardPoints.length",
        examples=[
            {
                "input": "cardPoints = [1, 2, 3, 4, 5, 6, 1], k = 3",
                "output": "12",
                "explanation": "Take three cards from the right: 5 + 6 + 1 = 12."
            },
            {
                "input": "cardPoints = [2, 2, 2], k = 2",
                "output": "4",
                "explanation": "Score is 4 regardless of which two cards are taken."
            }
        ]
    ),

    "longest-substring-without-repeating-characters": make_prob(
        description="Given a string `s`, find the length of the longest substring without repeating characters. Solve in O(N) time using two pointers and a character index map to jump the left pointer forward immediately.",
        input_format="A string `s`.",
        output_format="Return an integer representing the maximum length.",
        constraints="0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
        examples=[
            {
                "input": "s = \"abcabcbb\"",
                "output": "3",
                "explanation": "The answer is \"abc\", with the length of 3."
            },
            {
                "input": "s = \"bbbbb\"",
                "output": "1",
                "explanation": "The answer is \"b\", with the length of 1."
            }
        ]
    ),

    "max-consecutive-ones-iii": make_prob(
        description="Given a binary array `nums` and an integer `k`, return the maximum number of consecutive `1`'s in the array if you can flip at most `k` `0`'s. Solve in O(N) time with O(1) space using a dynamic sliding window.",
        input_format="A binary integer array `nums` and an integer `k`.",
        output_format="Return the maximum length of consecutive 1s achievable.",
        constraints="1 <= nums.length <= 10^5\nnums[i] is either 0 or 1.\n0 <= k <= nums.length",
        examples=[
            {
                "input": "nums = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k = 2",
                "output": "6",
                "explanation": "Flipping two zeros from index 5 to index 10 gives 6 consecutive 1s: [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1]."
            },
            {
                "input": "nums = [0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], k = 3",
                "output": "10",
                "explanation": "Flipping 3 zeros gives 10 consecutive 1s."
            }
        ]
    ),

    "fruit-into-baskets": make_prob(
        description="You are visiting a farm that has a single row of fruit trees arranged from left to right. The trees are represented by an integer array `fruits` where `fruits[i]` is the type of fruit the `i`-th tree produces. You only have 2 baskets, and each basket can only hold a single type of fruit. Return the maximum number of fruits you can pick (i.e. length of longest subarray with at most 2 distinct integers).",
        input_format="An integer array `fruits` of length `n`.",
        output_format="Return the maximum fruits you can pick.",
        constraints="1 <= fruits.length <= 10^5\n0 <= fruits[i] < fruits.length",
        examples=[
            {
                "input": "fruits = [1, 2, 1]",
                "output": "3",
                "explanation": "We can pick from all 3 trees."
            },
            {
                "input": "fruits = [0, 1, 2, 2]",
                "output": "3",
                "explanation": "We can pick from trees [1, 2, 2] (length 3)."
            }
        ]
    ),

    "longest-substring-with-at-most-k-distinct-characters": make_prob(
        description="Given a string `s` and an integer `k`, return the length of the longest substring of `s` that contains at most `k` distinct characters. Solve in O(N) time using two pointers and a character frequency map.",
        input_format="A string `s` and an integer `k`.",
        output_format="Return the maximum length of a substring with at most `k` distinct characters.",
        constraints="1 <= s.length <= 10^5\n1 <= k <= 50",
        examples=[
            {
                "input": "s = \"eceba\", k = 2",
                "output": "3",
                "explanation": "The substring is \"ece\" with length 3."
            },
            {
                "input": "s = \"aa\", k = 1",
                "output": "2",
                "explanation": "\"aa\" has 1 distinct character and length 2."
            }
        ]
    ),

    "longest-repeating-character-replacement": make_prob(
        description="You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English character at most `k` times. Return the length of the longest substring containing the same letter you can get after performing the above operations. Maintain `window_length - max_frequency <= k`.",
        input_format="An uppercase English string `s` and integer `k`.",
        output_format="Return the maximum length achievable.",
        constraints="1 <= s.length <= 10^5\ns consists of only uppercase English letters.\n0 <= k <= s.length",
        examples=[
            {
                "input": "s = \"ABAB\", k = 2",
                "output": "4",
                "explanation": "Replace the two 'A's with two 'B's or vice versa to obtain \"BBBB\" or \"AAAA\"."
            },
            {
                "input": "s = \"AABABBA\", k = 1",
                "output": "4",
                "explanation": "Replace the middle 'A' with 'B' to form \"AABBBBA\". The substring \"BBBB\" has length 4."
            }
        ]
    ),

    "minimum-window-substring-": make_prob(
        description="Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `\"\"`. Solve in O(M + N) time.",
        input_format="Two strings `s` and `t`.",
        output_format="Return the minimum substring of `s` containing all characters of `t`.",
        constraints="m == s.length\nn == t.length\n1 <= m, n <= 10^5\ns and t consist of uppercase and lowercase English letters.",
        examples=[
            {
                "input": "s = \"ADOBECODEBANC\", t = \"ABC\"",
                "output": "\"BANC\"",
                "explanation": "The minimum window substring \"BANC\" includes 'A', 'B', and 'C' from string t."
            },
            {
                "input": "s = \"a\", t = \"a\"",
                "output": "\"a\"",
                "explanation": "The entire string s is the minimum window."
            }
        ]
    ),

    "minimum-window-subsequence": make_prob(
        description="Given strings `s1` and `s2`, return the minimum contiguous substring `W` of `s1`, so that `s2` is a subsequence of `W`. If there is no such window in `s1` that covers all characters in `s2`, return the empty string `\"\"`. If there are multiple such minimum-length windows, return the one with the smallest starting index.",
        input_format="Two strings `s1` and `s2`.",
        output_format="Return the minimum substring window containing `s2` as a subsequence.",
        constraints="1 <= s1.length <= 2 * 10^4\n1 <= s2.length <= 100\ns1 and s2 consist of lowercase English letters.",
        examples=[
            {
                "input": "s1 = \"abcdebdde\", s2 = \"bde\"",
                "output": "\"bcde\"",
                "explanation": "\"bcde\" is the first occurrence of a window where \"bde\" is a subsequence."
            },
            {
                "input": "s1 = \"jmeqqaewmptpyaxddbgkimxpakypcxmvdujvgxqa\", s2 = \"l\"",
                "output": "\"\"",
                "explanation": "'l' does not appear in s1."
            }
        ]
    ),

    "number-of-substrings-containing-all-three-characters": make_prob(
        description="Given a string `s` consisting only of characters `a`, `b` and `c`. Return the number of substrings containing at least one occurrence of all these characters `a`, `b` and `c`. Solve in O(N) time by recording the last seen indices of 'a', 'b', and 'c'.",
        input_format="A string `s` containing only 'a', 'b', and 'c'.",
        output_format="Return the count of substrings containing all 3 characters.",
        constraints="3 <= s.length <= 5 * 10^4\ns consists only of characters a, b or c.",
        examples=[
            {
                "input": "s = \"abcabc\"",
                "output": "10",
                "explanation": "The substrings containing at least one occurrence of 'a', 'b' and 'c' are \"abc\", \"abca\", \"abcab\", \"abcabc\", \"bca\", \"bcab\", \"bcabc\", \"cab\", \"cabc\" and \"abc\"."
            },
            {
                "input": "s = \"aaacb\"",
                "output": "3",
                "explanation": "\"aaacb\", \"aacb\" and \"acb\"."
            }
        ]
    ),

    "binary-subarrays-with-sum": make_prob(
        description="Given a binary array `nums` and an integer `goal`, return the number of non-empty subarrays with a sum `goal`. Solve in O(N) time using `atMost(goal) - atMost(goal - 1)` or prefix sum hash map.",
        input_format="A binary integer array `nums` and an integer `goal`.",
        output_format="Return total count of binary subarrays with sum `goal`.",
        constraints="1 <= nums.length <= 3 * 10^4\nnums[i] is either 0 or 1.\n0 <= goal <= nums.length",
        examples=[
            {
                "input": "nums = [1, 0, 1, 0, 1], goal = 2",
                "output": "4",
                "explanation": "The 4 subarrays are [1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 1]."
            },
            {
                "input": "nums = [0, 0, 0, 0, 0], goal = 0",
                "output": "15",
                "explanation": "Total subarrays of all zeros is 5 * 6 / 2 = 15."
            }
        ]
    ),

    "count-number-of-nice-subarrays": make_prob(
        description="Given an array of integers `nums` and an integer `k`. A continuous subarray is called nice if there are `k` odd numbers on it. Return the number of nice sub-arrays. Solve in O(N) time using `atMostK(k) - atMostK(k - 1)`.",
        input_format="An integer array `nums` and integer `k`.",
        output_format="Return the number of nice subarrays.",
        constraints="1 <= nums.length <= 5 * 10^4\n1 <= nums[i] <= 10^5\n1 <= k <= nums.length",
        examples=[
            {
                "input": "nums = [1, 1, 2, 1, 1], k = 3",
                "output": "2",
                "explanation": "Subarrays with 3 odd numbers: [1, 1, 2, 1] and [1, 2, 1, 1]."
            },
            {
                "input": "nums = [2, 4, 6], k = 1",
                "output": "0",
                "explanation": "There are no odd numbers."
            }
        ]
    ),

    "subarrays-with-k-different-integers": make_prob(
        description="Given an integer array `nums` and an integer `k`, return the number of good subarrays of `nums`. A good array is an array where the number of different integers in that array is exactly `k`. Use the sliding window counting identity: `exactly(k) = atMost(k) - atMost(k - 1)` in O(N) time.",
        input_format="An integer array `nums` and integer `k`.",
        output_format="Return the number of subarrays with exactly `k` distinct integers.",
        constraints="1 <= nums.length <= 2 * 10^4\n1 <= nums[i], k <= nums.length",
        examples=[
            {
                "input": "nums = [1, 2, 1, 2, 3], k = 2",
                "output": "7",
                "explanation": "Subarrays formed with exactly 2 different integers: [1, 2], [2, 1], [1, 2], [2, 3], [1, 2, 1], [2, 1, 2], [1, 2, 1, 2]."
            },
            {
                "input": "nums = [1, 2, 1, 3, 4], k = 3",
                "output": "3",
                "explanation": "Subarrays: [1, 2, 1, 3], [2, 1, 3], [1, 3, 4]."
            }
        ]
    ),
}
