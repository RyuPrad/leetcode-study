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

### Binary Search

**Binary Search:** `nums`, `target`, `left`, `right`, `mid`, `ans`

**Search Insert Position:** `nums`, `target`, `left`, `right`, `mid`, `ans`

### Linked List

**Merge Two Sorted Lists:** `list1`, `list2`, `dummy`, `tail`, `curr`

**Reverse Linked List:** `head`, `prev`, `curr`, `next`

**Linked List Cycle:** `head`, `slow`, `fast`

**Reorder List:** `head`, `slow`, `fast`, `prev`, `curr`, `next`, `second`

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
