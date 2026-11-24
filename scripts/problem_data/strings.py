from .common import make_prob

STRINGS_DATA = {
    "remove-outermost-parentheses": make_prob(
        description="A valid parentheses string is either empty `\"\"`, `\"(\" + A + \")\"`, or `A + B`, where `A` and `B` are valid parentheses strings. A valid parentheses string `s` is primitive if it is nonempty, and it cannot be split into `A + B`. Given a valid parentheses string `s`, consider its primitive decomposition: `s = P_1 + P_2 + ... + P_k`. Return `s` after removing the outermost parentheses of every primitive string in the primitive decomposition.",
        input_format="A valid parentheses string `s`.",
        output_format="Return the string after stripping outermost parentheses from each primitive component.",
        constraints="1 <= s.length <= 10^5\ns[i] is either '(' or ')'.\ns is a valid parentheses string.",
        examples=[
            {
                "input": "s = \"(()())(())\"",
                "output": "\"()()()\"",
                "explanation": "Decomposition: \"(()())\" + \"(())\". Outer removed: \"()()\" + \"()\" = \"()()()\"."
            },
            {
                "input": "s = \"(()())(())(()(()))\"",
                "output": "\"()()()()(())\"",
                "explanation": "Each primitive block has its outermost parentheses removed."
            }
        ]
    ),

    "maximum-nesting-depth-of-the-parentheses": make_prob(
        description="Given a valid parentheses string `s`, return the nesting depth of `s`. The nesting depth is the maximum number of open parentheses that are nested inside one another without being closed.",
        input_format="A string `s` containing characters, digits, and parentheses.",
        output_format="Return an integer representing the maximum nesting depth.",
        constraints="1 <= s.length <= 100\ns consists of digits 0-9 and characters '+', '-', '*', '/', '(', and ')'.\ns is guaranteed to be a valid parentheses string.",
        examples=[
            {
                "input": "s = \"(1+(2*3)+((8)/4))+1\"",
                "output": "3",
                "explanation": "Digit 8 is inside 3 nested pairs of parentheses."
            },
            {
                "input": "s = \"(1)+((2))+(((3)))\"",
                "output": "3",
                "explanation": "Maximum depth is 3 around digit 3."
            }
        ]
    ),

    "roman-to-integer": make_prob(
        description="Roman numerals are represented by seven different symbols: I (1), V (5), X (10), L (50), C (100), D (500), and M (1000). Subtraction rule applies when a smaller numeral appears before a larger one (e.g., IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900). Given a roman numeral string `s`, convert it to an integer.",
        input_format="A roman numeral string `s`.",
        output_format="Return the converted integer value.",
        constraints="1 <= s.length <= 15\ns contains only the characters ('I', 'V', 'X', 'L', 'C', 'D', 'M').\nGuaranteed that s is a valid roman numeral in range [1, 3999].",
        examples=[
            {
                "input": "s = \"III\"",
                "output": "3",
                "explanation": "III = 3."
            },
            {
                "input": "s = \"LVIII\"",
                "output": "58",
                "explanation": "L = 50, V = 5, III = 3."
            }
        ]
    ),

    "string-to-integer-atoi": make_prob(
        description="Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer. The algorithm must: 1. Ignore leading whitespace. 2. Check for optional '+' or '-' sign. 3. Read subsequent digits until a non-digit character is encountered. 4. Clamp the integer within 32-bit signed integer range `[-2^31, 2^31 - 1]`.",
        input_format="A string `s`.",
        output_format="Return the parsed 32-bit signed integer value.",
        constraints="0 <= s.length <= 200\ns consists of English letters, digits, ' ', '+', '-', and '.'.",
        examples=[
            {
                "input": "s = \"42\"",
                "output": "42",
                "explanation": "The integer 42 is read."
            },
            {
                "input": "s = \"   -042\"",
                "output": "-42",
                "explanation": "Leading spaces ignored, '-' indicates negative, digits '042' parsed as 42."
            }
        ]
    ),

    "count-number-of-substring": make_prob(
        description="Given a string `s` of lowercase alphabets and an integer `k`, count the number of substrings that contain exactly `k` distinct characters. Solve in O(N) time using helper function `atMostK(s, k) - atMostK(s, k - 1)`.",
        input_format="A string `s` and an integer `k`.",
        output_format="Return the count of substrings with exactly `k` distinct characters.",
        constraints="1 <= s.length <= 10^5\n1 <= k <= 26\ns consists of lowercase English characters.",
        examples=[
            {
                "input": "s = \"pqpqs\", k = 2",
                "output": "7",
                "explanation": "Substrings with exactly 2 distinct characters: \"pq\", \"pqp\", \"pqpq\", \"qp\", \"qpq\", \"pq\", \"qs\"."
            },
            {
                "input": "s = \"aabacbebebe\", k = 3",
                "output": "10",
                "explanation": "10 substrings contain exactly 3 distinct characters."
            }
        ]
    ),

    "longest-palindromic-substring": make_prob(
        description="Given a string `s`, return the longest palindromic substring in `s`. Solve in O(N^2) time with O(1) space by expanding around potential centers (both odd and even centers), or in O(N) time using Manacher's Algorithm.",
        input_format="A string `s`.",
        output_format="Return the longest palindromic substring.",
        constraints="1 <= s.length <= 1000\ns consists of only digits and English letters.",
        examples=[
            {
                "input": "s = \"babad\"",
                "output": "\"bab\"",
                "explanation": "\"aba\" is also a valid answer."
            },
            {
                "input": "s = \"cbbd\"",
                "output": "\"bb\"",
                "explanation": "The longest palindromic substring is \"bb\"."
            }
        ]
    ),

    "sum-of-beauty-of-all-substrings": make_prob(
        description="The beauty of a string is the difference in frequencies between the most frequent and least frequent characters (ignoring characters with frequency 0). Given a string `s`, return the sum of beauty of all of its substrings.",
        input_format="A string `s` of lowercase English letters.",
        output_format="Return an integer representing the sum of beauty of all substrings.",
        constraints="1 <= s.length <= 500\ns consists of only lowercase English letters.",
        examples=[
            {
                "input": "s = \"aabcb\"",
                "output": "5",
                "explanation": "The substrings with non-zero beauty are [\"aab\", \"aabc\", \"aabcb\", \"abcb\", \"bcb\"], each with beauty 1. Sum = 5."
            },
            {
                "input": "s = \"aabcbaa\"",
                "output": "17",
                "explanation": "Total sum of beauties across all substrings is 17."
            }
        ]
    ),

    # --- STRINGS ADVANCED ALGO ---
    "reverse-every-word-in-a-string": make_prob(
        description="Given an input string `s`, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in `s` will be separated by at least one space. Return a string of the words in reverse order concatenated by a single space, without leading or trailing spaces.",
        input_format="A string `s` containing words separated by spaces.",
        output_format="Return the string with reversed word sequence and clean single spaces.",
        constraints="1 <= s.length <= 10^4\ns contains English letters, digits, and spaces ' '.\nThere is at least one word in s.",
        examples=[
            {
                "input": "s = \"the sky is blue\"",
                "output": "\"blue is sky the\"",
                "explanation": "The words are reversed in order."
            },
            {
                "input": "s = \"  hello world  \"",
                "output": "\"world hello\"",
                "explanation": "Reversed words should not contain leading or trailing spaces."
            }
        ]
    ),

    "minimum-number-of-bracket-reversals-to-make-an-expression-balanced": make_prob(
        description="Given a string `s` consisting of only curly brackets `{` and `}`, find the minimum number of bracket reversals required to make the expression balanced. If the expression cannot be made balanced (e.g. its length is odd), return -1.",
        input_format="A string `s` consisting of '{' and '}'.",
        output_format="Return the minimum number of bracket reversals, or -1.",
        constraints="1 <= s.length <= 10^5\ns consists only of '{' and '}'.",
        examples=[
            {
                "input": "s = \"}{{}{\"",
                "output": "1",
                "explanation": "Reversing the first bracket transforms it into \"{{}{\", and after balancing, 1 reversal is sufficient."
            },
            {
                "input": "s = \"{{}{{{}{{}{{\"",
                "output": "-1",
                "explanation": "Length of the string is odd, so it cannot be balanced."
            }
        ]
    ),

    "count-and-say": make_prob(
        description="The count-and-say sequence is a sequence of digit strings defined by the recursive formula: `countAndSay(1) = \"1\"`, and `countAndSay(n)` is the run-length encoding of `countAndSay(n - 1)`. Run-length encoding replaces consecutive identical digits with the count followed by the digit itself.",
        input_format="An integer `n`.",
        output_format="Return the `n`-th term of the count-and-say sequence.",
        constraints="1 <= n <= 30",
        examples=[
            {
                "input": "n = 1",
                "output": "\"1\"",
                "explanation": "This is the base case."
            },
            {
                "input": "n = 4",
                "output": "\"1211\"",
                "explanation": "countAndSay(1) = \"1\", countAndSay(2) = \"11\", countAndSay(3) = \"21\", countAndSay(4) = \"1211\"."
            }
        ]
    ),

    "hashing-in-strings-theory": make_prob(
        description="Understand String Polynomial Rolling Hash: how to convert substrings into integer hash codes modulo a large prime `P` (e.g. 10^9 + 7) using base `B` (e.g. 31 or 53). Learn how rolling hashes enable O(1) substring equality comparisons and power the Rabin-Karp pattern searching algorithm.",
        input_format="A text string `text` and pattern string `pattern`.",
        output_format="Return or demonstrate polynomial rolling hash calculation matching `pattern` inside `text`.",
        constraints="1 <= text.length, pattern.length <= 10^5",
        examples=[
            {
                "input": "text = \"ababc\", pattern = \"abc\"",
                "output": "[2]",
                "explanation": "Pattern \"abc\" matches at 0-based index 2."
            },
            {
                "input": "text = \"aaaaa\", pattern = \"aa\"",
                "output": "[0, 1, 2, 3]",
                "explanation": "Pattern matches at indices 0, 1, 2, and 3."
            }
        ]
    ),

    "rabin-karp-algorithm": make_prob(
        description="Given two strings `text` and `pattern`, find all starting indices in `text` where `pattern` appears as a substring using the Rabin-Karp string matching algorithm with polynomial rolling hash in O(N + M) average time.",
        input_format="Two strings `text` and `pattern`.",
        output_format="Return a list of starting indices where `pattern` occurs in `text`.",
        constraints="1 <= text.length, pattern.length <= 10^5\ntext and pattern consist of lowercase English letters.",
        examples=[
            {
                "input": "text = \"GEEKS FOR GEEKS\", pattern = \"GEEK\"",
                "output": "[0, 10]",
                "explanation": "Pattern \"GEEK\" appears at indices 0 and 10."
            },
            {
                "input": "text = \"AABAACAADAABAABA\", pattern = \"AABA\"",
                "output": "[0, 9, 12]",
                "explanation": "Pattern appears at indices 0, 9, and 12."
            }
        ]
    ),

    "z-function": make_prob(
        description="Given a string `s` of length `n`, calculate its Z-array. The Z-array for string `s` is an array of length `n` where `z[i]` equals the greatest number of characters starting from position `i` that coincide with the first characters of `s`. Solve in O(N) linear time using the standard Z-algorithm window approach.",
        input_format="A string `s` of length `n`.",
        output_format="Return the Z-array of size `n` with `z[0] = 0`.",
        constraints="1 <= s.length <= 10^5\ns consists of lowercase English characters.",
        examples=[
            {
                "input": "s = \"aabxaabxcaabxaabxay\"",
                "output": "[0, 1, 0, 0, 4, 1, 0, 0, 0, 8, 1, 0, 0, 5, 1, 0, 0, 1, 0]",
                "explanation": "Z-values correspond to length of longest common prefix with whole string."
            },
            {
                "input": "s = \"aaaaa\"",
                "output": "[0, 4, 3, 2, 1]",
                "explanation": "At index 1, \"aaaa\" matches prefix of length 4."
            }
        ]
    ),

    "kmp-algorithm-or-lps-array": make_prob(
        description="Given a string `pattern`, construct its Longest Prefix which is also Suffix (LPS) array in O(M) time, and use the Knuth-Morris-Pratt (KMP) algorithm to find all occurrences of `pattern` in a given `text` in O(N) time without backtracking.",
        input_format="Two strings `text` and `pattern`.",
        output_format="Return the list of 0-based starting indices of pattern in text.",
        constraints="1 <= text.length, pattern.length <= 10^5\ntext and pattern consist of lowercase English letters.",
        examples=[
            {
                "input": "text = \"ABABDABACDABABCABAB\", pattern = \"ABABCABAB\"",
                "output": "[10]",
                "explanation": "Pattern found at index 10 using LPS skip table."
            },
            {
                "input": "text = \"ABCABCD\", pattern = \"ABCD\"",
                "output": "[3]",
                "explanation": "Pattern begins at index 3."
            }
        ]
    ),

    "shortest-palindrome": make_prob(
        description="You are given a string `s`. You can convert `s` to a palindrome by adding characters in front of it. Find and return the shortest palindrome you can find by performing this transformation. Solve in O(N) time using KMP LPS preprocessing on `s + '#' + reverse(s)`.",
        input_format="A string `s`.",
        output_format="Return the shortest palindrome string formed.",
        constraints="0 <= s.length <= 5 * 10^4\ns consists of lowercase English letters only.",
        examples=[
            {
                "input": "s = \"aacecaaa\"",
                "output": "\"aaacecaaa\"",
                "explanation": "Prepending 'a' gives the shortest palindrome."
            },
            {
                "input": "s = \"abcd\"",
                "output": "\"dcbabcd\"",
                "explanation": "Prepending \"dcb\" gives the shortest palindrome."
            }
        ]
    ),

    "longest-happy-prefix": make_prob(
        description="A string is called a happy prefix if is a non-empty prefix which is also a suffix (excluding itself). Given a string `s`, return the longest happy prefix of `s`. Return an empty string `\"\"` if no such prefix exists. Solve in O(N) time using the KMP LPS array.",
        input_format="A string `s`.",
        output_format="Return the longest happy prefix string.",
        constraints="1 <= s.length <= 10^5\ns contains only lowercase English letters.",
        examples=[
            {
                "input": "s = \"level\"",
                "output": "\"l\"",
                "explanation": "\"l\" is a prefix of \"level\" and also a suffix of \"level\"."
            },
            {
                "input": "s = \"ababab\"",
                "output": "\"abab\"",
                "explanation": "\"abab\" is the largest prefix which is also suffix."
            }
        ]
    ),
}
