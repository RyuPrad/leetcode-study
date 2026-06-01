# Variable Naming Guide

Use the same variable names everywhere in this vault: Markdown notes, code blocks, HTML visualizers, HUD labels, and step traces. When you see a name in one place, you should recognize it instantly in every other place for that problem.

## Universal inputs

| Name | Meaning |
|---|---|
| `nums` | array of numbers |
| `strs` | array of strings |
| `s` | first string |
| `t` | second string |
| `target` | target value to find or match |
| `k` | top-k, kth element, or count limit |
| `head` | linked list head node |
| `root` | tree root node |

## Universal indexes and pointers

| Name | Meaning |
|---|---|
| `i` | primary loop index |
| `j` | secondary loop index |
| `left` | left pointer |
| `right` | right pointer |
| `mid` | binary search midpoint |
| `slow` | slow pointer |
| `fast` | fast pointer |
| `prev` | previous linked-list node |
| `curr` | current linked-list node |
| `next` | next linked-list node |

## Universal hash / set / map variables

| Name | Meaning |
|---|---|
| `seen` | Set or Map of values already visited |
| `freq` | frequency map |
| `need` | complement or value still needed |
| `key` | encoded grouping key |
| `groups` | grouped map or object |

## Universal output variables

| Name | Meaning |
|---|---|
| `res` | output array or list |
| `ans` | scalar answer: max area, count, boolean, or index |
| `count` | running counter |
| `sum` | current sum |

## Problem-specific patterns

### Array & Hashing

**Two Sum:** `nums`, `target`, `i`, `num`, `need`, `seen`, `res`

**Contains Duplicate:** `nums`, `seen`

**Valid Anagram:** `s`, `t`, `freq`

**Group Anagrams:** `strs`, `groups`, `key`, `res`

**Top K Frequent Elements:** `nums`, `k`, `freq`, `buckets`, `res`

**Product of Array Except Self:** `nums`, `res`, `prefix`, `suffix`

**Encode and Decode Strings:** `strs`, `encoded`, `decoded`, `i`, `len`

**Longest Common Prefix:** `strs`, `prefix`

**Concatenation of Array:** `nums`, `res`, `i`, `n`

**Remove Element:** `nums`, `val`, `i`, `k`, `ans`

**Majority Element:** `nums`, `num`, `count`, `ans`

**Majority Element II:** `nums`, `num`, `cand1`, `cand2`, `count1`, `count2`, `res`

**Sort Colors:** `nums`, `low`, `mid`, `high`

**Sort an Array:** `nums`, `left`, `mid`, `right`, `i`, `j`, `k`, `temp`

**Design HashSet:** `size`, `buckets`, `key`, `idx`

**Design HashMap:** `size`, `buckets`, `key`, `value`, `idx`

**Subarray Sum Equals K:** `nums`, `k`, `num`, `sum`, `freq`, `count`

**Range Sum Query 2D - Immutable:** `matrix`, `prefix`, `row1`, `col1`, `row2`, `col2`

**Best Time to Buy and Sell Stock II:** `prices`, `i`, `ans`

**Valid Sudoku:** `board`, `r`, `c`, `val`, `rows`, `cols`, `boxes`, `b`, `ans`

**Longest Consecutive Sequence:** `nums`, `seen`, `num`, `curr`, `length`, `ans`

**First Missing Positive:** `nums`, `n`, `i`, `j`, `ans`

### Two Pointers

**Valid Palindrome:** `s`, `left`, `right`, `ans`

**Container With Most Water:** `height`, `left`, `right`, `area`, `ans`

**3Sum:** `nums`, `res`, `i`, `left`, `right`, `sum`

**Reverse String:** `s`, `left`, `right`

**Valid Palindrome II:** `s`, `left`, `right`

**Merge Strings Alternately:** `word1`, `word2`, `i`, `j`, `res`

