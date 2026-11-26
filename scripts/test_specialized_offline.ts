import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { prisma } from "../src/lib/prisma";
import registry from "../src/data/problem_templates_registry.json";
import { buildExecutableDriver, compareOutputs, SupportedLanguage } from "../src/lib/executionWrapper";

function runCodeOffline(language: SupportedLanguage, driverCode: string, testIndex: number): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bn-exec-"));
  try {
    if (language === "python") {
      const filePath = path.join(tmpDir, "main.py");
      fs.writeFileSync(filePath, driverCode);
      const out = execSync(`python3 "${filePath}"`, {
        input: String(testIndex),
        encoding: "utf-8",
        timeout: 5000,
      });
      return out.trim();
    } else if (language === "javascript") {
      const filePath = path.join(tmpDir, "main.js");
      fs.writeFileSync(filePath, driverCode);
      const out = execSync(`node "${filePath}"`, {
        input: String(testIndex),
        encoding: "utf-8",
        timeout: 5000,
      });
      return out.trim();
    } else if (language === "java") {
      const filePath = path.join(tmpDir, "Main.java");
      fs.writeFileSync(filePath, driverCode);
      execSync(`javac "${filePath}"`, { timeout: 10000 });
      const out = execSync(`java -cp "${tmpDir}" Main`, {
        input: String(testIndex),
        encoding: "utf-8",
        timeout: 5000,
      });
      return out.trim();
    } else if (language === "cpp") {
      const srcPath = path.join(tmpDir, "main.cpp");
      const binPath = path.join(tmpDir, "a.out");
      fs.writeFileSync(srcPath, driverCode);
      execSync(`clang++ -std=c++17 "${srcPath}" -o "${binPath}"`, { timeout: 10000 });
      const out = execSync(`"${binPath}"`, {
        input: String(testIndex),
        encoding: "utf-8",
        timeout: 5000,
      });
      return out.trim();
    }
    throw new Error("Unsupported language: " + language);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

interface TestProblem {
  slug: string;
  solutions: Record<SupportedLanguage, string>;
  incorrectSolution?: Record<SupportedLanguage, string>;
}

const specializedProblems: TestProblem[] = [
  {
    slug: "detect-a-loop-in-ll",
    solutions: {
      python: `
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True
        return False
`,
      javascript: `
var hasCycle = function(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }
    return false;
};
`,
      java: `
public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}
`,
      cpp: `
class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) return true;
        }
        return false;
    }
};
`
    },
    incorrectSolution: {
      python: `
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        return False
`,
      javascript: `
var hasCycle = function(head) {
    return false;
};
`,
      java: `
public class Solution {
    public boolean hasCycle(ListNode head) {
        return false;
    }
}
`,
      cpp: `
class Solution {
public:
    bool hasCycle(ListNode *head) {
        return false;
    }
};
`
    }
  },
  {
    slug: "find-the-starting-point-in-ll",
    solutions: {
      python: `
class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                entry = head
                while entry != slow:
                    entry = entry.next
                    slow = slow.next
                return entry
        return None
`,
      javascript: `
var detectCycle = function(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
            let entry = head;
            while (entry !== slow) {
                entry = entry.next;
                slow = slow.next;
            }
            return entry;
        }
    }
    return null;
};
`,
      java: `
public class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                ListNode entry = head;
                while (entry != slow) {
                    entry = entry.next;
                    slow = slow.next;
                }
                return entry;
            }
        }
        return null;
    }
}
`,
      cpp: `
class Solution {
public:
    ListNode *detectCycle(ListNode *head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                ListNode *entry = head;
                while (entry != slow) {
                    entry = entry->next;
                    slow = slow->next;
                }
                return entry;
            }
        }
        return nullptr;
    }
};
`
    }
  },
  {
    slug: "length-of-loop-in-ll",
    solutions: {
      python: `
class Solution:
    def countNodesinLoop(self, head: Optional[ListNode]) -> int:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                count = 1
                curr = slow.next
                while curr != slow:
                    count += 1
                    curr = curr.next
                return count
        return 0
`,
      javascript: `
var countNodesinLoop = function(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
            let count = 1;
            let curr = slow.next;
            while (curr !== slow) {
                count++;
                curr = curr.next;
            }
            return count;
        }
    }
    return 0;
};
`,
      java: `
public class Solution {
    public int countNodesinLoop(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                int count = 1;
                ListNode curr = slow.next;
                while (curr != slow) {
                    count++;
                    curr = curr.next;
                }
                return count;
            }
        }
        return 0;
    }
}
`,
      cpp: `
class Solution {
public:
    int countNodesinLoop(ListNode *head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                int count = 1;
                ListNode *curr = slow->next;
                while (curr != slow) {
                    count++;
                    curr = curr->next;
                }
                return count;
            }
        }
        return 0;
    }
};
`
    }
  },
  {
    slug: "find-the-intersection-point-of-y-ll",
    solutions: {
      python: `
class Solution:
    def getIntersectionNode(self, headA: Optional[ListNode], headB: Optional[ListNode]) -> Optional[ListNode]:
        if not headA or not headB: return None
        a, b = headA, headB
        while a != b:
            a = a.next if a else headB
            b = b.next if b else headA
        return a
`,
      javascript: `
var getIntersectionNode = function(headA, headB) {
    if (!headA || !headB) return null;
    let a = headA, b = headB;
    while (a !== b) {
        a = a ? a.next : headB;
        b = b ? b.next : headA;
    }
    return a;
};
`,
      java: `
public class Solution {
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        if (headA == null || headB == null) return null;
        ListNode a = headA, b = headB;
        while (a != b) {
            a = (a == null) ? headB : a.next;
            b = (b == null) ? headA : b.next;
        }
        return a;
    }
}
`,
      cpp: `
class Solution {
public:
    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
        if (!headA || !headB) return nullptr;
        ListNode *a = headA, *b = headB;
        while (a != b) {
            a = a ? a->next : headB;
            b = b ? b->next : headA;
        }
        return a;
    }
};
`
    }
  },
  {
    slug: "clone-a-ll-with-random-and-next-pointer",
    solutions: {
      python: `
class Solution:
    def copyRandomList(self, head: Optional[Node]) -> Optional[Node]:
        if not head: return None
        curr = head
        while curr:
            nxt = curr.next
            copy = Node(curr.val if hasattr(curr, 'val') else curr.data)
            curr.next = copy
            copy.next = nxt
            curr = nxt
        curr = head
        while curr:
            if curr.random:
                curr.next.random = curr.random.next
            curr = curr.next.next
        dummy = Node(0)
        copy_curr = dummy
        curr = head
        while curr:
            nxt = curr.next.next
            copy = curr.next
            copy_curr.next = copy
            copy_curr = copy
            curr.next = nxt
            curr = nxt
        return dummy.next
`,
      javascript: `
var copyRandomList = function(head) {
    if (!head) return null;
    let curr = head;
    while (curr) {
        let copy = new Node(curr.val !== undefined ? curr.val : curr.data);
        copy.next = curr.next;
        curr.next = copy;
        curr = copy.next;
    }
    curr = head;
    while (curr) {
        if (curr.random) {
            curr.next.random = curr.random.next;
        }
        curr = curr.next.next;
    }
    let dummy = new Node(0);
    let copyCurr = dummy;
    curr = head;
    while (curr) {
        let copy = curr.next;
        curr.next = copy.next;
        copyCurr.next = copy;
        copyCurr = copy;
        curr = curr.next;
    }
    return dummy.next;
};
`,
      java: `
public class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) return null;
        Node curr = head;
        while (curr != null) {
            Node copy = new Node(curr.data != 0 ? curr.data : curr.val);
            copy.next = curr.next;
            curr.next = copy;
            curr = copy.next;
        }
        curr = head;
        while (curr != null) {
            if (curr.random != null) {
                curr.next.random = curr.random.next;
            }
            curr = curr.next.next;
        }
        Node dummy = new Node(0);
        Node copyCurr = dummy;
        curr = head;
        while (curr != null) {
            Node copy = curr.next;
            curr.next = copy.next;
            copyCurr.next = copy;
            copyCurr = copy;
            curr = curr.next;
        }
        return dummy.next;
    }
}
`,
      cpp: `
class Solution {
public:
    Node* copyRandomList(Node* head) {
        if (!head) return nullptr;
        Node* curr = head;
        while (curr) {
            Node* copy = new Node(curr->data != 0 ? curr->data : curr->val);
            copy->next = curr->next;
            curr->next = copy;
            curr = copy->next;
        }
        curr = head;
        while (curr) {
            if (curr->random) {
                curr->next->random = curr->random->next;
            }
            curr = curr->next->next;
        }
        Node dummy(0);
        Node* copyCurr = &dummy;
        curr = head;
        while (curr) {
            Node* copy = curr->next;
            curr->next = copy->next;
            copyCurr->next = copy;
            copyCurr = copy;
            curr = curr->next;
        }
        return dummy.next;
    }
};
`
    }
  },
  {
    slug: "lca-in-bt",
    solutions: {
      python: `
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root == p or root == q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root
        return left if left else right
`,
      javascript: `
var lowestCommonAncestor = function(root, p, q) {
    if (!root || root === p || root === q) return root;
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    if (left && right) return root;
    return left ? left : right;
};
`,
      java: `
public class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
}
`,
      cpp: `
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root || root == p || root == q) return root;
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);
        if (left && right) return root;
        return left ? left : right;
    }
};
`
    }
  }
];

async function main() {
  console.log("=== OFFLINE SPECIALIZED PROBLEMS VERIFICATION ===\\n");
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const prob of specializedProblems) {
    const dbProb = await prisma.problem.findUnique({
      where: { slug: prob.slug },
      include: { testCases: { where: { isActive: true }, orderBy: { order: "asc" } } },
    });

    if (!dbProb) {
      console.error(`Problem not found in DB: ${prob.slug}`);
      continue;
    }

    const template = (registry as any)[prob.slug];
    const testCases = dbProb.testCases.map((tc) => ({
      order: tc.order,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }));

    console.log(`Testing problem: ${prob.slug} (${testCases.length} cases)`);

    const languages: SupportedLanguage[] = ["python", "javascript", "java", "cpp"];

    for (const lang of languages) {
      const solution = prob.solutions[lang];
      if (!solution) continue;

      const driverCode = buildExecutableDriver({
        language: lang,
        sourceCode: solution,
        problemTemplate: template,
        testCases,
      });

      let langPassed = 0;
      for (const tc of testCases) {
        totalTests++;
        try {
          const actual = runCodeOffline(lang, driverCode, tc.order);
          const ok = compareOutputs(actual, tc.expectedOutput);
          if (ok) {
            passedTests++;
            langPassed++;
          } else {
            failedTests++;
            console.error(`  [${lang}] Case ${tc.order} FAILED: Expected "${tc.expectedOutput}", got "${actual}"`);
          }
        } catch (e: any) {
          failedTests++;
          console.error(`  [${lang}] Case ${tc.order} ERROR: ${e.message}`);
        }
      }

      console.log(`  [${lang}] Result: ${langPassed}/${testCases.length} passed.`);

      // Verify rejection of incorrect solution if provided
      if (prob.incorrectSolution && prob.incorrectSolution[lang]) {
        const incorrectDriver = buildExecutableDriver({
          language: lang,
          sourceCode: prob.incorrectSolution[lang],
          problemTemplate: template,
          testCases,
        });
        let incorrectPassed = 0;
        for (const tc of testCases) {
          try {
            const actual = runCodeOffline(lang, incorrectDriver, tc.order);
            if (compareOutputs(actual, tc.expectedOutput)) {
              incorrectPassed++;
            }
          } catch {}
        }
        if (incorrectPassed === testCases.length) {
          console.error(`  [${lang}] WARNING: Incorrect solution passed all test cases! (Grading integrity failure)`);
        } else {
          console.log(`  [${lang}] Integrity Check PASSED: Incorrect solution rejected (${incorrectPassed}/${testCases.length} passed).`);
        }
      }
    }
    console.log("");
  }

  console.log(`===============================================`);
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log("ALL SPECIALIZED PROBLEMS PASSED OFFLINE IN ALL 4 LANGUAGES!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
