from .common import make_prob

GRAPHS_DATA = {
    "introduction-to-graph": make_prob(
        description="Learn the fundamentals of Graph Theory: vertices (nodes), edges (directed vs. undirected, weighted vs. unweighted), degrees, in-degree and out-degree. Understand graph representations in memory: Adjacency Matrix (O(V^2) space) and Adjacency List (O(V + E) space).",
        input_format="Number of vertices `V`, edges `E`, and edge pairs.",
        output_format="Return or construct the adjacency list representation of the graph.",
        constraints="1 <= V <= 10^5\n0 <= E <= 2 * 10^5",
        examples=[
            {
                "input": "V = 4, edges = [[0, 1], [0, 2], [1, 2], [2, 3]]",
                "output": "adj = {0: [1, 2], 1: [0, 2], 2: [0, 1, 3], 3: [2]}",
                "explanation": "Adjacency list captures all undirected connections."
            },
            {
                "input": "V = 2, edges = [[0, 1]]",
                "output": "adj = {0: [1], 1: [0]}",
                "explanation": "Single edge between 0 and 1."
            }
        ]
    ),

    "traversal-techniques": make_prob(
        description="Master the two fundamental graph traversal algorithms: Breadth-First Search (BFS) using a FIFO queue to explore nodes level-by-level, and Depth-First Search (DFS) using recursion or an explicit stack to traverse deep into paths before backtracking. Both run in O(V + E) time.",
        input_format="Number of vertices `V` and adjacency list `adj`.",
        output_format="Return `[bfsTraversal, dfsTraversal]` from starting vertex 0.",
        constraints="1 <= V <= 10^4\n0 <= E <= 10^4",
        examples=[
            {
                "input": "V = 5, adj = [[1, 2, 3], [], [4], [], []]",
                "output": "BFS: [0, 1, 2, 3, 4], DFS: [0, 1, 2, 4, 3]",
                "explanation": "BFS explores immediate neighbors first; DFS explores depth first."
            },
            {
                "input": "V = 3, adj = [[1, 2], [0], [0]]",
                "output": "BFS: [0, 1, 2]",
                "explanation": "Traversed."
            }
        ]
    ),

    "connected-components": make_prob(
        description="Given an undirected graph with `V` vertices and an adjacency list, find the number of connected components. A connected component is a maximal set of vertices such that every pair is connected by a path. Iterate through all vertices and trigger BFS or DFS for unvisited vertices in O(V + E) time.",
        input_format="An integer `V` and edge list.",
        output_format="Return the number of connected components as an integer.",
        constraints="1 <= V <= 10^5\n0 <= edges.length <= 10^5",
        examples=[
            {
                "input": "V = 4, edges = [[0, 1], [2, 3]]",
                "output": "2",
                "explanation": "Component 1: {0, 1}; Component 2: {2, 3}. Total = 2."
            },
            {
                "input": "V = 3, edges = []",
                "output": "3",
                "explanation": "3 isolated vertices yield 3 components."
            }
        ]
    ),

    "number-of-provinces": make_prob(
        description="There are `n` cities. Some of them are connected, while some are not. If city `a` is connected directly with city `b`, and city `b` is connected directly with city `c`, then city `a` is connected indirectly with city `c`. A province is a group of directly or indirectly connected cities. Given an `n x n` adjacency matrix `isConnected`, return the total number of provinces. Solve in O(V^2) using DFS/BFS or Disjoint Set Union.",
        input_format="An `n x n` binary matrix `isConnected`.",
        output_format="Return the total number of provinces.",
        constraints="1 <= n <= 200\nisConnected[i][j] is 1 or 0.\nisConnected[i][i] == 1\nisConnected[i][j] == isConnected[j][i]",
        examples=[
            {
                "input": "isConnected = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]",
                "output": "2",
                "explanation": "Cities 0 and 1 form one province, and city 2 forms another."
            },
            {
                "input": "isConnected = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]",
                "output": "3",
                "explanation": "All 3 cities are isolated, giving 3 provinces."
            }
        ]
    ),

    "number-of-islands": make_prob(
        description="Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. Solve in O(m * n) time using BFS or DFS flood-fill.",
        input_format="An `m x n` 2D grid of '1's and '0's.",
        output_format="Return the total count of islands.",
        constraints="m == grid.length\nn == grid[i].length\n1 <= m, n <= 300\ngrid[i][j] is '0' or '1'.",
        examples=[
            {
                "input": "grid = [[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]]",
                "output": "1",
                "explanation": "All '1's are connected together into a single island."
            },
            {
                "input": "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]",
                "output": "3",
                "explanation": "3 distinct islands."
            }
        ]
    ),

    "flood-fill-algorithm": make_prob(
        description="An image is represented by an `m x n` integer grid `image` where `image[i][j]` represents the pixel value of the image. You are given three integers `sr`, `sc`, and `color`. You should perform a flood fill on the image starting from pixel `image[sr][sc]`. To perform a flood fill, consider the starting pixel, plus any 4-directionally connected pixels with the same color, and update them to the new `color`. Solve in O(m * n) using BFS or DFS.",
        input_format="An `m x n` 2D integer matrix `image`, starting coordinates `(sr, sc)`, and target `color`.",
        output_format="Return the modified image matrix after flood fill.",
        constraints="m == image.length\nn == image[i].length\n1 <= m, n <= 50\n0 <= image[i][j], color < 2^16\n0 <= sr < m\n0 <= sc < n",
        examples=[
            {
                "input": "image = [[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr = 1, sc = 1, color = 2",
                "output": "[[2, 2, 2], [2, 2, 0], [2, 0, 1]]",
                "explanation": "From the center at (1, 1), all connected pixels with value 1 are filled with color 2."
            },
            {
                "input": "image = [[0, 0, 0], [0, 0, 0]], sr = 0, sc = 0, color = 0",
                "output": "[[0, 0, 0], [0, 0, 0]]",
                "explanation": "Starting pixel is already color 0, so no changes occur."
            }
        ]
    ),

    "number-of-enclaves": make_prob(
        description="You are given an `m x n` binary matrix `grid`, where `0` represents a sea cell and `1` represents a land cell. A move consists of walking from one land cell to another 4-directionally adjacent land cell or walking off the boundary of the grid. Return the number of land cells in `grid` for which we cannot walk off the boundary of the grid in any number of moves. Solve by running BFS/DFS from boundary land cells to mark escapable cells, then counting remaining 1s.",
        input_format="An `m x n` 2D binary grid.",
        output_format="Return the number of enclosed land cells.",
        constraints="m == grid.length\nn == grid[i].length\n1 <= m, n <= 500\ngrid[i][j] is either 0 or 1.",
        examples=[
            {
                "input": "grid = [[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]",
                "output": "3",
                "explanation": "The three 1s in the center cannot reach any boundary."
            },
            {
                "input": "grid = [[0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]]",
                "output": "0",
                "explanation": "All 1s are connected to the boundary."
            }
        ]
    ),

    "rotten-oranges": make_prob(
        description="You are given an `m x n` grid where each cell can have one of three values: 0 (empty), 1 (fresh orange), 2 (rotten orange). Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1. Solve in O(m * n) using multi-source BFS.",
        input_format="An `m x n` 2D grid containing 0s, 1s, and 2s.",
        output_format="Return minimum minutes, or -1 if fresh oranges remain.",
        constraints="m == grid.length\nn == grid[i].length\n1 <= m, n <= 10\ngrid[i][j] is 0, 1, or 2.",
        examples=[
            {
                "input": "grid = [[2, 1, 1], [1, 1, 0], [0, 1, 1]]",
                "output": "4",
                "explanation": "In 4 minutes, all fresh oranges rot."
            },
            {
                "input": "grid = [[2, 1, 1], [0, 1, 1], [1, 0, 1]]",
                "output": "-1",
                "explanation": "The bottom-left fresh orange cannot be reached."
            }
        ]
    ),

    "distance-of-nearest-cell-having-one": make_prob(
        description="Given an `m x n` binary matrix `grid`, find the distance of nearest 1 in the grid for each cell. The distance between two adjacent cells is 1 (Manhattan distance). Solve in O(m * n) time using multi-source BFS initialized with all cells containing 1.",
        input_format="An `m x n` binary matrix `grid`.",
        output_format="Return an `m x n` matrix where each cell has the distance to the nearest 1.",
        constraints="m == grid.length\nn == grid[i].length\n1 <= m, n <= 500\ngrid[i][j] is 0 or 1.\nThere is at least one 1 in the grid.",
        examples=[
            {
                "input": "grid = [[0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 1, 1]]",
                "output": "[[1, 0, 0, 1], [0, 0, 1, 1], [1, 1, 0, 0]]",
                "explanation": "Distances computed from nearest 1s."
            },
            {
                "input": "grid = [[1, 0, 0], [0, 0, 0], [0, 0, 0]]",
                "output": "[[0, 1, 2], [1, 2, 3], [2, 3, 4]]",
                "explanation": "Manhattan distances expanding from (0, 0)."
            }
        ]
    ),

    "surrounded-regions": make_prob(
        description="Given an `m x n` matrix `board` containing `'X'` and `'O'`, capture all regions that are 4-directionally surrounded by `'X'`. A region is captured by flipping all `'O'`s into `'X'`s in that surrounded region. An `'O'` cell on the boundary or connected to the boundary cannot be captured. Solve in O(m * n) using boundary BFS/DFS.",
        input_format="An `m x n` 2D character matrix `board`.",
        output_format="Modify the matrix in-place with surrounded 'O's flipped to 'X's.",
        constraints="m == board.length\nn == board[i].length\n1 <= m, n <= 200\nboard[i][j] is 'X' or 'O'.",
        examples=[
            {
                "input": "board = [[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"O\",\"X\"],[\"X\",\"X\",\"O\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]",
                "output": "[[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]",
                "explanation": "Only the 'O' at (3, 1) touches the boundary and survives; all others are captured."
            },
            {
                "input": "board = [[\"X\"]]",
                "output": "[[\"X\"]]",
                "explanation": "No 'O' exists."
            }
        ]
    ),

    "number-of-distinct-islands": make_prob(
        description="Given a boolean 2D matrix `grid` of size `n x m`. You have to find the number of distinct islands where a group of connected 1s forms an island. Two islands are considered distinct if one cannot be translated (shifted) into the other. Solve by recording the relative coordinates `(r - r0, c - c0)` of each island in a HashSet.",
        input_format="An `n x m` 2D binary grid.",
        output_format="Return the number of distinct island shapes.",
        constraints="1 <= n, m <= 500\ngrid[i][j] is 0 or 1.",
        examples=[
            {
                "input": "grid = [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 0, 1, 1], [0, 0, 0, 1, 1]]",
                "output": "1",
                "explanation": "Both islands are 2x2 squares, so they have the identical shape. Total distinct = 1."
            },
            {
                "input": "grid = [[1, 1, 0, 1, 1], [1, 0, 0, 0, 0], [0, 0, 0, 0, 1], [1, 1, 0, 1, 1]]",
                "output": "3",
                "explanation": "3 distinct island shapes."
            }
        ]
    ),

    "detect-a-cycle-in-an-undirected-graph": make_prob(
        description="Given an undirected graph with `V` vertices and `E` edges, determine whether the graph contains any cycle or not. Solve in O(V + E) time using BFS or DFS tracking the parent node of each visited vertex.",
        input_format="An integer `V` and adjacency list `adj`.",
        output_format="Return boolean `true` if cycle exists, else `false`.",
        constraints="1 <= V <= 10^5\n0 <= E <= 2 * 10^5",
        examples=[
            {
                "input": "V = 4, adj = [[1, 2], [0, 2], [0, 1, 3], [2]]",
                "output": "true",
                "explanation": "Nodes 0, 1, and 2 form a cycle triangle."
            },
            {
                "input": "V = 4, adj = [[1], [0, 2], [1, 3], [2]]",
                "output": "false",
                "explanation": "Linear chain graph has no cycle."
            }
        ]
    ),

    "bipartite-graph": make_prob(
        description="There is an undirected graph with `n` nodes. A graph is bipartite if the nodes can be partitioned into two independent sets `A` and `B` such that every edge connects a node in set `A` and a node in set `B`. Return `true` if and only if it is bipartite. Note: a graph is bipartite if and only if it does not contain an odd-length cycle. Solve in O(V + E) time using 2-coloring BFS or DFS.",
        input_format="A 2D integer array `graph` where `graph[u]` is an array of nodes that node `u` is adjacent to.",
        output_format="Return boolean `true` if bipartite, else `false`.",
        constraints="graph.length == n\n1 <= n <= 100\n0 <= graph[u].length < n\nNo self-loops or parallel edges.",
        examples=[
            {
                "input": "graph = [[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]",
                "output": "false",
                "explanation": "Cannot partition nodes into two sets because of odd cycle between 0, 1, 2."
            },
            {
                "input": "graph = [[1, 3], [0, 2], [1, 3], [0, 2]]",
                "output": "true",
                "explanation": "Even cycle of 4 nodes can be colored with 2 colors: {0, 2} and {1, 3}."
            }
        ]
    ),

    "topological-sort-or-kahns-algorithm": make_prob(
        description="Given a Directed Acyclic Graph (DAG) with `V` vertices and `E` edges, find any Topological Sorting of that graph. Topological sorting for DAG is a linear ordering of vertices such that for every directed edge `u -> v`, vertex `u` comes before `v` in the ordering. Solve in O(V + E) time using Kahn's algorithm (BFS with in-degrees) or DFS with a stack.",
        input_format="An integer `V` and adjacency list `adj` of a DAG.",
        output_format="Return an array representing a valid topological sort sequence.",
        constraints="1 <= V <= 10^4\n0 <= E <= 10^4",
        examples=[
            {
                "input": "V = 6, adj = [[], [], [3], [1], [0, 1], [0, 2]]",
                "output": "[5, 4, 2, 3, 1, 0]",
                "explanation": "All edges point from left to right in this topological order."
            },
            {
                "input": "V = 4, adj = [[1], [2], [3], []]",
                "output": "[0, 1, 2, 3]",
                "explanation": "Linear dependency sequence."
            }
        ]
    ),

    "detect-a-cycle-in-a-directed-graph": make_prob(
        description="Given a Directed Graph with `V` vertices and `E` edges, determine if it contains any cycle. Solve in O(V + E) time using DFS with a path-visited recursion stack, or using Kahn's Algorithm (if topological sort count < V, then a cycle exists).",
        input_format="An integer `V` and adjacency list `adj` of a directed graph.",
        output_format="Return boolean `true` if cycle exists, else `false`.",
        constraints="1 <= V <= 10^5\n0 <= E <= 2 * 10^5",
        examples=[
            {
                "input": "V = 4, adj = [[1], [2], [3], [1]]",
                "output": "true",
                "explanation": "Cycle exists: 1 -> 2 -> 3 -> 1."
            },
            {
                "input": "V = 3, adj = [[1], [2], []]",
                "output": "false",
                "explanation": "DAG without cycles."
            }
        ]
    ),

    "find-eventual-safe-states": make_prob(
        description="There is a directed graph of `n` nodes. A node is a terminal node if there are no outgoing edges. A node is a safe node if every possible path starting from that node leads to a terminal node (or another safe node). Return an array containing all the safe nodes of the graph sorted in ascending order. Solve in O(V + E) by reversing edges and applying Kahn's algorithm.",
        input_format="A 2D integer array `graph`.",
        output_format="Return a sorted list of safe node indices.",
        constraints="n == graph.length\n1 <= n <= 10^4\n0 <= graph[i].length <= n",
        examples=[
            {
                "input": "graph = [[1, 2], [2, 3], [5], [0], [5], [], []]",
                "output": "[2, 4, 5, 6]",
                "explanation": "Nodes 5 and 6 are terminal. Paths from 2 and 4 only lead to terminal nodes. Nodes 0, 1, 3 are in a cycle."
            },
            {
                "input": "graph = [[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]",
                "output": "[4]",
                "explanation": "Only node 4 is terminal and safe."
            }
        ]
    ),

    "course-schedule-i": make_prob(
        description="There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a, b]` indicates that you must take course `b` first if you want to take course `a`. Return `true` if you can finish all courses, or `false` otherwise (equivalent to detecting if the prerequisite dependency graph contains a cycle). Solve in O(V + E) using Kahn's algorithm.",
        input_format="An integer `numCourses` and a list of pairs `prerequisites`.",
        output_format="Return boolean `true` if courses can be completed, else `false`.",
        constraints="1 <= numCourses <= 2000\n0 <= prerequisites.length <= 5000\nprerequisites[i].length == 2\nAll pairs are unique.",
        examples=[
            {
                "input": "numCourses = 2, prerequisites = [[1, 0]]",
                "output": "true",
                "explanation": "To take course 1, you must finish course 0. Valid order: [0, 1]."
            },
            {
                "input": "numCourses = 2, prerequisites = [[1, 0], [0, 1]]",
                "output": "false",
                "explanation": "Cyclic prerequisite dependency prevents completion."
            }
        ]
    ),

    "course-schedule-ii": make_prob(
        description="There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. Given prerequisites `[a, b]` (take b before a), return the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array `[]`. Solve using Kahn's Topological Sort in O(V + E) time.",
        input_format="An integer `numCourses` and array of prerequisite pairs.",
        output_format="Return an array representing a valid course completion order, or [].",
        constraints="1 <= numCourses <= 2000\n0 <= prerequisites.length <= numCourses * (numCourses - 1)",
        examples=[
            {
                "input": "numCourses = 2, prerequisites = [[1, 0]]",
                "output": "[0, 1]",
                "explanation": "0 must be taken before 1."
            },
            {
                "input": "numCourses = 4, prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]]",
                "output": "[0, 2, 1, 3]",
                "explanation": "[0, 1, 2, 3] is also a valid order."
            }
        ]
    ),

    "alient-dictionary": make_prob(
        description="There is a new alien language that uses the English alphabet. However, the order among letters is unknown. You are given a list of strings `words` from the alien language's dictionary, where the strings are sorted lexicographically by the rules of this new language. Derive the order of letters in this alien language. If no valid order exists, return `\"\"`. Construct a directed graph from adjacent word mismatches and compute Topological Sort.",
        input_format="An array of strings `words` and integer `k` (alphabet size).",
        output_format="Return a string representing the alien alphabetical order.",
        constraints="1 <= words.length <= 500\n1 <= words[i].length <= 100\n1 <= k <= 26",
        examples=[
            {
                "input": "words = [\"baa\", \"abcd\", \"abca\", \"cab\", \"cad\"], k = 4",
                "output": "\"bdac\"",
                "explanation": "From \"baa\" and \"abcd\", b comes before a; \"abcd\" and \"abca\" gives d before a; \"abca\" and \"cab\" gives a before c; \"cab\" and \"cad\" gives b before d."
            },
            {
                "input": "words = [\"caa\", \"aaa\", \"aab\"], k = 3",
                "output": "\"cab\"",
                "explanation": "Order derived: c -> a -> b."
            }
        ]
    ),

    "shortest-path-in-dag": make_prob(
        description="Given a Directed Acyclic Graph (DAG) with `V` vertices and `E` weighted edges, find the shortest path from a given source vertex `src = 0` to all other vertices. If a vertex is unreachable, return -1 for its distance. Solve in O(V + E) time by computing Topological Sort first, then relaxing edges in topological order.",
        input_format="An integer `V`, integer `E`, and edge list with `(u, v, weight)`.",
        output_format="Return an array of shortest distances from vertex 0 to all vertices.",
        constraints="1 <= V <= 10^5\n0 <= E <= 2 * 10^5\n0 <= weight <= 10^4",
        examples=[
            {
                "input": "V = 6, edges = [[0, 1, 2], [0, 4, 1], [1, 2, 3], [4, 2, 2], [4, 5, 4], [2, 3, 6], [5, 3, 1]]",
                "output": "[0, 2, 3, 6, 1, 5]",
                "explanation": "Shortest distances from source 0 to vertices 0 through 5."
            },
            {
                "input": "V = 2, edges = [[0, 1, 5]]",
                "output": "[0, 5]",
                "explanation": "Direct edge."
            }
        ]
    ),

    "shortest-path-in-undirected-graph-with-unit-weights": make_prob(
        description="You are given an undirected graph with `V` vertices and unit edge weights (weight = 1 for all edges). Find the shortest path from a given source vertex `src` to all other vertices. If a vertex is not reachable, distance is -1. Solve in O(V + E) time using standard Breadth-First Search (BFS).",
        input_format="An integer `V`, edge list, and source vertex `src`.",
        output_format="Return an array of distances from `src` to all vertices.",
        constraints="1 <= V <= 10^5\n0 <= edges.length <= 2 * 10^5",
        examples=[
            {
                "input": "V = 9, edges = [[0, 1], [0, 3], [3, 4], [4, 5], [5, 6], [1, 2], [2, 6], [6, 7], [7, 8], [6, 8]], src = 0",
                "output": "[0, 1, 2, 1, 2, 3, 3, 4, 4]",
                "explanation": "BFS guarantees shortest path in unit weight graphs."
            },
            {
                "input": "V = 3, edges = [[0, 1]], src = 0",
                "output": "[0, 1, -1]",
                "explanation": "Vertex 2 is unreachable."
            }
        ]
    ),

    "word-ladder-i": make_prob(
        description="A transformation sequence from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence of words `beginWord -> s1 -> s2 -> ... -> sk` such that every adjacent pair of words differs by exactly one letter. Return the number of words in the shortest transformation sequence from `beginWord` to `endWord`, or 0 if no such sequence exists. Solve in O(N * L * 26) using BFS with a HashSet of dictionary words.",
        input_format="Two strings `beginWord` and `endWord`, and a list of strings `wordList`.",
        output_format="Return the integer length of the shortest transformation sequence.",
        constraints="1 <= beginWord.length <= 10\nendWord.length == beginWord.length\n1 <= wordList.length <= 5000\nAll words have the same length and lowercase English letters.",
        examples=[
            {
                "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\", \"dot\", \"dog\", \"lot\", \"log\", \"cog\"]",
                "output": "5",
                "explanation": "One shortest transformation sequence is \"hit\" -> \"hot\" -> \"dot\" -> \"dog\" -> \"cog\", which is 5 words long."
            },
            {
                "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\", \"dot\", \"dog\", \"lot\", \"log\"]",
                "output": "0",
                "explanation": "The endWord \"cog\" is not in wordList."
            }
        ]
    ),

    "word-ladder-ii": make_prob(
        description="A transformation sequence from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence where each adjacent pair differs by one letter. Return all the shortest transformation sequences from `beginWord` to `endWord`, or an empty list if no such sequence exists. Solve using BFS level mapping followed by backtracking DFS from endWord to beginWord.",
        input_format="Strings `beginWord`, `endWord`, and list `wordList`.",
        output_format="Return a list of all shortest transformation path lists.",
        constraints="1 <= beginWord.length <= 10\nendWord.length == beginWord.length\n1 <= wordList.length <= 500\nAll words unique.",
        examples=[
            {
                "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\", \"dot\", \"dog\", \"lot\", \"log\", \"cog\"]",
                "output": "[[\"hit\", \"hot\", \"dot\", \"dog\", \"cog\"], [\"hit\", \"hot\", \"lot\", \"log\", \"cog\"]]",
                "explanation": "There are two shortest transformation paths of length 5."
            },
            {
                "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\", \"dot\", \"dog\", \"lot\", \"log\"]",
                "output": "[]",
                "explanation": "No valid transformation."
            }
        ]
    ),

    "dijkstra's-algorithm": make_prob(
        description="Given a weighted, undirected and connected graph of `V` vertices and an adjacency list, find the shortest distance of all the vertices from the source vertex `S`. Graph edges have non-negative weights. Solve in O(E log V) time using Dijkstra's algorithm with a Min-Heap (PriorityQueue).",
        input_format="Number of vertices `V`, adjacency list `adj` with `[neighbor, weight]`, and source vertex `S`.",
        output_format="Return an array of shortest distances from `S` to each vertex.",
        constraints="1 <= V <= 10^5\n0 <= E <= 2 * 10^5\n0 <= weight <= 10^4",
        examples=[
            {
                "input": "V = 3, adj = [[[1, 1], [2, 6]], [[2, 3], [0, 1]], [[1, 3], [0, 6]]], S = 2",
                "output": "[4, 3, 0]",
                "explanation": "Shortest distance from 2 to 2 is 0; 2 to 1 is 3; 2 to 0 via 1 is 3 + 1 = 4."
            },
            {
                "input": "V = 2, adj = [[[1, 9]], [[0, 9]]], S = 0",
                "output": "[0, 9]",
                "explanation": "Direct edge of weight 9."
            }
        ]
    ),

    "print-shortest-path-": make_prob(
        description="You are given a weighted undirected graph having `n` vertices numbered from 1 to `n` and `m` edges along with their weights. Find the shortest path from vertex 1 to vertex `n`. If no path exists, return `[-1]`. Otherwise, return the sequence of vertices on the path with path weight sum. Use a `parent[]` array alongside Dijkstra's algorithm.",
        input_format="Integers `n` (vertices), `m` (edges), and edge list `(u, v, weight)`.",
        output_format="Return the path array starting with vertex 1 and ending at vertex n (with total weight).",
        constraints="2 <= n <= 10^5\n0 <= m <= 2 * 10^5\n1 <= weight <= 10^4",
        examples=[
            {
                "input": "n = 5, m = 6, edges = [[1, 2, 2], [2, 5, 5], [2, 3, 4], [1, 4, 1], [4, 3, 3], [3, 5, 1]]",
                "output": "[1, 4, 3, 5]",
                "explanation": "Total weight of path 1 -> 4 -> 3 -> 5 is 1 + 3 + 1 = 5, which is the minimum."
            },
            {
                "input": "n = 2, m = 0, edges = []",
                "output": "[-1]",
                "explanation": "No path exists between 1 and 2."
            }
        ]
    ),

    "shortest-path-with-minimum-effort": make_prob(
        description="You are a hiker preparing for an upcoming hike. You are given `heights`, a 2D array of size `rows x columns`, where `heights[row][col]` represents the height of cell `(row, col)`. You can move up, down, left, or right. A path's effort is the maximum absolute difference in heights between two consecutive cells of the path. Return the minimum effort required to travel from `(0, 0)` to `(rows - 1, columns - 1)` using Dijkstra's algorithm.",
        input_format="A 2D integer matrix `heights`.",
        output_format="Return the minimum effort value.",
        constraints="rows == heights.length\ncolumns == heights[i].length\n1 <= rows, columns <= 100\n1 <= heights[i][j] <= 10^6",
        examples=[
            {
                "input": "heights = [[1, 2, 2], [3, 8, 2], [5, 3, 5]]",
                "output": "2",
                "explanation": "Path [1, 3, 5, 3, 5] has max consecutive difference 2."
            },
            {
                "input": "heights = [[1, 2, 3], [3, 8, 4], [5, 3, 5]]",
                "output": "1",
                "explanation": "Path along perimeter has maximum difference of only 1."
            }
        ]
    ),

    "path-with-minimum-effort": make_prob(
        description="Determine the path from `(0, 0)` to `(m - 1, n - 1)` in a grid that minimizes the maximum effort (maximum height jump between adjacent cells). Solve in O(rows * cols * log(rows * cols)) using Dijkstra with a priority queue.",
        input_format="A 2D integer matrix `heights` of size `m x n`.",
        output_format="Return an integer representing the minimized maximum jump.",
        constraints="1 <= m, n <= 100\n1 <= heights[i][j] <= 10^6",
        examples=[
            {
                "input": "heights = [[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]]",
                "output": "0",
                "explanation": "Path through only 1s has maximum difference 0."
            },
            {
                "input": "heights = [[3]]",
                "output": "0",
                "explanation": "Single cell requires 0 effort."
            }
        ]
    ),

    "cheapest-flight-within-k-stops": make_prob(
        description="There are `n` cities connected by some number of flights. You are given an array `flights` where `flights[i] = [from_i, to_i, price_i]`. You are also given three integers `src`, `dst`, and `k`, return the cheapest price from `src` to `dst` with at most `k` stops. If there is no such route, return -1. Solve in O(k * E) using a queue with `(stops, node, cost)` or Bellman-Ford.",
        input_format="Integer `n`, array `flights`, `src`, `dst`, and integer `k`.",
        output_format="Return the minimum cost, or -1.",
        constraints="1 <= n <= 100\n0 <= flights.length <= (n * (n - 1) / 2)\n0 <= src, dst < n\n0 <= k < n",
        examples=[
            {
                "input": "n = 4, flights = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src = 0, dst = 3, k = 1",
                "output": "700",
                "explanation": "Cheapest path with at most 1 stop is 0 -> 1 -> 3 with cost 100 + 600 = 700."
            },
            {
                "input": "n = 3, flights = [[0, 1, 100], [1, 2, 100], [0, 2, 500]], src = 0, dst = 2, k = 1",
                "output": "200",
                "explanation": "Path 0 -> 1 -> 2 has cost 200 with 1 stop."
            }
        ]
    ),

    "minimum-multiplications-to-reach-end": make_prob(
        description="Given start, end, and an array `arr` of integers. At each step, start is multiplied with any number in the array and then taken modulo 100000. Find the minimum number of steps to reach `end` from `start`. If impossible, return -1. Solve in O(100000 * N) time using BFS on a state graph of size 100000.",
        input_format="An integer array `arr`, starting integer `start`, and target integer `end`.",
        output_format="Return minimum multiplications, or -1.",
        constraints="1 <= arr.length <= 10^4\n1 <= arr[i] <= 10^4\n1 <= start, end < 10^5",
        examples=[
            {
                "input": "arr = [2, 5, 7], start = 3, end = 30",
                "output": "2",
                "explanation": "Step 1: 3 * 2 = 6; Step 2: 6 * 5 = 30. Total 2 multiplications."
            },
            {
                "input": "arr = [3, 4, 65], start = 7, end = 66175",
                "output": "4",
                "explanation": "Minimum 4 multiplications."
            }
        ]
    ),

    "number-of-ways-to-arrive-at-destination": make_prob(
        description="You are in a city that consists of `n` intersections numbered from 0 to `n - 1` with bi-directional roads. Return the number of ways you can arrive at destination `n - 1` in the shortest amount of time. Since the answer may be large, return it modulo 10^9 + 7. Solve in O(E log V) using modified Dijkstra tracking shortest distances and number of paths.",
        input_format="Integer `n` and 2D array `roads` where `roads[i] = [u, v, time]`.",
        output_format="Return the number of shortest paths modulo 10^9 + 7.",
        constraints="1 <= n <= 200\nn - 1 <= roads.length <= n * (n - 1) / 2\n1 <= time_i <= 10^9",
        examples=[
            {
                "input": "n = 7, roads = [[0, 6, 7], [0, 1, 2], [1, 2, 3], [1, 3, 3], [6, 3, 3], [3, 5, 1], [6, 5, 1], [2, 5, 1], [0, 4, 5], [4, 6, 2]]",
                "output": "4",
                "explanation": "The 4 paths of shortest distance 7 are: 0-6, 0-4-6, 0-1-2-5-6, 0-1-3-5-6."
            },
            {
                "input": "n = 2, roads = [[1, 0, 10]]",
                "output": "1",
                "explanation": "Only 1 direct path."
            }
        ]
    ),

    "bellman-ford-algorithm": make_prob(
        description="Given a weighted, directed graph of `V` vertices and `E` edges with source `S`, find the shortest distance from `S` to all vertices. Unlike Dijkstra, Bellman-Ford can handle negative weights and detect negative weight cycles. Relax all edges `V - 1` times in O(V * E) time. If an edge can still be relaxed on the `V`-th pass, a negative cycle exists (return `[-1]`).",
        input_format="An integer `V`, edge list `edges` containing `[u, v, weight]`, and source `S`.",
        output_format="Return an array of shortest distances, or [-1] if a negative cycle is detected.",
        constraints="1 <= V <= 500\n0 <= E <= V * (V - 1)\n-1000 <= weight <= 1000",
        examples=[
            {
                "input": "V = 3, edges = [[0, 1, 5], [1, 0, 3], [1, 2, -1], [2, 0, 1]], S = 2",
                "output": "[1, 6, 0]",
                "explanation": "Shortest distance from 2 to all vertices computed."
            },
            {
                "input": "V = 2, edges = [[0, 1, -1], [1, 0, -2]], S = 0",
                "output": "[-1]",
                "explanation": "Negative weight cycle detected."
            }
        ]
    ),

    "floyd-warshall-algorithm": make_prob(
        description="The problem is to find the shortest distance between all pairs of vertices in a given directed weighted graph. The graph is represented as an adjacency matrix of size `n x n`. If a path does not exist, value is -1. Solve in O(V^3) time using the Floyd-Warshall dynamic programming algorithm: `matrix[i][j] = min(matrix[i][j], matrix[i][k] + matrix[k][j])`.",
        input_format="An `n x n` distance matrix `matrix`.",
        output_format="Modify `matrix` in-place with all-pairs shortest distances.",
        constraints="1 <= n <= 100\n-1 <= matrix[i][j] <= 1000",
        examples=[
            {
                "input": "matrix = [[0, 25], [-1, 0]]",
                "output": "[[0, 25], [-1, 0]]",
                "explanation": "Distance between all pairs computed."
            },
            {
                "input": "matrix = [[0, 1, 43], [1, 0, 6], [-1, -1, 0]]",
                "output": "[[0, 1, 7], [1, 0, 6], [-1, -1, 0]]",
                "explanation": "Shortest distance from 0 to 2 is through 1: 1 + 6 = 7."
            }
        ]
    ),

    "find-the-city-with-the-smallest-number-of-neighbors": make_prob(
        description="There are `n` cities numbered from `0` to `n - 1`. Given an array `edges` where `edges[i] = [from_i, to_i, weight_i]` and an integer `distanceThreshold`, return the city with the smallest number of cities that are reachable through some path and whose distance is at most `distanceThreshold`. If there are multiple such cities, return the city with the greatest number. Solve in O(N^3) using Floyd-Warshall.",
        input_format="Integer `n`, array `edges`, and integer `distanceThreshold`.",
        output_format="Return the city index.",
        constraints="2 <= n <= 100\n1 <= edges.length <= n * (n - 1) / 2\n1 <= distanceThreshold <= 10^4",
        examples=[
            {
                "input": "n = 4, edges = [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], distanceThreshold = 4",
                "output": "3",
                "explanation": "City 3 has 2 neighbors within threshold 4, and has the greatest index."
            },
            {
                "input": "n = 5, edges = [[0, 1, 2], [0, 4, 8], [1, 2, 3], [1, 4, 2], [2, 3, 1], [3, 4, 1]], distanceThreshold = 2",
                "output": "0",
                "explanation": "City 0 has only 1 reachable neighbor (city 1)."
            }
        ]
    ),

    "network-delay-time": make_prob(
        description="You are given a network of `n` nodes, labeled from 1 to `n`. You are also given `times`, a list of travel times as directed edges `times[i] = [u_i, v_i, w_i]`. We will send a signal from a given node `k`. Return the minimum time it takes for all the `n` nodes to receive the signal. If it is impossible for all the `n` nodes to receive the signal, return -1. Solve in O(E log V) using Dijkstra's algorithm.",
        input_format="A list of directed edges `times`, integer `n`, and source node `k`.",
        output_format="Return the minimum time, or -1.",
        constraints="1 <= k <= n <= 100\n1 <= times.length <= 6000\n0 <= w_i <= 100",
        examples=[
            {
                "input": "times = [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n = 4, k = 2",
                "output": "2",
                "explanation": "Signal reaches node 1 at t=1, node 3 at t=1, and node 4 at t=2. Total time = 2."
            },
            {
                "input": "times = [[1, 2, 1]], n = 2, k = 1",
                "output": "1",
                "explanation": "Time = 1."
            }
        ]
    ),

    "swim-in-rising-water": make_prob(
        description="You are given an `n x n` integer matrix `grid` where each value `grid[i][j]` represents the elevation at that point. At time `t`, the depth of the water everywhere is `t`. You can swim to a 4-directionally adjacent cell if the water depth is at least the elevation of that cell. Return the least time until you can reach the bottom right cell `(n - 1, n - 1)` starting from `(0, 0)`. Solve in O(N^2 log N) using Dijkstra with PriorityQueue.",
        input_format="An `n x n` integer grid.",
        output_format="Return the minimum time to swim to destination.",
        constraints="n == grid.length == grid[i].length\n1 <= n <= 50\n0 <= grid[i][j] < n^2\nAll values distinct.",
        examples=[
            {
                "input": "grid = [[0, 2], [1, 3]]",
                "output": "3",
                "explanation": "At t = 3, water level reaches 3 allowing passage to (1, 1)."
            },
            {
                "input": "grid = [[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]",
                "output": "16",
                "explanation": "Path requires waiting until t = 16."
            }
        ]
    ),

    "mst-theory": make_prob(
        description="Learn the principles of Minimum Spanning Trees (MST) in connected, weighted undirected graphs. An MST is a subgraph that connects all `V` vertices with exactly `V - 1` edges without cycles and with the minimum total edge weight. Learn Cut Property, Cycle Property, Prim's Greedy Algorithm, and Kruskal's Algorithm.",
        input_format="Graph description and edge weights.",
        output_format="Understand MST properties and edge count = V - 1.",
        constraints="V >= 1",
        examples=[
            {
                "input": "V = 4, edges = [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 4]]",
                "output": "MST weight = 1 + 2 + 3 = 6",
                "explanation": "Spanning tree connects all 4 nodes with 3 edges."
            },
            {
                "input": "Triangle graph V = 3 with weights 1, 2, 3",
                "output": "MST weight = 1 + 2 = 3",
                "explanation": "Exclude heaviest cycle edge 3."
            }
        ]
    ),

    "disjoint-set-": make_prob(
        description="Implement the Disjoint Set Union (DSU / Union-Find) data structure with two crucial optimizations: Path Compression in `findUPar(u)` and Union by Rank (or Size) in `unionByRank(u, v)`. These optimizations reduce the amortized time complexity of union and find operations to nearly constant time `O(alpha(N))` (inverse Ackermann function).",
        input_format="Number of elements `n` and union/find query commands.",
        output_format="Return results of find queries and component groupings.",
        constraints="1 <= n <= 10^5\n1 <= queries <= 2 * 10^5",
        examples=[
            {
                "input": "union(1, 2), union(2, 3), find(1) == find(3)",
                "output": "true",
                "explanation": "1 and 3 belong to the same connected set."
            },
            {
                "input": "union(1, 2), find(1) == find(4)",
                "output": "false",
                "explanation": "4 is in a separate component."
            }
        ]
    ),

    "find-the-mst-weight": make_prob(
        description="Given a weighted, undirected and connected graph of `V` vertices and `E` edges, find the sum of weights of the edges of the Minimum Spanning Tree (MST). Implement Prim's algorithm using a Min-Heap in O(E log V) or Kruskal's algorithm using Disjoint Set Union in O(E log E) time.",
        input_format="Number of vertices `V` and adjacency list `adj`.",
        output_format="Return the sum of weights of edges in the MST.",
        constraints="2 <= V <= 10^5\nV - 1 <= E <= 2 * 10^5\n1 <= weight <= 10^4",
        examples=[
            {
                "input": "V = 3, E = 3, edges = [[0, 1, 5], [1, 2, 3], [0, 2, 1]]",
                "output": "4",
                "explanation": "Edges (0, 2) weight 1 and (1, 2) weight 3 give MST weight 4."
            },
            {
                "input": "V = 2, E = 1, edges = [[0, 1, 10]]",
                "output": "10",
                "explanation": "Single edge is the MST."
            }
        ]
    ),

    "number-of-operations-to-make-network-connected": make_prob(
        description="There are `n` computers numbered from `0` to `n - 1` connected by ethernet cables `connections`. You can extract certain cables and reconnect them between any pair of disconnected computers. Return the minimum number of times you need to do this in order to make all the computers connected. If it is impossible, return -1. Use Disjoint Set Union to count redundant cables and total components.",
        input_format="Integer `n` and 2D array `connections`.",
        output_format="Return minimum operations, or -1 if impossible.",
        constraints="1 <= n <= 10^5\n1 <= connections.length <= min(n * (n - 1) / 2, 10^5)",
        examples=[
            {
                "input": "n = 4, connections = [[0, 1], [0, 2], [1, 2]]",
                "output": "1",
                "explanation": "Remove redundant cable [1, 2] and connect computer 3. Total 1 move."
            },
            {
                "input": "n = 6, connections = [[0, 1], [0, 2], [0, 3], [1, 2]]",
                "output": "-1",
                "explanation": "Not enough cables to connect 6 computers."
            }
        ]
    ),

    "accounts-merge": make_prob(
        description="Given a list of `accounts` where each element `accounts[i]` is a list of strings, where the first element `accounts[i][0]` is a name, and the rest of the elements are emails representing that account. Merge these accounts using Disjoint Set Union by mapping each email to a unique account ID and taking union of all emails in the same account.",
        input_format="A list of lists of strings `accounts`.",
        output_format="Return the merged accounts list with sorted emails.",
        constraints="1 <= accounts.length <= 1000\n2 <= accounts[i].length <= 10\n1 <= email.length <= 30",
        examples=[
            {
                "input": "accounts = [[\"John\", \"johnsmith@mail.com\", \"john_newyork@mail.com\"], [\"John\", \"johnsmith@mail.com\", \"john00@mail.com\"], [\"Mary\", \"mary@mail.com\"], [\"John\", \"johnnybravo@mail.com\"]]",
                "output": "[[\"John\", \"john00@mail.com\", \"john_newyork@mail.com\", \"johnsmith@mail.com\"], [\"Mary\", \"mary@mail.com\"], [\"John\", \"johnnybravo@mail.com\"]]",
                "explanation": "The first two accounts share \"johnsmith@mail.com\" and are merged into one."
            },
            {
                "input": "accounts = [[\"Gabe\",\"Gabe0@m.co\",\"Gabe3@m.co\",\"Gabe1@m.co\"],[\"Kevin\",\"Kevin3@m.co\",\"Kevin5@m.co\",\"Kevin0@m.co\"]]",
                "output": "[[\"Gabe\",\"Gabe0@m.co\",\"Gabe1@m.co\",\"Gabe3@m.co\"],[\"Kevin\",\"Kevin0@m.co\",\"Kevin3@m.co\",\"Kevin5@m.co\"]]",
                "explanation": "No common emails, accounts remain separate."
            }
        ]
    ),

    "number-of-islands-ii": make_prob(
        description="You are given an `n x m` 2D grid initially filled with water (0). You are given an array `operators` where each operator `[row, col]` turns water into land (1). After each operation, find the number of islands. Solve online using Disjoint Set Union with 4-directional neighbor connections in O(k * alpha(n * m)) time.",
        input_format="Integers `n`, `m`, and a 2D array of positions `operators`.",
        output_format="Return an array of integers showing island count after each operation.",
        constraints="1 <= n, m <= 100\n1 <= operators.length <= 1000",
        examples=[
            {
                "input": "n = 4, m = 5, operators = [[0, 0], [0, 0], [1, 1], [1, 0], [0, 1], [0, 3], [1, 3], [0, 4], [3, 2], [2, 2], [1, 2], [0, 2]]",
                "output": "[1, 1, 2, 1, 1, 2, 2, 2, 3, 3, 1, 1]",
                "explanation": "Island counts updated dynamically as lands connect."
            },
            {
                "input": "n = 1, m = 2, operators = [[0, 0], [0, 1]]",
                "output": "[1, 1]",
                "explanation": "Second land merges with first."
            }
        ]
    ),

    "making-a-large-island": make_prob(
        description="You are given an `n x n` binary matrix `grid`. You are allowed to change at most one `0` to be `1`. Return the size of the largest island in `grid` after applying this operation. Solve in O(N^2) time using Disjoint Set Union: precompute island sizes and check which distinct islands are connected by flipping each zero.",
        input_format="An `n x n` binary grid.",
        output_format="Return the maximum island size.",
        constraints="n == grid.length == grid[i].length\n1 <= n <= 500\ngrid[i][j] is either 0 or 1.",
        examples=[
            {
                "input": "grid = [[1, 0], [0, 1]]",
                "output": "3",
                "explanation": "Change one 0 to 1 to connect the two 1s into an island of size 3."
            },
            {
                "input": "grid = [[1, 1], [1, 1]]",
                "output": "4",
                "explanation": "Grid is already all 1s; island size is 4."
            }
        ]
    ),

    "most-stones-removed-with-same-row-or-column": make_prob(
        description="On a 2D plane, we place `n` stones at some integer coordinate points. Each coordinate point may have at most one stone. A stone can be removed if it shares either the same row or the same column as another stone that has not been removed. Return the largest possible number of stones that can be removed. Formula: `totalStones - totalConnectedComponents` using Disjoint Set Union.",
        input_format="A 2D integer array `stones` where `stones[i] = [x_i, y_i]`.",
        output_format="Return maximum removable stones count.",
        constraints="1 <= stones.length <= 1000\n0 <= x_i, y_i <= 10^4\nNo two stones at same position.",
        examples=[
            {
                "input": "stones = [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1], [2, 2]]",
                "output": "5",
                "explanation": "All stones form a single connected component of size 6. We can remove 6 - 1 = 5 stones."
            },
            {
                "input": "stones = [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]]",
                "output": "3",
                "explanation": "Remove 3 stones."
            }
        ]
    ),

    "kosaraju's-algorithm": make_prob(
        description="Given a Directed Graph with `V` vertices and `E` edges, find the number of Strongly Connected Components (SCCs) in the graph. A Strongly Connected Component is a maximal subgraph where every vertex is reachable from any other vertex in that subgraph. Implement Kosaraju's Algorithm in O(V + E) time: 1. Sort vertices by finish time using DFS. 2. Transpose the graph (reverse all edges). 3. Perform DFS in order of finish times.",
        input_format="An integer `V` and adjacency list `adj` of a directed graph.",
        output_format="Return the number of strongly connected components.",
        constraints="1 <= V <= 5000\n0 <= E <= 5000",
        examples=[
            {
                "input": "V = 5, adj = [[2, 3], [0], [1], [4], []]",
                "output": "3",
                "explanation": "SCCs are {0, 1, 2}, {3}, and {4}. Total 3 components."
            },
            {
                "input": "V = 4, adj = [[1], [2], [0], [3]]",
                "output": "2",
                "explanation": "SCCs are {0, 1, 2} and {3}."
            }
        ]
    ),

    "bridges-in-graph": make_prob(
        description="An edge in an undirected connected graph is a bridge (critical connection) if removing it disconnects the graph. Given `n` servers numbered from `0` to `n - 1` and a list of server connections, return all critical connections in the network. Solve in O(V + E) time using Tarjan's bridge-finding algorithm tracking discovery time `tin[u]` and lowest reachable time `low[u]` (`low[v] > tin[u]`).",
        input_format="An integer `n` and 2D integer array `connections`.",
        output_format="Return a list of bridge edges `[u, v]`.",
        constraints="2 <= n <= 10^5\nn - 1 <= connections.length <= 10^5\nAll connections unique.",
        examples=[
            {
                "input": "n = 4, connections = [[0, 1], [1, 2], [2, 0], [1, 3]]",
                "output": "[[1, 3]]",
                "explanation": "Edge [1, 3] is the only bridge because removing it isolates node 3."
            },
            {
                "input": "n = 2, connections = [[0, 1]]",
                "output": "[[0, 1]]",
                "explanation": "Single edge is critical."
            }
        ]
    ),

    "articulation-point-in-graph": make_prob(
        description="Given an undirected connected graph with `V` vertices and `E` edges, find all the Articulation Points (cut vertices) in the graph. An articulation point is a vertex whose removal increases the number of connected components. Solve in O(V + E) time using Tarjan's algorithm: a node `u` is an articulation point if `low[v] >= tin[u]` for a child `v` (or if `u` is root with > 1 children).",
        input_format="An integer `V` and adjacency list `adj`.",
        output_format="Return a list of articulation point vertices sorted in ascending order, or [-1].",
        constraints="1 <= V <= 10^5\n1 <= E <= 10^5",
        examples=[
            {
                "input": "V = 5, adj = [[1], [0, 4], [3, 4], [2, 4], [1, 2, 3]]",
                "output": "[1, 4]",
                "explanation": "Removing vertex 1 or vertex 4 disconnects the graph."
            },
            {
                "input": "V = 4, adj = [[1, 2], [0, 2], [0, 1, 3], [2]]",
                "output": "[2]",
                "explanation": "Removing vertex 2 isolates vertex 3."
            }
        ]
    ),
}
