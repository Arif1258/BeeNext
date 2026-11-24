from .common import make_prob

TREES_BST_DATA = {
    # --- BINARY TREES (32) ---
    "introduction-": make_prob(
        description="Learn the fundamentals of Binary Trees: root node, left and right children, leaf nodes, depth, height, and degrees. Understand types of binary trees: Full, Complete, Perfect, Balanced, and Degenerate trees. Learn tree node representation: `class TreeNode { int val; TreeNode left; TreeNode right; }`.",
        input_format="Conceptual or serialized representation of binary tree nodes.",
        output_format="Return or demonstrate basic tree construction and node counting.",
        constraints="0 <= nodes <= 10^5",
        examples=[
            {
                "input": "root = [1, 2, 3, 4, 5]",
                "output": "nodes = 5, height = 3",
                "explanation": "Binary tree with 5 nodes has root 1, children 2 and 3, and leaves 4 and 5."
            },
            {
                "input": "root = [1]",
                "output": "nodes = 1, height = 1",
                "explanation": "Single root node."
            }
        ]
    ),

    "inorder-traversal": make_prob(
        description="Given the `root` of a binary tree, return the inorder traversal of its nodes' values (`Left -> Root -> Right`). Implement both recursive and iterative versions using an explicit stack.",
        input_format="The `root` node of a binary tree.",
        output_format="Return a list of node values in inorder sequence.",
        constraints="The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [1, null, 2, 3]",
                "output": "[1, 3, 2]",
                "explanation": "Inorder traversal visits Left -> Root -> Right."
            },
            {
                "input": "root = []",
                "output": "[]",
                "explanation": "Empty tree returns empty list."
            }
        ]
    ),

    "preorder-traversal": make_prob(
        description="Given the `root` of a binary tree, return the preorder traversal of its nodes' values (`Root -> Left -> Right`). Implement both recursive and iterative versions using an explicit stack.",
        input_format="The `root` node of a binary tree.",
        output_format="Return a list of node values in preorder sequence.",
        constraints="The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [1, null, 2, 3]",
                "output": "[1, 2, 3]",
                "explanation": "Visits Root (1) -> Left (none) -> Right (2) -> Left of 2 (3)."
            },
            {
                "input": "root = [1]",
                "output": "[1]",
                "explanation": "Single node."
            }
        ]
    ),

    "postorder-traversal": make_prob(
        description="Given the `root` of a binary tree, return the postorder traversal of its nodes' values (`Left -> Right -> Root`). Implement both recursive and iterative (using two stacks or 1 stack with previous pointer) versions.",
        input_format="The `root` node of a binary tree.",
        output_format="Return a list of integers in postorder traversal sequence.",
        constraints="The number of the nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [1, null, 2, 3]",
                "output": "[3, 2, 1]",
                "explanation": "Left -> Right -> Root."
            },
            {
                "input": "root = [1, 2, 3]",
                "output": "[2, 3, 1]",
                "explanation": "Leaves 2 and 3 visited before root 1."
            }
        ]
    ),

    "level-order-traversal": make_prob(
        description="Given the `root` of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level) using a FIFO queue (BFS).",
        input_format="The `root` node of a binary tree.",
        output_format="Return a list of lists of integers, where each sublist contains values of a tree level.",
        constraints="The number of nodes in the tree is in the range [0, 2000].\n-1000 <= Node.val <= 1000",
        examples=[
            {
                "input": "root = [3, 9, 20, null, null, 15, 7]",
                "output": "[[3], [9, 20], [15, 7]]",
                "explanation": "Level 0 has [3], Level 1 has [9, 20], Level 2 has [15, 7]."
            },
            {
                "input": "root = [1]",
                "output": "[[1]]",
                "explanation": "Single node level."
            }
        ]
    ),

    "pre,-post,-inorder-in-one-traversal": make_prob(
        description="Given a binary tree, print its Preorder, Inorder, and Postorder traversals in a single traversal using one stack of pairs `(TreeNode, state)`. If state is 1: record preorder and increment state; if 2: record inorder and increment; if 3: record postorder and pop.",
        input_format="The `root` node of a binary tree.",
        output_format="Return an object/tuple containing `[preorder, inorder, postorder]` lists.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "root = [1, 2, 5, 3, 4, null, 6]",
                "output": "pre = [1, 2, 3, 4, 5, 6], in = [3, 2, 4, 1, 5, 6], post = [3, 4, 2, 6, 5, 1]",
                "explanation": "All three traversals generated concurrently in one stack pass."
            },
            {
                "input": "root = [1]",
                "output": "pre = [1], in = [1], post = [1]",
                "explanation": "Single node tree."
            }
        ]
    ),

    "maximum-depth-in-bt": make_prob(
        description="Given the `root` of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node. Compute recursively using `1 + max(maxDepth(left), maxDepth(right))`.",
        input_format="The `root` node of a binary tree.",
        output_format="Return an integer representing the maximum depth.",
        constraints="The number of nodes in the tree is in the range [0, 10^4].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [3, 9, 20, null, null, 15, 7]",
                "output": "3",
                "explanation": "Path 3 -> 20 -> 15 or 3 -> 20 -> 7 has length 3."
            },
            {
                "input": "root = [1, null, 2]",
                "output": "2",
                "explanation": "Path 1 -> 2 has length 2."
            }
        ]
    ),

    "check-if-two-trees-are-identical-or-not": make_prob(
        description="Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not. Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.",
        input_format="Roots of two binary trees `p` and `q`.",
        output_format="Return boolean `true` if identical, else `false`.",
        constraints="The number of nodes in both trees is in the range [0, 100].\n-10^4 <= Node.val <= 10^4",
        examples=[
            {
                "input": "p = [1, 2, 3], q = [1, 2, 3]",
                "output": "true",
                "explanation": "Both trees have identical structure and node values."
            },
            {
                "input": "p = [1, 2], q = [1, null, 2]",
                "output": "false",
                "explanation": "Structures differ."
            }
        ]
    ),

    "check-for-balanced-binary-tree": make_prob(
        description="Given a binary tree, determine if it is height-balanced. A height-balanced binary tree is defined as a binary tree in which the depth of the two subtrees of every node never differs by more than one. Solve in O(N) time by returning -1 if any subtree is unbalanced.",
        input_format="The `root` node of a binary tree.",
        output_format="Return boolean `true` if balanced, else `false`.",
        constraints="The number of nodes in the tree is in the range [0, 5000].\n-10^4 <= Node.val <= 10^4",
        examples=[
            {
                "input": "root = [3, 9, 20, null, null, 15, 7]",
                "output": "true",
                "explanation": "Heights of subtrees at root differ by 2 - 1 = 1 <= 1."
            },
            {
                "input": "root = [1, 2, 2, 3, 3, null, null, 4, 4]",
                "output": "false",
                "explanation": "Subtree heights differ by more than 1."
            }
        ]
    ),

    "diameter-of-binary-tree": make_prob(
        description="Given the `root` of a binary tree, return the length of the diameter of the tree. The diameter of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root. Solve in O(N) time maintaining `max(diameter, leftHeight + rightHeight)`.",
        input_format="The `root` node of a binary tree.",
        output_format="Return the diameter length (number of edges on longest path).",
        constraints="The number of nodes in the tree is in the range [1, 10^4].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [1, 2, 3, 4, 5]",
                "output": "3",
                "explanation": "3 is the length of the path [4, 2, 1, 3] or [5, 2, 1, 3]."
            },
            {
                "input": "root = [1, 2]",
                "output": "1",
                "explanation": "Direct edge between 1 and 2."
            }
        ]
    ),

    "maximum-path-sum-": make_prob(
        description="A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. The path sum is the sum of the node's values in the path. Given the `root` of a binary tree, return the maximum path sum of any non-empty path.",
        input_format="The `root` of a binary tree.",
        output_format="Return the maximum path sum.",
        constraints="The number of nodes in the tree is in the range [1, 3 * 10^4].\n-1000 <= Node.val <= 1000",
        examples=[
            {
                "input": "root = [1, 2, 3]",
                "output": "6",
                "explanation": "The optimal path is 2 -> 1 -> 3 with path sum 2 + 1 + 3 = 6."
            },
            {
                "input": "root = [-10, 9, 20, null, null, 15, 7]",
                "output": "42",
                "explanation": "Path 15 -> 20 -> 7 gives sum 15 + 20 + 7 = 42."
            }
        ]
    ),

    "check-for-symmetrical-bts": make_prob(
        description="Given the `root` of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center). A tree is symmetric if `left.val == right.val` and left's left subtree matches right's right subtree while left's right matches right's left.",
        input_format="The `root` node of a binary tree.",
        output_format="Return boolean `true` if symmetric, else `false`.",
        constraints="The number of nodes in the tree is in the range [1, 1000].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [1, 2, 2, 3, 4, 4, 3]",
                "output": "true",
                "explanation": "The tree is symmetric around its vertical axis."
            },
            {
                "input": "root = [1, 2, 2, null, 3, null, 3]",
                "output": "false",
                "explanation": "Left and right subtrees do not mirror each other."
            }
        ]
    ),

    "children-sum-property-in-binary-tree": make_prob(
        description="Given a binary tree, modify it so that it satisfies the Children Sum Property: for every node, its value must be equal to the sum of values of its left and right children (leaf nodes are exempt). You can only increment node values, not decrement.",
        input_format="The `root` of a binary tree.",
        output_format="Modify the tree in-place so each parent equals the sum of its children.",
        constraints="1 <= nodes <= 10^5\n0 <= Node.val <= 10^9",
        examples=[
            {
                "input": "root = [2, 35, 10, 2, 3, 5, 2]",
                "output": "[Modified tree satisfying parent = left + right]",
                "explanation": "Nodes incremented appropriately top-down then bottom-up."
            },
            {
                "input": "root = [50, 7, 2]",
                "output": "[50, 25, 25]",
                "explanation": "Children incremented to match parent value."
            }
        ]
    ),

    "zig-zag-or-spiral-traversal": make_prob(
        description="Given the `root` of a binary tree, return the zigzag level order traversal of its nodes' values (i.e., from left to right, then right to left for the next level and alternate between). Solve in O(N) using BFS and a boolean flag.",
        input_format="The `root` of a binary tree.",
        output_format="Return a list of lists of integers in zigzag level order.",
        constraints="The number of nodes in the tree is in the range [0, 2000].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [3, 9, 20, null, null, 15, 7]",
                "output": "[[3], [20, 9], [15, 7]]",
                "explanation": "Level 0: left to right [3]. Level 1: right to left [20, 9]. Level 2: left to right [15, 7]."
            },
            {
                "input": "root = [1]",
                "output": "[[1]]",
                "explanation": "Single node."
            }
        ]
    ),

    "boundary-traversal": make_prob(
        description="Given a Binary Tree, find its Boundary Traversal. The boundary includes: 1. Left boundary nodes (excluding leaves). 2. All leaf nodes (left to right). 3. Right boundary nodes in reverse bottom-up order (excluding leaves).",
        input_format="The `root` of a binary tree.",
        output_format="Return a list of node values along the boundary in anti-clockwise order.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "root = [1, 2, 7, 3, null, null, 8, null, 4, 9, null, 5, 6, 10, 11]",
                "output": "[1, 2, 3, 4, 5, 6, 10, 11, 9, 8, 7]",
                "explanation": "Anti-clockwise traversal: left boundary, leaves, and reverse right boundary."
            },
            {
                "input": "root = [1]",
                "output": "[1]",
                "explanation": "Single root node."
            }
        ]
    ),

    "vertical-order-traversal": make_prob(
        description="Given the `root` of a binary tree, calculate the vertical order traversal of the binary tree. For each node at `(row, col)`, its left child is at `(row + 1, col - 1)` and right is at `(row + 1, col + 1)`. If two nodes have the same row and col, sort them by value. Group results by column from leftmost to rightmost.",
        input_format="The `root` of a binary tree.",
        output_format="Return a list of lists of node values ordered vertically by columns.",
        constraints="The number of nodes in the tree is in the range [1, 1000].\n0 <= Node.val <= 1000",
        examples=[
            {
                "input": "root = [3, 9, 20, null, null, 15, 7]",
                "output": "[[9], [3, 15], [20], [7]]",
                "explanation": "Column -1 has [9]; Column 0 has [3, 15]; Column 1 has [20]; Column 2 has [7]."
            },
            {
                "input": "root = [1, 2, 3, 4, 5, 6, 7]",
                "output": "[[4], [2], [1, 5, 6], [3], [7]]",
                "explanation": "Sorted vertical slices."
            }
        ]
    ),

    "top-view-of-bt": make_prob(
        description="Given a binary tree, print the top view of the binary tree. The top view consists of the set of nodes visible when the tree is viewed from the top. For each vertical column coordinate, only the topmost node is included in the result.",
        input_format="The `root` of a binary tree.",
        output_format="Return a list of node values representing the top view from leftmost to rightmost column.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "root = [1, 2, 3, 4, 5, 6, 7]",
                "output": "[4, 2, 1, 3, 7]",
                "explanation": "Nodes 4, 2, 1, 3, 7 are visible from the top."
            },
            {
                "input": "root = [1, 2, 3]",
                "output": "[2, 1, 3]",
                "explanation": "Top view contains [2, 1, 3]."
            }
        ]
    ),

    "bottom-view-of-bt": make_prob(
        description="Given a binary tree, return an array of nodes representing the bottom view of the tree from leftmost column to rightmost. If there are multiple bottom-most nodes for a horizontal distance, the node that appears later in level order traversal is considered.",
        input_format="The `root` of a binary tree.",
        output_format="Return a list of node values representing the bottom view.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "root = [1, 2, 3, 4, 5, 6, 7]",
                "output": "[4, 2, 6, 3, 7]",
                "explanation": "Bottom-most nodes at each horizontal column are visible."
            },
            {
                "input": "root = [20, 8, 22, 5, 3, 4, 25]",
                "output": "[5, 8, 4, 22, 25]",
                "explanation": "Bottom view correctly rendered."
            }
        ]
    ),

    "right-left-view-of-bt": make_prob(
        description="Given the `root` of a binary tree, return the right-side view of the binary tree (nodes visible when looked at from the right side) and the left-side view (nodes visible from left side). Solve in O(N) using recursive DFS taking the first node encountered at each level.",
        input_format="The `root` of a binary tree.",
        output_format="Return a list of node values for the right view (or left view).",
        constraints="The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [1, 2, 3, null, 5, null, 4]",
                "output": "right view = [1, 3, 4]",
                "explanation": "From the right side, nodes 1, 3, and 4 are visible."
            },
            {
                "input": "root = [1, null, 3]",
                "output": "right view = [1, 3]",
                "explanation": "Nodes 1 and 3 are visible."
            }
        ]
    ),

    "print-root-to-leaf-path-in-bt": make_prob(
        description="Given the `root` of a binary tree, return all root-to-leaf paths in any order. A leaf is a node with no children. Format each path as a string of values separated by `\"->\"`.",
        input_format="The `root` of a binary tree.",
        output_format="Return a list of strings representing paths from root to each leaf.",
        constraints="The number of nodes in the tree is in the range [1, 100].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [1, 2, 3, null, 5]",
                "output": "[\"1->2->5\", \"1->3\"]",
                "explanation": "All valid root to leaf paths."
            },
            {
                "input": "root = [1]",
                "output": "[\"1\"]",
                "explanation": "Single node leaf path."
            }
        ]
    ),

    "lca-in-bt": make_prob(
        description="Given a binary tree, find the Lowest Common Ancestor (LCA) of two given nodes `p` and `q`. The lowest common ancestor is defined between two nodes `p` and `q` as the lowest node in `T` that has both `p` and `q` as descendants. Solve in O(N) time with postorder recursion.",
        input_format="The `root` of a binary tree and two nodes `p` and `q`.",
        output_format="Return the LCA node.",
        constraints="The number of nodes in the tree is in the range [2, 10^5].\n-10^9 <= Node.val <= 10^9\nAll Node.val are unique.\np != q and both p and q exist in the tree.",
        examples=[
            {
                "input": "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 1",
                "output": "3",
                "explanation": "The LCA of nodes 5 and 1 is 3."
            },
            {
                "input": "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 4",
                "output": "5",
                "explanation": "The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself."
            }
        ]
    ),

    "maximum-width-of-bt": make_prob(
        description="Given the `root` of a binary tree, return the maximum width of the given tree. The maximum width of a tree is the maximum width among all levels. The width of one level is defined as the length between the end-nodes (the leftmost and rightmost non-null nodes), where the null nodes between the end-nodes are counted as if in a full binary tree. Index nodes as `2*i + 1` and `2*i + 2` using BFS.",
        input_format="The `root` of a binary tree.",
        output_format="Return an integer representing the maximum width.",
        constraints="The number of nodes in the tree is in the range [1, 3000].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [1, 3, 2, 5, 3, null, 9]",
                "output": "4",
                "explanation": "The maximum width exists in the third level with nodes [5, 3, null, 9] (width 4)."
            },
            {
                "input": "root = [1, 3, 2, 5, null, null, 9, 6, null, 7]",
                "output": "7",
                "explanation": "Width across the 4th level."
            }
        ]
    ),

    "print-all-nodes-at-a-distance-of-k-in-bt": make_prob(
        description="Given the `root` of a binary tree, the value of a target node `target`, and an integer `k`, return an array of the values of all nodes that have a distance `k` from the target node. Solve by establishing child-to-parent pointers with BFS/DFS and running a radial BFS outward up to distance `k`.",
        input_format="The `root` node, `target` node, and integer `k`.",
        output_format="Return a list of node values at distance `k`.",
        constraints="The number of nodes in the tree is in the range [1, 500].\n0 <= Node.val <= 500\nAll values are unique.\n0 <= k <= 1000",
        examples=[
            {
                "input": "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], target = 5, k = 2",
                "output": "[7, 4, 1]",
                "explanation": "Nodes that are distance 2 from node 5 are 7, 4, and 1."
            },
            {
                "input": "root = [1], target = 1, k = 3",
                "output": "[]",
                "explanation": "No nodes at distance 3."
            }
        ]
    ),

    "minimum-time-taken-to-burn-the-bt-from-a-given-node": make_prob(
        description="Given a binary tree and a target node `start`. Find the minimum time required to burn the entire binary tree if the target node is set on fire. In 1 unit of time, fire spreads to connected nodes (parent, left child, right child). Solve using radial BFS.",
        input_format="The `root` of a binary tree and integer `start`.",
        output_format="Return the minimum time in seconds/units to burn the tree completely.",
        constraints="1 <= nodes <= 10^5\nAll node values are distinct.",
        examples=[
            {
                "input": "root = [1, 2, 3, 4, 5, null, 6, null, null, 7, 8, null, 9, 10, null], start = 8",
                "output": "7",
                "explanation": "The maximum distance from node 8 to any node in the tree is 7 units of time."
            },
            {
                "input": "root = [1, 2, 3], start = 2",
                "output": "2",
                "explanation": "At t=1, 1 catches fire; at t=2, 3 catches fire. Total = 2."
            }
        ]
    ),

    "count-total-nodes-in-a-complete-bt": make_prob(
        description="Given the `root` of a complete binary tree, return the number of the nodes in the tree. According to Wikipedia, every level, except possibly the last, is completely filled, and all nodes in the last level are as far left as possible. Design an algorithm that runs in less than O(N) time (specifically O(log^2 N)) by comparing left and right heights.",
        input_format="The `root` of a complete binary tree.",
        output_format="Return total count of nodes as an integer.",
        constraints="The number of nodes in the tree is in the range [0, 5 * 10^4].\n0 <= Node.val <= 5 * 10^4\nThe tree is guaranteed to be complete.",
        examples=[
            {
                "input": "root = [1, 2, 3, 4, 5, 6]",
                "output": "6",
                "explanation": "Tree has 6 nodes."
            },
            {
                "input": "root = []",
                "output": "0",
                "explanation": "Empty tree has 0 nodes."
            }
        ]
    ),

    "flatten-binary-tree-to-linked-list": make_prob(
        description="Given the `root` of a binary tree, flatten the tree into a \"linked list\" in-place: the \"linked list\" should use the same `TreeNode` class where the `right` child pointer points to the next node in the list, the `left` child pointer is always `null`, and nodes appear in preorder order. Solve in O(N) time and O(1) space using Morris traversal.",
        input_format="The `root` of a binary tree.",
        output_format="Flatten the tree in-place so all nodes follow right child pointers.",
        constraints="The number of nodes in the tree is in the range [0, 2000].\n-100 <= Node.val <= 100",
        examples=[
            {
                "input": "root = [1, 2, 5, 3, 4, null, 6]",
                "output": "[1, null, 2, null, 3, null, 4, null, 5, null, 6]",
                "explanation": "Flattened in-place along right pointers matching preorder sequence."
            },
            {
                "input": "root = []",
                "output": "[]",
                "explanation": "Empty tree remains empty."
            }
        ]
    ),

    "requirements-needed-to-construct-a-unique-bt": make_prob(
        description="Determine whether a unique binary tree can be constructed given two traversal sequences. Note that to construct a unique binary tree, an Inorder traversal MUST be paired with either a Preorder or Postorder traversal. Preorder + Postorder does not yield a unique tree in general.",
        input_format="Two traversal sequence types `a` and `b` (e.g. 1: Preorder, 2: Inorder, 3: Postorder).",
        output_format="Return boolean `true` if a unique binary tree can be constructed, else `false`.",
        constraints="a, b in {1, 2, 3}",
        examples=[
            {
                "input": "a = Inorder, b = Preorder",
                "output": "true",
                "explanation": "Inorder and Preorder uniquely identify root and partition left/right subtrees."
            },
            {
                "input": "a = Preorder, b = Postorder",
                "output": "false",
                "explanation": "Without Inorder, left and right subtrees cannot be uniquely partitioned."
            }
        ]
    ),

    "construct-a-bt-from-preorder-and-inorder": make_prob(
        description="Given two integer arrays `preorder` and `inorder` where `preorder` is the preorder traversal of a binary tree and `inorder` is the inorder traversal of the same tree, construct and return the binary tree. Use a hash map of inorder indices to divide subtrees in O(N) time.",
        input_format="Two integer arrays `preorder` and `inorder`.",
        output_format="Return the `root` node of the constructed binary tree.",
        constraints="1 <= preorder.length <= 3000\ninorder.length == preorder.length\n-3000 <= preorder[i], inorder[i] <= 3000\npreorder and inorder consist of unique values.",
        examples=[
            {
                "input": "preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]",
                "output": "[3, 9, 20, null, null, 15, 7]",
                "explanation": "Root is 3. Inorder shows 9 in left subtree and [15, 20, 7] in right subtree."
            },
            {
                "input": "preorder = [-1], inorder = [-1]",
                "output": "[-1]",
                "explanation": "Single node tree."
            }
        ]
    ),

    "construct-a-bt-from-postorder-and-inorder": make_prob(
        description="Given two integer arrays `inorder` and `postorder` where `inorder` is the inorder traversal of a binary tree and `postorder` is the postorder traversal of the same tree, construct and return the binary tree.",
        input_format="Two integer arrays `inorder` and `postorder`.",
        output_format="Return the `root` node of the constructed binary tree.",
        constraints="1 <= inorder.length <= 3000\npostorder.length == inorder.length\n-3000 <= inorder[i], postorder[i] <= 3000\ninorder and postorder consist of unique values.",
        examples=[
            {
                "input": "inorder = [9, 3, 15, 20, 7], postorder = [9, 15, 7, 20, 3]",
                "output": "[3, 9, 20, null, null, 15, 7]",
                "explanation": "Last element in postorder is root 3."
            },
            {
                "input": "inorder = [-1], postorder = [-1]",
                "output": "[-1]",
                "explanation": "Single node."
            }
        ]
    ),

    "serialize-and-de-serialize-bt": make_prob(
        description="Serialization is the process of converting a data structure or object into a sequence of bits or a string so that it can be stored. Deserialization reconstructs the tree from this string. Design an algorithm to serialize and deserialize a binary tree using Level Order traversal (BFS) with comma separation and `'#'` for null nodes.",
        input_format="A binary tree for `serialize(root)` and a string for `deserialize(data)`.",
        output_format="The reconstructed tree must match the original tree identically.",
        constraints="The number of nodes in the tree is in the range [0, 10^4].\n-1000 <= Node.val <= 1000",
        examples=[
            {
                "input": "root = [1, 2, 3, null, null, 4, 5]",
                "output": "\"1,2,3,#,#,4,5,#,#,#,#\"",
                "explanation": "Serialized string can be deserialized back into identical binary tree."
            },
            {
                "input": "root = []",
                "output": "\"\"",
                "explanation": "Empty tree serializes to empty string."
            }
        ]
    ),

    "morris-inorder-traversal-": make_prob(
        description="Given the `root` of a binary tree, return the inorder traversal of its nodes' values using Morris Inorder Traversal in O(N) time and strictly O(1) auxiliary space by creating temporary threaded links from the inorder predecessor to current node.",
        input_format="The `root` of a binary tree.",
        output_format="Return a list of integers in inorder sequence with O(1) space.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "root = [1, null, 2, 3]",
                "output": "[1, 3, 2]",
                "explanation": "Traversal accomplished in O(1) space without recursion or stack."
            },
            {
                "input": "root = [1, 2, 3]",
                "output": "[2, 1, 3]",
                "explanation": "Inorder sequence."
            }
        ]
    ),

    "morris-preorder-traversal-": make_prob(
        description="Given the `root` of a binary tree, return the preorder traversal of its nodes' values using Morris Preorder Traversal in O(N) time and strictly O(1) auxiliary space. When establishing a thread to the predecessor, record the current node value before moving left.",
        input_format="The `root` of a binary tree.",
        output_format="Return a list of integers in preorder sequence with O(1) auxiliary space.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "root = [1, null, 2, 3]",
                "output": "[1, 2, 3]",
                "explanation": "Preorder sequence generated using threaded tree pointers."
            },
            {
                "input": "root = [1, 2, 3]",
                "output": "[1, 2, 3]",
                "explanation": "Preorder output."
            }
        ]
    ),

    # --- BINARY SEARCH TREES (15) ---
    "introduction-to-bst": make_prob(
        description="Learn the definition and key properties of a Binary Search Tree (BST): for every node `X`, all nodes in its left subtree have `val < X.val` and all nodes in its right subtree have `val > X.val`. Understand that the Inorder traversal of any BST produces a strictly ascending sorted sequence.",
        input_format="A binary tree or array representation.",
        output_format="Determine BST properties and verify ordering.",
        constraints="0 <= nodes <= 10^5",
        examples=[
            {
                "input": "root = [4, 2, 7, 1, 3]",
                "output": "Inorder = [1, 2, 3, 4, 7]",
                "explanation": "Inorder traversal of valid BST is sorted in ascending order."
            },
            {
                "input": "root = [2, 1, 3]",
                "output": "Inorder = [1, 2, 3]",
                "explanation": "Valid BST."
            }
        ]
    ),

    "search-in-bst": make_prob(
        description="You are given the `root` of a binary search tree (BST) and an integer `val`. Find the node in the BST that the node's value equals `val` and return the subtree rooted with that node. If such a node does not exist, return `null`. Solve in O(height) time.",
        input_format="The `root` of a BST and integer `val`.",
        output_format="Return the subtree rooted at target node, or null.",
        constraints="The number of nodes in the tree is in the range [1, 5000].\n1 <= Node.val <= 10^7\nroot is a valid BST.",
        examples=[
            {
                "input": "root = [4, 2, 7, 1, 3], val = 2",
                "output": "[2, 1, 3]",
                "explanation": "Node 2 with its subtree [2, 1, 3] is returned."
            },
            {
                "input": "root = [4, 2, 7, 1, 3], val = 5",
                "output": "[]",
                "explanation": "5 is not found."
            }
        ]
    ),

    "floor-and-ceil-in-a-bst": make_prob(
        description="Given a Binary Search Tree and a target `key`, find the Floor and Ceil of `key` in the BST. Floor is the greatest value <= key. Ceil is the smallest value >= key. If not present, return -1. Solve in O(height) time without inspecting the whole tree.",
        input_format="The `root` of a BST and integer `key`.",
        output_format="Return `[floor, ceil]`.",
        constraints="1 <= nodes <= 10^5\n1 <= Node.val, key <= 10^9",
        examples=[
            {
                "input": "root = [8, 4, 12, 2, 6, 10, 14], key = 11",
                "output": "floor = 10, ceil = 12",
                "explanation": "Largest node <= 11 is 10; smallest node >= 11 is 12."
            },
            {
                "input": "root = [10, 5, 15], key = 10",
                "output": "floor = 10, ceil = 10",
                "explanation": "Exact key matches both floor and ceil."
            }
        ]
    ),

    "minimum-and-maximum-in-bst": make_prob(
        description="Given a Binary Search Tree, find the minimum and maximum value present in it. In a BST, the leftmost node is the minimum and the rightmost node is the maximum.",
        input_format="The `root` of a BST.",
        output_format="Return `[minValue, maxValue]`.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "root = [5, 4, 6, 3, null, null, 7, 1]",
                "output": "[1, 7]",
                "explanation": "Leftmost node is 1 and rightmost node is 7."
            },
            {
                "input": "root = [9]",
                "output": "[9, 9]",
                "explanation": "Single node."
            }
        ]
    ),

    "insert-a-given-node-in-bst": make_prob(
        description="You are given the `root` node of a binary search tree (BST) and a `value` to insert into the tree. Return the root node of the BST after the insertion. It is guaranteed that the new value does not exist in the original BST. Solve in O(height) time.",
        input_format="The `root` of a BST and an integer `val`.",
        output_format="Return the `root` of the updated BST.",
        constraints="The number of nodes in the tree will be in the range [0, 10^4].\n-10^8 <= Node.val, val <= 10^8\nAll values in BST are unique.",
        examples=[
            {
                "input": "root = [4, 2, 7, 1, 3], val = 5",
                "output": "[4, 2, 7, 1, 3, 5]",
                "explanation": "5 is inserted as left child of 7."
            },
            {
                "input": "root = [40, 20, 60, 10, 30, 50, 70], val = 25",
                "output": "[40, 20, 60, 10, 30, 50, 70, null, null, 25]",
                "explanation": "25 is inserted as left child of 30."
            }
        ]
    ),

    "delete-a-node-in-bst": make_prob(
        description="Given a root node reference of a BST and a `key`, delete the node with the given key in the BST. Return the root node reference of the BST. Deletion involves 3 cases: 1. Node is leaf (remove directly). 2. Node has 1 child (link child to parent). 3. Node has 2 children (replace with inorder successor or predecessor and delete it).",
        input_format="The `root` of a BST and integer `key`.",
        output_format="Return the `root` after deleting `key`.",
        constraints="The number of nodes in the tree is in the range [0, 10^4].\n-10^5 <= Node.val, key <= 10^5\nAll values are unique.",
        examples=[
            {
                "input": "root = [5, 3, 6, 2, 4, null, 7], key = 3",
                "output": "[5, 4, 6, 2, null, null, 7]",
                "explanation": "Node 3 is deleted and replaced with its inorder successor 4."
            },
            {
                "input": "root = [5, 3, 6, 2, 4, null, 7], key = 0",
                "output": "[5, 3, 6, 2, 4, null, 7]",
                "explanation": "Key 0 does not exist in BST, so tree remains unchanged."
            }
        ]
    ),

    "kth-smallest-and-largest-element-in-bst": make_prob(
        description="Given the `root` of a binary search tree, and an integer `k`, return the `k`-th smallest value and `k`-th largest value in the tree. Since Inorder traversal is sorted, the k-th node visited during Inorder is the k-th smallest element, and reverse Inorder gives k-th largest.",
        input_format="The `root` of a BST and an integer `k`.",
        output_format="Return `[kthSmallest, kthLargest]`.",
        constraints="The number of nodes in the tree is n.\n1 <= k <= n <= 10^4\n0 <= Node.val <= 10^4",
        examples=[
            {
                "input": "root = [3, 1, 4, null, 2], k = 1",
                "output": "1st smallest = 1, 1st largest = 4",
                "explanation": "Inorder is [1, 2, 3, 4]."
            },
            {
                "input": "root = [5, 3, 6, 2, 4, null, null, 1], k = 3",
                "output": "3rd smallest = 3, 3rd largest = 4",
                "explanation": "Sorted order: [1, 2, 3, 4, 5, 6]."
            }
        ]
    ),

    "check-if-a-tree-is-a-bst-or-not": make_prob(
        description="Given the `root` of a binary tree, determine if it is a valid binary search tree (BST). A valid BST satisfies: left subtree values < current node val < right subtree values across all levels. Solve recursively passing valid range `(minVal, maxVal)` in O(N) time.",
        input_format="The `root` of a binary tree.",
        output_format="Return boolean `true` if valid BST, else `false`.",
        constraints="The number of nodes in the tree is in the range [1, 10^4].\n-2^31 <= Node.val <= 2^31 - 1",
        examples=[
            {
                "input": "root = [2, 1, 3]",
                "output": "true",
                "explanation": "Left child 1 < root 2 < right child 3."
            },
            {
                "input": "root = [5, 1, 4, null, null, 3, 6]",
                "output": "false",
                "explanation": "The root's right child is 4, which is less than 5."
            }
        ]
    ),

    "lca-in-bst": make_prob(
        description="Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST. According to the definition of LCA, the LCA is the first split point where one target node lies in left subtree and the other in right subtree (or one node equals current node).",
        input_format="The `root` of a BST and two nodes `p` and `q`.",
        output_format="Return the LCA node.",
        constraints="The number of nodes in the tree is in the range [2, 10^5].\n-10^9 <= Node.val <= 10^9\nAll Node.val are unique.\np != q and both exist in the BST.",
        examples=[
            {
                "input": "root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 8",
                "output": "6",
                "explanation": "The LCA of nodes 2 and 8 is 6."
            },
            {
                "input": "root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 4",
                "output": "2",
                "explanation": "The LCA of nodes 2 and 4 is 2."
            }
        ]
    ),

    "construct-a-bst-from-a-preorder-traversal": make_prob(
        description="Given an array of integers `preorder`, which represents the preorder traversal of a BST, construct the tree and return its root. Solve in O(N) time by maintaining an upper bound boundary `bound` during recursive construction.",
        input_format="An integer array `preorder`.",
        output_format="Return the `root` node of the constructed BST.",
        constraints="1 <= preorder.length <= 100\n1 <= preorder[i] <= 1000\nAll the values of preorder are unique.",
        examples=[
            {
                "input": "preorder = [8, 5, 1, 7, 10, 12]",
                "output": "[8, 5, 10, 1, 7, null, 12]",
                "explanation": "Constructed BST satisfies all search properties."
            },
            {
                "input": "preorder = [1, 3]",
                "output": "[1, null, 3]",
                "explanation": "3 is right child of 1."
            }
        ]
    ),

    "inorder-successor-and-predecessor-in-bst": make_prob(
        description="There is a BST given with root node with key part as an integer only. You need to find the in-order successor and predecessor of a given key. If either doesn't exist, return -1. Solve in O(height) time.",
        input_format="The `root` of a BST and target integer `key`.",
        output_format="Return `[predecessorVal, successorVal]`.",
        constraints="1 <= nodes <= 10^5\n1 <= Node.val, key <= 10^9",
        examples=[
            {
                "input": "root = [20, 8, 22, 4, 12, null, null, 10, 14], key = 8",
                "output": "pre = 4, suc = 10",
                "explanation": "Inorder predecessor of 8 is 4; successor is 10."
            },
            {
                "input": "root = [5, 2, 7], key = 2",
                "output": "pre = -1, suc = 5",
                "explanation": "No predecessor exists for the smallest element."
            }
        ]
    ),

    "bst-iterator": make_prob(
        description="Implement the `BSTIterator` class that represents an iterator over the in-order traversal of a binary search tree (BST). Support `next()` returning the next smallest number, and `hasNext()` returning boolean. `next()` must run in amortized O(1) time and use O(h) memory where `h` is tree height.",
        input_format="Method calls to BSTIterator initialized with tree root.",
        output_format="Return in-order values sequentially.",
        constraints="The number of nodes in the tree is in the range [1, 10^5].\n0 <= Node.val <= 10^6\nAt most 10^5 calls to next and hasNext.",
        examples=[
            {
                "input": "BSTIterator([7, 3, 15, null, null, 9, 20]), next(), next(), hasNext(), next(), hasNext(), next(), hasNext(), next(), hasNext()",
                "output": "[3, 7, true, 9, true, 15, true, 20, false]",
                "explanation": "Yields values in ascending sorted order: 3, 7, 9, 15, 20."
            },
            {
                "input": "BSTIterator([1]), next(), hasNext()",
                "output": "[1, false]",
                "explanation": "Single node."
            }
        ]
    ),

    "two-sum-in-bst": make_prob(
        description="Given the `root` of a binary search tree and an integer `k`, return `true` if there exist two elements in the BST such that their sum is equal to `k`, or `false` otherwise. Solve in O(N) time and O(h) space using two `BSTIterator` instances: one moving forward (normal inorder) and one moving backward (reverse inorder).",
        input_format="The `root` of a BST and target integer `k`.",
        output_format="Return boolean `true` if pair exists, else `false`.",
        constraints="The number of nodes in the tree is in the range [1, 10^4].\n-10^4 <= Node.val <= 10^4\nroot is guaranteed to be a valid BST.\n-10^5 <= k <= 10^5",
        examples=[
            {
                "input": "root = [5, 3, 6, 2, 4, null, 7], k = 9",
                "output": "true",
                "explanation": "Nodes 2 and 7 sum to 9."
            },
            {
                "input": "root = [5, 3, 6, 2, 4, null, 7], k = 28",
                "output": "false",
                "explanation": "No two nodes sum to 28."
            }
        ]
    ),

    "correct-bst-with-two-nodes-swapped": make_prob(
        description="You are given the `root` of a binary search tree (BST), where the values of exactly two nodes of the tree were swapped by mistake. Recover the tree without changing its structure. Solve in O(N) time and O(1) extra space using Morris Traversal, or O(h) space with standard Inorder recursion.",
        input_format="The `root` of a BST with two swapped nodes.",
        output_format="Modify the tree in-place recovering valid BST node order.",
        constraints="The number of nodes in the tree is in the range [2, 1000].\n-2^31 <= Node.val <= 2^31 - 1",
        examples=[
            {
                "input": "root = [1, 3, null, null, 2]",
                "output": "[3, 1, null, null, 2]",
                "explanation": "3 cannot be left child of 1. Swap 1 and 3."
            },
            {
                "input": "root = [3, 1, 4, null, null, 2]",
                "output": "[2, 1, 4, null, null, 3]",
                "explanation": "2 cannot be in right subtree for root 3. Swap 2 and 3."
            }
        ]
    ),

    "largest-bst-in-binary-tree": make_prob(
        description="Given a binary tree, find the largest subtree which is also a Binary Search Tree (BST), where the largest means subtree with the largest number of nodes in it. A subtree must include all of its descendants. Solve in O(N) postorder time by passing `(size, minVal, maxVal)` up from children.",
        input_format="The `root` of a binary tree.",
        output_format="Return the size (number of nodes) of the largest BST subtree.",
        constraints="The number of nodes in the tree is in the range [1, 10^4].\n-10^4 <= Node.val <= 10^4",
        examples=[
            {
                "input": "root = [10, 5, 15, 1, 8, null, 7]",
                "output": "3",
                "explanation": "Subtree rooted at 5 with nodes [5, 1, 8] is a valid BST of size 3."
            },
            {
                "input": "root = [4, 2, 7, 2, 3, 5, null, 2, null, null, null, null, null, 1]",
                "output": "2",
                "explanation": "Largest BST has size 2."
            }
        ]
    ),
}
