import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

// Special problem custom overrides if method names in solution code differ from LeetCode standard
const SPECIAL_SIGNATURES = {
  // Sorting problems standard LeetCode function signature
  "selection-sort": {
    methodName: "sortArray",
    returnType: "int[]",
    params: [{ name: "nums", type: "int[]" }],
  },
  "bubble-sort": {
    methodName: "sortArray",
    returnType: "int[]",
    params: [{ name: "nums", type: "int[]" }],
  },
  "insertion-sort": {
    methodName: "sortArray",
    returnType: "int[]",
    params: [{ name: "nums", type: "int[]" }],
  },
  "merge-sort": {
    methodName: "sortArray",
    returnType: "int[]",
    params: [{ name: "nums", type: "int[]" }],
  },
  "quick-sort": {
    methodName: "sortArray",
    returnType: "int[]",
    params: [{ name: "nums", type: "int[]" }],
  },
  "recursive-bubble-sort": {
    methodName: "sortArray",
    returnType: "int[]",
    params: [{ name: "nums", type: "int[]" }],
  },
  "recursive-insertion-sort": {
    methodName: "sortArray",
    returnType: "int[]",
    params: [{ name: "nums", type: "int[]" }],
  },

  // Binary Tree traversals
  "inorder-traversal": {
    methodName: "inorderTraversal",
    returnType: "List<Integer>",
    params: [{ name: "root", type: "TreeNode" }],
  },
  "preorder-traversal": {
    methodName: "preorderTraversal",
    returnType: "List<Integer>",
    params: [{ name: "root", type: "TreeNode" }],
  },
  "postorder-traversal": {
    methodName: "postorderTraversal",
    returnType: "List<Integer>",
    params: [{ name: "root", type: "TreeNode" }],
  },
  "level-order-traversal": {
    methodName: "levelOrder",
    returnType: "List<List<Integer>>",
    params: [{ name: "root", type: "TreeNode" }],
  },

  // Linked list common problems
  "reverse-a-linked-list": {
    methodName: "reverseList",
    returnType: "ListNode",
    params: [{ name: "head", type: "ListNode" }],
  },
  "middle-of-a-linked-list": {
    methodName: "middleNode",
    returnType: "ListNode",
    params: [{ name: "head", type: "ListNode" }],
  },
  "detect-a-loop-in-ll": {
    methodName: "hasCycle",
    returnType: "boolean",
    params: [{ name: "head", type: "ListNode" }],
  },
  "find-the-starting-point-in-ll": {
    methodName: "detectCycle",
    returnType: "ListNode",
    params: [{ name: "head", type: "ListNode" }],
  },
  "length-of-loop-in-ll": {
    methodName: "countNodesinLoop",
    returnType: "int",
    params: [{ name: "head", type: "ListNode" }],
  },
  "check-if-ll-is-palindrome-or-not": {
    methodName: "isPalindrome",
    returnType: "boolean",
    params: [{ name: "head", type: "ListNode" }],
  },
  "segregate-odd-and-even-nodes-in-ll": {
    methodName: "oddEvenList",
    returnType: "ListNode",
    params: [{ name: "head", type: "ListNode" }],
  },
  "remove-nth-node-from-the-back-of-the-ll": {
    methodName: "removeNthFromEnd",
    returnType: "ListNode",
    params: [{ name: "head", type: "ListNode" }, { name: "n", type: "int" }],
  },
  "delete-the-middle-node-of-ll": {
    methodName: "deleteMiddle",
    returnType: "ListNode",
    params: [{ name: "head", type: "ListNode" }],
  },
  "sort-a-ll": {
    methodName: "sortList",
    returnType: "ListNode",
    params: [{ name: "head", type: "ListNode" }],
  },
  "sort-a-ll-of-0's-1's-and-2's-by-changing-links": {
    methodName: "segregate",
    returnType: "ListNode",
    params: [{ name: "head", type: "ListNode" }],
  },
  "intersection-of-two-linked-list": {
    methodName: "getIntersectionNode",
    returnType: "ListNode",
    params: [{ name: "headA", type: "ListNode" }, { name: "headB", type: "ListNode" }],
  },
  "add-1-to-a-number-represented-by-ll": {
    methodName: "addOne",
    returnType: "ListNode",
    params: [{ name: "head", type: "ListNode" }],
  },
  "add-two-numbers-in-ll": {
    methodName: "addTwoNumbers",
    returnType: "ListNode",
    params: [{ name: "l1", type: "ListNode" }, { name: "l2", type: "ListNode" }],
  },

  "introduction-to-graph": {
    methodName: "printGraph",
    returnType: "List<List<Integer>>",
    params: [{ name: "V", type: "int" }, { name: "edges", type: "int[][]" }],
  },
  "traversal-in-linked-list": {
    methodName: "traverseList",
    returnType: "List<Integer>",
    params: [{ name: "head", type: "ListNode" }],
  },
  "learn-python": {
    methodName: "processArray",
    returnType: "int[]",
    params: [{ name: "arr", type: "int[]" }],
  },

  // Conceptual problems flagged for manual review
  "breaking-the-myth": {
    isConceptual: true,
    methodName: "solve",
    returnType: "String",
    params: [],
  },
  "programming-languages-and-choosing-a-path": {
    isConceptual: true,
    methodName: "solve",
    returnType: "String",
    params: [],
  },
};

