// Original concise statements for the bundled practice contracts.
export const statements = Object.fromEntries(`
1|Return the two distinct indices whose values sum to target. Exactly one pair exists; either index order is accepted.
2|Add two nonnegative integers represented by linked lists of digits, least significant digit first. Return the sum in the same list format.
3|Return the length of the longest substring containing no repeated character.
4|Return the median of the values in two sorted arrays. At least one array is nonempty.
5|Return any longest palindromic substring of s. A palindrome reads the same in both directions.
6|Write s in a zigzag pattern on numRows rows (down the rows, then diagonally back up, repeating) and return the rows read left to right, top to bottom.
7|Reverse the decimal digits of a signed 32-bit integer. Return 0 if the reversed value falls outside the signed 32-bit range.
9|Return true if the integer x reads the same forwards and backwards, without converting it to a string.
10|Match the whole string s against pattern p. A dot matches any character; a star repeats its preceding element zero or more times. Return a boolean.
11|Each array value is the height of a vertical line at that index. Return the greatest area held between two lines and the horizontal axis.
12|Convert an integer from 1 to 3999 to a Roman numeral.
13|Convert a valid Roman numeral to its integer value, including subtractive pairs such as IV and IX.
14|Return the longest prefix shared by every string in strs. Return an empty string if none is shared.
15|Return all distinct triplets of values whose sum is zero. Each input position can be used once per triplet. Triplet order does not matter.
17|Return all letter combinations for a string of phone keypad digits 2–9. An empty digit string produces no combinations.
18|Return all distinct quadruplets summing to target. Use four different input positions; result order does not matter.
19|Remove the nth node from the end of a linked list and return its new head.
20|Return whether the bracket string is balanced and properly nested. The bracket types are (), [], and {}.
21|Merge two sorted linked lists into one sorted linked list and return its head.
22|Return every balanced string containing n pairs of parentheses, without duplicates.
23|Merge all sorted linked lists in lists into one sorted linked list.
24|Swap every two adjacent nodes of the linked list by relinking nodes (not by changing values), and return the head.
25|Reverse the nodes of a linked list in consecutive groups of k. Leave the final group unchanged if it has fewer than k nodes.
26|Remove duplicates from sorted nums in place. Return k, the number of distinct values, and put those values in the first k positions in sorted order.
27|Remove every occurrence of val from nums in place. Return the number k of retained values and put them in the first k positions. Their order may vary.
28|Return the index of the first occurrence of needle in haystack, or -1 if needle does not occur.
33|Find target in a sorted array of distinct integers that has been rotated. Return its index, or -1 if absent.
34|nums is sorted in nondecreasing order. Return [first, last], the first and last indices of target, or [-1, -1] if target is absent, in O(log n) time.
35|Return the index of target in sorted nums, or the index where it should be inserted to keep the array sorted.
36|Return whether a partially filled 9 by 9 Sudoku board has no repeated digit in any row, column, or 3 by 3 box. Dots are empty cells; solving the board is unnecessary.
39|Return unique combinations of positive candidates summing to target. A candidate may be reused any number of times.
40|Return unique combinations summing to target, using each candidate position at most once. Candidates may contain duplicates.
41|Return the smallest positive integer missing from nums.
42|Return the total rainwater trapped between nonnegative bars whose heights are given by height.
43|Multiply two nonnegative decimal integer strings and return their product as a decimal string, without leading zeros except for zero itself.
45|Each nums[i] is your maximum forward jump from i. The last index is reachable. Return the minimum number of jumps from index 0 to the last index.
46|Return every permutation of the distinct values in nums.
47|Return every distinct permutation of nums, which may contain duplicates.
48|Rotate the square matrix 90 degrees clockwise in place.
49|Group all input strings by anagram equivalence. Every occurrence must appear once. Group order and order within groups may vary.
50|Return x raised to integer power n. Negative exponents are allowed.
51|Return every placement of n queens on an n by n board so that no queens share a row, column, or diagonal. Represent each board as strings using Q and dot.
52|Return the number of valid n-queens placements on an n by n board.
53|Return the largest sum of a nonempty contiguous subarray.
54|Return the matrix values in clockwise spiral order, starting at the top-left cell.
55|Each nums[i] is your maximum forward jump from i. Return whether you can reach the final index starting at index 0.
56|Merge all overlapping closed intervals and return the merged intervals sorted by start.
57|Insert newInterval into sorted, disjoint closed intervals, merging any overlaps. Return the result sorted by start.
58|s contains English letters and spaces and has at least one word. Return the length of its last word.
59|Return an n × n matrix filled with the numbers 1 to n² in clockwise spiral order, starting at the top-left corner.
61|Rotate the linked list to the right by k places and return the new head.
62|Count paths from the top-left to the bottom-right of an m by n grid, moving only right or down.
63|Count right/down paths through a grid where 1 is blocked and 0 is open, from top-left to bottom-right.
64|Return the minimum sum along a top-left to bottom-right path through a nonnegative grid, moving only right or down.
66|Add one to a nonnegative integer represented by its decimal digits, most significant first, and return the new digits.
67|Add the two binary strings and return the sum in binary without leading zeros.
68|Pack words into lines of exactly maxWidth characters, as many words per line as fit. Spread spaces evenly between words, with extra spaces going to the leftmost gaps. The last line, and any line with one word, is left-justified and padded with spaces.
69|Return the integer part of the nonnegative square root of x.
70|Count distinct ways to climb n stairs when each move climbs one or two stairs.
71|Normalize an absolute Unix path. Resolve dot, double-dot, and repeated slashes; the result starts at root and has no trailing slash unless it is root.
72|Return the minimum insertions, deletions, and replacements needed to transform word1 into word2.
73|For every original zero in matrix, set its entire row and column to zero. Modify matrix in place.
74|Return whether target occurs in a matrix whose rows are sorted and whose first value in each row exceeds the last value in the preceding row.
75|Sort nums containing only 0, 1, and 2 in place.
76|Return a shortest substring of s containing every character occurrence in t. Return an empty string if no such window exists.
77|Return every combination of k distinct numbers chosen from 1 through n.
78|Return every subset of nums, including the empty subset. Input values are distinct; result order does not matter.
79|Return whether word can be formed by a path through horizontally or vertically adjacent board cells without reusing a cell.
80|nums is sorted. Remove extra copies in place so each value appears at most twice, keeping sorted order. Return k, the kept count; the first k positions hold the result.
81|Return whether target occurs in a rotated sorted array that may contain duplicates.
83|Delete all duplicates from a sorted linked list so that each value appears once, and return the sorted list.
84|Return the greatest rectangle area under adjacent histogram bars of width one.
86|Rearrange the linked list so that all nodes less than x come before nodes greater than or equal to x, preserving the original relative order within each part. Return the head.
88|Merge the first m sorted values of nums1 and the n sorted values of nums2 into nums1 in place. nums1 has m+n slots.
90|Return every distinct subset of nums, including the empty subset. Input values may repeat.
91|Count decodings of a digit string under 1=A through 26=Z. Codes cannot start with zero.
92|Reverse the nodes between the one-based positions left and right, inclusive, and return the list head.
93|Return every valid IP address that can be formed by inserting three dots into the digit string s, in any order. Each of the four parts is 0 to 255 with no leading zeros.
94|Return the binary tree values in inorder: left subtree, node, right subtree.
95|Return all structurally unique binary search trees that store exactly the values 1 to n, in any order.
96|Return the number of structurally unique binary search trees that store exactly the values 1 to n.
97|Return whether s3 can be formed by interleaving s1 and s2 while preserving the order within each input string.
98|Return whether a binary tree is a strict binary search tree: every left descendant is smaller, and every right descendant is larger.
100|Return whether two binary trees have identical structure and values.
101|Return true if the binary tree is a mirror of itself (symmetric around its center).
102|Return the binary tree values grouped by depth, from root level downward and left to right within each level.
103|Return the zigzag level order traversal of the tree: left to right on the first level, right to left on the next, alternating.
104|Return the number of nodes on the longest path from the root to a leaf. An empty tree has depth zero.
105|Reconstruct a binary tree from its preorder and inorder traversals, which contain the same distinct values. Return its root.
106|Given the inorder and postorder traversals of a binary tree with distinct values, build and return the tree.
108|Convert a strictly increasing array into a height-balanced binary search tree (any valid answer is accepted).
110|Return whether every node has left and right subtree heights differing by at most one.
112|Return true if the tree has a root-to-leaf path whose node values add up to targetSum.
115|Count distinct subsequences of s equal to t. A subsequence preserves order but may skip characters.
116|In a perfect binary tree, set each node's next pointer to the node on its right in the same level (null at the end of a level). Cases give the tree in level order; the output lists each level by following next, ending each level with "#".
118|Return the first numRows rows of Pascal's triangle, where each number is the sum of the two numbers directly above it.
120|Return the minimum path sum from the top of the triangle to the bottom, moving at each step to an adjacent number in the row below (index c or c + 1).
121|Return the maximum profit from one buy followed by one sell on a later day. Return zero when no profit is possible.
122|Return the maximum profit with any number of stock trades, holding at most one share at a time and selling before buying again.
124|Return the largest sum along any nonempty simple path in the binary tree. The path may start and end at any nodes.
125|Return whether s is a palindrome after ignoring nonalphanumeric characters and letter case.
127|Return the number of words in a shortest transformation from beginWord to endWord, changing one letter at a time. Every word after beginWord must be in wordList. Return zero if impossible.
128|Return the length of the longest consecutive integer sequence present in nums, regardless of input order.
129|Each root-to-leaf path of digits forms a number. Return the sum of all these numbers.
130|Change every region of O cells completely enclosed by X cells into X in place. Horizontal or vertical connection to a border keeps a region open.
131|Return every partition of s into substrings that are all palindromes. Preserve substring order within a partition.
133|Return a deep copy of an undirected connected graph. Node values are 1 through n; each node has val and neighbors. No returned node may be an original node.
134|gas[i] is fuel available at station i and cost[i] is fuel needed to reach the next station. Return the unique start index allowing one circular trip, or -1 if impossible.
135|Give every child at least one candy. A child with a higher rating than an adjacent child must receive more. Return the minimum total candies.
136|Every value occurs twice except one that occurs once. Return the single value.
138|Deep-copy a linked list whose nodes have val, next, and random pointers. random can point to any list node or null. Preserve the original list and share no nodes with it.
139|Return whether s can be segmented into one or more words from wordDict. Dictionary words may be reused.
140|Return every sentence obtained by splitting s into dictionary words separated by single spaces. Dictionary words may be reused.
141|Return whether following next pointers in the linked list encounters a cycle. The case argument pos creates a tail-to-node link; -1 means no cycle. Your function receives only head.
143|Reorder a list in place from L0,L1,…,Ln into L0,Ln,L1,Ln-1,… . Modify pointers without changing node values.
144|Return binary tree values in preorder: node, left subtree, right subtree.
145|Return binary tree values in postorder: left subtree, right subtree, node.
146|Implement LRUCache(capacity), get(key), and put(key,value). get returns -1 for a missing key. Both reads and writes make a key most recently used. When full, evict the least recently used key.
147|Sort a singly linked list with insertion sort and return the sorted head.
148|Sort the linked list in ascending order and return its head, in O(n log n) time.
149|Given distinct points on a plane, return the maximum number of points that lie on the same straight line.
150|Evaluate valid reverse Polish notation using integer operands and +, -, *, /. Division truncates toward zero.
152|Return the largest product of a nonempty contiguous subarray.
153|Return the minimum value in a rotated sorted array of distinct integers.
155|Implement a stack with push(val), pop(), top(), and getMin(). pop removes without returning a value; getMin returns the current minimum. Read/pop operations are called only on a nonempty stack.
160|Return the node at which two singly linked lists intersect, or null if they do not. Cases give listA, listB, and skipA and skipB: list B joins list A at node skipA after its first skipB nodes (equal to the list lengths when there is no intersection). The lists must keep their structure.
162|Return the index of any peak element: a value strictly greater than its neighbors, where positions outside the array count as negative infinity.
167|In a sorted array, find the unique two values summing to target. Return their increasing one-based indices.
168|Convert a positive integer into its Excel column name, where 1=A, 26=Z, and 27=AA.
169|Return the value occurring more than floor(n/2) times. Such a value is guaranteed to exist.
173|Implement BSTIterator(root) over the in-order traversal of a binary search tree, with next() returning the next smallest value and hasNext() telling whether one remains.
179|Arrange the nonnegative integers in nums to form the largest number and return it as a string (without leading zeros).
187|Return every 10-letter sequence that occurs more than once in the DNA string s, in any order.
189|Rotate nums to the right by k positions in place.
190|Reverse all 32 bits of an unsigned integer and return the unsigned result.
191|Return the number of set bits in the binary representation of n.
198|Return the largest sum obtainable by selecting nonadjacent values from nums.
199|Return the rightmost visible node value at every depth of the binary tree.
200|Count islands of 1 cells in a rectangular character grid. Land connects horizontally or vertically; 0 is water.
201|Return the bitwise AND of every integer in the inclusive range [left,right].
202|Repeatedly replace n with the sum of the squares of its decimal digits. Return whether this eventually reaches 1.
203|Remove every node of the linked list whose value equals val, and return the new head.
205|s and t have the same length. Return whether the characters of s can be replaced to get t, mapping each character to exactly one character and no two characters to the same one.
206|Reverse a singly linked list and return its new head.
207|For each [course,prerequisite] pair, the prerequisite must come first. Return whether all numCourses courses can be finished.
208|Implement Trie with insert(word), search(word), and startsWith(prefix). search requires a whole inserted word; startsWith checks whether any inserted word has that prefix.
209|Return the shortest length of a contiguous subarray of positive nums whose sum is at least target, or zero if none exists.
210|Return any ordering of all courses satisfying [course,prerequisite] pairs, or an empty array when impossible.
211|Implement WordDictionary with addWord(word) and search(word). In search only, a dot matches any single lowercase letter.
212|Return all dictionary words that can be traced through horizontally or vertically adjacent board cells without reusing a cell in a word. Return each found word once.
213|Return the largest sum of nonadjacent values arranged in a circle. The first and last positions are adjacent.
215|Return the kth largest array value, counting duplicate occurrences separately.
217|Return whether any value occurs at least twice in nums.
219|Return whether equal values occur at two distinct indices whose distance is at most k.
221|Given a matrix of "0" and "1", return the area of the largest square containing only "1".
225|Implement a last-in-first-out stack using queue operations. push(x) adds; pop returns and removes the top; top reads it; empty returns a boolean.
226|Swap every node's left and right children and return the root of the inverted binary tree.
229|Return every value occurring more than floor(n/3) times, without duplicates.
230|Return the kth smallest value, counting from one, in a binary search tree with distinct values.
232|Implement a first-in-first-out queue using stacks. push(x) adds; pop removes and returns the front; peek reads it; empty returns a boolean.
234|Return true if the values of the singly linked list read the same forwards and backwards.
235|Return the lowest node in the BST whose subtree contains both p and q, allowing either node to be its own ancestor. The case uses node values; your function receives node objects.
238|Return an array where each position is the product of every input value except the value at that position.
239|Return the maximum value of every consecutive window of length k, from left to right.
242|Return whether t is an anagram of s, with exactly the same character counts.
252|Return whether a person can attend all half-open meeting intervals without any overlaps. One meeting may start when another ends.
253|Return the minimum number of rooms needed for all half-open meeting intervals.
256|Paint n houses red, blue or green so that no two adjacent houses have the same color. costs[i][j] is the cost of painting house i with color j. Return the minimum total cost.
261|Return whether the undirected graph with nodes 0 through n-1 and the supplied edges forms one tree.
263|An ugly number is a positive integer whose prime factors are limited to 2, 3 and 5. Return true if n is an ugly number.
268|nums contains n distinct values from 0 through n. Return the one missing value.
269|Infer any valid character order from words sorted in an unknown alphabet. Return each present character once; return an empty string if the words are inconsistent.
271|Implement Codec.encode(strs) returning a string and Codec.decode(s) restoring the original string array exactly. Strings may be empty or contain separators. Encoding and decoding use separate Codec instances.
279|Return the fewest positive perfect squares whose sum is n. A square may be used repeatedly.
280|Reorder nums in place so that nums[0] <= nums[1] >= nums[2] <= nums[3] … Any valid order is accepted.
283|Move every 0 in nums to the end, in place, keeping the relative order of the nonzero values. Return nothing; the judge checks nums.
286|Fill each empty room with its distance to the nearest gate in place. Gates are 0, walls are -1, and empty rooms are 2147483647. Move horizontally or vertically; unreachable rooms stay unchanged.
287|The n+1 values are in [1,n] and exactly one value is repeated. Return that repeated value.
290|Return whether s follows pattern: a one-to-one correspondence exists between pattern letters and the words of s.
295|Implement MedianFinder with addNum(num) and findMedian(). For an even number of values, return the mean of the middle two. At least one value precedes every median query.
297|Implement serialize(root) returning a string and deserialize(data) rebuilding the exact binary tree. The judge checks the round trip; any string encoding is allowed.
300|Return the length of the longest strictly increasing subsequence of nums.
303|Implement NumArray(nums) and sumRange(left, right), which returns the sum of nums[left..right] inclusive. nums never changes.
304|Implement NumMatrix(matrix) and sumRegion(row1,col1,row2,col2). Return the sum inside each inclusive rectangle. The original matrix does not change.
309|Maximize stock-trading profit while holding at most one share. After selling, wait one whole day before buying again.
310|Return all roots producing minimum-height trees for the given undirected tree with nodes 0 through n-1.
312|Burst every balloon for maximum coins. Bursting i earns its value times its current neighbors' values. Missing outside neighbors have value 1.
322|Return the minimum number of coins needed to total amount, or -1 if impossible. Each coin denomination may be reused.
323|Count connected components of an undirected graph on nodes 0 through n-1.
329|Return the longest strictly increasing path length in a matrix, moving horizontally or vertically.
332|Use every directed flight ticket once to build an itinerary starting at JFK. A valid itinerary exists; return the lexicographically smallest one.
337|Tree nodes contain money. Return the greatest total obtainable without selecting a node and its immediate parent together.
338|Return an array of set-bit counts for every integer from 0 through n.
343|Split n into at least two positive integers to maximize their product. Return that product.
344|Reverse the array of characters in place.
347|Return the k most frequent values. The set of answers is unique; order may vary.
352|Implement SummaryRanges: addNum(value) adds a nonnegative integer to a stream, and getIntervals() returns the numbers seen so far as a sorted list of disjoint intervals [start, end].
355|Implement Twitter: postTweet(userId,tweetId), getNewsFeed(userId), follow(followerId,followeeId), and unfollow(followerId,followeeId). A feed contains up to 10 newest tweets by the user and followed users, newest first. Tweet IDs are unique.
367|Return whether num is the square of an integer, without using a built-in square root.
371|Return the sum of two signed integers without using arithmetic plus or minus in your solution.
374|Find the hidden integer in [1,n]. The supplied guess(value) returns 0 when correct, 1 when the hidden value is higher, and -1 when lower. Only n is passed to your function; pick configures the test.
377|Count ordered sequences of positive nums whose sum is target. Values are distinct and may be reused.
380|Implement RandomizedSet with insert(val) and remove(val), each returning whether the set changed, and getRandom(), which returns a uniformly random stored value. Each operation must take average O(1) time. getRandom is only called on a nonempty set; any stored value is accepted.
392|Return whether s is a subsequence of t: s can be formed by deleting zero or more characters of t without reordering the rest.
394|Decode nested repetition expressions such as 3[a2[c]]. Digits give a positive repeat count for the bracketed substring.
399|Each equation [a,b] with value v means a/b=v. Return the ratio for each query, or -1 when unknown. Equations are mutually consistent.
402|num is a nonnegative integer string without leading zeros. Remove exactly k digits to make the smallest possible number and return it without leading zeros ("0" if nothing remains).
410|Split a nonnegative array into exactly k nonempty contiguous pieces, minimizing the largest piece sum. Return that minimum.
416|Return whether the positive numbers can be partitioned into two subsets of equal sum.
417|Return cells from which water can reach both the top/left border and the bottom/right border. Water moves to neighboring cells of no greater height.
424|Return the longest substring that can be made of one repeated uppercase letter by changing at most k characters.
427|Build a quad tree for a square binary grid. A uniform region is a leaf; otherwise divide into topLeft, topRight, bottomLeft, bottomRight. Node(val,isLeaf,topLeft,topRight,bottomLeft,bottomRight) is provided.
435|Return the fewest intervals to remove so the remaining half-open intervals do not overlap.
438|Return the start indices of every substring of s that is an anagram of p, in increasing order.
441|Build a staircase with n coins where row i holds exactly i coins. Return the number of complete rows.
448|nums has n values, each in [1, n]. Return every value in [1, n] that does not appear in nums.
450|Delete key from a BST and return the new root. If absent, keep all values. Any valid BST with exactly the remaining values is accepted.
456|Return whether nums has indices i < j < k with nums[i] < nums[k] < nums[j].
460|Implement LFUCache(capacity), get(key), and put(key,value). Missing keys return -1. Evict the least frequently used key; break ties by least recently used. Reads and updates increment frequency; new keys start at frequency 1.
463|Return the perimeter of the single island in a binary grid. Land cells share sides horizontally or vertically, and the island has no lakes.
472|Return all words in the list that are made by concatenating at least two shorter words from the same list (words may repeat).
473|Return whether every positive matchstick can be used exactly once to form four equal-length sides of a square.
474|Return the size of the largest subset of strs that has at most m 0s and n 1s in total.
494|Assign plus or minus to every nums value. Count assignments whose resulting sum is target.
496|nums1 is a subset of the distinct values in nums2. For each value in nums1, return the first greater value to its right in nums2, or -1 if none exists.
502|Starting with capital w, perform at most k projects. A project requires its capital threshold and adds its profit once. Return the maximum final capital.
513|Return the leftmost value in the last row of the binary tree.
516|Return the length of the longest palindromic subsequence of s.
518|Count unordered combinations of coin denominations totaling amount. Denominations are distinct positive integers and may be reused.
523|Return whether nums has a contiguous subarray of length at least 2 whose sum is a multiple of k (0 counts as a multiple).
535|Design a Codec with encode(longUrl), returning a short URL, and decode(shortUrl), returning the original. The judge checks decode(encode(longUrl)) on the same Codec instance.
538|Change every value in the binary search tree to the original value plus the sum of all values greater than it, and return the root.
540|nums is sorted; every value appears exactly twice except one value that appears once. Return that value in O(log n) time.
543|Return the greatest number of edges on any path between two nodes in the binary tree.
554|Each row of wall lists brick widths with the same total. Draw a vertical line from top to bottom, not along either outer edge, crossing as few bricks as possible. Return that count.
560|Count contiguous, nonempty subarrays whose values sum to k.
567|Return whether s2 contains any contiguous permutation of s1.
572|Return whether a node in root starts a subtree identical in structure and values to subRoot.
605|flowerbed has 0 for empty and 1 for planted, with no two adjacent flowers. Return whether n new flowers can be planted without any two flowers being adjacent.
606|Return the preorder string of the tree where each child subtree is wrapped in parentheses, omitting empty parentheses that do not affect the one-to-one mapping (keep "()" for a missing left child when a right child exists).
617|Merge two binary trees by overlaying them: overlapping nodes sum their values, otherwise the non-null node is used. Return the merged tree.
621|Schedule unit-time tasks in any order with at least n idle or other-task intervals between equal task types. Return the shortest total time including idle intervals.
622|Implement a fixed-capacity circular queue: enQueue(value) and deQueue() return success booleans; Front() and Rear() return -1 when empty; isEmpty() and isFull() return booleans.
646|A pair [c, d] can follow [a, b] when b < c. Return the length of the longest chain that can be formed from pairs, using the pairs in any order.
647|Count all palindromic substring occurrences. Equal strings at different positions count separately.
649|Senators act cyclically in their given R/D order and optimally ban an opposing senator. Return Radiant or Dire, the winning party.
652|Return one root node for every kind of duplicate subtree (same structure and values) in the tree, in any order.
658|Return the k closest values to x in a sorted array, in ascending order. For equal distance, prefer the smaller value.
662|Return the maximum width of the binary tree: for each level, the length between its leftmost and rightmost non-null nodes, counting the null positions between them.
665|Return whether nums can become non-decreasing (nums[i] <= nums[i + 1] for every i) by changing at most one element.
669|Remove every node of the binary search tree whose value is outside [low, high], keeping the relative structure of the remaining nodes. Return the new root.
673|Return the number of longest strictly increasing subsequences in nums.
678|Return whether the string can be balanced if each star may represent an opening parenthesis, a closing parenthesis, or an empty string.
680|Return whether s can be made a palindrome by deleting at most one character.
682|Maintain scores from operations: an integer adds a score, + adds the last two, D doubles the last, and C removes the last. All operations are valid. Return the final score sum.
684|An undirected tree on nodes 1 through n has one extra edge. Return the edge to remove to restore a tree, choosing the last such edge in input order.
691|Each sticker is a word whose letters you can cut out and rearrange; you have unlimited copies of every sticker. Return the minimum number of stickers needed to spell target, or -1 if it is impossible.
695|Return the greatest size of a horizontally/vertically connected island of 1 cells, or zero if no land exists.
698|Return whether all positive nums can be divided into k nonempty subsets of equal sum.
700|Find val in a BST and return the root of its subtree, or null if absent.
701|Insert the absent val into a BST and return the new root. Any valid BST containing exactly the original values plus val is accepted.
703|Implement KthLargest(k,nums) and add(val). After each addition, return the kth largest stream value, counting duplicates. At least k values exist when add returns.
704|Find target in a strictly increasing integer array. Return its index or -1.
705|Implement MyHashSet with add(key), remove(key), and contains(key). Adding a present key or removing an absent key has no extra effect.
706|Implement MyHashMap with put(key,value), get(key), and remove(key). Missing keys return -1; putting an existing key replaces its value.
707|Implement MyLinkedList with get(index) (the value at index, or -1 if invalid), addAtHead(val), addAtTail(val), addAtIndex(index, val) (ignored if index > length) and deleteAtIndex(index) (ignored if invalid).
721|Merge accounts sharing email addresses, including transitive matches. Matching accounts have the same name. Return each name followed by its unique sorted emails; account order may vary.
724|Return the leftmost index where the sum of the values strictly to its left equals the sum strictly to its right, or -1 if there is none.
725|Split the linked list into k consecutive parts whose sizes differ by at most one, with earlier parts never smaller than later ones. Return the k part heads (null for empty parts).
735|Asteroids move along a line: positive rightward, negative leftward, absolute value is size. Colliding smaller asteroids disappear; equal sizes both disappear. Return survivors in original order.
739|For each day's temperature, return days until a strictly warmer temperature, or zero when none follows.
740|Pick nums[i] to earn nums[i] points; every element equal to nums[i] - 1 or nums[i] + 1 is then deleted. Return the maximum number of points you can earn.
743|Edges [u,v,w] give directed travel time. Return how long a signal from k takes to reach every node 1 through n, or -1 if any node is unreachable.
746|Pay cost[i] to use stair i and then climb one or two stairs. Start at stair 0 or 1. Return the least cost to move beyond the last stair.
752|Starting at 0000, rotate one digit up or down per move, wrapping between 0 and 9. Avoid deadends. Return minimum moves to target or -1.
763|Partition s into as many consecutive parts as possible so that no character appears in multiple parts. Return their lengths.
767|Rearrange every character of s so no adjacent characters are equal. Return any valid string or an empty string if impossible.
778|Each square grid elevation is a distinct integer from 0 through n*n-1. At time t you may enter cells of elevation at most t. Return the earliest time a path connects top-left to bottom-right.
783|Return the minimum difference between the values of any two different nodes in a binary search tree.
785|Return true if the nodes of the undirected graph can be split into two sets so that every edge connects a node in one set to a node in the other.
787|Return the cheapest flight cost from src to dst using at most k intermediate stops, or -1 if impossible.
802|A node is terminal if it has no outgoing edges, and safe if every path from it leads to a terminal node. Return all safe nodes in ascending order.
837|Alice starts with 0 points and draws numbers while she has fewer than k points; each draw adds an integer from 1 to maxPts, uniformly at random. Return the probability that she ends with n or fewer points.
838|Some dominoes are pushed left ("L") or right ("R"), the rest are upright ("."). A falling domino pushes its neighbor each second; a domino pushed from both sides stays upright. Return the final state.
846|Return whether all cards can be partitioned into groups of groupSize consecutive integer values.
853|Cars at distinct positions drive toward target at their given speeds. Cars cannot pass and merge into fleets when they catch up. Return how many fleets reach target.
860|Lemonade costs 5. Process bills of 5, 10, or 20 in order starting with no cash. Return whether exact change can be given to everyone.
867|Return the transpose of matrix, exchanging rows and columns.
875|Koko eats from one pile each hour at a fixed positive integer speed. Return the smallest speed that finishes all piles within h hours.
876|Return the middle node of a singly linked list; if there are two middle nodes, return the second one.
877|Two optimal players take a whole pile from either end of an even-length row. The positive pile total is odd. Return whether the first player wins.
879|n members can commit crimes; crime i needs group[i] members and earns profit[i], and a member can join only one crime. Count the subsets of crimes with total profit at least minProfit using at most n members, modulo 10^9 + 7.
881|Each boat carries at most two people with combined weight at most limit. Every person fits alone. Return the fewest boats needed.
894|Return all full binary trees (every node has 0 or 2 children) with n nodes, all values 0, in any order.
895|Implement FreqStack.push(val) and pop(). pop removes and returns the most frequent value, breaking ties by the most recent occurrence.
901|Implement StockSpanner.next(price). Return the number of consecutive days ending today with price no greater than today's price.
904|Moving right from any starting tree, pick one fruit per tree into two baskets, each holding a single fruit type, and stop at the first tree that fits neither basket. Return the most fruit you can pick.
909|Squares are numbered 1 to n² in a zigzag from the bottom-left. Each move rolls a die (1 to 6) and, if the square has a snake or ladder, follows it. Return the fewest moves to reach square n², or -1.
912|Return nums sorted in ascending order.
918|Return the greatest sum of a nonempty circular subarray, using each original position at most once.
920|Your music player has n different songs. Count the playlists of goal songs in which every song is played at least once and a song is replayed only after k other songs. Return the count modulo 10^9 + 7.
926|A binary string is monotone increasing if it is some 0s followed by some 1s. Return the minimum number of flips to make s monotone increasing.
929|In the local name (before @), dots are ignored and everything after the first + is ignored; the domain is unchanged. Return how many different addresses actually receive mail.
933|Implement RecentCounter.ping(t), returning the count of calls in the inclusive interval [t-3000,t]. Calls have strictly increasing positive timestamps.
934|An n × n grid contains exactly two islands of 1s. Return the smallest number of 0s that must be flipped to 1 to connect them.
946|pushed and popped contain the same distinct values. Return whether this pop order can result from pushing values in the pushed order onto an initially empty stack.
951|A flip swaps the left and right children of a node. Return true if root1 can be turned into root2 by some number of flips.
953|Return whether words are lexicographically sorted according to the supplied permutation of the 26 lowercase letters. A shorter prefix comes first.
958|Return true if the binary tree is complete: every level except possibly the last is full, and the last level has all its nodes as far left as possible.
973|Return k input points nearest to the origin by Euclidean distance. Any tied selection and any result order are accepted; preserve multiplicity.
977|nums is sorted in nondecreasing order. Return the squares of its values, also sorted in nondecreasing order.
978|Return the longest contiguous subarray whose adjacent comparisons strictly alternate greater-than and less-than. A single element is valid.
981|Implement TimeMap.set(key,value,timestamp) and get(key,timestamp). get returns the value at the latest set time no greater than the query time, or an empty string. Set timestamps strictly increase.
983|You travel on the given days of a year. A 1-day pass costs costs[0], a 7-day pass costs[1], and a 30-day pass costs[2]. Return the minimum cost to travel every day in days.
989|The array-form of an integer lists its digits from left to right. Given the array-form num of an integer and an integer k, return the array-form of num + k.
994|Each minute, rotten oranges (2) rot horizontally/vertically adjacent fresh oranges (1). Empty cells are 0. Return the time until no fresh oranges remain, or -1 if impossible.
997|Among people 1 through n, the town judge trusts nobody and is trusted by everyone else. Return that person or -1.
1011|Ship packages in their given order over at most days days. Return the smallest daily weight capacity needed.
1020|In a grid of 0 (sea) and 1 (land), return the number of land cells from which you cannot walk off the edge of the grid moving 4-directionally on land.
1029|costs[i] = [aCost, bCost] is the cost of flying person i to city a or city b. Send exactly half of the 2n people to each city and return the minimum total cost.
1035|Draw lines connecting nums1[i] and nums2[j] when they are equal, so that no two lines cross or share an endpoint. Return the maximum number of lines.
1041|A robot starts at (0, 0) facing north and repeats the instructions forever. Return true if it stays within some circle.
1046|Repeatedly smash the two heaviest stones. Equal weights vanish; otherwise replace them by their difference. Return the last weight or zero.
1049|Choose stone pairs to smash in any order. Equal weights vanish, otherwise their difference remains. Return the smallest possible final weight.
1071|Return the longest string that repeats a whole number of times to form both str1 and str2, or an empty string.
1091|Return the length (number of cells) of the shortest path from the top-left to the bottom-right cell of an n × n binary matrix, moving in 8 directions through 0s only, or -1 if none exists.
1094|Trips [passengers,start,end] occupy seats from start up to but excluding end. Return whether all trips fit within capacity along the route.
1095|Return the smallest index of target in a strictly rising then strictly falling MountainArray, or -1. Use arr.length() and arr.get(index); at most 100 get calls are allowed.
1129|Edges are red or blue. Return answer where answer[x] is the length of the shortest path from node 0 to x whose edge colors alternate, or -1 if no such path exists.
1137|Return Tn where T0=0, T1=T2=1, and each later term is the sum of the preceding three terms.
1140|Players alternately take the next 1 through 2*M piles, with M initially 1 and then max(M,taken). Both play optimally. Return the first player's maximum total stones.
1143|Return the length of the longest subsequence shared by text1 and text2.
1162|In an n × n grid of 0 (water) and 1 (land), find a water cell whose Manhattan distance to the nearest land is as large as possible and return that distance, or -1 if the grid has no land or no water.
1189|Using each letter of text at most once, return how many times the word "balloon" can be formed.
1209|Repeatedly remove k adjacent equal letters from s until no such group remains. Return the final string; it is unique.
1220|Count the strings of length n made of lowercase vowels where each "a" is followed only by "e", "e" only by "a" or "i", "i" by anything but "i", "o" only by "i" or "u", and "u" only by "a". Return the count modulo 10^9 + 7.
1239|Concatenate a subsequence of arr so that every character is unique. Return the maximum possible length.
1254|In a grid of 0 (land) and 1 (water), a closed island is a group of 4-directionally connected land cells completely surrounded by water. Return the number of closed islands.
1260|One shift moves every element one place to the right; the last element of each row moves to the start of the next row, and the last element of the grid moves to grid[0][0]. Return the grid after k shifts.
1268|After each character of searchWord is typed, suggest up to three products that start with the typed prefix, in lexicographic order. Return the list of suggestion lists.
1288|Remove every interval [a, b) that is covered by another interval [c, d), meaning c <= a and b <= d. Return the number of intervals that remain.
1299|Replace every element of arr with the greatest element to its right, and the last element with -1. Return arr.
1325|Delete every leaf with value target, repeating when deletion creates new target leaves. Return the remaining root or null.
1343|Return how many contiguous subarrays of length k have an average of at least threshold.
1359|Given n orders, each with a pickup and a delivery, count the sequences of all 2n stops in which every delivery comes after its own pickup. Return the count modulo 10^9 + 7.
1376|The head of a company tree informs direct reports, each of whom informs theirs; employee i needs informTime[i] minutes. Return the minutes needed to inform all employees.
1383|Choose at most k engineers. Performance is the sum of their speeds times the minimum efficiency among them. Return the maximum performance modulo 10^9 + 7.
1396|Implement UndergroundSystem with checkIn(id, stationName, t), checkOut(id, stationName, t) and getAverageTime(startStation, endStation), the average time of all completed trips between those stations.
1405|Using at most a copies of a, b copies of b, and c copies of c, return any longest string with no three equal consecutive letters.
1406|Players alternately take the next one, two, or three stones from the front. Both maximize their total value. Return Alice, Bob, or Tie according to the outcome.
1423|Take exactly k cards, each from the beginning or the end of the row. Return the maximum total points.
1443|Starting and ending at vertex 0 of an undirected tree, return the minimum seconds needed to collect all apples, where walking an edge takes 1 second.
1448|Count nodes whose value is at least every value on their path from the root.
1456|Return the largest number of vowels (a, e, i, o, u) in any substring of s with length k.
1461|Return whether every binary code of length k is a substring of the binary string s.
1462|Prerequisite pairs [a,b] mean course a precedes b. For each query [u,v], return whether u is a direct or indirect prerequisite of v. The graph is acyclic.
1466|n cities are joined by n - 1 one-way roads that form a tree when directions are ignored. Return the minimum number of roads to reverse so that every city can reach city 0.
1470|Given nums = [x1, x2, ..., xn, y1, y2, ..., yn], return [x1, y1, x2, y2, ..., xn, yn].
1472|Implement BrowserHistory(homepage) with visit(url), which clears forward history, back(steps) and forward(steps), which move at most steps pages and return the current URL.
1489|For a connected weighted graph, return [critical,pseudoCritical] edge-index arrays. Critical edges appear in every minimum spanning tree; pseudo-critical edges appear in some but not every minimum spanning tree.
1498|Count the nonempty subsequences of nums whose minimum plus maximum is at most target. Return the count modulo 1000000007.
1514|Given an undirected graph where edge i succeeds with probability succProb[i], return the maximum probability of a path from start_node to end_node, or 0 if there is none.
1523|Given two nonnegative integers low and high, return the count of odd numbers between low and high, inclusive.
1547|A stick of length n is to be cut at every position in cuts, in any order. Each cut costs the length of the piece being cut. Return the minimum total cost.
1553|Each day you may eat one orange, or n/2 oranges if n is divisible by 2, or 2n/3 oranges if n is divisible by 3. Return the minimum number of days to eat all n oranges.
1557|Given a directed acyclic graph, return the smallest set of vertices from which all nodes are reachable (any order).
1572|Return the sum of the primary and secondary diagonals of a square matrix, counting the center cell only once.
1579|Edges have type 1 (only Alice can use), 2 (only Bob) or 3 (both). Return the maximum number of edges you can remove so that both Alice and Bob can still reach every node, or -1 if that is impossible.
1584|Connect all points with minimum total Manhattan edge length. Return the weight of a minimum spanning tree.
1603|Implement ParkingSystem(big, medium, small) and addCar(carType), which parks a car in a free space of its type (1 big, 2 medium, 3 small) and returns whether it could.
1626|A team conflicts if a younger player has a strictly higher score than an older player; players of the same age never conflict. Return the highest total score of a team without conflicts.
1631|A path's effort is the largest absolute height change between neighboring cells. Return the minimum effort to travel from top-left to bottom-right.
1639|Form target left to right by taking target[i] from column c of any word; after using column c, only columns to its right may be used for later letters. Return the number of ways modulo 10^9 + 7.
1647|A string is good when no two different letters have the same frequency. Return the minimum number of characters to delete from s to make it good.
1658|Each operation removes the leftmost or rightmost element of nums and subtracts it from x. Return the minimum number of operations to reduce x exactly to 0, or -1 if impossible.
1675|You may double any odd element (once it becomes even it can only be halved) and halve any even element, any number of times. Return the minimum possible difference between the maximum and minimum element.
1721|Swap the values of the kth node from the beginning and the kth node from the end (1-indexed), and return the head.
1768|Merge word1 and word2 by alternating characters starting with word1, appending any remainder at the end.
1799|nums has 2n positive integers. In the i-th operation (1-indexed) choose two remaining numbers x and y, earn i × gcd(x, y) and remove both. Return the maximum total score after n operations.
1822|Return 1 if the product of nums is positive, -1 if it is negative, and 0 if it is zero.
1834|Tasks [enqueueTime,processingTime] run on one nonpreemptive CPU. When idle, choose an available task with shortest processing time, then smallest original index. Return execution indices.
1838|One operation increments an element of nums by 1. Using at most k operations, return the largest possible frequency of any single value.
1845|Implement SeatManager(n) for seats 1 to n, reserve() which reserves and returns the smallest unreserved seat, and unreserve(seatNumber) which gives a seat back.
1849|Return true if s can be split into two or more pieces whose numeric values are in descending order and each adjacent pair differs by exactly 1.
1851|For each query, return the length of the shortest closed interval containing it, or -1. A closed interval [l,r] has length r-l+1.
1856|The min-product of an array is its minimum value times its sum. Return the maximum min-product of any nonempty subarray of nums, modulo 10^9 + 7 (maximize before taking the modulo).
1857|The color value of a path is the count of its most frequent color. Return the largest color value of any path in the directed graph, or -1 if the graph has a cycle.
1863|For every subset, XOR its elements, with the empty subset contributing zero. Return the sum of all subset XOR values.
1866|There are n sticks with lengths 1 to n. A stick is visible from the left if no longer stick is to its left. Return the number of arrangements with exactly k visible sticks, modulo 10^9 + 7.
1871|Starting at index 0 of a binary string, jump between minJump and maxJump positions rightward, landing only on 0. Return whether the final index is reachable.
1882|Task j becomes available at second j and takes tasks[j] seconds. Each free server takes the next waiting task in order; the lightest server (smallest index on ties) is chosen. Return the server index used for each task.
1888|You may move the first character of the binary string s to its end any number of times, and flip any character. Return the minimum number of flips needed to make s alternating.
1898|Remove the characters of s at removable[0..k-1]. Return the largest k such that p is still a subsequence of s.
1899|You may combine two triplets by taking their coordinatewise maximum. Return whether some selection can produce target exactly.
1905|An island in grid2 is a sub-island if every cell of it is also land in grid1. Return the number of sub-islands in grid2.
1911|The alternating sum of a sequence is the sum of the elements at even indices minus the sum at odd indices. Return the maximum alternating sum of any subsequence of nums.
1921|Monster i starts dist[i] away from the city and moves speed[i] per minute. A weapon shoots one monster at minute 0, 1, 2, and so on. You lose when a monster reaches the city, including at the same moment the weapon is ready. Return the number of monsters eliminated before losing, or n if all are eliminated.
1929|Return the input array concatenated with itself.
1930|Return the number of distinct palindromes of length 3 that are subsequences of s.
1958|Playing color at the empty cell (rMove, cMove) is legal if it becomes an endpoint of a good line: three or more cells in a row where both endpoints are color and every middle cell is the other color. Return true if the move is legal.
1963|s has n / 2 "[" and n / 2 "]" characters. Return the minimum number of swaps (of any two positions) needed to make s balanced.
1964|For each index i, return the length of the longest non-decreasing subsequence of obstacles[0..i] that includes obstacle i.
1968|nums holds distinct integers. Return any rearrangement in which no element (other than the first and last) equals the average of its two neighbors.
1980|Given n distinct binary strings, each of length n, return any binary string of length n that does not appear in nums.
1984|Choose k scores from nums. Return the minimum possible difference between the highest and lowest chosen score.
1985|Each string in nums is an integer without leading zeros. Return the string of the k-th largest integer (duplicates count separately).
1993|Implement LockingTree(parent) with lock(num, user), unlock(num, user) and upgrade(num, user): upgrade locks num for user and unlocks all its descendants, but only if num is unlocked, it has at least one locked descendant, and no ancestor is locked.
2001|Rectangles i < j are interchangeable when width / height is equal for both. Return the number of interchangeable pairs.
2002|Choose two disjoint palindromic subsequences of s (no index used by both). Return the maximum possible product of their lengths.
2013|Implement DetectSquares.add(point) and count(point). Count axis-aligned positive-area squares having the query as one corner and three stored point occurrences as the others. Duplicate stored points multiply the count.
2017|Two robots cross a 2 × n grid from top-left to bottom-right, moving only right or down. The first collects and zeroes its path; then the second collects what remains. The first robot minimizes the second robot's total, the second maximizes it. Return the second robot's total.
2028|You observed m dice rolls; n more are missing. The mean of all n + m rolls is mean. Return any n values from 1 to 6 for the missing rolls, or an empty array if none exist.
2101|Detonating a bomb detonates every bomb within its circular range, which may continue the chain. You may detonate one bomb. Return the maximum number of bombs that can be detonated.
2130|In a linked list of even length n, node i and node n - 1 - i are twins. Return the maximum sum of a node and its twin.
2140|Questions are processed in order. Solving question i earns points[i] but you must skip the next brainpower[i] questions; you may also skip any question. Return the maximum points you can earn.
2215|Return [answer1, answer2]: the distinct values of nums1 not in nums2, and the distinct values of nums2 not in nums1. Values within each list may be in any order.
2218|Each move takes the top coin of any pile. Return the maximum total value of exactly k coins.
2300|A spell and a potion succeed when the product of their strengths is at least success. For each spell, return how many potions it succeeds with.
2306|Choose two distinct ideas, swap their first letters, and keep the pair if neither new name is in ideas. The concatenation "newA newB" is then a valid company name. Return the number of distinct valid names.
2348|Return the number of contiguous subarrays of nums that contain only 0.
2359|In a directed graph where each node has at most one outgoing edge, return the node reachable from both node1 and node2 that minimizes the maximum of the two distances (smallest index on ties), or -1.
2369|Partition nums into contiguous blocks. Each block must be two equal values, three equal values, or three consecutive increasing values. Return true if at least one valid partition exists.
2390|Each * in s removes itself and the closest remaining non-star character to its left. Return the string after all stars are processed.
2392|Place 1 through k once each in a k by k zero-filled matrix. Each row condition [a,b] puts a above b; each column condition puts a left of b. Return any valid matrix, or [] if impossible.
2402|Assign meetings in start-time order to the lowest available room index. If all rooms are busy, delay until the earliest room frees, keeping duration; break ties by room index. Return the most-used room, breaking ties by smallest index.
2405|Split s into the fewest substrings in which no letter appears more than once. Return that number.
2421|A tree has n nodes with values vals. A good path starts and ends at nodes with the same value, and every node on it has a value no larger than that. Count the good paths, including single nodes, where a path and its reverse count once.
2439|In one operation choose i > 0 with nums[i] > 0, decrease nums[i] by 1 and increase nums[i - 1] by 1. Return the minimum possible value of the maximum of nums.
2466|Build strings by repeatedly appending either zero copies of "0" or one copies of "1". A good string has length between low and high inclusive. Return the number of different good strings modulo 10^9 + 7.
2477|A tree of n cities has one representative per city who must reach city 0. Each city has a car with seats seats; driving one road costs 1 liter. Return the minimum total fuel.
2483|Closing at hour j costs 1 for every open hour before j with no customers ("N") and 1 for every closed hour from j on with customers ("Y"). Return the earliest closing hour with the minimum penalty.
2492|The score of a path is the smallest road distance on it; paths may repeat cities and roads. Cities 1 and n are connected. Return the minimum possible score of a path between them.
2542|Choose k indices. The score is the sum of nums1 at those indices times the minimum of nums2 at those indices. Return the maximum possible score.
2616|Choose p pairs of distinct indices from nums (each index used at most once) to minimize the largest absolute difference within a pair. Return that minimum; it is 0 when p = 0.
2707|Split s into nonoverlapping dictionary words and leftover characters. Return the minimum number of leftover characters. Dictionary words may be reused.
2709|Indices are adjacent when their values have gcd greater than one. Return whether every index can reach every other index through such links.
2807|Insert a node containing the greatest common divisor between each adjacent pair of list nodes. Return the head.
3133|Construct n strictly increasing positive integers whose bitwise AND is x. Return the smallest possible final value.
`.trim().split('\n').map(line=>{const [id,...text]=line.split('|');return [Number(id),text.join('|')];}));