**Merge Sorted Array:** `nums1`, `nums2`, `m`, `n`, `i`, `j`, `k`

**Remove Duplicates from Sorted Array:** `nums`, `left`, `right`, `k`

**Two Sum II - Input Array Is Sorted:** `numbers`, `target`, `left`, `right`, `sum`, `res`

**4Sum:** `nums`, `target`, `i`, `j`, `left`, `right`, `sum`, `res`

**Rotate Array:** `nums`, `k`, `left`, `right`

**Boats to Save People:** `people`, `limit`, `left`, `right`, `boats`

**Trapping Rain Water:** `height`, `left`, `right`, `leftMax`, `rightMax`, `res`

### Sliding Window

**Contains Duplicate II:** `nums`, `k`, `i`, `seen`, `ans`

**Best Time to Buy and Sell Stock:** `prices`, `left`, `right`, `ans`

**Longest Substring Without Repeating Characters:** `s`, `left`, `right`, `seen`, `ans`

**Longest Repeating Character Replacement:** `s`, `k`, `left`, `right`, `freq`, `maxFreq`, `ans`

**Permutation in String:** `s1`, `s2`, `need`, `window`, `left`, `right`

**Minimum Size Subarray Sum:** `target`, `nums`, `left`, `right`, `sum`, `ans`

**Find K Closest Elements:** `arr`, `k`, `x`, `left`, `right`

**Minimum Window Substring:** `s`, `t`, `need`, `window`, `left`, `right`, `have`, `needCount`, `ans`

**Sliding Window Maximum:** `nums`, `k`, `deque`, `left`, `right`, `res`

### Stack

**Baseball Game:** `operations`, `stack`, `res`

**Valid Parentheses:** `s`, `stack`, `map`

**Evaluate Reverse Polish Notation:** `tokens`, `stack`, `a`, `b`

**Implement Stack using Queues:** `q`, `x`, `i`

**Implement Queue using Stacks:** `sIn`, `sOut`, `x`

**Min Stack:** `stack`, `val`, `min`

**Daily Temperatures:** `temperatures`, `stack`, `i`, `j`, `res`

**Online Stock Span:** `stack`, `price`, `span`

**Largest Rectangle in Histogram:** `heights`, `stack`, `i`, `maxArea`

**Decode String:** `s`, `stack`, `curStr`, `curNum`

**Generate Parentheses:** `n`, `stack`, `open`, `close`, `res`

**Simplify Path:** `path`, `parts`, `stack`

**Asteroid Collision:** `asteroids`, `stack`, `a`, `top`

**Car Fleet:** `target`, `position`, `speed`, `cars`, `stack`

**Maximum Frequency Stack:** `freq`, `group`, `maxFreq`, `val`

### Binary Search

**Binary Search:** `nums`, `target`, `left`, `right`, `mid`, `ans`

**Search Insert Position:** `nums`, `target`, `left`, `right`, `mid`, `ans`

**Guess Number Higher or Lower:** `n`, `left`, `right`, `mid`, `pick`, `res`

**Sqrt(x):** `x`, `left`, `right`, `mid`, `ans`

**Search a 2D Matrix:** `matrix`, `target`, `m`, `n`, `left`, `right`, `mid`

**Koko Eating Bananas:** `piles`, `h`, `left`, `right`, `mid`, `ans`

**Capacity to Ship Packages Within D Days:** `weights`, `days`, `left`, `right`, `mid`, `ans`

**Find Minimum in Rotated Sorted Array:** `nums`, `left`, `right`, `mid`, `ans`

**Search in Rotated Sorted Array:** `nums`, `target`, `left`, `right`, `mid`

**Search in Rotated Sorted Array II:** `nums`, `target`, `left`, `right`, `mid`

**Time Based Key-Value Store:** `store`, `key`, `value`, `timestamp`, `left`, `right`, `mid`, `res`

**Split Array Largest Sum:** `nums`, `k`, `left`, `right`, `mid`, `ans`

