from .common import make_prob

LINKED_LIST_DATA = {
    "introduction-to-singly-linkedlist": make_prob(
        description="Learn the fundamentals of a Singly Linked List: node structure (`data` and `next` pointer), heap allocation, dereferencing, and converting an array into a linked list in O(N) time.",
        input_format="An integer array `arr` of size `n`.",
        output_format="Return the `head` pointer of the constructed linked list.",
        constraints="1 <= arr.length <= 10^5\n-10^9 <= arr[i] <= 10^9",
        examples=[
            {
                "input": "arr = [1, 2, 3, 4, 5]",
                "output": "1 -> 2 -> 3 -> 4 -> 5",
                "explanation": "Nodes are chained sequentially from index 0 to n-1."
            },
            {
                "input": "arr = [10]",
                "output": "10",
                "explanation": "Single node linked list."
            }
        ]
    ),

    "traversal-in-linked-list": make_prob(
        description="Given the `head` of a singly linked list, traverse the list from head to tail and print or return all node values in order. Solve in O(N) time with O(1) auxiliary space.",
        input_format="The `head` node of a singly linked list.",
        output_format="Return a list of integers containing all node values in traversal order.",
        constraints="0 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "head = [1, 2, 3, 4]",
                "output": "[1, 2, 3, 4]",
                "explanation": "Traversed sequentially from head to tail."
            },
            {
                "input": "head = []",
                "output": "[]",
                "explanation": "Empty list produces empty result."
            }
        ]
    ),

    "deletion-in-linked-list": make_prob(
        description="Learn core deletion mechanics in a Singly Linked List: deleting the head node, deleting the tail node, and deleting by position or value in O(1) to O(N) time while preventing memory leaks and handling null pointers.",
        input_format="The `head` of a singly linked list and deletion command.",
        output_format="Return the updated head of the linked list.",
        constraints="1 <= nodes <= 10^5",
        examples=[
            {
                "input": "list = 1 -> 2 -> 3 -> 4, delete value 3",
                "output": "1 -> 2 -> 4",
                "explanation": "Node with value 3 unlinked."
            },
            {
                "input": "list = 5 -> 10, delete value 5",
                "output": "10",
                "explanation": "Head node deleted, new head is 10."
            }
        ]
    ),

    "insertion-in-linked-list": make_prob(
        description="Understand the fundamental insertion operations in a Singly Linked List: inserting at head (O(1)), inserting at tail (O(N) or O(1) with tail pointer), and inserting at the k-th position (O(K)).",
        input_format="The `head` of a linked list, new value `val`, and insertion target.",
        output_format="Return the updated head of the linked list.",
        constraints="0 <= nodes <= 10^5\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "list = 2 -> 3, insert 1 at head",
                "output": "1 -> 2 -> 3",
                "explanation": "1 becomes the new head."
            },
            {
                "input": "list = 1 -> 2, insert 3 at tail",
                "output": "1 -> 2 -> 3",
                "explanation": "3 appended at the end."
            }
        ]
    ),

    "deletion-of-the-head-of-ll": make_prob(
        description="Given the `head` of a linked list, delete the first node (head) and return the new head of the linked list in O(1) time.",
        input_format="The `head` node of a linked list.",
        output_format="Return the new head of the linked list after removing the first node.",
        constraints="0 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "head = 1 -> 2 -> 3",
                "output": "2 -> 3",
                "explanation": "Node 1 is removed, 2 becomes the new head."
            },
            {
                "input": "head = [1]",
                "output": "[]",
                "explanation": "Removing the only node leaves an empty list."
            }
        ]
    ),

    "deletion-of-the-tail-of-ll": make_prob(
        description="Given the `head` of a linked list, remove the last node (tail) of the list and return the head. If the list has only one node, return null.",
        input_format="The `head` of a linked list.",
        output_format="Return the head after deleting the tail node.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "head = 1 -> 2 -> 3 -> 4",
                "output": "1 -> 2 -> 3",
                "explanation": "The last node 4 is removed."
            },
            {
                "input": "head = [1]",
                "output": "[]",
                "explanation": "Deleting tail from single node results in null."
            }
        ]
    ),

    "deletion-of-the-kth-element-of-ll": make_prob(
        description="Given the `head` of a linked list and an integer `k`, delete the `k`-th node of the linked list (1-indexed) and return the head of the updated list.",
        input_format="The `head` of a linked list and integer `k` (1 <= k <= length).",
        output_format="Return the head after deleting the k-th node.",
        constraints="1 <= nodes <= 10^5\n1 <= k <= nodes",
        examples=[
            {
                "input": "head = 1 -> 2 -> 3 -> 4 -> 5, k = 3",
                "output": "1 -> 2 -> 4 -> 5",
                "explanation": "The 3rd node with value 3 is removed."
            },
            {
                "input": "head = 10 -> 20, k = 1",
                "output": "20",
                "explanation": "1st node (head) deleted."
            }
        ]
    ),

    "delete-the-element-with-value-x": make_prob(
        description="Given the `head` of a linked list and an integer value `x`, delete the first occurrence of node with value `x` from the linked list. Return the head of the modified linked list.",
        input_format="The `head` of a linked list and value `x`.",
        output_format="Return the head of the modified linked list.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val, x <= 10^9",
        examples=[
            {
                "input": "head = 1 -> 2 -> 3 -> 4, x = 3",
                "output": "1 -> 2 -> 4",
                "explanation": "Node with value 3 deleted."
            },
            {
                "input": "head = 5 -> 6 -> 7, x = 5",
                "output": "6 -> 7",
                "explanation": "Head node with value 5 deleted."
            }
        ]
    ),

    "insertion-at-the-head-of-ll": make_prob(
        description="Given the `head` of a singly linked list and an integer `val`, insert a new node with value `val` at the beginning (head) of the linked list in O(1) time and return the new head.",
        input_format="The `head` of a linked list and an integer `val`.",
        output_format="Return the new head of the linked list.",
        constraints="0 <= nodes <= 10^5\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "head = 2 -> 3 -> 4, val = 1",
                "output": "1 -> 2 -> 3 -> 4",
                "explanation": "1 is inserted at the front."
            },
            {
                "input": "head = [], val = 5",
                "output": "5",
                "explanation": "New head in an empty list."
            }
        ]
    ),

    "insertion-at-the-tail-of-ll": make_prob(
        description="Given the `head` of a linked list and an integer `val`, insert a new node with value `val` at the end (tail) of the linked list and return the head.",
        input_format="The `head` of a linked list and an integer `val`.",
        output_format="Return the head of the linked list.",
        constraints="0 <= nodes <= 10^5\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "head = 1 -> 2 -> 3, val = 4",
                "output": "1 -> 2 -> 3 -> 4",
                "explanation": "4 is appended to the tail."
            },
            {
                "input": "head = [], val = 10",
                "output": "10",
                "explanation": "First element inserted."
            }
        ]
    ),

    "insertion-at-the-kth-position-of-ll": make_prob(
        description="Given the `head` of a linked list, an integer `val`, and a position `k` (1-indexed), insert a new node with value `val` at position `k` and return the head.",
        input_format="The `head` of a linked list, integer `val`, and integer `k`.",
        output_format="Return the head of the modified linked list.",
        constraints="1 <= k <= nodes + 1\n0 <= nodes <= 10^5\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "head = 1 -> 2 -> 4 -> 5, val = 3, k = 3",
                "output": "1 -> 2 -> 3 -> 4 -> 5",
                "explanation": "3 is inserted at position 3."
            },
            {
                "input": "head = 2 -> 3, val = 1, k = 1",
                "output": "1 -> 2 -> 3",
                "explanation": "Inserted at position 1 (new head)."
            }
        ]
    ),

    "insertion-before-the-value-x-in-ll": make_prob(
        description="Given the `head` of a linked list, an integer `val`, and an existing target value `x`, insert a new node with value `val` immediately before the first node that contains value `x`.",
        input_format="The `head` of a linked list, integer `val`, and integer `x`.",
        output_format="Return the head of the modified list.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val, val, x <= 10^9",
        examples=[
            {
                "input": "head = 1 -> 2 -> 4 -> 5, val = 3, x = 4",
                "output": "1 -> 2 -> 3 -> 4 -> 5",
                "explanation": "3 is inserted right before 4."
            },
            {
                "input": "head = 2 -> 3, val = 1, x = 2",
                "output": "1 -> 2 -> 3",
                "explanation": "Inserted before head."
            }
        ]
    ),

    "find-the-length-of-the-linked-list": make_prob(
        description="Given the `head` of a singly linked list, count and return the total number of nodes in the linked list in O(N) time and O(1) space.",
        input_format="The `head` of a linked list.",
        output_format="Return the total node count as an integer.",
        constraints="0 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "head = 1 -> 2 -> 3 -> 4 -> 5",
                "output": "5",
                "explanation": "There are 5 nodes in the list."
            },
            {
                "input": "head = []",
                "output": "0",
                "explanation": "Empty list has 0 nodes."
            }
        ]
    ),

    "search-in-linked-list": make_prob(
        description="Given the `head` of a linked list and an integer `key`, return `true` if `key` is present in the linked list, otherwise return `false`. Solve in O(N) time with O(1) space.",
        input_format="The `head` of a linked list and integer `key`.",
        output_format="Return boolean `true` if found, else `false`.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val, key <= 10^9",
        examples=[
            {
                "input": "head = 1 -> 2 -> 3 -> 4, key = 3",
                "output": "true",
                "explanation": "3 is present at index 2."
            },
            {
                "input": "head = 1 -> 2 -> 3, key = 5",
                "output": "false",
                "explanation": "5 is not present."
            }
        ]
    ),

    "introduction-to-doubly-ll": make_prob(
        description="Understand the Doubly Linked List (DLL) architecture: each node contains `data`, a `prev` pointer to previous node, and a `next` pointer to next node. Learn how DLL enables bidirectional traversal and O(1) deletions given a node pointer.",
        input_format="An integer array `arr` of size `n`.",
        output_format="Return the `head` of the constructed Doubly Linked List.",
        constraints="1 <= arr.length <= 10^5\n-10^9 <= arr[i] <= 10^9",
        examples=[
            {
                "input": "arr = [1, 2, 3, 4, 5]",
                "output": "1 <-> 2 <-> 3 <-> 4 <-> 5",
                "explanation": "Doubly linked list constructed with bidirectional links."
            },
            {
                "input": "arr = [42]",
                "output": "42 (prev = null, next = null)",
                "explanation": "Single node DLL."
            }
        ]
    ),

    "deletion-in-doubly-ll": make_prob(
        description="Master deletion operations in a Doubly Linked List: unlinking head, unlinking tail, and removing a node at position k by adjusting both `node.prev.next` and `node.next.prev` in O(1) time.",
        input_format="The `head` of a DLL and deletion instruction.",
        output_format="Return the head of the updated DLL.",
        constraints="1 <= nodes <= 10^5",
        examples=[
            {
                "input": "list = 1 <-> 2 <-> 3 <-> 4, delete node 3",
                "output": "1 <-> 2 <-> 4",
                "explanation": "2.next points to 4 and 4.prev points to 2."
            },
            {
                "input": "list = 5 <-> 10, delete head",
                "output": "10 (prev = null)",
                "explanation": "New head has null prev."
            }
        ]
    ),

    "insertion-in-dll": make_prob(
        description="Master insertion operations in a Doubly Linked List: inserting before head, inserting before tail, and inserting before the k-th node by updating four pointers in O(1) time.",
        input_format="The `head` of a DLL, integer `val`, and insertion target.",
        output_format="Return the head of the updated DLL.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "list = 2 <-> 3, insert 1 before head",
                "output": "1 <-> 2 <-> 3",
                "explanation": "1 becomes head with prev = null."
            },
            {
                "input": "list = 1 <-> 3, insert 2 before 3",
                "output": "1 <-> 2 <-> 3",
                "explanation": "2 linked between 1 and 3."
            }
        ]
    ),

    "convert-array-to-dll": make_prob(
        description="Given an array of integers `arr`, convert it into a Doubly Linked List and return the head of the DLL in O(N) time.",
        input_format="An integer array `arr` of size `n`.",
        output_format="Return the head of the doubly linked list.",
        constraints="1 <= arr.length <= 10^5\n-10^9 <= arr[i] <= 10^9",
        examples=[
            {
                "input": "arr = [1, 2, 3, 4, 5]",
                "output": "1 <-> 2 <-> 3 <-> 4 <-> 5",
                "explanation": "DLL created with forward and backward links."
            },
            {
                "input": "arr = [10]",
                "output": "10",
                "explanation": "Single node DLL."
            }
        ]
    ),

    "delete-tail-of-dll": make_prob(
        description="Given the `head` of a doubly linked list, delete the last node (tail) of the list and return the head in O(N) time (or O(1) if tail pointer is given).",
        input_format="The `head` of a DLL.",
        output_format="Return the head after deleting the tail.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "head = 1 <-> 2 <-> 3 <-> 4",
                "output": "1 <-> 2 <-> 3",
                "explanation": "Node 4 removed."
            },
            {
                "input": "head = [1]",
                "output": "[]",
                "explanation": "Deleting tail from 1-node list leaves null."
            }
        ]
    ),

    "delete-kth-element-of-dll": make_prob(
        description="Given the `head` of a doubly linked list and an integer `k`, delete the `k`-th node from the DLL (1-indexed) and return the head.",
        input_format="The `head` of a DLL and integer `k`.",
        output_format="Return the head of the updated DLL.",
        constraints="1 <= nodes <= 10^5\n1 <= k <= nodes",
        examples=[
            {
                "input": "head = 1 <-> 2 <-> 3 <-> 4, k = 2",
                "output": "1 <-> 3 <-> 4",
                "explanation": "2nd node deleted."
            },
            {
                "input": "head = 10 <-> 20, k = 1",
                "output": "20",
                "explanation": "Head node deleted."
            }
        ]
    ),

    "removing-given-node-in-dll": make_prob(
        description="Given a reference to a node in a doubly linked list (guaranteed not to be the head or null), delete this node in O(1) time without traversing the list.",
        input_format="A pointer to the target `node` to be deleted.",
        output_format="Unlink the node in-place in O(1) time.",
        constraints="The target node is not null and is a middle/tail node of a valid DLL.",
        examples=[
            {
                "input": "list: 1 <-> 2 <-> 3, target node: 2",
                "output": "1 <-> 3",
                "explanation": "Node 2 unlinked: 1.next = 3, 3.prev = 1."
            },
            {
                "input": "list: 1 <-> 2, target node: 2",
                "output": "1",
                "explanation": "Tail node unlinked."
            }
        ]
    ),

    "insert-node-before-head-in-dll": make_prob(
        description="Given the `head` of a doubly linked list and an integer `val`, insert a new node with value `val` before the head in O(1) time and return the new head.",
        input_format="The `head` of a DLL and integer `val`.",
        output_format="Return the new head of the DLL.",
        constraints="0 <= nodes <= 10^5\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "head = 2 <-> 3, val = 1",
                "output": "1 <-> 2 <-> 3",
                "explanation": "1 becomes the new head."
            },
            {
                "input": "head = [], val = 5",
                "output": "5",
                "explanation": "Single node created."
            }
        ]
    ),

    "insert-node-before-tail-in-dll": make_prob(
        description="Given the `head` of a doubly linked list and an integer `val`, insert a new node with value `val` immediately before the tail node and return the head.",
        input_format="The `head` of a DLL (at least 1 node) and integer `val`.",
        output_format="Return the head of the modified DLL.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "head = 1 <-> 2 <-> 4, val = 3",
                "output": "1 <-> 2 <-> 3 <-> 4",
                "explanation": "3 is inserted right before the tail 4."
            },
            {
                "input": "head = 10 <-> 20, val = 15",
                "output": "10 <-> 15 <-> 20",
                "explanation": "Inserted before 20."
            }
        ]
    ),

    "insert-node-before-kth-node-in-dll": make_prob(
        description="Given the `head` of a doubly linked list, an integer `val`, and integer `k` (1 <= k <= length), insert a new node with value `val` before the `k`-th node in the list.",
        input_format="The `head` of a DLL, integer `val`, and integer `k`.",
        output_format="Return the head of the modified DLL.",
        constraints="1 <= nodes <= 10^5\n1 <= k <= nodes\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "head = 1 <-> 2 <-> 4 <-> 5, val = 3, k = 3",
                "output": "1 <-> 2 <-> 3 <-> 4 <-> 5",
                "explanation": "3 is inserted before the 3rd node (4)."
            },
            {
                "input": "head = 2 <-> 3, val = 1, k = 1",
                "output": "1 <-> 2 <-> 3",
                "explanation": "Inserted before 1st node (becomes new head)."
            }
        ]
    ),

    "insert-before-given-node-in-dll": make_prob(
        description="Given a reference to a `node` in a doubly linked list and an integer `val`, insert a new node with value `val` immediately before `node` in O(1) time.",
        input_format="A pointer to `node` in a DLL and integer `val`.",
        output_format="Insert the new node in O(1) time.",
        constraints="node is a valid non-null node in a DLL.\n-10^9 <= val <= 10^9",
        examples=[
            {
                "input": "list = 1 <-> 3, node = 3, val = 2",
                "output": "1 <-> 2 <-> 3",
                "explanation": "2 inserted before 3 in O(1) time."
            },
            {
                "input": "list = 10, node = 10, val = 5",
                "output": "5 <-> 10",
                "explanation": "Inserted before single node."
            }
        ]
    ),

    "delete-head-of-dll": make_prob(
        description="Given the `head` of a doubly linked list, delete the first node (head) and return the new head of the DLL in O(1) time.",
        input_format="The `head` of a DLL.",
        output_format="Return the new head of the DLL.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "head = 1 <-> 2 <-> 3",
                "output": "2 <-> 3",
                "explanation": "1 is deleted, 2 becomes new head with prev = null."
            },
            {
                "input": "head = [10]",
                "output": "[]",
                "explanation": "Leaves empty list."
            }
        ]
    ),

    "reverse-a-doubly-linked-list": make_prob(
        description="Given the `head` of a doubly linked list, reverse the list in-place and return the new head. For every node, swap its `prev` and `next` pointers in O(N) time with O(1) auxiliary space.",
        input_format="The `head` of a doubly linked list.",
        output_format="Return the head of the reversed doubly linked list.",
        constraints="0 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "head = 1 <-> 2 <-> 3 <-> 4",
                "output": "4 <-> 3 <-> 2 <-> 1",
                "explanation": "All prev and next pointers swapped."
            },
            {
                "input": "head = [1]",
                "output": "[1]",
                "explanation": "Single node remains unchanged."
            }
        ]
    ),

    "add-two-numbers-in-ll": make_prob(
        description="You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list. Solve in O(max(N, M)) time tracking the carry digit.",
        input_format="Heads of two linked lists `l1` and `l2`.",
        output_format="Return the head of the sum linked list.",
        constraints="The number of nodes in each linked list is in the range [1, 100].\n0 <= Node.val <= 9\nIt is guaranteed that the list represents a number that does not have leading zeros.",
        examples=[
            {
                "input": "l1 = [2, 4, 3], l2 = [5, 6, 4]",
                "output": "[7, 0, 8]",
                "explanation": "342 + 465 = 807."
            },
            {
                "input": "l1 = [0], l2 = [0]",
                "output": "[0]",
                "explanation": "0 + 0 = 0."
            }
        ]
    ),

    "segregate-odd-and-even-nodes-in-ll": make_prob(
        description="Given the `head` of a singly linked list, group all the nodes with odd indices together followed by the nodes with even indices, and return the reordered list. The first node is considered odd, and the second node is even, and so on. Note that the relative order inside both the odd and even groups should remain as it was in the input. Solve in O(N) time and O(1) extra space.",
        input_format="The `head` of a singly linked list.",
        output_format="Return the head of the rearranged linked list.",
        constraints="The number of nodes in the linked list is in the range [0, 10^4].\n-10^6 <= Node.val <= 10^6",
        examples=[
            {
                "input": "head = [1, 2, 3, 4, 5]",
                "output": "[1, 3, 5, 2, 4]",
                "explanation": "Odd indices: 1, 3, 5; Even indices: 2, 4."
            },
            {
                "input": "head = [2, 1, 3, 5, 6, 4, 7]",
                "output": "[2, 3, 6, 7, 1, 5, 4]",
                "explanation": "Odd indices grouped before even indices."
            }
        ]
    ),

    "sort-a-ll-of-0's-1's-and-2's": make_prob(
        description="Given a linked list of `N` nodes where nodes can contain values `0`, `1`, or `2` only. The task is to sort the linked list in-place by changing links using 3 dummy heads (`zeroHead`, `oneHead`, `twoHead`) in O(N) time and O(1) space.",
        input_format="The `head` of a linked list containing only values 0, 1, and 2.",
        output_format="Return the head of the sorted linked list.",
        constraints="1 <= nodes <= 10^5\nNode.val in {0, 1, 2}",
        examples=[
            {
                "input": "head = 1 -> 2 -> 2 -> 1 -> 2 -> 0 -> 2 -> 2",
                "output": "0 -> 1 -> 1 -> 2 -> 2 -> 2 -> 2 -> 2",
                "explanation": "List partitioned into 0s, 1s, and 2s."
            },
            {
                "input": "head = 2 -> 2 -> 0 -> 1",
                "output": "0 -> 1 -> 2 -> 2",
                "explanation": "Sorted in non-decreasing order."
            }
        ]
    ),

    "remove-nth-node-from-the-back-of-the-ll": make_prob(
        description="Given the `head` of a linked list, remove the `n`-th node from the end of the list and return its head. Solve in one pass using two pointers (`fast` and `slow`) separated by `n` steps.",
        input_format="The `head` of a linked list and integer `n`.",
        output_format="Return the head of the modified linked list.",
        constraints="The number of nodes in the list is sz.\n1 <= sz <= 30\n0 <= Node.val <= 100\n1 <= n <= sz",
        examples=[
            {
                "input": "head = [1, 2, 3, 4, 5], n = 2",
                "output": "[1, 2, 3, 5]",
                "explanation": "The 2nd node from the end is 4, which is removed."
            },
            {
                "input": "head = [1], n = 1",
                "output": "[]",
                "explanation": "Single node removed leaves empty list."
            }
        ]
    ),

    "reverse-a-ll": make_prob(
        description="Given the `head` of a singly linked list, reverse the list, and return the reversed list. Implement both the iterative approach using 3 pointers (`prev`, `curr`, `next`) and the recursive approach in O(N) time.",
        input_format="The `head` of a singly linked list.",
        output_format="Return the head of the reversed list.",
        constraints="The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000",
        examples=[
            {
                "input": "head = [1, 2, 3, 4, 5]",
                "output": "[5, 4, 3, 2, 1]",
                "explanation": "Reversed linked list."
            },
            {
                "input": "head = [1, 2]",
                "output": "[2, 1]",
                "explanation": "Reversed list."
            }
        ]
    ),

    "add-one-to-a-number-represented-by-ll": make_prob(
        description="A number is represented in a linked list such that each digit corresponds to a node in linked list (MSB at head, LSB at tail). Add 1 to the number and return the head of the modified linked list. Solve in O(N) using recursion or reversing the list.",
        input_format="The `head` of a linked list representing a non-negative integer.",
        output_format="Return the head of the linked list after adding 1.",
        constraints="1 <= nodes <= 10^5\n0 <= Node.val <= 9",
        examples=[
            {
                "input": "head = 4 -> 5 -> 6",
                "output": "4 -> 5 -> 7",
                "explanation": "456 + 1 = 457."
            },
            {
                "input": "head = 9 -> 9 -> 9",
                "output": "1 -> 0 -> 0 -> 0",
                "explanation": "999 + 1 = 1000."
            }
        ]
    ),

    "find-middle-of-linked-list": make_prob(
        description="Given the `head` of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node. Solve in one pass using Floyd's Tortoise and Hare algorithm (`slow` moves 1 step, `fast` moves 2 steps).",
        input_format="The `head` of a singly linked list.",
        output_format="Return the middle `TreeNode`.",
        constraints="The number of nodes in the list is in the range [1, 100].\n1 <= Node.val <= 100",
        examples=[
            {
                "input": "head = [1, 2, 3, 4, 5]",
                "output": "[3, 4, 5]",
                "explanation": "The middle node is 3."
            },
            {
                "input": "head = [1, 2, 3, 4, 5, 6]",
                "output": "[4, 5, 6]",
                "explanation": "Since the list has two middle nodes with values 3 and 4, we return the second one."
            }
        ]
    ),

    "delete-the-middle-node-in-ll": make_prob(
        description="You are given the `head` of a linked list. Delete the middle node, and return the `head` of the modified linked list. For a list of size `n`, the 0-indexed middle node is at `⌊n / 2⌋`. Solve in O(N) time and O(1) space using two pointers.",
        input_format="The `head` of a linked list.",
        output_format="Return the head after deleting the middle node.",
        constraints="The number of nodes in the list is in the range [1, 10^5].\n1 <= Node.val <= 10^5",
        examples=[
            {
                "input": "head = [1, 3, 4, 7, 1, 2, 6]",
                "output": "[1, 3, 4, 1, 2, 6]",
                "explanation": "Middle node with value 7 (index 3) is deleted."
            },
            {
                "input": "head = [1, 2, 3, 4]",
                "output": "[1, 2, 4]",
                "explanation": "Node 3 at index 2 is deleted."
            }
        ]
    ),

    "check-if-ll-is-palindrome-or-not": make_prob(
        description="Given the `head` of a singly linked list, return `true` if it is a palindrome or `false` otherwise. Solve in O(N) time and O(1) space: 1. Find the middle node using slow/fast pointers. 2. Reverse the second half of the list. 3. Compare values of first half and second half.",
        input_format="The `head` of a singly linked list.",
        output_format="Return boolean `true` if palindrome, else `false`.",
        constraints="The number of nodes in the list is in the range [1, 10^5].\n0 <= Node.val <= 9",
        examples=[
            {
                "input": "head = [1, 2, 2, 1]",
                "output": "true",
                "explanation": "List reads the same forward and backward."
            },
            {
                "input": "head = [1, 2]",
                "output": "false",
                "explanation": "Not a palindrome."
            }
        ]
    ),

    "find-the-intersection-point-of-y-ll": make_prob(
        description="Given the heads of two singly linked-lists `headA` and `headB`, return the node at which the two lists intersect. If the two linked lists have no intersection at all, return `null`. Solve in O(N + M) time and O(1) space using two pointers where each pointer switches to the other list's head upon reaching null.",
        input_format="Heads of two linked lists `headA` and `headB`.",
        output_format="Return the intersecting node, or null.",
        constraints="The number of nodes of listA is in the m.\nThe number of nodes of listB is in the n.\n1 <= m, n <= 3 * 10^4\n1 <= Node.val <= 10^5",
        examples=[
            {
                "input": "intersectVal = 8, listA = [4, 1, 8, 4, 5], listB = [5, 6, 1, 8, 4, 5], skipA = 2, skipB = 3",
                "output": "Intersected at '8'",
                "explanation": "The intersected node's value is 8."
            },
            {
                "input": "intersectVal = 0, listA = [2, 6, 4], listB = [1, 5], skipA = 3, skipB = 2",
                "output": "null",
                "explanation": "The two lists do not intersect."
            }
        ]
    ),

    "detect-a-loop-in-ll": make_prob(
        description="Given `head`, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the `next` pointer. Return `true` if there is a cycle, otherwise `false`. Solve in O(N) time and O(1) space using Floyd's Cycle-Finding Algorithm (slow and fast pointers).",
        input_format="The `head` of a linked list.",
        output_format="Return boolean `true` if cycle exists, else `false`.",
        constraints="The number of the nodes in the list is in the range [0, 10^4].\n-10^5 <= Node.val <= 10^5",
        examples=[
            {
                "input": "head = [3, 2, 0, -4], pos = 1 (tail connects to node index 1)",
                "output": "true",
                "explanation": "There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed)."
            },
            {
                "input": "head = [1], pos = -1",
                "output": "false",
                "explanation": "There is no cycle in the linked list."
            }
        ]
    ),

    "find-the-starting-point-in-ll": make_prob(
        description="Given the `head` of a linked list, return the node where the cycle begins. If there is no cycle, return `null`. Solve in O(N) time and O(1) space: after `slow` and `fast` meet, reset `slow` to `head` and advance both one step at a time until they collide at the loop starting node.",
        input_format="The `head` of a linked list.",
        output_format="Return the starting node of the cycle, or null.",
        constraints="The number of the nodes in the list is in the range [0, 10^4].\n-10^5 <= Node.val <= 10^5",
        examples=[
            {
                "input": "head = [3, 2, 0, -4], pos = 1",
                "output": "Node with value 2",
                "explanation": "Cycle begins at node with value 2."
            },
            {
                "input": "head = [1, 2], pos = 0",
                "output": "Node with value 1",
                "explanation": "Cycle begins at node with value 1."
            }
        ]
    ),

    "length-of-loop-in-ll": make_prob(
        description="Given a linked list of size `n`, find the length of loop (number of nodes in the cycle) present in the list. If no loop is present, return 0. After detecting cycle collision with Floyd's algorithm, keep one pointer stationary and advance the other counting steps until it returns to the collision point.",
        input_format="The `head` of a linked list.",
        output_format="Return the length of the cycle, or 0.",
        constraints="1 <= n <= 10^5\n-10^9 <= Node.val <= 10^9",
        examples=[
            {
                "input": "head: 25 -> 14 -> 19 -> 33 -> 10 -> (loops back to 14)",
                "output": "4",
                "explanation": "The loop contains 4 nodes (14, 19, 33, 10)."
            },
            {
                "input": "head = 1 -> 2 -> 3 (no loop)",
                "output": "0",
                "explanation": "No cycle exists."
            }
        ]
    ),

    "reverse-ll-in-group-of-given-size-k": make_prob(
        description="Given the `head` of a linked list, reverse the nodes of the list `k` at a time, and return the modified list. `k` is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of `k` then left-out nodes, in the end, should remain as it is.",
        input_format="The `head` of a linked list and integer `k`.",
        output_format="Return the head of the modified linked list.",
        constraints="The number of nodes in the list is n.\n1 <= k <= n <= 5000\n0 <= Node.val <= 1000",
        examples=[
            {
                "input": "head = [1, 2, 3, 4, 5], k = 2",
                "output": "[2, 1, 4, 3, 5]",
                "explanation": "Nodes reversed in pairs; 5 remains as is."
            },
            {
                "input": "head = [1, 2, 3, 4, 5], k = 3",
                "output": "[3, 2, 1, 4, 5]",
                "explanation": "First 3 nodes reversed; remaining 2 nodes unchanged."
            }
        ]
    ),

    "rotate-a-ll": make_prob(
        description="Given the `head` of a linked list, rotate the list to the right by `k` places. Solve in O(N) time by connecting tail to head forming a circular list, then breaking the loop at index `length - (k % length) - 1`.",
        input_format="The `head` of a linked list and non-negative integer `k`.",
        output_format="Return the head of the rotated list.",
        constraints="The number of nodes in the list is in the range [0, 500].\n-100 <= Node.val <= 100\n0 <= k <= 2 * 10^9",
        examples=[
            {
                "input": "head = [1, 2, 3, 4, 5], k = 2",
                "output": "[4, 5, 1, 2, 3]",
                "explanation": "Rotate right 1: [5, 1, 2, 3, 4]. Rotate 2: [4, 5, 1, 2, 3]."
            },
            {
                "input": "head = [0, 1, 2], k = 4",
                "output": "[2, 0, 1]",
                "explanation": "k % 3 = 1 step right gives [2, 0, 1]."
            }
        ]
    ),

    "merge-sorted-lists-": make_prob(
        description="You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
        input_format="Heads of two sorted linked lists `list1` and `list2`.",
        output_format="Return the head of the merged sorted linked list.",
        constraints="The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.",
        examples=[
            {
                "input": "list1 = [1, 2, 4], list2 = [1, 3, 4]",
                "output": "[1, 1, 2, 3, 4, 4]",
                "explanation": "Nodes merged in sorted order."
            },
            {
                "input": "list1 = [], list2 = []",
                "output": "[]",
                "explanation": "Both lists empty."
            }
        ]
    ),

    "flattening-of-ll": make_prob(
        description="Given a Linked List where every node represents a sub-linked-list and contains two pointers: `next` points to next main node, `bottom` points to sub-linked-list in sorted order. Flatten the list so that all nodes appear in a single sorted list connected via `bottom` pointers.",
        input_format="The `head` of a multi-level linked list.",
        output_format="Return the head of the flattened sorted linked list.",
        constraints="0 <= N, M <= 1000\n1 <= Node.val <= 10^5",
        examples=[
            {
                "input": "5 -> 10 -> 19 -> 28\n|    |     |     |\n7    20    22    35\n|          |     |\n8          50    40",
                "output": "5 -> 7 -> 8 -> 10 -> 19 -> 20 -> 22 -> 28 -> 35 -> 40 -> 50",
                "explanation": "Merged bottom-wise into a single sorted list."
            },
            {
                "input": "5 -> 10",
                "output": "5 -> 10",
                "explanation": "Already flat."
            }
        ]
    ),

    "sort-ll": make_prob(
        description="Given the `head` of a linked list, return the list after sorting it in ascending order. Solve in O(N log N) time and O(log N) stack space using Merge Sort on Linked List.",
        input_format="The `head` of an unsorted linked list.",
        output_format="Return the head of the sorted linked list.",
        constraints="The number of nodes in the list is in the range [0, 5 * 10^4].\n-10^5 <= Node.val <= 10^5",
        examples=[
            {
                "input": "head = [4, 2, 1, 3]",
                "output": "[1, 2, 3, 4]",
                "explanation": "Sorted in non-decreasing order."
            },
            {
                "input": "head = [-1, 5, 3, 4, 0]",
                "output": "[-1, 0, 3, 4, 5]",
                "explanation": "Sorted."
            }
        ]
    ),

    "clone-a-ll-with-random-and-next-pointer": make_prob(
        description="A linked list of length `n` is given such that each node contains an additional random pointer, which could point to any node in the list, or `null`. Construct a deep copy of the list. Solve in O(N) time and O(1) auxiliary space by weaving clone nodes next to original nodes.",
        input_format="The `head` of a linked list with random pointers.",
        output_format="Return the head of the cloned linked list.",
        constraints="0 <= n <= 1000\n-10^4 <= Node.val <= 10^4\nNode.random is null or points to some node in the linked list.",
        examples=[
            {
                "input": "head = [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]",
                "output": "[[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]",
                "explanation": "Deep copy reproduces node values and internal next/random pointer graph identically."
            },
            {
                "input": "head = [[1, 1], [2, 1]]",
                "output": "[[1, 1], [2, 1]]",
                "explanation": "Cloned with self-referencing random pointers."
            }
        ]
    ),

    "delete-all-occurrences-of-a-key-in-dll": make_prob(
        description="Given the `head` of a doubly linked list and a key `k`, delete all occurrences of `k` from the doubly linked list and return the head of the modified list in O(N) time and O(1) space.",
        input_format="The `head` of a DLL and integer `k`.",
        output_format="Return the head of the DLL after deleting all instances of `k`.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val, k <= 10^9",
        examples=[
            {
                "input": "head = 2 <-> 2 <-> 10 <-> 8 <-> 4 <-> 2 <-> 5 <-> 2, k = 2",
                "output": "10 <-> 8 <-> 4 <-> 5",
                "explanation": "All nodes with value 2 deleted."
            },
            {
                "input": "head = 9 <-> 1 <-> 3 <-> 5 <-> 9, k = 9",
                "output": "1 <-> 3 <-> 5",
                "explanation": "Both occurrences of 9 removed."
            }
        ]
    ),

    "remove-duplicated-from-sorted-dll": make_prob(
        description="Given a doubly linked list of `n` nodes which is sorted in non-decreasing order, remove all duplicate nodes from the DLL in-place such that each unique value appears only once. Solve in O(N) time and O(1) space.",
        input_format="The `head` of a sorted doubly linked list.",
        output_format="Return the head of the DLL with duplicates removed.",
        constraints="1 <= nodes <= 10^5\n-10^9 <= Node.val <= 10^9\nDLL is sorted.",
        examples=[
            {
                "input": "head = 1 <-> 1 <-> 1 <-> 2 <-> 3 <-> 4",
                "output": "1 <-> 2 <-> 3 <-> 4",
                "explanation": "Duplicate 1s removed."
            },
            {
                "input": "head = 1 <-> 2 <-> 2 <-> 3",
                "output": "1 <-> 2 <-> 3",
                "explanation": "Duplicates removed."
            }
        ]
    ),

    "find-pairs-with-given-sum-in-doubly-linked-list": make_prob(
        description="Given a sorted doubly linked list of positive distinct integers, find all pairs of numbers in the list that sum up to a given value `target`. Solve in O(N) time and O(1) extra space using two pointers (`left` starting at head and `right` starting at tail).",
        input_format="The `head` of a sorted DLL and integer `target`.",
        output_format="Return a list of pairs `[first, second]` summing to `target`.",
        constraints="1 <= nodes <= 10^5\n1 <= Node.val, target <= 10^9\nAll node values are distinct and sorted.",
        examples=[
            {
                "input": "head = 1 <-> 2 <-> 4 <-> 5 <-> 6 <-> 8 <-> 9, target = 7",
                "output": "[[1, 6], [2, 5]]",
                "explanation": "1 + 6 = 7 and 2 + 5 = 7."
            },
            {
                "input": "head = 1 <-> 5 <-> 6, target = 6",
                "output": "[[1, 5]]",
                "explanation": "1 + 5 = 6."
            }
        ]
    ),
}
