from .common import make_prob

STACK_QUEUES_DATA = {
    "implementation-using-different-ds": make_prob(
        description="Understand the core abstractions of LIFO (Last-In-First-Out) Stacks and FIFO (First-In-First-Out) Queues. Learn their memory models, asymptotic complexities for `push()`, `pop()`, `peek()`, and `isEmpty()`, and how underlying contiguous arrays vs. dynamically allocated linked nodes affect cache locality and reallocation overhead.",
        input_format="A sequence of push, pop, and top operations.",
        output_format="Return results of queries demonstrating LIFO / FIFO state.",
        constraints="1 <= operations <= 10^5\n-10^9 <= value <= 10^9",
        examples=[
            {
                "input": "push(1), push(2), pop(), top()",
                "output": "pop: 2, top: 1",
                "explanation": "LIFO stack returns 2 on pop and leaves 1 at top."
            },
            {
                "input": "enqueue(1), enqueue(2), dequeue()",
                "output": "dequeue: 1",
                "explanation": "FIFO queue outputs 1 first."
            }
        ]
    ),

    "implement-stack-using-arrays": make_prob(
        description="Implement a Stack data structure using an array. The stack should support `push(x)` to push element x onto the stack, and `pop()` to remove and return the topmost element from the stack. If the stack is empty, `pop()` should return -1.",
        input_format="A sequence of stack operations: 1 x (push x) and 2 (pop).",
        output_format="Return array of values returned by pop operations.",
        constraints="1 <= operations <= 10^5\n1 <= x <= 10^5",
        examples=[
            {
                "input": "push(2), push(3), pop(), push(4), pop()",
                "output": "[3, 4]",
                "explanation": "First pop returns 3. Then 4 is pushed and popped."
            },
            {
                "input": "pop(), push(4), pop()",
                "output": "[-1, 4]",
                "explanation": "Stack is initially empty, returning -1 on first pop."
            }
        ]
    ),

    "implement-queue-using-arrays": make_prob(
        description="Implement a Queue data structure using an array with front and rear pointers. Support `push(x)` to insert element x at the rear, and `pop()` to remove and return the element at the front. If the queue is empty, return -1.",
        input_format="A sequence of operations: 1 x (enqueue x) and 2 (dequeue).",
        output_format="Return array of values produced by pop operations.",
        constraints="1 <= operations <= 10^5\n1 <= x <= 10^5",
        examples=[
            {
                "input": "push(2), push(3), pop(), push(4), pop()",
                "output": "[2, 3]",
                "explanation": "FIFO order: 2 is removed first, then 3."
            },
            {
                "input": "pop(), push(1), pop()",
                "output": "[-1, 1]",
                "explanation": "Empty queue returns -1."
            }
        ]
    ),

    "implement-stack-using-queue": make_prob(
        description="Implement a last-in-first-out (LIFO) stack using only a standard FIFO queue. Support `push(x)`, `pop()`, `top()`, and `empty()`. You can achieve this by rotating the single queue on each push by `size - 1` steps.",
        input_format="Method calls to MyStack: push(x), pop(), top(), empty().",
        output_format="Return results matching LIFO behavior.",
        constraints="1 <= x <= 9\nAt most 100 calls will be made to push, pop, top, and empty.",
        examples=[
            {
                "input": "[\"MyStack\", \"push\", \"push\", \"top\", \"pop\", \"empty\"] -> [[], [1], [2], [], [], []]",
                "output": "[null, null, null, 2, 2, false]",
                "explanation": "Top returns 2; pop returns 2; stack is not empty."
            },
            {
                "input": "push(5), pop(), empty()",
                "output": "5, true",
                "explanation": "Single item pushed and popped leaves empty stack."
            }
        ]
    ),

    "implement-queue-using-stack": make_prob(
        description="Implement a first-in-first-out (FIFO) queue using two stacks `input` and `output`. Support `push(x)`, `pop()`, `peek()`, and `empty()`. Amortized cost for each operation must be O(1).",
        input_format="Method calls to MyQueue: push(x), pop(), peek(), empty().",
        output_format="Return outputs matching FIFO queue semantics.",
        constraints="1 <= x <= 9\nAt most 100 calls will be made to push, pop, peek, and empty.",
        examples=[
            {
                "input": "[\"MyQueue\", \"push\", \"push\", \"peek\", \"pop\", \"empty\"] -> [[], [1], [2], [], [], []]",
                "output": "[null, null, null, 1, 1, false]",
                "explanation": "Peek returns 1; pop removes 1; queue has element 2 remaining."
            },
            {
                "input": "push(10), push(20), pop()",
                "output": "10",
                "explanation": "10 was inserted first."
            }
        ]
    ),

    "implement-stack-using-linkedlist": make_prob(
        description="Implement a Stack data structure using a Singly Linked List where nodes contain `data` and `next` pointer. Insertions and deletions occur at the head of the linked list in O(1) time.",
        input_format="A sequence of operations: push(x) and pop().",
        output_format="Return array of values returned by pop operations.",
        constraints="1 <= operations <= 10^5\n1 <= x <= 10^9",
        examples=[
            {
                "input": "push(10), push(20), pop(), top()",
                "output": "pop: 20, top: 10",
                "explanation": "20 was at head; after pop, 10 is at head."
            },
            {
                "input": "pop()",
                "output": "-1",
                "explanation": "Empty stack returns -1."
            }
        ]
    ),

    "implement-queue-using-linkedlist": make_prob(
        description="Implement a Queue data structure using a Singly Linked List with `front` and `rear` pointers. `push(x)` appends a new node at `rear`, and `pop()` removes the node at `front` in O(1) time.",
        input_format="A sequence of operations: push(x) and pop().",
        output_format="Return array of popped values.",
        constraints="1 <= operations <= 10^5\n1 <= x <= 10^9",
        examples=[
            {
                "input": "push(2), push(3), pop(), push(4), pop()",
                "output": "[2, 3]",
                "explanation": "2 is popped, then 3 is popped."
            },
            {
                "input": "pop()",
                "output": "-1",
                "explanation": "Queue is empty."
            }
        ]
    ),

    "balanced-paranthesis": make_prob(
        description="Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid. Open brackets must be closed by the same type of brackets, in the correct order, and every close bracket has a corresponding open bracket. Solve in O(N) time using a stack.",
        input_format="A string `s` consisting of parenthesis characters.",
        output_format="Return boolean `true` if valid, else `false`.",
        constraints="1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
        examples=[
            {
                "input": "s = \"()[]{}\"",
                "output": "true",
                "explanation": "All brackets close in valid pairs."
            },
            {
                "input": "s = \"(]\"",
                "output": "false",
                "explanation": "Mismatched bracket types."
            }
        ]
    ),

    "infix-to-postfix-conversion": make_prob(
        description="Given an infix expression `s` containing operands and operators (`+`, `-`, `*`, `/`, `^`, `(`, `)`), convert it to its equivalent Postfix expression using an operator stack and operator precedence rules.",
        input_format="An infix string `s`.",
        output_format="Return the equivalent postfix string.",
        constraints="1 <= s.length <= 10^5\ns contains valid infix expression.",
        examples=[
            {
                "input": "s = \"a+b*(c^d-e)^(f+g*h)-i\"",
                "output": "\"abcd^e-fgh*+^*+i-\"",
                "explanation": "Standard infix converted to postfix notation."
            },
            {
                "input": "s = \"(A+B)*(C+D)\"",
                "output": "\"AB+CD+*\"",
                "explanation": "Expressions inside parentheses evaluated first."
            }
        ]
    ),

    "infix-to-prefix-conversion": make_prob(
        description="Given an infix expression `s`, convert it into its equivalent Prefix expression using operator precedence. Algorithm: reverse string, swap `(` with `)`, compute postfix, and reverse the result.",
        input_format="An infix string `s`.",
        output_format="Return the equivalent prefix string.",
        constraints="1 <= s.length <= 10^5",
        examples=[
            {
                "input": "s = \"(A+B)*C-D+F\"",
                "output": "\"++-*+ABCDF\"",
                "explanation": "Operator precedes its operands."
            },
            {
                "input": "s = \"A+B*C\"",
                "output": "\"+A*BC\"",
                "explanation": "Multiplication has higher precedence than addition."
            }
        ]
    ),

    "prefix-to-infix-conversion": make_prob(
        description="Given a Prefix expression `s`, convert it to an Infix expression with appropriate parentheses. Traverse from right to left, pushing operands onto the stack and combining when an operator is encountered.",
        input_format="A prefix expression string `s`.",
        output_format="Return the infix expression string with parentheses.",
        constraints="1 <= s.length <= 10^5",
        examples=[
            {
                "input": "s = \"*-A/BC-/AKL\"",
                "output": "\"((A-(B/C))*((A/K)-L))\"",
                "explanation": "Converted to valid parenthesized infix form."
            },
            {
                "input": "s = \"*+AB-CD\"",
                "output": "\"((A+B)*(C-D))\"",
                "explanation": "Infix form derived."
            }
        ]
    ),

    "prefix-to-postfix-conversion": make_prob(
        description="Given a Prefix expression `s`, convert it to a Postfix expression using a stack. Traverse from right to left, combining `operand1 + operand2 + operator` on each operator encountered.",
        input_format="A prefix string `s`.",
        output_format="Return the postfix expression string.",
        constraints="1 <= s.length <= 10^5",
        examples=[
            {
                "input": "s = \"*+AB-CD\"",
                "output": "\"AB+CD-*\"",
                "explanation": "Prefix to postfix conversion completed."
            },
            {
                "input": "s = \"/A+BC\"",
                "output": "\"ABC+/\"",
                "explanation": "Converted."
            }
        ]
    ),

    "postfix-to-infix-conversion": make_prob(
        description="Given a Postfix expression `s`, convert it into an Infix expression. Read the expression from left to right, pushing operands to the stack and creating `\"(\" + op1 + operator + op2 + \")\"` on encountering operators.",
        input_format="A postfix string `s`.",
        output_format="Return the infix string with parenthesis.",
        constraints="1 <= s.length <= 10^5",
        examples=[
            {
                "input": "s = \"ab*c+\"",
                "output": "\"((a*b)+c)\"",
                "explanation": "Postfix converted to infix."
            },
            {
                "input": "s = \"ab+\"",
                "output": "\"(a+b)\"",
                "explanation": "Converted."
            }
        ]
    ),

    "postfix-to-prefix-conversion": make_prob(
        description="Given a Postfix expression `s`, convert it to a Prefix expression using a stack. Read from left to right, combining `operator + op1 + op2` when an operator is encountered.",
        input_format="A postfix string `s`.",
        output_format="Return the prefix string.",
        constraints="1 <= s.length <= 10^5",
        examples=[
            {
                "input": "s = \"AB+CD-*\"",
                "output": "\"*+AB-CD\"",
                "explanation": "Postfix converted to prefix."
            },
            {
                "input": "s = \"ABC/-AK/L-*\"",
                "output": "\"*-A/BC-/AKL\"",
                "explanation": "Prefix form produced."
            }
        ]
    ),

    "next-greater-element": make_prob(
        description="The next greater element of some element `x` in an array is the first greater element that is to the right of `x` in the same array. Given array `nums`, return an array `ans` where `ans[i]` is the next greater element of `nums[i]`. If no greater element exists, return `-1`. Solve in O(N) time using a monotonic decreasing stack.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return an array of integers representing next greater elements.",
        constraints="1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [4, 5, 2, 25]",
                "output": "[5, 25, 25, -1]",
                "explanation": "Next greater of 4 is 5; 5 is 25; 2 is 25; 25 has none (-1)."
            },
            {
                "input": "nums = [13, 7, 6, 12]",
                "output": "[-1, 12, 12, -1]",
                "explanation": "Next greater of 7 is 12; 6 is 12."
            }
        ]
    ),

    "next-greater-element---2": make_prob(
        description="Given a circular integer array `nums` (i.e., the next element of `nums[nums.length - 1]` is `nums[0]`), return the next greater number for every element in `nums`. The next greater number of a number `x` is the first greater number to its traversing-order next in the array. If it doesn't exist, return -1. Solve in O(N) time by iterating from `2N - 1` down to `0` using a monotonic stack with index modulo `n`.",
        input_format="A circular integer array `nums`.",
        output_format="Return an array containing next greater elements for each position.",
        constraints="1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 2, 1]",
                "output": "[2, -1, 2]",
                "explanation": "The first 1's next greater number is 2; 2's is none (-1); the second 1 wraps around to find 2."
            },
            {
                "input": "nums = [1, 2, 3, 4, 3]",
                "output": "[2, 3, 4, -1, 4]",
                "explanation": "Last element 3 wraps around to find 4."
            }
        ]
    ),

    "asteroid-collision": make_prob(
        description="We are given an array `asteroids` of integers representing asteroids in a row. The absolute value represents size, and sign represents direction (+ moving right, - moving left). Each asteroid moves at the same speed. Find out the state of the asteroids after all collisions using a stack. Two asteroids moving towards each other collide: smaller explodes, equal sizes both explode, larger continues.",
        input_format="An integer array `asteroids`.",
        output_format="Return the surviving asteroids in order.",
        constraints="2 <= asteroids.length <= 10^4\n-1000 <= asteroids[i] <= 1000\nasteroids[i] != 0",
        examples=[
            {
                "input": "asteroids = [5, 10, -5]",
                "output": "[5, 10]",
                "explanation": "10 and -5 collide resulting in 10 surviving. 5 and 10 never collide."
            },
            {
                "input": "asteroids = [8, -8]",
                "output": "[]",
                "explanation": "Both asteroids explode."
            }
        ]
    ),

    "sum-of-subarray-minimums": make_prob(
        description="Given an array of integers `arr`, find the sum of `min(b)`, where `b` ranges over every (contiguous) subarray of `arr`. Since the answer may be large, return the answer modulo `10^9 + 7`. Solve in O(N) time by finding Previous Less Element (PLE) and Next Less Element (NLE) for each element using monotonic stacks.",
        input_format="An integer array `arr`.",
        output_format="Return sum of subarray minimums modulo 10^9 + 7.",
        constraints="1 <= arr.length <= 3 * 10^4\n1 <= arr[i] <= 3 * 10^4",
        examples=[
            {
                "input": "arr = [3, 1, 2, 4]",
                "output": "17",
                "explanation": "Subarrays: [3] min 3; [1] min 1; [2] min 2; [4] min 4; [3, 1] min 1; [1, 2] min 1; [2, 4] min 2; [3, 1, 2] min 1; [1, 2, 4] min 1; [3, 1, 2, 4] min 1. Sum = 17."
            },
            {
                "input": "arr = [11, 81, 94, 43, 3]",
                "output": "444",
                "explanation": "Sum of all subarray minimums modulo 10^9 + 7 is 444."
            }
        ]
    ),

    "sum-of-subarray-ranges": make_prob(
        description="You are given an integer array `nums`. The range of a subarray is the difference between the largest and smallest element in the subarray. Return the sum of all subarray ranges of `nums`. Solve in O(N) time using monotonic stacks: `Sum of Ranges = (Sum of Subarray Maximums) - (Sum of Subarray Minimums)`.",
        input_format="An integer array `nums` of length `n`.",
        output_format="Return a long integer representing total sum of ranges.",
        constraints="1 <= nums.length <= 1000\n-10^9 <= nums[i] <= 10^9",
        examples=[
            {
                "input": "nums = [1, 2, 3]",
                "output": "4",
                "explanation": "Subarrays: [1] range 0; [2] range 0; [3] range 0; [1, 2] range 1; [2, 3] range 1; [1, 2, 3] range 2. Total = 4."
            },
            {
                "input": "nums = [1, 3, 3]",
                "output": "4",
                "explanation": "Sum of ranges is 4."
            }
        ]
    ),

    "remove-k-digits": make_prob(
        description="Given string `num` representing a non-negative integer, and an integer `k`, return the smallest possible integer after removing `k` digits from `num`. Use a monotonic increasing stack to drop earlier digits when a smaller subsequent digit appears, then strip leading zeros.",
        input_format="A digit string `num` and integer `k`.",
        output_format="Return the smallest integer string.",
        constraints="1 <= k <= num.length <= 10^5\nnum consists of only digits.\nnum does not have any leading zeros not including '0' itself.",
        examples=[
            {
                "input": "num = \"1432219\", k = 3",
                "output": "\"1219\"",
                "explanation": "Remove digits 4, 3, and 2 to form 1219, which is the smallest."
            },
            {
                "input": "num = \"10200\", k = 1",
                "output": "\"200\"",
                "explanation": "Remove the leading 1 and the output is 200 (leading 0s removed)."
            }
        ]
    ),

    "next-smaller-element": make_prob(
        description="Given an array `A` of integers of length `n`, find the immediate next smaller element for each element on its right side. If no smaller element exists on the right, return -1 for that position. Solve in O(N) time using a monotonic stack.",
        input_format="An integer array `A` of length `n`.",
        output_format="Return an array of next smaller elements.",
        constraints="1 <= A.length <= 10^5\n-10^9 <= A[i] <= 10^9",
        examples=[
            {
                "input": "A = [4, 5, 2, 10, 8]",
                "output": "[2, 2, -1, 8, -1]",
                "explanation": "Next smaller of 4 is 2; 5 is 2; 2 has none (-1); 10 is 8; 8 has none (-1)."
            },
            {
                "input": "A = [3, 2, 1]",
                "output": "[2, 1, -1]",
                "explanation": "Next smaller for each element found."
            }
        ]
    ),

    "implement-min-stack": make_prob(
        description="Design a stack that supports push, pop, top, and retrieving the minimum element in constant O(1) time. Support `push(val)`, `pop()`, `top()`, and `getMin()`. Solve either using a stack of pairs `(val, minSoFar)` or a single stack with encoded values `2 * val - min`.",
        input_format="Method calls to MinStack.",
        output_format="Return outputs matching O(1) MinStack behavior.",
        constraints="-2^31 <= val <= 2^31 - 1\nAt most 3 * 10^4 calls made to push, pop, top, and getMin.",
        examples=[
            {
                "input": "push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()",
                "output": "getMin: -3, top: 0, getMin: -2",
                "explanation": "Minimum updates correctly as elements are added and removed."
            },
            {
                "input": "push(1), push(2), getMin()",
                "output": "getMin: 1",
                "explanation": "1 is the minimum."
            }
        ]
    ),

    "sliding-window-maximum": make_prob(
        description="You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window. Solve in O(N) time using a monotonic decreasing deque storing indices.",
        input_format="An integer array `nums` and integer `k`.",
        output_format="Return an array of the maximum elements in each window.",
        constraints="1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\n1 <= k <= nums.length",
        examples=[
            {
                "input": "nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3",
                "output": "[3, 3, 5, 5, 6, 7]",
                "explanation": "Window [1, 3, -1] max 3; [3, -1, -3] max 3; [-1, -3, 5] max 5; [-3, 5, 3] max 5; [5, 3, 6] max 6; [3, 6, 7] max 7."
            },
            {
                "input": "nums = [1], k = 1",
                "output": "[1]",
                "explanation": "Single element array."
            }
        ]
    ),

    "trapping-rainwater": make_prob(
        description="Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining. Solve in O(N) time and O(1) space using two pointers (`left` and `right`) tracking `leftMax` and `rightMax`.",
        input_format="An integer array `height` representing bar elevations.",
        output_format="Return the total units of trapped rainwater.",
        constraints="n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
        examples=[
            {
                "input": "height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
                "output": "6",
                "explanation": "The elevation map traps 6 units of rainwater."
            },
            {
                "input": "height = [4, 2, 0, 3, 2, 5]",
                "output": "9",
                "explanation": "Total trapped water is 9 units."
            }
        ]
    ),

    "largest-rectangle-in-a-histogram": make_prob(
        description="Given an array of integers `heights` representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram. Solve in O(N) single-pass using a monotonic stack to determine width boundaries.",
        input_format="An integer array `heights`.",
        output_format="Return the maximum rectangular area as an integer.",
        constraints="1 <= heights.length <= 10^5\n0 <= heights[i] <= 10^4",
        examples=[
            {
                "input": "heights = [2, 1, 5, 6, 2, 3]",
                "output": "10",
                "explanation": "The largest rectangle has height 5 and width 2 (bars at index 2 and 3), area = 5 * 2 = 10."
            },
            {
                "input": "heights = [2, 4]",
                "output": "4",
                "explanation": "Area = 4."
            }
        ]
    ),

    "maximum-rectangles": make_prob(
        description="Given a `rows x cols` binary `matrix` filled with 0's and 1's, find the largest rectangle containing only 1's and return its area. Solve in O(rows * cols) time by converting each row into an accumulated histogram and applying the Largest Rectangle in Histogram algorithm.",
        input_format="A 2D character/integer matrix `matrix` containing '0's and '1's.",
        output_format="Return the maximum area of a rectangle of 1s.",
        constraints="rows == matrix.length\ncols == matrix[i].length\n1 <= rows, cols <= 200\nmatrix[i][j] is '0' or '1'.",
        examples=[
            {
                "input": "matrix = [[\"1\", \"0\", \"1\", \"0\", \"0\"], [\"1\", \"0\", \"1\", \"1\", \"1\"], [\"1\", \"1\", \"1\", \"1\", \"1\"], [\"1\", \"0\", \"0\", \"1\", \"0\"]]",
                "output": "6",
                "explanation": "The maximal rectangle has area 6 (height 2, width 3)."
            },
            {
                "input": "matrix = [[\"0\"]]",
                "output": "0",
                "explanation": "Matrix contains only zero."
            }
        ]
    ),

    "stock-span-problem": make_prob(
        description="Design an algorithm that collects daily price quotes for some stock and returns the span of that stock's price for the current day. The span of the stock's price today is defined as the maximum number of consecutive days (starting from today and going backward) for which the stock price was less than or equal to today's price. Solve in amortized O(1) time per day using a monotonic stack of `(price, span)` pairs.",
        input_format="A series of calls to StockSpanner.next(price).",
        output_format="Return an array of span values.",
        constraints="1 <= price <= 10^5\nAt most 10^4 calls will be made to next.",
        examples=[
            {
                "input": "next(100), next(80), next(60), next(70), next(60), next(75), next(85)",
                "output": "[1, 1, 1, 2, 1, 4, 6]",
                "explanation": "On day 7 (price 85), 85 >= [80, 60, 70, 60, 75, 85], so span is 6."
            },
            {
                "input": "next(10), next(20), next(30)",
                "output": "[1, 2, 3]",
                "explanation": "Prices strictly increase, giving consecutive spans."
            }
        ]
    ),

    "celebrity-problem": make_prob(
        description="A celebrity is a person who is known to everyone in a party, but does not know anyone in return. If `M[i][j] = 1`, it means person `i` knows person `j`. Given a square matrix `M` of size `n x n`, find the celebrity at the party. If no celebrity is present, return -1. Solve in O(N) time with O(1) space using elimination.",
        input_format="An `n x n` binary matrix `M`.",
        output_format="Return the 0-based index of the celebrity, or -1.",
        constraints="2 <= n <= 3000\n0 <= M[i][j] <= 1",
        examples=[
            {
                "input": "M = [[0, 1, 0], [0, 0, 0], [0, 1, 0]]",
                "output": "1",
                "explanation": "0 knows 1, 2 knows 1, and 1 knows no one. Person 1 is the celebrity."
            },
            {
                "input": "M = [[0, 1], [1, 0]]",
                "output": "-1",
                "explanation": "Both know each other, so no celebrity exists."
            }
        ]
    ),

    "lru-cache": make_prob(
        description="Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the `LRUCache` class with `get(key)` in O(1) time and `put(key, value)` in O(1) time. When the cache reaches its capacity, it should invalidate and evict the least recently used key before inserting a new item. Use a Doubly Linked List paired with a Hash Map.",
        input_format="Method calls to LRUCache: LRUCache(capacity), put(key, value), get(key).",
        output_format="Return outputs matching LRU eviction semantics.",
        constraints="1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5\nAt most 2 * 10^5 calls to get and put.",
        examples=[
            {
                "input": "LRUCache(2), put(1, 1), put(2, 2), get(1), put(3, 3), get(2), put(4, 4), get(1), get(3), get(4)",
                "output": "[null, null, null, 1, null, -1, null, -1, 3, 4]",
                "explanation": "Key 2 is evicted when key 3 is added. Later key 1 is evicted when key 4 is added."
            },
            {
                "input": "LRUCache(1), put(2, 1), get(2)",
                "output": "[null, null, 1]",
                "explanation": "Single item cache works correctly."
            }
        ]
    ),

    "lfu-cache": make_prob(
        description="Design and implement a data structure for a Least Frequently Used (LFU) cache. Support `get(key)` and `put(key, value)` in O(1) average time complexity. When capacity is exceeded, invalidate and evict the least frequently used key. If there is a tie, invalidate the least recently used key among them. Maintain a hash map of frequencies to Doubly Linked Lists.",
        input_format="Method calls to LFUCache.",
        output_format="Return results matching LFU cache semantics.",
        constraints="1 <= capacity <= 10^4\n0 <= key <= 10^5\n0 <= value <= 10^9\nAt most 2 * 10^5 calls.",
        examples=[
            {
                "input": "LFUCache(2), put(1, 1), put(2, 2), get(1), put(3, 3), get(2), get(3), put(4, 4), get(1), get(3), get(4)",
                "output": "[null, null, null, 1, null, -1, 3, null, -1, 3, 4]",
                "explanation": "Key 2 had frequency 1 and was LRU among frequency 1, so it is evicted when key 3 is inserted."
            },
            {
                "input": "LFUCache(1), put(1, 10), get(1)",
                "output": "[null, null, 10]",
                "explanation": "Key 1 retrieved."
            }
        ]
    ),

    "number-of-greater-elements-to-the-right": make_prob(
        description="Given an array of `n` integers and `q` queries, each containing an index. For each query, return the count of elements that are strictly greater than `arr[query_index]` and lie to its right in the array.",
        input_format="An integer array `arr` of size `n`, an integer `q`, and an array of `indices`.",
        output_format="Return an array of query answers.",
        constraints="1 <= n <= 10^4\n1 <= q <= 100\n0 <= arr[i] <= 10^5\n0 <= indices[i] < n",
        examples=[
            {
                "input": "arr = [3, 4, 2, 7, 5, 8, 10, 6], queries = [0, 5]",
                "output": "[6, 1]",
                "explanation": "To right of index 0 (val 3): 4, 7, 5, 8, 10, 6 (6 elements). To right of index 5 (val 8): 10 (1 element)."
            },
            {
                "input": "arr = [1, 2, 3, 4, 5], queries = [4]",
                "output": "[0]",
                "explanation": "No elements to the right of the last index."
            }
        ]
    ),
}