function parseParams(paramStr) {
  if (!paramStr || !paramStr.trim()) return [];
  return paramStr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((part) => {
      const tokens = part.trim().split(/\s+/);
      const name = tokens[tokens.length - 1].replace(/[^\w]/g, "");
      const type = tokens.slice(0, tokens.length - 1).join(" ");
      return { name, type };
    });
}

function extractSignatureFromCode(code) {
  if (!code) return null;
  const lines = code.split("\n");
  for (const line of lines) {
    if (line.includes("class ") || line.includes("interface ")) continue;
    const m = line.match(/(?:public\s+)?(?:static\s+)?([\w<>[\]]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
    if (m && m[2] !== "main" && !["swap", "partition", "printList", "printGraph"].includes(m[2])) {
      return {
        returnType: m[1],
        methodName: m[2],
        params: parseParams(m[3]),
      };
    }
  }
  return null;
}

export function toCppType(javaType) {
  switch (javaType) {
    case "int": return "int";
    case "long": return "long long";
    case "double": return "double";
    case "float": return "float";
    case "boolean": return "bool";
    case "String": return "string";
    case "char": return "char";
    case "int[]": return "vector<int>";
    case "long[]": return "vector<long long>";
    case "int[][]": return "vector<vector<int>>";
    case "char[]": return "vector<char>";
    case "String[]": return "vector<string>";
    case "List<Integer>":
    case "ArrayList<Integer>": return "vector<int>";
    case "List<String>": return "vector<string>";
    case "List<List<Integer>>": return "vector<vector<int>>";
    case "ListNode": return "ListNode*";
    case "TreeNode": return "TreeNode*";
    case "Node": return "Node*";
    case "void": return "void";
    default:
      if (javaType.endsWith("[]")) {
        return `vector<${toCppType(javaType.slice(0, -2))}>`;
      }
      return javaType;
  }
}

export function toPythonType(javaType) {
  switch (javaType) {
    case "int": return "int";
    case "long": return "int";
    case "double":
    case "float": return "float";
    case "boolean": return "bool";
    case "String": return "str";
    case "char": return "str";
    case "int[]": return "List[int]";
    case "long[]": return "List[int]";
    case "int[][]": return "List[List[int]]";
    case "char[]": return "List[str]";
    case "String[]": return "List[str]";
    case "List<Integer>":
    case "ArrayList<Integer>": return "List[int]";
    case "List<String>": return "List[str]";
    case "List<List<Integer>>": return "List[List[int]]";
    case "ListNode": return "Optional[ListNode]";
    case "TreeNode": return "Optional[TreeNode]";
    case "Node": return "Optional[Node]";
    case "void": return "None";
    default:
      if (javaType.endsWith("[]")) {
        return `List[${toPythonType(javaType.slice(0, -2))}]`;
      }
      return "Any";
  }
}

export function toJsType(javaType) {
  switch (javaType) {
    case "int":
    case "long":
    case "double":
    case "float": return "number";
    case "boolean": return "boolean";
    case "String":
    case "char": return "string";
    case "int[]":
    case "long[]": return "number[]";
    case "int[][]": return "number[][]";
    case "char[]":
    case "String[]": return "string[]";
    case "List<Integer>":
    case "ArrayList<Integer>": return "number[]";
    case "List<String>": return "string[]";
    case "List<List<Integer>>": return "number[][]";
    case "ListNode": return "ListNode";
    case "TreeNode": return "TreeNode";
    case "Node": return "Node";
    case "void": return "void";
    default:
      if (javaType.endsWith("[]")) {
        return `${toJsType(javaType.slice(0, -2))}[]`;
      }
      return "any";
  }
}

export function generateStarterTemplates(signature, categorySlug = "") {
  const { methodName, returnType, params } = signature;
  const isTree = categorySlug.includes("tree") || params.some((p) => p.type.includes("TreeNode")) || returnType.includes("TreeNode");
  const isLL = !isTree && (categorySlug.includes("linked-list") || params.some((p) => p.type.includes("ListNode") || p.type === "Node") || returnType.includes("ListNode") || returnType === "Node");

  // Java Template
  let javaHeader = "";
  if (isLL) {
    javaHeader += `/**
 * Definition for singly-linked list.
 * class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */\n`;
  } else if (isTree) {
    javaHeader += `/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */\n`;
  }

  const javaParams = params.map((p) => `${p.type} ${p.name}`).join(", ");
  const javaCode = `${javaHeader}class Solution {
    public ${returnType} ${methodName}(${javaParams}) {
        // Write your code here
        
    }
}`;

  // C++ Template
  let cppHeader = "";
  if (isLL) {
    cppHeader += `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */\n`;
  } else if (isTree) {
    cppHeader += `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */\n`;
  }

  const cppReturnType = toCppType(returnType);
  const cppParams = params
    .map((p) => {
      const cType = toCppType(p.type);
      const isRef = cType.startsWith("vector") || cType === "string";
      return isRef ? `${cType}& ${p.name}` : `${cType} ${p.name}`;
    })
    .join(", ");

  const cppCode = `${cppHeader}class Solution {
public:
    ${cppReturnType} ${methodName}(${cppParams}) {
        // Write your code here
        
    }
};`;

  // Python Template
  let pyHeader = "";
  if (isLL) {
    pyHeader += `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next\n`;
  } else if (isTree) {
    pyHeader += `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right\n`;
  }

  const pyReturnType = toPythonType(returnType);
  const pyParams = ["self", ...params.map((p) => `${p.name}: ${toPythonType(p.type)}`)].join(", ");

  const pyCode = `${pyHeader}class Solution:
    def ${methodName}(${pyParams}) -> ${pyReturnType}:
        # Write your code here
        pass`;

  // JavaScript Template
  let jsDoc = "/**\n";
  if (isLL) {
    jsDoc += " * Definition for singly-linked list.\n";
    jsDoc += " * function ListNode(val, next) {\n";
    jsDoc += " *     this.val = (val===undefined ? 0 : val)\n";
    jsDoc += " *     this.next = (next===undefined ? null : next)\n";
    jsDoc += " * }\n";
  } else if (isTree) {
    jsDoc += " * Definition for a binary tree node.\n";
    jsDoc += " * function TreeNode(val, left, right) {\n";
    jsDoc += " *     this.val = (val===undefined ? 0 : val)\n";
    jsDoc += " *     this.left = (left===undefined ? null : left)\n";
    jsDoc += " *     this.right = (right===undefined ? null : right)\n";
    jsDoc += " * }\n";
  }
  for (const p of params) {
    jsDoc += ` * @param {${toJsType(p.type)}} ${p.name}\n`;
  }
  jsDoc += ` * @return {${toJsType(returnType)}}\n */\n`;

  const jsParams = params.map((p) => p.name).join(", ");
  const jsCode = `${jsDoc}var ${methodName} = function(${jsParams}) {
    // Write your code here
    
};`;

  return {
    java: javaCode,
    cpp: cppCode,
    python: pyCode,
    javascript: jsCode,
  };
}

async function main() {
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      category: { select: { slug: true, title: true } },
      codes: {
        where: { approachType: "OPTIMAL" },
        select: { javaCode: true },
      },
    },
    orderBy: { order: "asc" },
  });

  const fullRegistry = {};
  let conceptualCount = 0;
  let algorithmicCount = 0;

  for (const p of problems) {
    let sig = SPECIAL_SIGNATURES[p.slug];
    if (!sig) {
      sig = extractSignatureFromCode(p.codes[0]?.javaCode);
    }

    if (!sig || sig.isConceptual) {
      conceptualCount++;
      fullRegistry[p.slug] = {
        title: p.title,
        slug: p.slug,
        isConceptual: true,
        methodName: "solve",
        returnType: "String",
        params: [],
        templates: generateStarterTemplates(
          { methodName: "solve", returnType: "String", params: [] },
          p.category.slug
        ),
      };
    } else {
      algorithmicCount++;
      fullRegistry[p.slug] = {
        title: p.title,
        slug: p.slug,
        isConceptual: false,
        methodName: sig.methodName,
        returnType: sig.returnType,
        params: sig.params,
        templates: generateStarterTemplates(sig, p.category.slug),
      };
    }
  }

  console.log(`Successfully built templates for all ${problems.length} problems!`);
  console.log(`Algorithmic problems: ${algorithmicCount}`);
  console.log(`Conceptual problems flagged for review: ${conceptualCount}`);

  fs.writeFileSync("scripts/problem_templates_registry.json", JSON.stringify(fullRegistry, null, 2));
  console.log("Registry saved to scripts/problem_templates_registry.json");
  await prisma.$disconnect();
}

main().catch(console.error);
