
# Ultimate Coding Interview CheatSheet

[

Intervew Prep

](https://www.reddit.com/r/leetcode/?f=flair_name%3A%22Intervew%20Prep%22)

# Standard Leetcode Variable Names

Use the same names in every note and visualizer. Full reference: [[Variable Naming Guide]].

| Category | Common names |
|---|---|
| Arrays | `nums`, `target`, `i`, `j`, `res`, `ans` |
| Strings | `s`, `t`, `strs`, `prefix` |
| Hash maps | `seen`, `freq`, `need`, `key`, `groups` |
| Two pointers | `left`, `right`, `slow`, `fast`, `sum`, `area` |
| Binary search | `left`, `right`, `mid`, `ans` |
| Linked lists | `head`, `prev`, `curr`, `next`, `dummy`, `tail` |

Problem-specific patterns (examples):

- **Two Sum:** `nums`, `target`, `i`, `num`, `need`, `seen`, `res`
- **3Sum:** `nums`, `res`, `i`, `left`, `right`, `sum`
- **Binary Search:** `nums`, `target`, `left`, `right`, `mid`, `ans`
- **Reverse Linked List:** `head`, `prev`, `curr`, `next`

# Coding question patterns for all relevant DSA types:

**Arrays and Strings**

1. Two Pointers: Used for finding pairs or elements that meet specific criteria.
    
2. Sliding Window: Maintains a subset of elements within a larger dataset.
    
3. Binary Search: Efficient searching in sorted arrays.
    
4. Prefix Sum: Precompute cumulative sums for quick range queries.
    

**Trees**

1. Depth-First Search (DFS): Preorder, inorder, and postorder traversals.
    
2. Breadth-First Search (BFS): Level-order traversal.
    
3. Binary Search Tree (BST) operations: Insertion, deletion, and validation.
    
4. Tree construction: From preorder/inorder or postorder/inorder traversals.
    

**Hashtables**

1. Frequency counting: Track occurrences of elements.
    
2. Two Sum pattern: Find pairs with a specific sum.
    
3. Anagram detection: Compare character frequencies.
    
4. Caching: Store computed results for quick lookup.
    

**Graphs**

1. Depth-First Search (DFS): Explore paths deeply before backtracking.
    
2. Breadth-First Search (BFS): Explore nodes level by level.
    
3. Topological Sort: Order nodes in a directed acyclic graph.
    
4. Union Find: Detect cycles and connect components.
    

**Stacks**

1. Parentheses matching: Validate balanced brackets.
    
2. Monotonic stack: Maintain increasing/decreasing order for next greater/smaller element problems.
    
3. Expression evaluation: Evaluate arithmetic expressions.
    

**Queues**

1. BFS implementation: Level-order traversal in graphs and trees.
    
2. Task scheduling: Manage order of operations.
    
3. Sliding window problems: Maintain a window of elements.
    

**Heaps**

1. Top K Elements Pattern: Find or manipulate the K largest/smallest elements in a collection.
    
2. Merge K Sorted Pattern: Combine K sorted lists or arrays into a single sorted list.
    
3. Two Heaps Pattern: Use two heaps to track median or balance elements in a stream.
    
4. Sliding Window Median Pattern: Calculate median in a sliding window over a stream of numbers.
    
5. Scheduling Pattern: Manage tasks or intervals using a heap for efficient scheduling.
    

Let me know if I am missing something. I intentionally left out DP (cause no one other than Google cares for it).

**PS: If you have time left after all this you can look into other common (but rare patterns) like:**

1. **Tries for word search**
    
2. **Backtracking (look at** [**n-Queens problem**](https://leetcode.com/problems/n-queens/) **for reference)**
    
3. **Greedy + Binary Search (refer to this** [problem](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/) **for pattern)**
    
4. **Divide and Conquer (look at** [merge sort](https://leetcode.com/problems/merge-k-sorted-lists/description/?envType=problem-list-v2&envId=merge-sort) **for a template)**