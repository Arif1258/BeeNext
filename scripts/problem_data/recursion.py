from .common import make_prob

RECURSION_DATA = {
    "pow(x,n)": make_prob(
        description="Implement `pow(x, n)`, which calculates `x` raised to the power `n` (`x^n`). Solve in O(log n) time using binary exponentiation, correctly handling negative powers and odd/even exponent branching.",
        input_format="A double float `x` and an integer exponent `n`.",
        output_format="Return the computed power value as a float / double.",
        constraints="-100.0 < x < 100.0\n-2^31 <= n <= 2^31 - 1\nEither x is not zero or n > 0.\n-10^4 <= x^n <= 10^4",
        examples=[
            {
                "input": "x = 2.00000, n = 10",
                "output": "1024.00000",
                "explanation": "2 raised to power 10 is 1024."
            },
            {
                "input": "x = 2.00000, n = -2",
                "output": "0.25000",
                "explanation": "2^-2 = 1/(2^2) = 1/4 = 0.25."
            }
        ]
    ),

    "generate-parentheses": make_prob(
        description="Given `n` pairs of parentheses, write a function to generate all combinations of well-formed parentheses using backtracking. A combination is well-formed if an opening bracket is always available before a closing bracket and total open brackets count equals `n`.",
        input_format="An integer `n`.",
        output_format="Return a list of all unique well-formed parentheses strings.",
        constraints="1 <= n <= 8",
        examples=[
            {
                "input": "n = 3",
                "output": "[\"((()))\", \"(()())\", \"(())()\", \"()(())\", \"()()()\"]",
                "explanation": "All 5 valid combinations of 3 parenthesis pairs."
            },
            {
                "input": "n = 1",
                "output": "[\"()\"]",
                "explanation": "Only 1 pair of parenthesis."
            }
        ]
    ),

    "power-set": make_prob(
        description="Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order. Solve using recursion / backtracking or bit manipulation.",
        input_format="An integer array `nums` of unique elements.",
        output_format="Return a list of all subsets.",
        constraints="1 <= nums.length <= 10\n-10 <= nums[i] <= 10\nAll elements are unique.",
        examples=[
            {
                "input": "nums = [1, 2, 3]",
                "output": "[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]",
                "explanation": "All 2^3 = 8 subsets are generated."
            },
            {
                "input": "nums = [0]",
                "output": "[[], [0]]",
                "explanation": "2^1 = 2 subsets."
            }
        ]
    ),

    "count-good-numbers": make_prob(
        description="A digit string is good if the digits (0-indexed) at even indices are even (0, 2, 4, 6, 8) and the digits at odd indices are prime (2, 3, 5, 7). Given an integer `n`, return the total number of good digit strings of length `n`. Since the answer may be large, return it modulo 10^9 + 7. Solve in O(log n) time using binary exponentiation.",
        input_format="A positive integer `n`.",
        output_format="Return the count of good digit strings modulo 10^9 + 7.",
        constraints="1 <= n <= 10^15",
        examples=[
            {
                "input": "n = 1",
                "output": "5",
                "explanation": "Good numbers of length 1: \"0\", \"2\", \"4\", \"6\", \"8\" (5 even digits)."
            },
            {
                "input": "n = 4",
                "output": "400",
                "explanation": "Even indices: 5 choices each (indices 0, 2). Odd indices: 4 choices each (indices 1, 3). Total = 5 * 4 * 5 * 4 = 400."
            }
        ]
    ),

    "reverse-a-stack": make_prob(
        description="You are given a stack `St`. You have to reverse the stack using recursion, without using any extra loop (no while or for loops) and without using any other auxiliary data structures.",
        input_format="A stack of integers `St`.",
        output_format="Reverse the stack in-place using recursion.",
        constraints="1 <= St.size <= 10^3\n-10^9 <= St.top <= 10^9",
        examples=[
            {
                "input": "St = [3, 2, 1, 7, 6] (top is 6)",
                "output": "[6, 7, 1, 2, 3] (top is 3)",
                "explanation": "The order of elements in stack is completely reversed."
            },
            {
                "input": "St = [4, 3, 9, 6]",
                "output": "[6, 9, 3, 4]",
                "explanation": "Stack elements inverted recursively."
            }
        ]
    ),

    "learn-all-patterns-of-subsequences": make_prob(
        description="Master the fundamental backtracking pattern of subsequences: the Take / Not Take recursive tree. Understand how each element either participates in the current candidate set or is excluded, yielding 2^N total branches. Learn how to format base conditions, accumulate running sums, and pass state efficiently.",
        input_format="An integer array `arr` and conceptual target `k`.",
        output_format="Return all subsequences generated through the standard Take/Not-Take recursive tree.",
        constraints="1 <= arr.length <= 15\n-10^3 <= arr[i] <= 10^3",
        examples=[
            {
                "input": "arr = [3, 1, 2]",
                "output": "[[], [3], [1], [2], [3, 1], [3, 2], [1, 2], [3, 1, 2]]",
                "explanation": "All 2^3 = 8 subsequences generated in systematic order."
            },
            {
                "input": "arr = [1, 2]",
                "output": "[[], [1], [2], [1, 2]]",
                "explanation": "Subsequences generated by branching."
            }
        ]
    ),

    "check-if-there-exists-a-subsequence-with-sum-k": make_prob(
        description="Given an array `arr` and target sum `k`, determine if there exists at least one subsequence whose sum equals `k`. Return `true` if any such subsequence exists, otherwise `false`. Optimize the recursion to return early as soon as the first matching subsequence is encountered.",
        input_format="An integer array `arr` and an integer `k`.",
        output_format="Return boolean `true` if valid subsequence exists, else `false`.",
        constraints="1 <= arr.length <= 20\n1 <= arr[i], k <= 10^5",
        examples=[
            {
                "input": "arr = [1, 2, 3, 4], k = 5",
                "output": "true",
                "explanation": "Subsequence [1, 4] or [2, 3] has sum 5."
            },
            {
                "input": "arr = [1, 2, 3], k = 10",
                "output": "false",
                "explanation": "No subsequence sums to 10."
            }
        ]
    ),

    "count-all-subsequences-with-sum-k": make_prob(
        description="Given an array `arr` of integers and an integer `k`, count all the subsequences whose sum is equal to `k`. Since the count can be large, return it modulo 10^9 + 7.",
        input_format="An integer array `arr` and an integer `k`.",
        output_format="Return the number of subsequences with sum `k` modulo 10^9 + 7.",
        constraints="1 <= arr.length <= 1000\n0 <= arr[i] <= 1000\n1 <= k <= 1000",
        examples=[
            {
                "input": "arr = [5, 2, 3, 10, 6, 8], k = 10",
                "output": "3",
                "explanation": "The subsequences are [5, 2, 3], [2, 8], and [10]."
            },
            {
                "input": "arr = [2, 4, 6], k = 6",
                "output": "2",
                "explanation": "Subsequences are [2, 4] and [6]."
            }
        ]
    ),

    "generate-binary-strings-without-consecutive-1s": make_prob(
        description="Given an integer `n`, generate all binary strings of length `n` such that there are no consecutive `1`s in any string. Return the strings in lexicographically sorted order.",
        input_format="A positive integer `n`.",
        output_format="Return a list of valid binary strings.",
        constraints="1 <= n <= 20",
        examples=[
            {
                "input": "n = 3",
                "output": "[\"000\", \"001\", \"010\", \"100\", \"101\"]",
                "explanation": "Strings \"011\", \"110\", and \"111\" contain consecutive 1s and are excluded."
            },
            {
                "input": "n = 2",
                "output": "[\"00\", \"01\", \"10\"]",
                "explanation": "\"11\" is excluded."
            }
        ]
    ),

    "combination-sum": make_prob(
        description="Given an array of distinct integers `candidates` and a target integer `target`, return a list of all unique combinations of `candidates` where the chosen numbers sum to `target`. You may return the combinations in any order. The same number may be chosen from `candidates` an unlimited number of times.",
        input_format="An array of distinct integers `candidates` and target integer `target`.",
        output_format="Return a list of all unique combinations summing to target.",
        constraints="1 <= candidates.length <= 30\n2 <= candidates[i] <= 40\nAll elements of candidates are distinct.\n1 <= target <= 40",
        examples=[
            {
                "input": "candidates = [2, 3, 6, 7], target = 7",
                "output": "[[2, 2, 3], [7]]",
                "explanation": "2 + 2 + 3 = 7 and 7 = 7."
            },
            {
                "input": "candidates = [2, 3, 5], target = 8",
                "output": "[[2, 2, 2, 2], [2, 3, 3], [3, 5]]",
                "explanation": "Valid combinations summing to 8."
            }
        ]
    ),

    "combination-sum-ii": make_prob(
        description="Given a collection of candidate numbers `candidates` and a target number `target`, find all unique combinations in `candidates` where the candidate numbers sum to `target`. Each number in `candidates` may only be used once in the combination. The solution set must not contain duplicate combinations.",
        input_format="An integer array `candidates` and target integer `target`.",
        output_format="Return a list of all unique combinations summing to target.",
        constraints="1 <= candidates.length <= 100\n1 <= candidates[i] <= 50\n1 <= target <= 30",
        examples=[
            {
                "input": "candidates = [10, 1, 2, 7, 6, 1, 5], target = 8",
                "output": "[[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]",
                "explanation": "All unique combinations where elements sum to 8."
            },
            {
                "input": "candidates = [2, 5, 2, 1, 2], target = 5",
                "output": "[[1, 2, 2], [5]]",
                "explanation": "Combinations summing to 5."
            }
        ]
    ),

    "subsets-i": make_prob(
        description="Given an array of integers `nums`, return all possible subset sums in non-decreasing order. A subset sum is the sum of all elements in a particular subset.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return a sorted list containing the sums of all 2^n subsets.",
        constraints="1 <= nums.length <= 15\n0 <= nums[i] <= 1000",
        examples=[
            {
                "input": "nums = [2, 3]",
                "output": "[0, 2, 3, 5]",
                "explanation": "Subsets are [], [2], [3], [2, 3] with sums 0, 2, 3, 5."
            },
            {
                "input": "nums = [5, 2, 1]",
                "output": "[0, 1, 2, 3, 5, 6, 7, 8]",
                "explanation": "Sorted subset sums of [1, 2, 5]."
            }
        ]
    ),

    "subsets-ii": make_prob(
        description="Given an integer array `nums` that may contain duplicates, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order. Avoid duplicates by sorting the array and skipping adjacent duplicate choices at the same recursion depth.",
        input_format="An integer array `nums` that may contain duplicate values.",
        output_format="Return a list of unique subsets.",
        constraints="1 <= nums.length <= 10\n-10 <= nums[i] <= 10",
        examples=[
            {
                "input": "nums = [1, 2, 2]",
                "output": "[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]",
                "explanation": "All unique subsets without duplicate listings."
            },
            {
                "input": "nums = [0]",
                "output": "[[], [0]]",
                "explanation": "2 subsets."
            }
        ]
    ),

    "combination-sum-iii": make_prob(
        description="Find all valid combinations of `k` numbers that sum up to `n` such that only numbers 1 through 9 are used, and each number is used at most once. Return a list of all possible valid combinations.",
        input_format="Two positive integers `k` and `n`.",
        output_format="Return a list of all unique combinations of size `k` summing to `n`.",
        constraints="2 <= k <= 9\n1 <= n <= 60",
        examples=[
            {
                "input": "k = 3, n = 7",
                "output": "[[1, 2, 4]]",
                "explanation": "1 + 2 + 4 = 7. There are no other valid combinations."
            },
            {
                "input": "k = 3, n = 9",
                "output": "[[1, 2, 6], [1, 3, 5], [2, 3, 4]]",
                "explanation": "Three valid 3-element combinations sum to 9."
            }
        ]
    ),

    "letter-combinations-of-a-phone-number": make_prob(
        description="Given a string containing digits from `2-9` inclusive, return all possible letter combinations that the number could represent based on classic telephone keypad buttons. Return the answer in any order.",
        input_format="A string `digits` containing characters '2' through '9'.",
        output_format="Return a list of strings representing all combinations.",
        constraints="0 <= digits.length <= 4\ndigits[i] is a digit in the range ['2', '9'].",
        examples=[
            {
                "input": "digits = \"23\"",
                "output": "[\"ad\", \"ae\", \"af\", \"bd\", \"be\", \"bf\", \"cd\", \"ce\", \"cf\"]",
                "explanation": "2 maps to 'abc' and 3 maps to 'def'."
            },
            {
                "input": "digits = \"\"",
                "output": "[]",
                "explanation": "Empty input produces empty output."
            }
        ]
    ),

    "palindrome-partitioning": make_prob(
        description="Given a string `s`, partition `s` such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of `s` using backtracking and two-pointer palindrome verification.",
        input_format="A string `s` of lowercase English letters.",
        output_format="Return a list of all palindromic partition lists.",
        constraints="1 <= s.length <= 16\ns contains only lowercase English letters.",
        examples=[
            {
                "input": "s = \"aab\"",
                "output": "[[\"a\", \"a\", \"b\"], [\"aa\", \"b\"]]",
                "explanation": "Both partitions consist entirely of palindromic substrings."
            },
            {
                "input": "s = \"a\"",
                "output": "[[\"a\"]]",
                "explanation": "Single character string."
            }
        ]
    ),

    "word-search": make_prob(
        description="Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically neighboring). The same letter cell may not be used more than once in a word.",
        input_format="An `m x n` character grid `board` and a string `word`.",
        output_format="Return boolean `true` if word exists, else `false`.",
        constraints="m == board.length\nn = board[i].length\n1 <= m, n <= 6\n1 <= word.length <= 15\nboard and word consist of lowercase and uppercase English letters.",
        examples=[
            {
                "input": "board = [[\"A\", \"B\", \"C\", \"E\"], [\"S\", \"F\", \"C\", \"S\"], [\"A\", \"D\", \"E\", \"E\"]], word = \"ABCCED\"",
                "output": "true",
                "explanation": "The word \"ABCCED\" can be traced on the grid."
            },
            {
                "input": "board = [[\"A\", \"B\", \"C\", \"E\"], [\"S\", \"F\", \"C\", \"S\"], [\"A\", \"D\", \"E\", \"E\"]], word = \"ABCB\"",
                "output": "false",
                "explanation": "Cell \"B\" cannot be reused twice."
            }
        ]
    ),

    "n-queen": make_prob(
        description="The n-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other. Given an integer `n`, return all distinct solutions to the n-queens puzzle. Each solution contains a distinct board configuration, where `'Q'` and `'.'` denote a queen and an empty space.",
        input_format="An integer `n`.",
        output_format="Return a list of all valid chessboard configurations.",
        constraints="1 <= n <= 9",
        examples=[
            {
                "input": "n = 4",
                "output": "[[[\".Q..\", \"...Q\", \"Q...\", \"..Q.\"], [\"..Q.\", \"Q...\", \"...Q\", \".Q..\"]]]",
                "explanation": "Two distinct solutions exist for 4-queens."
            },
            {
                "input": "n = 1",
                "output": "[[\"Q\"]]",
                "explanation": "Single queen on 1x1 board."
            }
        ]
    ),

    "rat-in-a-maze": make_prob(
        description="Consider a rat placed at `(0, 0)` in a square matrix `mat` of order `n x n`. It has to reach destination at `(n - 1, n - 1)`. Find all possible paths that the rat can take to reach from source to destination. Directions are 'U'(up), 'D'(down), 'L'(left), 'R'(right). Value 0 means blocked cell, 1 means path. Return paths in lexicographical order.",
        input_format="An `n x n` 2D binary matrix `mat`.",
        output_format="Return a list of path direction strings sorted alphabetically.",
        constraints="2 <= n <= 5\nmat[i][j] is either 0 or 1.",
        examples=[
            {
                "input": "mat = [[1, 0, 0, 0], [1, 1, 0, 1], [1, 1, 0, 0], [0, 1, 1, 1]], n = 4",
                "output": "[\"DDRDRR\", \"DRDDRR\"]",
                "explanation": "Two valid paths exist from (0, 0) to (3, 3)."
            },
            {
                "input": "mat = [[1, 0], [1, 0]], n = 2",
                "output": "[]",
                "explanation": "Destination (1, 1) is blocked."
            }
        ]
    ),

    "m-coloring-problem": make_prob(
        description="Given an undirected graph and an integer `m`, determine if the graph can be colored with at most `m` colors such that no two adjacent vertices of the graph are colored with the same color. Return `true` if graph can be colored, else `false`.",
        input_format="An adjacency matrix or edge list for `n` vertices, and integer `m` (colors).",
        output_format="Return boolean `true` if m-coloring is possible, else `false`.",
        constraints="1 <= n <= 20\n1 <= m <= n",
        examples=[
            {
                "input": "n = 4, m = 3, edges = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]]",
                "output": "true",
                "explanation": "The graph can be colored with 3 colors."
            },
            {
                "input": "n = 3, m = 2, edges = [[0, 1], [1, 2], [2, 0]]",
                "output": "false",
                "explanation": "A triangle graph requires at least 3 colors."
            }
        ]
    ),

    "sudoko-solver": make_prob(
        description="Write a program to solve a Sudoku puzzle by filling the empty cells. A sudoku solution must satisfy: 1. Each digit 1-9 must occur exactly once in each row. 2. Each digit 1-9 must occur exactly once in each column. 3. Each digit 1-9 must occur exactly once in each of the 9 `3x3` sub-boxes. Character `'.'` indicates an empty cell.",
        input_format="A `9x9` 2D character array `board`.",
        output_format="Modify the `9x9` board in-place with the completed valid Sudoku solution.",
        constraints="board.length == 9\nboard[i].length == 9\nboard[i][j] is a digit '1'-'9' or '.'.\nIt is guaranteed that the input board has only one unique solution.",
        examples=[
            {
                "input": "board = [[\"5\",\"3\",\".\",\".\",\"7\",\".\",\".\",\".\",\".\"],[\"6\",\".\",\".\",\"1\",\"9\",\"5\",\".\",\".\",\".\"],[\".\",\"9\",\"8\",\".\",\".\",\".\",\".\",\"6\",\".\"],[\"8\",\".\",\".\",\".\",\"6\",\".\",\".\",\".\",\"3\"],[\"4\",\".\",\".\",\"8\",\".\",\"3\",\".\",\".\",\"1\"],[\"7\",\".\",\".\",\".\",\"2\",\".\",\".\",\".\",\"6\"],[\".\",\"6\",\".\",\".\",\".\",\".\",\"2\",\"8\",\".\"],[\".\",\".\",\".\",\"4\",\"1\",\"9\",\".\",\".\",\"5\"],[\".\",\".\",\".\",\".\",\"8\",\".\",\".\",\"7\",\"9\"]]",
                "output": "[Valid completed 9x9 Sudoku grid]",
                "explanation": "All rows, columns, and 3x3 subgrids contain numbers 1-9 uniquely."
            },
            {
                "input": "board = [standard Sudoku puzzle]",
                "output": "[solved Sudoku grid]",
                "explanation": "Puzzle solved via backtracking."
            }
        ]
    ),

    "expression-add-operators": make_prob(
        description="Given a string `num` that contains only digits and an integer `target`, return all possibilities to insert the binary operators `'+'`, `'-'`, and/or `'*'` between the digits of `num` so that the resultant expression evaluates to the `target` value. Operands must not contain leading zeros.",
        input_format="A string `num` of digits and integer `target`.",
        output_format="Return a list of all valid expression strings.",
        constraints="1 <= num.length <= 10\nnum consists of only digits.\n-2^31 <= target <= 2^31 - 1",
        examples=[
            {
                "input": "num = \"123\", target = 6",
                "output": "[\"1*2*3\", \"1+2+3\"]",
                "explanation": "Both expressions evaluate to 6."
            },
            {
                "input": "num = \"232\", target = 8",
                "output": "[\"2*3+2\", \"2+3*2\"]",
                "explanation": "Both expressions evaluate to 8."
            }
        ]
    ),
}