**Median of Two Sorted Arrays:** `nums1`, `nums2`, `m`, `n`, `left`, `right`, `i`, `j`, `left1`, `right1`, `left2`, `right2`

**Find in Mountain Array:** `arr`, `target`, `n`, `left`, `right`, `mid`, `peak`, `res`

### Linked List

**Merge Two Sorted Lists:** `list1`, `list2`, `dummy`, `tail`, `curr`

**Reverse Linked List:** `head`, `prev`, `curr`, `next`

**Linked List Cycle:** `head`, `slow`, `fast`

**Reorder List:** `head`, `slow`, `fast`, `prev`, `curr`, `next`, `second`

**Remove Nth Node From End of List:** `head`, `dummy`, `fast`, `slow`, `n`

**Copy List with Random Pointer:** `head`, `map`, `curr`

**Add Two Numbers:** `l1`, `l2`, `dummy`, `curr`, `carry`, `sum`

**Find the Duplicate Number:** `nums`, `slow`, `fast`

**Reverse Linked List II:** `head`, `dummy`, `prev`, `curr`, `next`, `left`, `right`

**Design Circular Queue:** `queue`, `head`, `count`, `capacity`, `value`

**LRU Cache:** `capacity`, `cache`, `key`, `value`

**LFU Cache:** `capacity`, `keyToVal`, `keyToFreq`, `freqToKeys`, `minFreq`, `key`, `value`

**Merge k Sorted Lists:** `lists`, `l1`, `l2`, `dummy`, `curr`, `merged`

**Reverse Nodes in k-Group:** `head`, `dummy`, `groupPrev`, `groupNext`, `kth`, `prev`, `curr`, `next`, `k`

### Trees

**Binary Tree Inorder Traversal:** `root`, `node`, `res`

**Binary Tree Preorder Traversal:** `root`, `node`, `res`

**Binary Tree Postorder Traversal:** `root`, `node`, `res`

**Binary Tree Level Order Traversal:** `root`, `res`, `queue`, `level`, `node`

**Invert Binary Tree:** `root`, `node`, `ans`

**Maximum Depth of Binary Tree:** `root`, `node`, `depth`, `ans`

**Diameter of Binary Tree:** `root`, `node`, `left`, `right`, `ans`

**Balanced Binary Tree:** `root`, `node`, `left`, `right`, `balanced`

**Same Tree:** `p`, `q`, `ans`

**Subtree of Another Tree:** `root`, `subRoot`, `node`, `ans`

**Binary Tree Right Side View:** `root`, `res`, `queue`, `node`

**Count Good Nodes in Binary Tree:** `root`, `node`, `count`, `maxSoFar`

**Lowest Common Ancestor of a Binary Search Tree:** `root`, `node`, `p`, `q`, `ans`

**Insert into a Binary Search Tree:** `root`, `node`, `val`, `ans`

**Delete Node in a BST:** `root`, `node`, `key`, `min`, `ans`

**Validate Binary Search Tree:** `root`, `node`, `low`, `high`, `ans`

**Kth Smallest Element in a BST:** `root`, `k`, `stack`, `node`

**Construct Binary Tree from Preorder and Inorder Traversal:** `preorder`, `inorder`, `root`, `rootVal`, `mid`

**Construct Quad Tree:** `grid`, `r`, `c`, `n`, `same`

**House Robber III:** `root`, `node`, `left`, `right`, `withRoot`, `withoutRoot`, `res`

**Delete Leaves With a Given Value:** `root`, `node`, `target`

**Binary Tree Maximum Path Sum:** `root`, `node`, `left`, `right`, `ans`

**Serialize and Deserialize Binary Tree:** `root`, `res`, `node`, `data`, `vals`, `i`

### Heap / Priority Queue

**Kth Largest Element in a Stream:** `k`, `heap`, `val`, `nums`, `num`

**Last Stone Weight:** `stones`, `heap`, `s`, `a`, `b`

