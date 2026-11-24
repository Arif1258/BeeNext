from .common import make_prob

# Generator helper for pattern problems
def _make_pattern(num, shape_desc, n3_output, n4_output):
    return make_prob(
        description=f"Given an integer `N`, print the Pattern {num} shape containing {shape_desc}.",
        input_format="A single positive integer `N` representing the dimension / height of the pattern.",
        output_format="Print the corresponding pattern to standard output.",
        constraints="1 <= N <= 20",
        examples=[
            {
                "input": "N = 3",
                "output": n3_output,
                "explanation": f"Pattern {num} rendered for N = 3."
            },
            {
                "input": "N = 4",
                "output": n4_output,
                "explanation": f"Pattern {num} rendered for N = 4."
            }
        ]
    )

BEGINNER_DATA = {
    # --- FOUNDATIONAL THINKING (12) ---
    "breaking-the-myth": make_prob(
        description="Explore and break down the common myths and misconceptions surrounding Data Structures, Algorithms, and technical coding interviews. Understand that excelling in DSA does not require genius-level mathematics or memorizing hundreds of solutions; rather, it is about consistent pattern recognition, structured problem decomposition, and deliberate practice.",
        input_format="A conceptual interview question or problem statement.",
        output_format="Analyze the problem logically and select an appropriate algorithmic paradigm.",
        constraints="1 <= questions <= 100",
        examples=[
            {
                "input": "Problem: Find an element in a million items.",
                "output": "Binary Search: O(log N) operations (~20 steps) rather than O(N) million checks.",
                "explanation": "Algorithmic thinking reduces exponential work to logarithmic time."
            },
            {
                "input": "Problem: Check duplicates in an array.",
                "output": "Hash Set: O(1) average lookup vs O(N^2) pairwise comparisons.",
                "explanation": "Right data structure choice drastically optimizes performance."
            }
        ]
    ),

    "programming-and-what-are-computers": make_prob(
        description="Understand how computers execute instructions at the hardware level: CPU architecture, arithmetic logic units (ALU), memory hierarchy (registers, L1/L2/L3 cache, RAM, secondary storage), and how high-level code translates into machine instructions. Learn why memory access patterns impact program performance.",
        input_format="Standard memory and compute parameters.",
        output_format="Demonstrate understanding of time and memory complexity.",
        constraints="1 <= instructions <= 10^8 per second",
        examples=[
            {
                "input": "CPU operations per second ~ 10^8",
                "output": "An O(N) algorithm with N = 10^7 runs in ~0.1 seconds.",
                "explanation": "Understanding processor limits helps verify time limit bounds."
            },
            {
                "input": "Array traversal (contiguous) vs Linked List traversal (pointer jumps)",
                "output": "Array exhibits superior spatial cache locality.",
                "explanation": "Hardware caches accelerate contiguous memory reads."
            }
        ]
    ),

    "how-to-think-like-a-programmer": make_prob(
        description="Develop systematic algorithmic problem-solving habits: 1. Understand the problem and identify edge cases. 2. Work through concrete examples manually with pencil and paper. 3. Formulate a brute-force approach first. 4. Optimize time and space complexities. 5. Write clean, modular pseudocode before implementing.",
        input_format="A problem description and sample constraints.",
        output_format="A structured step-by-step problem breakdown from brute force to optimal.",
        constraints="1 <= complexity <= O(N!)",
        examples=[
            {
                "input": "Find pair with sum K",
                "output": "Brute Force: O(N^2) loops -> Sorting + Two Pointers: O(N log N) -> Hash Map: O(N)",
                "explanation": "Progressive optimization steps."
            },
            {
                "input": "Find minimum in array",
                "output": "Initialize min = arr[0], traverse once updating min, return min. O(N).",
                "explanation": "Step-by-step logic."
            }
        ]
    ),

    "flowcharts-and-pseudocode": make_prob(
        description="Learn to construct visual flowcharts using standard flowchart symbols (oval for start/stop, parallelogram for I/O, rectangle for processes, and diamond for conditional branching) and translate flow logic into structured pseudocode.",
        input_format="A conditional problem scenario.",
        output_format="Construct a structured decision flow and pseudocode representation.",
        constraints="1 <= conditions <= 100",
        examples=[
            {
                "input": "Check if a number N is positive, negative, or zero.",
                "output": "Start -> Input N -> If N > 0: Print 'Positive' -> Else If N < 0: Print 'Negative' -> Else: Print 'Zero' -> End.",
                "explanation": "Structured flowchart decisions mapped cleanly."
            },
            {
                "input": "Compute sum of numbers from 1 to N.",
                "output": "Initialize sum = 0, i = 1; While i <= N: sum += i, i++; Print sum.",
                "explanation": "Loop invariant in pseudocode."
            }
        ]
    ),

    "flowchart-problem-solving": make_prob(
        description="Apply flowchart modeling to multi-step algorithmic challenges: loop invariants, termination conditions, nested branches, and edge case detection. Trace paths for various input values to verify correctness before coding.",
        input_format="A problem with multiple branches and loops.",
        output_format="Complete verified flowchart execution trace.",
        constraints="1 <= steps <= 10^5",
        examples=[
            {
                "input": "Find maximum of three numbers A, B, and C.",
                "output": "Compare A and B; compare winner with C; print maximum.",
                "explanation": "Decision diamond branches evaluate the maximum in 2 comparisons."
            },
            {
                "input": "Determine if year Y is a leap year.",
                "output": "If (Y % 400 == 0) or (Y % 4 == 0 and Y % 100 != 0): Leap -> Else: Not Leap.",
                "explanation": "Compound conditional logic."
            }
        ]
    ),

    "dry-runs-edge-cases-and-debugging": make_prob(
        description="Master dry running code with trace tables: tracking variable values at each loop iteration. Learn to identify and test critical edge cases: null/empty inputs, single-element arrays, extreme bounds (integer overflow), all duplicates, and reverse-sorted collections.",
        input_format="An algorithm implementation and edge-case test vector.",
        output_format="Execution trace table showing variable state per iteration.",
        constraints="1 <= iterations <= 100",
        examples=[
            {
                "input": "Binary Search on [1, 3, 5] for target 4",
                "output": "Iter 1: low=0, high=2, mid=1 (val 3) -> low=2. Iter 2: low=2, high=2, mid=2 (val 5) -> high=1. Loop terminates, returns -1.",
                "explanation": "Trace table isolates boundary termination conditions."
            },
            {
                "input": "Array reversal on [1, 2, 3, 4]",
                "output": "Swap(0, 3) -> [4, 2, 3, 1]; Swap(1, 2) -> [4, 3, 2, 1]; Stop.",
                "explanation": "Pointers meet at center."
            }
        ]
    ),

    "programming-languages-and-choosing-a-path": make_prob(
        description="Compare the major programming languages used in competitive programming and technical interviews: C++ (high execution speed, STL, pointer control), Java (strict typing, JVM, comprehensive Collections framework, industry standard), and Python (rapid prototyping, clean syntax). Choose a language that matches your interview goals.",
        input_format="Language preference and target engineering domains.",
        output_format="Recommended primary and secondary language stack.",
        constraints="Valid language in {C++, Java, Python, JavaScript}",
        examples=[
            {
                "input": "Goal: Competitive programming with fastest runtime",
                "output": "C++ with GCC and STL",
                "explanation": "Zero-overhead abstractions and fastest execution times."
            },
            {
                "input": "Goal: Enterprise software engineering and backend interviews",
                "output": "Java with Java Collections Framework",
                "explanation": "Strong typing and widely tested in technical interviews."
            }
        ]
    ),

    "learn-cpp": make_prob(
        description="Master foundational C++ programming: standard I/O with `cin` and `cout`, fundamental data types (`int`, `long long`, `float`, `double`, `char`, `string`), conditional statements (`if-else`, `switch`), loops (`for`, `while`, `do-while`), functions, and passing parameters by value vs. reference (`&`).",
        input_format="Standard input stream values.",
        output_format="Standard output formatted using C++ I/O streams.",
        constraints="-10^9 <= integers <= 10^9",
        examples=[
            {
                "input": "int a = 5, b = 10; cin >> a >> b;",
                "output": "cout << a + b << endl; -> 15",
                "explanation": "Basic C++ stream addition."
            },
            {
                "input": "Pass by reference: void increment(int &x) { x++; }",
                "output": "Original variable value is incremented directly.",
                "explanation": "Reference parameters mutate caller state without copying."
            }
        ]
    ),

    "learn-java": make_prob(
        description="Master foundational Java programming: class declarations, the `main` method, primitive types vs. reference types, input reading via `Scanner` and `BufferedReader`, conditionals, loops, array declarations, and memory management via garbage collection.",
        input_format="Standard input stream values.",
        output_format="Formatted output using `System.out.println()`.",
        constraints="-10^9 <= integers <= 10^9",
        examples=[
            {
                "input": "int[] arr = new int[]{1, 2, 3};",
                "output": "System.out.println(arr.length) -> 3",
                "explanation": "Array creation and length attribute access in Java."
            },
            {
                "input": "Scanner sc = new Scanner(System.in); int x = sc.nextInt();",
                "output": "Parses integer from standard input stream.",
                "explanation": "Console input parsing."
            }
        ]
    ),

    "learn-python": make_prob(
        description="Master foundational Python programming: dynamic typing, indentation, input parsing via `input().split()`, list comprehensions, slicing `arr[::-1]`, dictionaries, sets, and functions.",
        input_format="Standard input lines.",
        output_format="Formatted console output.",
        constraints="-10^9 <= integers <= 10^9",
        examples=[
            {
                "input": "nums = list(map(int, input().split()))",
                "output": "Parses a space-separated line into a list of integers.",
                "explanation": "Python list comprehension and map."
            },
            {
                "input": "s = \"hello\"; print(s[::-1])",
                "output": "\"olleh\"",
                "explanation": "String reversal using Python slice step."
            }
        ]
    ),

    "easy-and-medium": make_prob(
        description="Understand the structural differences between Easy and Medium difficulty problems in technical coding rounds: Easy problems generally require direct implementation of standard algorithms (e.g. single pass, basic hash map), while Medium problems require combining multiple patterns (e.g., prefix sum with hash maps, binary search on answers, or multi-state dynamic programming).",
        input_format="A problem statement and constraints.",
        output_format="Identify algorithmic requirements and optimal data structure choices.",
        constraints="1 <= N <= 10^6",
        examples=[
            {
                "input": "Check if an array contains duplicates (Easy)",
                "output": "Single pass with HashSet in O(N) time and O(N) space.",
                "explanation": "Direct application of a hash set."
            },
            {
                "input": "Longest Substring Without Repeating Characters (Medium)",
                "output": "Dynamic sliding window with hash map and two pointers in O(N) time.",
                "explanation": "Combines window expansion, contraction, and index tracking."
            }
        ]
    ),

    "hard": make_prob(
        description="Understand what defines Hard technical interview problems: complex state spaces, subtle edge cases, advanced data structure augmentations (e.g., segment trees, binary tries, monotonic queues), and combining multiple paradigms such as graph traversals with dynamic programming.",
        input_format="Complex constraint scenarios.",
        output_format="Architect an optimal composite algorithmic strategy.",
        constraints="1 <= N <= 10^5",
        examples=[
            {
                "input": "Trapping Rainwater / Largest Rectangle in Histogram",
                "output": "Monotonic Stack in O(N) linear time and O(N) auxiliary space.",
                "explanation": "Maintains boundary invariants to eliminate nested loops."
            },
            {
                "input": "Median of Two Sorted Arrays",
                "output": "Binary search on partition points in O(log(min(M, N))) time.",
                "explanation": "Optimizes combined median calculation without merging."
            }
        ]
    ),

    # --- PATTERNS 1 THROUGH 22 ---
    "pattern-1": _make_pattern(1, "an N x N square of asterisks", "* * *\n* * *\n* * *", "* * * *\n* * * *\n* * * *\n* * * *"),
    "pattern-2": _make_pattern(2, "a right-angled triangle of asterisks", "*\n* *\n* * *", "*\n* *\n* * *\n* * * *"),
    "pattern-3": _make_pattern(3, "a right-angled number triangle (1 to row index)", "1\n1 2\n1 2 3", "1\n1 2\n1 2 3\n1 2 3 4"),
    "pattern-4": _make_pattern(4, "a right-angled triangle with repeating numbers", "1\n2 2\n3 3 3", "1\n2 2\n3 3 3\n4 4 4 4"),
    "pattern-5": _make_pattern(5, "an inverted right-angled triangle of asterisks", "* * *\n* *\n*", "* * * *\n* * *\n* *\n*"),
    "pattern-6": _make_pattern(6, "an inverted right-angled number triangle", "1 2 3\n1 2\n1", "1 2 3 4\n1 2 3\n1 2\n1"),
    "pattern-7": _make_pattern(7, "a centered star pyramid with spaces", "  *\n ***\n*****", "   *\n  ***\n *****\n*******"),
    "pattern-8": _make_pattern(8, "an inverted centered star pyramid", "*****\n ***\n  *", "*******\n *****\n  ***\n   *"),
    "pattern-9": _make_pattern(9, "a symmetric star diamond", "  *\n ***\n*****\n*****\n ***\n  *", "   *\n  ***\n *****\n*******\n*******\n *****\n  ***\n   *"),
    "pattern-10": _make_pattern(10, "a half diamond star pattern rotated 90 degrees", "*\n* *\n* * *\n* *\n*", "*\n* *\n* * *\n* * * *\n* * *\n* *\n*"),
    "pattern-11": _make_pattern(11, "a binary triangle alternating 1 and 0", "1\n0 1\n1 0 1", "1\n0 1\n1 0 1\n0 1 0 1"),
    "pattern-12": _make_pattern(12, "a symmetric number crown with middle spaces", "1    1\n12  21\n123321", "1      1\n12    21\n123  321\n12344321"),
    "pattern-13": _make_pattern(13, "Floyd's triangle of consecutive increasing numbers", "1\n2 3\n4 5 6", "1\n2 3\n4 5 6\n7 8 9 10"),
    "pattern-14": _make_pattern(14, "an increasing alphabet triangle starting from 'A'", "A\nAB\nABC", "A\nAB\nABC\nABCD"),
    "pattern-15": _make_pattern(15, "an inverted alphabet triangle starting from 'A'", "ABC\nAB\nA", "ABCD\nABC\nAB\nA"),
    "pattern-16": _make_pattern(16, "an alphabet triangle with repeating letters", "A\nBB\nCCC", "A\nBB\nCCC\nDDDD"),
    "pattern-17": _make_pattern(17, "an alphabet pyramid symmetric around center", "  A\n ABA\nABCBA", "   A\n  ABA\n ABCBA\nABCDCBA"),
    "pattern-18": _make_pattern(18, "an alphabet triangle printing characters backwards from N-th letter", "C\nC B\nC B A", "D\nD C\nD C B\nD C B A"),
    "pattern-19": _make_pattern(19, "a symmetric hollow void pattern inside a square", "******\n**  **\n*    *\n*    *\n**  **\n******", "********\n***  ***\n**    **\n*      *\n*      *\n**    **\n***  ***\n********"),
    "pattern-20": _make_pattern(20, "a butterfly star pattern", "*    *\n**  **\n******\n**  **\n*    *", "*      *\n**    **\n***  ***\n********\n***  ***\n**    **\n*      *"),
    "pattern-21": _make_pattern(21, "a hollow square pattern with boundary stars", "***\n* *\n***", "****\n*  *\n*  *\n****"),
    "pattern-22": _make_pattern(22, "a concentric square spiral of numbers counting down from N to 1", "3 3 3 3 3\n3 2 2 2 3\n3 2 1 2 3\n3 2 2 2 3\n3 3 3 3 3", "4 4 4 4 4 4 4\n4 3 3 3 3 3 4\n4 3 2 2 2 3 4\n4 3 2 1 2 3 4\n4 3 2 2 2 3 4\n4 3 3 3 3 3 4\n4 4 4 4 4 4 4"),

    # --- STANDARD LIBRARIES & OVERVIEWS (9) ---
    "theory-with-examples": make_prob(
        description="Review standard library collections and time complexity benchmarks: constant time O(1) array indexing, logarithmic O(log N) binary search tree / heap lookups, and linear O(N) traversals. Learn how standard library containers implement these algorithmic concepts internally.",
        input_format="A collection operation query.",
        output_format="Return time complexity and output of standard container operation.",
        constraints="1 <= operations <= 10^5",
        examples=[
            {
                "input": "Lookup key in Hash Map",
                "output": "O(1) average time complexity",
                "explanation": "Hash tables compute array buckets in constant time."
            },
            {
                "input": "Insert in Balanced BST (std::map / TreeMap)",
                "output": "O(log N) time complexity",
                "explanation": "Red-Black tree self-balances to guarantee logarithmic height."
            }
        ]
    ),

    "stl": make_prob(
        description="Master the C++ Standard Template Library (STL): sequential containers (`vector`, `deque`, `list`), associative containers (`set`, `map`, `unordered_set`, `unordered_map`), container adapters (`stack`, `queue`, `priority_queue`), and common algorithms (`sort`, `lower_bound`, `upper_bound`, `reverse`, `next_permutation`).",
        input_format="An array of integers `nums`.",
        output_format="Demonstrate sorting and searching using C++ STL algorithms.",
        constraints="1 <= nums.length <= 10^5",
        examples=[
            {
                "input": "vector<int> v = {3, 1, 2}; sort(v.begin(), v.end());",
                "output": "v = [1, 2, 3]",
                "explanation": "std::sort uses Introsort running in O(N log N) time."
            },
            {
                "input": "priority_queue<int> pq; pq.push(10); pq.push(20);",
                "output": "pq.top() = 20",
                "explanation": "Default C++ priority_queue is a Max-Heap."
            }
        ]
    ),

    "java-collections": make_prob(
        description="Master the Java Collections Framework (JCF): `List` (`ArrayList`, `LinkedList`), `Set` (`HashSet`, `TreeSet`, `LinkedHashSet`), `Map` (`HashMap`, `TreeMap`, `LinkedHashMap`), and `Queue` (`PriorityQueue`, `ArrayDeque`). Learn `Comparable` vs. `Comparator` for custom sorting.",
        input_format="An array of strings or integers.",
        output_format="Demonstrate Java collection storage, retrieval, and sorting.",
        constraints="1 <= elements <= 10^5",
        examples=[
            {
                "input": "Map<String, Integer> map = new HashMap<>(); map.put(\"apple\", 3);",
                "output": "map.get(\"apple\") -> 3",
                "explanation": "HashMap provides O(1) average get and put operations."
            },
            {
                "input": "PriorityQueue<Integer> pq = new PriorityQueue<>(); pq.add(5); pq.add(1);",
                "output": "pq.poll() -> 1",
                "explanation": "Java PriorityQueue is a Min-Heap by default."
            }
        ]
    ),

    "python-libraries-part-1": make_prob(
        description="Master Python's built-in data structures and utilities: `list`, `tuple`, `set`, `dict`, list comprehensions, slicing, `enumerate()`, `zip()`, and the `sorted()` function with custom key lambdas.",
        input_format="A list of values.",
        output_format="Demonstrate Pythonic manipulation.",
        constraints="1 <= elements <= 10^5",
        examples=[
            {
                "input": "arr = [3, 1, 4]; arr.sort()",
                "output": "[1, 3, 4]",
                "explanation": "Python uses Timsort running in O(N log N) time."
            },
            {
                "input": "d = {x: x**2 for x in range(3)}",
                "output": "{0: 0, 1: 1, 2: 4}",
                "explanation": "Dictionary comprehension."
            }
        ]
    ),

    "python-libraries-part-2": make_prob(
        description="Master advanced Python standard library modules for DSA: `collections` (`defaultdict`, `Counter`, `deque`), `heapq` (`heappush`, `heappop`, `heapify`), `bisect` (`bisect_left`, `bisect_right`), and `itertools` (`permutations`, `combinations`).",
        input_format="An array of integers or characters.",
        output_format="Demonstrate Counter, heapq, and bisect operations.",
        constraints="1 <= elements <= 10^5",
        examples=[
            {
                "input": "from collections import Counter; Counter(\"banana\")",
                "output": "{'a': 3, 'n': 2, 'b': 1}",
                "explanation": "Counter tallies element frequencies in O(N) time."
            },
            {
                "input": "import heapq; h = [3, 1, 2]; heapq.heapify(h); heapq.heappop(h)",
                "output": "1",
                "explanation": "heapq maintains Min-Heap invariant."
            }
        ]
    ),

    "basic-maths": make_prob(
        description="Understand foundational mathematical operations in programming: modulo arithmetic, digit extraction using `% 10` and `/ 10`, prime number testing in O(sqrt(N)), Euclidean algorithm for GCD, and counting divisors.",
        input_format="A positive integer `n`.",
        output_format="Demonstrate core mathematical evaluations.",
        constraints="1 <= n <= 10^9",
        examples=[
            {
                "input": "n = 1234",
                "output": "Digits: 4, 3, 2, 1",
                "explanation": "Extracted sequentially via modulo 10."
            },
            {
                "input": "GCD(12, 18)",
                "output": "6",
                "explanation": "Greatest common divisor."
            }
        ]
    ),

    "basic-arrays-hashing-and-strings": make_prob(
        description="Comprehensive review of foundational 1D array operations, frequency hash tables, and string manipulations: linear scans, in-place element swapping, character counting, and boundary checks.",
        input_format="An array `nums` of length `n`.",
        output_format="Demonstrate linear search and frequency mapping.",
        constraints="1 <= n <= 10^5",
        examples=[
            {
                "input": "nums = [1, 2, 2, 3]",
                "output": "Frequencies: {1: 1, 2: 2, 3: 1}",
                "explanation": "Frequency mapping."
            },
            {
                "input": "nums = [10, 20, 30]",
                "output": "Sum = 60",
                "explanation": "Linear accumulator."
            }
        ]
    ),

    "beginner-basic-hashing": make_prob(
        description="Learn direct addressing and basic hashing: using an array of size 26 for lowercase characters or size `max_val + 1` for numbers to achieve O(1) frequency lookups.",
        input_format="A string `s` or integer array `nums`.",
        output_format="Return frequency counts using direct address hashing.",
        constraints="1 <= s.length <= 10^5",
        examples=[
            {
                "input": "s = \"apple\", query = 'p'",
                "output": "2",
                "explanation": "Character 'p' appears 2 times."
            },
            {
                "input": "nums = [1, 2, 1, 3], query = 1",
                "output": "2",
                "explanation": "Number 1 appears twice."
            }
        ]
    ),

    "basic-string": make_prob(
        description="Understand string representations in memory: character arrays, ASCII encoding (e.g. `'a'` is 97, `'A'` is 65), immutability (in Java/Python), and string concatenation performance (`StringBuilder` vs. string addition).",
        input_format="A string `s`.",
        output_format="Demonstrate basic string indexing, length, and ASCII translation.",
        constraints="1 <= s.length <= 10^5",
        examples=[
            {
                "input": "char ch = 'c'; int val = ch - 'a';",
                "output": "2",
                "explanation": "0-based alphabet index."
            },
            {
                "input": "s = \"code\"",
                "output": "Length = 4",
                "explanation": "Length inspection."
            }
        ]
    ),

    # --- BASIC MATHS (13) ---
    "count-all-digits-of-a-number": make_prob(
        description="Given an integer `n`, count and return the total number of digits in `n`. Solve in O(log10 n) by repeatedly dividing by 10, or in O(1) using `(int)(Math.log10(n) + 1)`.",
        input_format="A positive integer `n`.",
        output_format="Return the total number of digits as an integer.",
        constraints="1 <= n <= 10^9",
        examples=[
            {
                "input": "n = 12345",
                "output": "5",
                "explanation": "12345 contains 5 digits."
            },
            {
                "input": "n = 7",
                "output": "1",
                "explanation": "Single digit."
            }
        ]
    ),

    "count-number-of-odd-digits-in-a-number": make_prob(
        description="Given a positive integer `n`, count and return how many odd digits exist in its decimal representation.",
        input_format="A positive integer `n`.",
        output_format="Return the count of odd digits.",
        constraints="1 <= n <= 10^9",
        examples=[
            {
                "input": "n = 12345",
                "output": "3",
                "explanation": "The odd digits are 1, 3, and 5 (count = 3)."
            },
            {
                "input": "n = 2468",
                "output": "0",
                "explanation": "All digits are even."
            }
        ]
    ),

    "reverse-a-number": make_prob(
        description="Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to go outside the signed 32-bit integer range `[-2^31, 2^31 - 1]`, then return 0.",
        input_format="A signed 32-bit integer `x`.",
        output_format="Return the reversed integer, or 0 if overflow occurs.",
        constraints="-2^31 <= x <= 2^31 - 1",
        examples=[
            {
                "input": "x = 123",
                "output": "321",
                "explanation": "Digits reversed."
            },
            {
                "input": "x = -123",
                "output": "-321",
                "explanation": "Sign is preserved."
            }
        ]
    ),

    "palindrome-number": make_prob(
        description="Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise. An integer is a palindrome when it reads the same forward and backward. Note: negative numbers are never palindromes.",
        input_format="An integer `x`.",
        output_format="Return boolean `true` if palindrome, else `false`.",
        constraints="-2^31 <= x <= 2^31 - 1",
        examples=[
            {
                "input": "x = 121",
                "output": "true",
                "explanation": "121 reads as 121 from left to right and from right to left."
            },
            {
                "input": "x = -121",
                "output": "false",
                "explanation": "From left to right it is -121. From right to left it is 121-. Not a palindrome."
            }
        ]
    ),

    "return-the-largest-digit-in-a-number": make_prob(
        description="Given an integer `n`, find and return the maximum single digit (0 through 9) that appears in `n`.",
        input_format="A positive integer `n`.",
        output_format="Return the maximum digit value as an integer.",
        constraints="1 <= n <= 10^9",
        examples=[
            {
                "input": "n = 28549",
                "output": "9",
                "explanation": "The maximum digit present is 9."
            },
            {
                "input": "n = 341",
                "output": "4",
                "explanation": "Max digit is 4."
            }
        ]
    ),

    "factorial-of-a-given-number-i": make_prob(
        description="Given a non-negative integer `n`, compute and return `n!` (`n * (n - 1) * ... * 1`). Note that `0! = 1`. Solve iteratively in O(N) time.",
        input_format="An integer `n`.",
        output_format="Return the factorial value as a long integer.",
        constraints="0 <= n <= 20",
        examples=[
            {
                "input": "n = 5",
                "output": "120",
                "explanation": "5! = 5 * 4 * 3 * 2 * 1 = 120."
            },
            {
                "input": "n = 0",
                "output": "1",
                "explanation": "0! = 1 by definition."
            }
        ]
    ),

    "check-if-the-number-if-armstrong": make_prob(
        description="Given an integer `n`, return `true` if it is an Armstrong number (also known as a Narcissistic number), otherwise `false`. An n-digit number is an Armstrong number if the sum of its digits raised to the power `k` (where `k` is total number of digits) equals the original number.",
        input_format="A positive integer `n`.",
        output_format="Return boolean `true` if Armstrong number, else `false`.",
        constraints="1 <= n <= 10^9",
        examples=[
            {
                "input": "n = 153",
                "output": "true",
                "explanation": "1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153."
            },
            {
                "input": "n = 123",
                "output": "false",
                "explanation": "1^3 + 2^3 + 3^3 = 1 + 8 + 27 = 36 != 123."
            }
        ]
    ),

    "check-for-perfect-number": make_prob(
        description="A perfect number is a positive integer that is equal to the sum of its positive proper divisors, excluding the number itself. Given an integer `n`, return `true` if `n` is a perfect number, otherwise return `false`. Solve in O(sqrt(N)) time.",
        input_format="A positive integer `n`.",
        output_format="Return boolean `true` if perfect number, else `false`.",
        constraints="1 <= n <= 10^8",
        examples=[
            {
                "input": "n = 28",
                "output": "true",
                "explanation": "Proper divisors: 1, 2, 4, 7, 14. Sum = 1 + 2 + 4 + 7 + 14 = 28."
            },
            {
                "input": "n = 7",
                "output": "false",
                "explanation": "Proper divisor is 1 != 7."
            }
        ]
    ),

    "check-for-prime-number": make_prob(
        description="Given an integer `n`, check whether it is a prime number. A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. Solve in O(sqrt(N)) time.",
        input_format="A positive integer `n`.",
        output_format="Return boolean `true` if prime, else `false`.",
        constraints="1 <= n <= 10^9",
        examples=[
            {
                "input": "n = 11",
                "output": "true",
                "explanation": "11 is divisible only by 1 and 11."
            },
            {
                "input": "n = 15",
                "output": "false",
                "explanation": "15 is divisible by 3 and 5."
            }
        ]
    ),

    "count-of-prime-numbers-till-n": make_prob(
        description="Given an integer `n`, return the count of prime numbers strictly less than `n`. Solve in O(N log(log N)) using the Sieve of Eratosthenes.",
        input_format="A positive integer `n`.",
        output_format="Return the count of primes strictly less than `n`.",
        constraints="0 <= n <= 5 * 10^6",
        examples=[
            {
                "input": "n = 10",
                "output": "4",
                "explanation": "There are 4 prime numbers less than 10, they are 2, 3, 5, 7."
            },
            {
                "input": "n = 1",
                "output": "0",
                "explanation": "No primes less than 1."
            }
        ]
    ),

    "gcd-of-two-numbers": make_prob(
        description="Given two integers `a` and `b`, calculate their Greatest Common Divisor (GCD) / Highest Common Factor (HCF). Solve in O(log(min(a, b))) time using the Euclidean algorithm: `gcd(a, b) = gcd(b, a % b)`.",
        input_format="Two positive integers `a` and `b`.",
        output_format="Return the GCD as an integer.",
        constraints="1 <= a, b <= 10^9",
        examples=[
            {
                "input": "a = 20, b = 28",
                "output": "4",
                "explanation": "4 is the largest integer dividing both 20 and 28."
            },
            {
                "input": "a = 60, b = 36",
                "output": "12",
                "explanation": "GCD is 12."
            }
        ]
    ),

    "lcm-of-two-numbers": make_prob(
        description="Given two integers `a` and `b`, find their Least Common Multiple (LCM). Use the mathematical property: `LCM(a, b) = (a * b) / GCD(a, b)`.",
        input_format="Two positive integers `a` and `b`.",
        output_format="Return the LCM as a long integer.",
        constraints="1 <= a, b <= 10^9",
        examples=[
            {
                "input": "a = 4, b = 6",
                "output": "12",
                "explanation": "12 is the smallest positive integer divisible by both 4 and 6."
            },
            {
                "input": "a = 5, b = 10",
                "output": "10",
                "explanation": "LCM is 10."
            }
        ]
    ),

    "divisors-of-a-number": make_prob(
        description="Given an integer `n`, find all of its positive divisors and return them in sorted order. Solve in O(sqrt(N)) time by iterating up to sqrt(n) and adding both `i` and `n / i`.",
        input_format="A positive integer `n`.",
        output_format="Return a sorted list of all positive divisors.",
        constraints="1 <= n <= 10^9",
        examples=[
            {
                "input": "n = 36",
                "output": "[1, 2, 3, 4, 6, 9, 12, 18, 36]",
                "explanation": "All positive divisors of 36."
            },
            {
                "input": "n = 7",
                "output": "[1, 7]",
                "explanation": "7 is prime, divisors are 1 and 7."
            }
        ]
    ),

    # --- BASIC ARRAYS & HASHING (7) ---
    "sum-of-array-elements": make_prob(
        description="Given an array of integers `nums`, calculate and return the sum of all elements in the array. Solve in O(N) time with O(1) space.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the sum as an integer.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 2, 3, 4]",
                "output": "10",
                "explanation": "1 + 2 + 3 + 4 = 10."
            },
            {
                "input": "nums = [-5, 5, 10]",
                "output": "10",
                "explanation": "Sum is 10."
            }
        ]
    ),

    "count-of-odd-numbers-in-array": make_prob(
        description="Given an array of integers `nums`, count and return how many numbers in the array are odd (`nums[i] % 2 != 0`).",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the count of odd numbers as an integer.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 2, 3, 4, 5]",
                "output": "3",
                "explanation": "Odd numbers: 1, 3, 5 (count = 3)."
            },
            {
                "input": "nums = [2, 4, 6]",
                "output": "0",
                "explanation": "No odd numbers."
            }
        ]
    ),

    "check-if-the-array-is-sorted-i": make_prob(
        description="Given an array `nums`, return `true` if the array was originally sorted in non-decreasing order, then rotated some number of positions (including zero). Otherwise, return `false`. The condition is equivalent to checking that `nums[i] > nums[(i + 1) % n]` at most once.",
        input_format="An integer array `nums`.",
        output_format="Return boolean `true` if sorted and rotated, else `false`.",
        constraints="1 <= nums.length <= 100\n1 <= nums[i] <= 100",
        examples=[
            {
                "input": "nums = [3, 4, 5, 1, 2]",
                "output": "true",
                "explanation": "[1, 2, 3, 4, 5] rotated by 3 positions."
            },
            {
                "input": "nums = [2, 1, 3, 4]",
                "output": "false",
                "explanation": "Cannot be obtained by rotation of sorted array."
            }
        ]
    ),

    "reverse-an-array": make_prob(
        description="Given an integer array `nums`, reverse the elements in-place using two pointers (`left` and `right`) in O(N) time and O(1) extra space.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the array reversed in-place.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 2, 3, 4, 5]",
                "output": "[5, 4, 3, 2, 1]",
                "explanation": "Reversed array."
            },
            {
                "input": "nums = [10, 20]",
                "output": "[20, 10]",
                "explanation": "Swapped."
            }
        ]
    ),

    "highest-occurring-element-in-an-array": make_prob(
        description="Given an array of integers `nums`, find and return the element that appears with the maximum frequency. If multiple elements have the same maximum frequency, return the smallest value among them.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the highest occurring element.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 3, 2, 1, 4, 1]",
                "output": "1",
                "explanation": "1 appears 3 times, which is the maximum."
            },
            {
                "input": "nums = [4, 4, 5, 5, 6]",
                "output": "4",
                "explanation": "Both 4 and 5 appear twice; 4 is smaller."
            }
        ]
    ),

    "second-highest-occurring-element": make_prob(
        description="Given an array of integers `nums`, find the element that appears with the second highest frequency. If multiple elements tie, return the smallest element. If fewer than 2 distinct frequencies exist, return -1.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the second highest occurring element, or -1.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 1, 1, 2, 2, 3]",
                "output": "2",
                "explanation": "Highest frequency is 3 (element 1), second highest is 2 (element 2)."
            },
            {
                "input": "nums = [5, 5, 5]",
                "output": "-1",
                "explanation": "Only one distinct frequency exists."
            }
        ]
    ),

    "sum-of-highest-and-lowest-frequency": make_prob(
        description="Given an array of integers `nums`, find the maximum frequency of any element and the minimum frequency of any element in the array. Return the sum of the highest and lowest frequencies.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return an integer representing (maxFreq + minFreq).",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 2, 2, 3, 3, 3]",
                "output": "4",
                "explanation": "Max frequency is 3 (for element 3), min frequency is 1 (for element 1). Sum = 3 + 1 = 4."
            },
            {
                "input": "nums = [10, 10, 10]",
                "output": "6",
                "explanation": "Max freq = 3, min freq = 3. Sum = 6."
            }
        ]
    ),

    # --- BASIC STRINGS (8) ---
    "reverse-a-string-ii": make_prob(
        description="Given a string `s`, reverse the string in-place (or return reversed string) using two pointers in O(N) time.",
        input_format="A string `s`.",
        output_format="Return the reversed string.",
        constraints="1 <= s.length <= 10^5",
        examples=[
            {
                "input": "s = \"hello\"",
                "output": "\"olleh\"",
                "explanation": "Characters reversed."
            },
            {
                "input": "s = \"Hannah\"",
                "output": "\"hannaH\"",
                "explanation": "Case-sensitive reversal."
            }
        ]
    ),

    "palindrome-check": make_prob(
        description="A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string `s`, return `true` if it is a palindrome, or `false` otherwise. Solve in O(N) time with O(1) space.",
        input_format="A string `s`.",
        output_format="Return boolean `true` if palindrome, else `false`.",
        constraints="1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
        examples=[
            {
                "input": "s = \"A man, a plan, a canal: Panama\"",
                "output": "true",
                "explanation": "\"amanaplanacanalpanama\" is a palindrome."
            },
            {
                "input": "s = \"race a car\"",
                "output": "false",
                "explanation": "\"raceacar\" is not a palindrome."
            }
        ]
    ),

    "largest-odd-number-in-a-string": make_prob(
        description="You are given a string `num`, representing a large integer. Return the largest-valued odd integer (as a string) that is a non-empty substring of `num`, or an empty string `\"\"` if no odd integer exists. Scan backwards from the end of the string to find the first odd digit.",
        input_format="A numeric string `num`.",
        output_format="Return the largest odd substring prefix.",
        constraints="1 <= num.length <= 10^5\nnum only consists of digits and does not contain any leading zeros.",
        examples=[
            {
                "input": "num = \"52\"",
                "output": "\"5\"",
                "explanation": "The only non-empty substrings are \"5\", \"2\", and \"52\". \"5\" is the only odd number."
            },
            {
                "input": "num = \"35427\"",
                "output": "\"35427\"",
                "explanation": "\"35427\" ends with 7 (odd), so the whole string is the largest odd number."
            }
        ]
    ),

    "longest-common-prefix": make_prob(
        description="Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string `\"\"`. Sort the array and compare the first and last strings, or perform vertical scanning.",
        input_format="An array of strings `strs`.",
        output_format="Return the longest common prefix string.",
        constraints="1 <= strs.length <= 200\n0 <= strs[i].length <= 200\nstrs[i] consists of only lowercase English letters.",
        examples=[
            {
                "input": "strs = [\"flower\", \"flow\", \"flight\"]",
                "output": "\"fl\"",
                "explanation": "\"fl\" is common to all 3 words."
            },
            {
                "input": "strs = [\"dog\", \"racecar\", \"car\"]",
                "output": "\"\"",
                "explanation": "There is no common prefix among the input strings."
            }
        ]
    ),

    "isomorphic-string": make_prob(
        description="Given two strings `s` and `t`, determine if they are isomorphic. Two strings `s` and `t` are isomorphic if the characters in `s` can be replaced to get `t`. All occurrences of a character must be replaced with another character while preserving the order of characters. No two characters may map to the same character, but a character may map to itself.",
        input_format="Two strings `s` and `t`.",
        output_format="Return boolean `true` if isomorphic, else `false`.",
        constraints="1 <= s.length <= 5 * 10^4\nt.length == s.length\ns and t consist of any valid ASCII character.",
        examples=[
            {
                "input": "s = \"egg\", t = \"add\"",
                "output": "true",
                "explanation": "'e' maps to 'a' and 'g' maps to 'd'."
            },
            {
                "input": "s = \"foo\", t = \"bar\"",
                "output": "false",
                "explanation": "'o' cannot map to both 'a' and 'r'."
            }
        ]
    ),

    "rotate-string": make_prob(
        description="Given two strings `s` and `goal`, return `true` if and only if `s` can become `goal` after some number of shifts on `s`. A shift on `s` consists of moving the leftmost character of `s` to the rightmost position. Check if `s.length == goal.length` and `goal` is a substring of `(s + s)`.",
        input_format="Two strings `s` and `goal`.",
        output_format="Return boolean `true` if `s` can rotate into `goal`, else `false`.",
        constraints="1 <= s.length, goal.length <= 100\ns and goal consist of lowercase English letters.",
        examples=[
            {
                "input": "s = \"abcde\", goal = \"cdeab\"",
                "output": "true",
                "explanation": "Shift by 2 positions yields \"cdeab\"."
            },
            {
                "input": "s = \"abcde\", goal = \"abced\"",
                "output": "false",
                "explanation": "Cannot be formed by shifts."
            }
        ]
    ),

    "valid-anagram": make_prob(
        description="Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once. Solve in O(N) time using a frequency array of size 26.",
        input_format="Two strings `s` and `t`.",
        output_format="Return boolean `true` if anagrams, else `false`.",
        constraints="1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.",
        examples=[
            {
                "input": "s = \"anagram\", t = \"nagaram\"",
                "output": "true",
                "explanation": "Both contain identical letter frequencies."
            },
            {
                "input": "s = \"rat\", t = \"car\"",
                "output": "false",
                "explanation": "'r', 'a', 't' vs 'c', 'a', 'r'."
            }
        ]
    ),

    "sort-characters-by-frequency": make_prob(
        description="Given a string `s`, sort it in decreasing order based on the frequency of the characters. The frequency of a character is the number of times it appears in the string. Return the sorted string. If there are multiple answers, return any of them.",
        input_format="A string `s`.",
        output_format="Return the frequency-sorted string.",
        constraints="1 <= s.length <= 5 * 10^5\ns consists of uppercase and lowercase English letters and digits.",
        examples=[
            {
                "input": "s = \"tree\"",
                "output": "\"eert\"",
                "explanation": "'e' appears twice, 'r' and 't' appear once. \"eetr\" is also valid."
            },
            {
                "input": "s = \"cccaaa\"",
                "output": "\"aaaccc\"",
                "explanation": "Both 'c' and 'a' appear three times. \"cccaaa\" is also valid."
            }
        ]
    ),

    # --- BASIC RECURSION (12) ---
    "recursion-theory": make_prob(
        description="Learn the principles of recursion: Base Cases (preventing infinite recursion and stack overflow) and Recursive Step (reducing problem size towards the base case). Understand the function call stack, stack frames, local variable allocation, and the flow of control on unwinding.",
        input_format="A positive integer `n`.",
        output_format="Demonstrate recursive call stack progression.",
        constraints="1 <= n <= 1000",
        examples=[
            {
                "input": "Print numbers 1 to N recursively",
                "output": "Calls: f(1) -> f(2) -> ... -> f(N)",
                "explanation": "Base case at N+1 unwinds and prints."
            },
            {
                "input": "Base case omitted",
                "output": "StackOverflowError",
                "explanation": "Recursion without a base case exhausts the call stack."
            }
        ]
    ),

    "recursion-concepts-with-parameters": make_prob(
        description="Learn the difference between Parameterized Recursion (accumulating the running result in a parameter down the call stack) and Functional Recursion (returning and combining the result up the call stack upon unwinding).",
        input_format="An integer `n`.",
        output_format="Compare parameterized vs functional recursive outputs.",
        constraints="1 <= n <= 10^4",
        examples=[
            {
                "input": "Parameterized: sum(n, total) -> sum(n - 1, total + n)",
                "output": "Returns total directly when n reaches 0.",
                "explanation": "Tail-recursive style."
            },
            {
                "input": "Functional: sum(n) -> n + sum(n - 1)",
                "output": "Builds addition on return unwinding.",
                "explanation": "Functional return style."
            }
        ]
    ),

    "sum-of-first-n-numbers": make_prob(
        description="Given an integer `n`, calculate the sum of the first `n` natural numbers (`1 + 2 + ... + n`) using recursion.",
        input_format="A positive integer `n`.",
        output_format="Return the sum as a long integer.",
        constraints="1 <= n <= 10^5",
        examples=[
            {
                "input": "n = 3",
                "output": "6",
                "explanation": "1 + 2 + 3 = 6."
            },
            {
                "input": "n = 5",
                "output": "15",
                "explanation": "1 + 2 + 3 + 4 + 5 = 15."
            }
        ]
    ),

    "factorial-of-a-given-number-ii": make_prob(
        description="Given an integer `n`, compute `n!` recursively using `fact(n) = n * fact(n - 1)` with base case `fact(0) = 1`.",
        input_format="An integer `n`.",
        output_format="Return `n!` as a long integer.",
        constraints="0 <= n <= 20",
        examples=[
            {
                "input": "n = 4",
                "output": "24",
                "explanation": "4! = 4 * 3 * 2 * 1 = 24."
            },
            {
                "input": "n = 1",
                "output": "1",
                "explanation": "1! = 1."
            }
        ]
    ),

    "sum-of-array-elements-ii": make_prob(
        description="Given an array of integers `nums`, compute the sum of all elements in the array recursively by adding `nums[index]` to the recursive sum of the remaining array.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the sum as an integer.",
        constraints="1 <= nums.length <= 1000\n-10^5 <= nums[i] <= 10^5",
        examples=[
            {
                "input": "nums = [1, 2, 3]",
                "output": "6",
                "explanation": "1 + sum([2, 3]) = 1 + 5 = 6."
            },
            {
                "input": "nums = [10]",
                "output": "10",
                "explanation": "Base case single element."
            }
        ]
    ),

    "reverse-a-string-i": make_prob(
        description="Given a string `s`, reverse the string recursively by swapping characters at `i` and `s.length() - 1 - i` until `i >= s.length() / 2`.",
        input_format="A string `s`.",
        output_format="Return the reversed string.",
        constraints="1 <= s.length <= 1000",
        examples=[
            {
                "input": "s = \"abc\"",
                "output": "\"cba\"",
                "explanation": "Reversed recursively."
            },
            {
                "input": "s = \"world\"",
                "output": "\"dlrow\"",
                "explanation": "Reversed."
            }
        ]
    ),

    "check-if-string-is-palindrome-or-not-": make_prob(
        description="Given a string `s`, determine if it is a palindrome using recursion. Compare `s[i]` with `s[n - 1 - i]` and recurse on `i + 1` until the midpoint is reached.",
        input_format="A string `s`.",
        output_format="Return boolean `true` if palindrome, else `false`.",
        constraints="1 <= s.length <= 10^4",
        examples=[
            {
                "input": "s = \"racecar\"",
                "output": "true",
                "explanation": "Reads identically in both directions."
            },
            {
                "input": "s = \"hello\"",
                "output": "false",
                "explanation": "Not a palindrome."
            }
        ]
    ),

    "check-if-a-number-is-prime-or-not": make_prob(
        description="Given an integer `n`, check if it is prime using recursion with trial divisor `d` starting at 2 up to `sqrt(n)`.",
        input_format="A positive integer `n`.",
        output_format="Return boolean `true` if prime, else `false`.",
        constraints="1 <= n <= 10^6",
        examples=[
            {
                "input": "n = 7",
                "output": "true",
                "explanation": "7 has no divisors between 2 and sqrt(7)."
            },
            {
                "input": "n = 9",
                "output": "false",
                "explanation": "9 is divisible by 3."
            }
        ]
    ),

    "reverse-an-array-ii": make_prob(
        description="Reverse an array `nums` recursively using two pointers `l` and `r`: swap `nums[l]` and `nums[r]`, then recurse with `l + 1` and `r - 1` until `l >= r`.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return the reversed array.",
        constraints="1 <= nums.length <= 1000\n-10^5 <= nums[i] <= 10^5",
        examples=[
            {
                "input": "nums = [1, 2, 3, 4]",
                "output": "[4, 3, 2, 1]",
                "explanation": "Reversed recursively."
            },
            {
                "input": "nums = [5]",
                "output": "[5]",
                "explanation": "Single element."
            }
        ]
    ),

    "check-if-the-array-is-sorted-ii": make_prob(
        description="Given an array of integers `nums`, check if the array is sorted in non-decreasing order using recursion. Verify that `nums[i] <= nums[i + 1]` and recursively check for index `i + 1`.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return boolean `true` if sorted, else `false`.",
        constraints="1 <= nums.length <= 1000\n-10^5 <= nums[i] <= 10^5",
        examples=[
            {
                "input": "nums = [1, 2, 3, 4, 5]",
                "output": "true",
                "explanation": "Array is sorted in ascending order."
            },
            {
                "input": "nums = [1, 3, 2]",
                "output": "false",
                "explanation": "3 > 2, so array is not sorted."
            }
        ]
    ),

    "sum-of-digits-in-a-given-number": make_prob(
        description="Given an integer `n`, compute the sum of its digits recursively: `digitSum(n) = (n % 10) + digitSum(n / 10)` with base case `digitSum(0) = 0`.",
        input_format="A non-negative integer `n`.",
        output_format="Return the sum of digits as an integer.",
        constraints="0 <= n <= 10^9",
        examples=[
            {
                "input": "n = 1234",
                "output": "10",
                "explanation": "1 + 2 + 3 + 4 = 10."
            },
            {
                "input": "n = 5",
                "output": "5",
                "explanation": "Single digit sum is 5."
            }
        ]
    ),

    "fibonacci-number": make_prob(
        description="The Fibonacci numbers, commonly denoted `F(n)` form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from `0` and `1`: `F(0) = 0, F(1) = 1, F(n) = F(n - 1) + F(n - 2)` for `n > 1`. Given `n`, calculate `F(n)`.",
        input_format="An integer `n`.",
        output_format="Return the n-th Fibonacci number.",
        constraints="0 <= n <= 30",
        examples=[
            {
                "input": "n = 2",
                "output": "1",
                "explanation": "F(2) = F(1) + F(0) = 1 + 0 = 1."
            },
            {
                "input": "n = 4",
                "output": "3",
                "explanation": "F(4) = F(3) + F(2) = 2 + 1 = 3."
            }
        ]
    ),
}