**K Closest Points to Origin:** `points`, `k`, `heap`, `dist`, `res`, `i`

**Kth Largest Element in an Array:** `nums`, `k`, `heap`, `num`

**Task Scheduler:** `tasks`, `n`, `freq`, `heap`, `time`, `queue`, `cnt`

**Design Twitter:** `time`, `tweets`, `following`, `heap`, `res`

**Single-Threaded CPU:** `tasks`, `indexed`, `heap`, `time`, `i`, `res`

**Reorganize String:** `s`, `freq`, `heap`, `res`, `prev`

**Longest Happy String:** `heap`, `res`

**Car Pooling:** `trips`, `capacity`, `heap`, `cur`

**Find Median from Data Stream:** `small`, `large`, `num`, `median`

**IPO:** `k`, `w`, `projects`, `maxHeap`, `i`, `j`

### Backtracking

**Sum of All Subset XOR Totals:** `nums`, `ans`, `i`, `xorSoFar`

**Subsets:** `nums`, `res`, `path`, `i`

**Subsets II:** `nums`, `res`, `path`, `start`, `i`

**Combination Sum:** `candidates`, `target`, `res`, `path`, `start`, `remain`, `i`

**Combination Sum II:** `candidates`, `target`, `res`, `path`, `start`, `remain`, `i`

**Combinations:** `n`, `k`, `res`, `path`, `start`, `i`

**Permutations:** `nums`, `res`, `path`, `used`, `i`

**Permutations II:** `nums`, `res`, `path`, `used`, `i`

**Letter Combinations of a Phone Number:** `digits`, `map`, `res`, `path`, `i`

**Word Search:** `board`, `word`, `rows`, `cols`, `r`, `c`, `i`

**Palindrome Partitioning:** `s`, `res`, `path`, `start`, `end`

**Word Break II:** `s`, `wordDict`, `words`, `res`, `path`, `start`, `end`, `word`

**N-Queens:** `n`, `res`, `board`, `cols`, `diag`, `antiDiag`, `r`, `c`

**N-Queens II:** `n`, `count`, `cols`, `diag`, `antiDiag`, `r`, `c`

**Matchsticks to Square:** `matchsticks`, `total`, `side`, `sides`, `i`, `j`

**Partition to K Equal Sum Subsets:** `nums`, `k`, `total`, `target`, `used`, `start`, `curSum`

### Tries

**Implement Trie (Prefix Tree):** `root`, `node`, `ch`, `word`, `prefix`, `str`, `children`, `isEnd`

**Design Add and Search Words Data Structure:** `root`, `node`, `ch`, `word`, `i`, `key`, `children`, `isEnd`, `dfs`

**Extra Characters in a String:** `s`, `dictionary`, `root`, `node`, `ch`, `dp`, `i`, `j`, `ans`

**Word Search II:** `board`, `words`, `root`, `node`, `child`, `ch`, `rows`, `cols`, `res`, `r`, `c`, `dirs`

### Graphs

**Island Perimeter:** `grid`, `rows`, `cols`, `r`, `c`, `perimeter`

**Verifying an Alien Dictionary:** `words`, `order`, `rank`, `i`, `j`, `w1`, `w2`, `ans`

**Find the Town Judge:** `n`, `trust`, `score`, `a`, `b`, `i`, `ans`

**Number of Islands:** `grid`, `rows`, `cols`, `r`, `c`, `count`, `dfs`

**Max Area of Island:** `grid`, `rows`, `cols`, `r`, `c`, `area`, `ans`, `dfs`

**Clone Graph:** `node`, `visited`, `dfs`, `copy`, `nei`, `val`, `neighbors`

**Walls and Gates:** `rooms`, `rows`, `cols`, `INF`, `queue`, `dirs`, `nr`, `nc`

**Rotting Oranges:** `grid`, `rows`, `cols`, `queue`, `fresh`, `minutes`, `dirs`, `nr`, `nc`

**Pacific Atlantic Water Flow:** `heights`, `rows`, `cols`, `pac`, `atl`, `dirs`, `dfs`, `res`

**Surrounded Regions:** `board`, `rows`, `cols`, `dfs`, `r`, `c`

**Open the Lock:** `deadends`, `target`, `dead`, `visited`, `queue`, `turns`, `state`, `digit`, `nextState`

**Course Schedule:** `numCourses`, `prerequisites`, `adj`, `indegree`, `queue`, `count`, `node`, `next`, `ans`

**Course Schedule II:** `numCourses`, `prerequisites`, `adj`, `indegree`, `queue`, `order`, `node`, `next`

**Graph Valid Tree:** `n`, `edges`, `dsu`, `parent`, `a`, `b`, `ra`, `rb`, `ans`

**Course Schedule IV:** `numCourses`, `prerequisites`, `queries`, `adj`, `reach`, `dfs`, `src`, `nei`, `res`

**Number of Connected Components in an Undirected Graph:** `n`, `edges`, `dsu`, `parent`, `count`, `a`, `b`, `ra`, `rb`

**Redundant Connection:** `edges`, `dsu`, `parent`, `rank`, `a`, `b`, `ra`, `rb`, `ans`

**Accounts Merge:** `accounts`, `dsu`, `parent`, `emailToId`, `email`, `groups`, `root`, `res`

**Evaluate Division:** `equations`, `values`, `queries`, `graph`, `dfs`, `src`, `dst`, `visited`, `w`, `res`

**Minimum Height Trees:** `n`, `edges`, `adj`, `degree`, `leaves`, `remaining`, `nei`, `ans`

**Word Ladder:** `beginWord`, `endWord`, `wordList`, `words`, `queue`, `visited`, `level`, `cand`

### Advanced Graphs

**Path with Minimum Effort:** `heights`, `rows`, `cols`, `effort`, `heap`, `dirs`, `e`, `r`, `c`, `nr`, `nc`, `ne`

**Network Delay Time:** `times`, `n`, `k`, `adj`, `dist`, `heap`, `node`, `nei`, `w`, `ans`

**Reconstruct Itinerary:** `tickets`, `adj`, `dests`, `res`, `visit`, `airport`, `next`

**Min Cost to Connect All Points:** `points`, `n`, `inMST`, `heap`, `total`, `count`, `cost`, `i`, `j`, `d`

**Swim in Rising Water:** `grid`, `n`, `time`, `heap`, `dirs`, `t`, `r`, `c`, `nr`, `nc`, `nt`

**Alien Dictionary:** `words`, `adj`, `indegree`, `w1`, `w2`, `minLen`, `queue`, `res`, `ch`, `nei`

**Cheapest Flights Within K Stops:** `n`, `flights`, `src`, `dst`, `k`, `dist`, `tmp`, `u`, `v`, `w`

**Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree:** `n`, `edges`, `indexed`, `dsu`, `parent`, `buildMST`, `weight`, `mstWeight`, `critical`, `pseudo`

**Build a Matrix With Conditions:** `k`, `rowConditions`, `colConditions`, `adj`, `indeg`, `order`, `rowPos`, `colPos`, `matrix`, `v`

**Greatest Common Divisor Traversal:** `nums`, `n`, `dsu`, `parent`, `primeToIndex`, `x`, `p`

## UI vs algorithm variables

Keep descriptive names for UI-only helpers:

- `dragContainer`, `historyStack`, `execState`, `trace`, `highlightedLine`

Rename only when the variable represents algorithm state shown in the debugger or code panel.

Examples:

- `current` → `num` when it means `nums[i]`
- `needed` → `need`
- `seenEntries` → `seen`
- `answerPair` → `res`
- `maxWater` → `ans`
- `result` → `res` or `ans` when it is the real return value; use `resultStatus` only for pending UI state
