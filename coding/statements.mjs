// Original concise statements for the bundled practice contracts.
export const statements = Object.fromEntries(`
1|Return the two distinct indices whose values sum to target. Exactly one pair exists; either index order is accepted.
2|Add two nonnegative integers represented by linked lists of digits, least significant digit first. Return the sum in the same list format.
3|Return the length of the longest substring containing no repeated character.
4|Return the median of the values in two sorted arrays. At least one array is nonempty.
5|Return any longest palindromic substring of s. A palindrome reads the same in both directions.
7|Reverse the decimal digits of a signed 32-bit integer. Return 0 if the reversed value falls outside the signed 32-bit range.
10|Match the whole string s against pattern p. A dot matches any character; a star repeats its preceding element zero or more times. Return a boolean.
11|Each array value is the height of a vertical line at that index. Return the greatest area held between two lines and the horizontal axis.
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
25|Reverse the nodes of a linked list in consecutive groups of k. Leave the final group unchanged if it has fewer than k nodes.
26|Remove duplicates from sorted nums in place. Return k, the number of distinct values, and put those values in the first k positions in sorted order.
27|Remove every occurrence of val from nums in place. Return the number k of retained values and put them in the first k positions. Their order may vary.
33|Find target in a sorted array of distinct integers that has been rotated. Return its index, or -1 if absent.
34|Return the first and last indices of target in nondecreasing nums, or [-1, -1] if it is absent. Duplicates and an empty array are allowed. Use O(log n) time.
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
62|Count paths from the top-left to the bottom-right of an m by n grid, moving only right or down.
63|Count right/down paths through a grid where 1 is blocked and 0 is open, from top-left to bottom-right.
64|Return the minimum sum along a top-left to bottom-right path through a nonnegative grid, moving only right or down.
66|Add one to a nonnegative integer represented by its decimal digits, most significant first, and return the new digits.
67|Add the two binary strings and return the sum in binary without leading zeros.
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
81|Return whether target occurs in a rotated sorted array that may contain duplicates.
84|Return the greatest rectangle area under adjacent histogram bars of width one.
88|Merge the first m sorted values of nums1 and the n sorted values of nums2 into nums1 in place. nums1 has m+n slots.
90|Return every distinct subset of nums, including the empty subset. Input values may repeat.
91|Count decodings of a digit string under 1=A through 26=Z. Codes cannot start with zero.
92|Reverse the nodes between the one-based positions left and right, inclusive, and return the list head.
94|Return the binary tree values in inorder: left subtree, node, right subtree.
97|Return whether s3 can be formed by interleaving s1 and s2 while preserving the order within each input string.
98|Return whether a binary tree is a strict binary search tree: every left descendant is smaller, and every right descendant is larger.
100|Return whether two binary trees have identical structure and values.
102|Return the binary tree values grouped by depth, from root level downward and left to right within each level.
104|Return the number of nodes on the longest path from the root to a leaf. An empty tree has depth zero.
105|Reconstruct a binary tree from its preorder and inorder traversals, which contain the same distinct values. Return its root.
110|Return whether every node has left and right subtree heights differing by at most one.
115|Count distinct subsequences of s equal to t. A subsequence preserves order but may skip characters.
121|Return the maximum profit from one buy followed by one sell on a later day. Return zero when no profit is possible.
122|Return the maximum profit with any number of stock trades, holding at most one share at a time and selling before buying again.
124|Return the largest sum along any nonempty simple path in the binary tree. The path may start and end at any nodes.
125|Return whether s is a palindrome after ignoring nonalphanumeric characters and letter case.
127|Return the number of words in a shortest transformation from beginWord to endWord, changing one letter at a time. Every word after beginWord must be in wordList. Return zero if impossible.
128|Return the length of the longest consecutive integer sequence present in nums, regardless of input order.
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
150|Evaluate valid reverse Polish notation using integer operands and +, -, *, /. Division truncates toward zero.
152|Return the largest product of a nonempty contiguous subarray.
153|Return the minimum value in a rotated sorted array of distinct integers.
155|Implement a stack with push(val), pop(), top(), and getMin(). pop removes without returning a value; getMin returns the current minimum. Read/pop operations are called only on a nonempty stack.
167|In a sorted array, find the unique two values summing to target. Return their increasing one-based indices.
168|Convert a positive integer into its Excel column name, where 1=A, 26=Z, and 27=AA.
169|Return the value occurring more than floor(n/2) times. Such a value is guaranteed to exist.
189|Rotate nums to the right by k positions in place.
190|Reverse all 32 bits of an unsigned integer and return the unsigned result.
191|Return the number of set bits in the binary representation of n.
198|Return the largest sum obtainable by selecting nonadjacent values from nums.
199|Return the rightmost visible node value at every depth of the binary tree.
200|Count islands of 1 cells in a rectangular character grid. Land connects horizontally or vertically; 0 is water.
201|Return the bitwise AND of every integer in the inclusive range [left,right].
202|Repeatedly replace n with the sum of the squares of its decimal digits. Return whether this eventually reaches 1.
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
225|Implement a last-in-first-out stack using queue operations. push(x) adds; pop returns and removes the top; top reads it; empty returns a boolean.
226|Swap every node's left and right children and return the root of the inverted binary tree.
229|Return every value occurring more than floor(n/3) times, without duplicates.
230|Return the kth smallest value, counting from one, in a binary search tree with distinct values.
232|Implement a first-in-first-out queue using stacks. push(x) adds; pop removes and returns the front; peek reads it; empty returns a boolean.
235|Return the lowest node in the BST whose subtree contains both p and q, allowing either node to be its own ancestor. The case uses node values; your function receives node objects.
238|Return an array where each position is the product of every input value except the value at that position.
239|Return the maximum value of every consecutive window of length k, from left to right.
242|Return whether t is an anagram of s, with exactly the same character counts.
252|Return whether a person can attend all half-open meeting intervals without any overlaps. One meeting may start when another ends.
253|Return the minimum number of rooms needed for all half-open meeting intervals.
261|Return whether the undirected graph with nodes 0 through n-1 and the supplied edges forms one tree.
268|nums contains n distinct values from 0 through n. Return the one missing value.
269|Infer any valid character order from words sorted in an unknown alphabet. Return each present character once; return an empty string if the words are inconsistent.
271|Implement Codec.encode(strs) returning a string and Codec.decode(s) restoring the original string array exactly. Strings may be empty or contain separators. Encoding and decoding use separate Codec instances.
279|Return the fewest positive perfect squares whose sum is n. A square may be used repeatedly.
286|Fill each empty room with its distance to the nearest gate in place. Gates are 0, walls are -1, and empty rooms are 2147483647. Move horizontally or vertically; unreachable rooms stay unchanged.
287|The n+1 values are in [1,n] and exactly one value is repeated. Return that repeated value.
295|Implement MedianFinder with addNum(num) and findMedian(). For an even number of values, return the mean of the middle two. At least one value precedes every median query.
297|Implement serialize(root) returning a string and deserialize(data) rebuilding the exact binary tree. The judge checks the round trip; any string encoding is allowed.
300|Return the length of the longest strictly increasing subsequence of nums.
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
355|Implement Twitter: postTweet(userId,tweetId), getNewsFeed(userId), follow(followerId,followeeId), and unfollow(followerId,followeeId). A feed contains up to 10 newest tweets by the user and followed users, newest first. Tweet IDs are unique.
371|Return the sum of two signed integers without using arithmetic plus or minus in your solution.
374|Find the hidden integer in [1,n]. The supplied guess(value) returns 0 when correct, 1 when the hidden value is higher, and -1 when lower. Only n is passed to your function; pick configures the test.
377|Count ordered sequences of positive nums whose sum is target. Values are distinct and may be reused.
394|Decode nested repetition expressions such as 3[a2[c]]. Digits give a positive repeat count for the bracketed substring.
399|Each equation [a,b] with value v means a/b=v. Return the ratio for each query, or -1 when unknown. Equations are mutually consistent.
410|Split a nonnegative array into exactly k nonempty contiguous pieces, minimizing the largest piece sum. Return that minimum.
416|Return whether the positive numbers can be partitioned into two subsets of equal sum.
417|Return cells from which water can reach both the top/left border and the bottom/right border. Water moves to neighboring cells of no greater height.
424|Return the longest substring that can be made of one repeated uppercase letter by changing at most k characters.
427|Build a quad tree for a square binary grid. A uniform region is a leaf; otherwise divide into topLeft, topRight, bottomLeft, bottomRight. Node(val,isLeaf,topLeft,topRight,bottomLeft,bottomRight) is provided.
435|Return the fewest intervals to remove so the remaining half-open intervals do not overlap.
450|Delete key from a BST and return the new root. If absent, keep all values. Any valid BST with exactly the remaining values is accepted.
460|Implement LFUCache(capacity), get(key), and put(key,value). Missing keys return -1. Evict the least frequently used key; break ties by least recently used. Reads and updates increment frequency; new keys start at frequency 1.
463|Return the perimeter of the single island in a binary grid. Land cells share sides horizontally or vertically, and the island has no lakes.
473|Return whether every positive matchstick can be used exactly once to form four equal-length sides of a square.
494|Assign plus or minus to every nums value. Count assignments whose resulting sum is target.
502|Starting with capital w, perform at most k projects. A project requires its capital threshold and adds its profit once. Return the maximum final capital.
518|Count unordered combinations of coin denominations totaling amount. Denominations are distinct positive integers and may be reused.
543|Return the greatest number of edges on any path between two nodes in the binary tree.
560|Count contiguous, nonempty subarrays whose values sum to k.
567|Return whether s2 contains any contiguous permutation of s1.
572|Return whether a node in root starts a subtree identical in structure and values to subRoot.
621|Schedule unit-time tasks in any order with at least n idle or other-task intervals between equal task types. Return the shortest total time including idle intervals.
622|Implement a fixed-capacity circular queue: enQueue(value) and deQueue() return success booleans; Front() and Rear() return -1 when empty; isEmpty() and isFull() return booleans.
647|Count all palindromic substring occurrences. Equal strings at different positions count separately.
649|Senators act cyclically in their given R/D order and optimally ban an opposing senator. Return Radiant or Dire, the winning party.
658|Return the k closest values to x in a sorted array, in ascending order. For equal distance, prefer the smaller value.
678|Return whether the string can be balanced if each star may represent an opening parenthesis, a closing parenthesis, or an empty string.
680|Return whether s can be made a palindrome by deleting at most one character.
682|Maintain scores from operations: an integer adds a score, + adds the last two, D doubles the last, and C removes the last. All operations are valid. Return the final score sum.
684|An undirected tree on nodes 1 through n has one extra edge. Return the edge to remove to restore a tree, choosing the last such edge in input order.
695|Return the greatest size of a horizontally/vertically connected island of 1 cells, or zero if no land exists.
698|Return whether all positive nums can be divided into k nonempty subsets of equal sum.
700|Find val in a BST and return the root of its subtree, or null if absent.
701|Insert the absent val into a BST and return the new root. Any valid BST containing exactly the original values plus val is accepted.
703|Implement KthLargest(k,nums) and add(val). After each addition, return the kth largest stream value, counting duplicates. At least k values exist when add returns.
704|Find target in a strictly increasing integer array. Return its index or -1.
705|Implement MyHashSet with add(key), remove(key), and contains(key). Adding a present key or removing an absent key has no extra effect.
706|Implement MyHashMap with put(key,value), get(key), and remove(key). Missing keys return -1; putting an existing key replaces its value.
721|Merge accounts sharing email addresses, including transitive matches. Matching accounts have the same name. Return each name followed by its unique sorted emails; account order may vary.
735|Asteroids move along a line: positive rightward, negative leftward, absolute value is size. Colliding smaller asteroids disappear; equal sizes both disappear. Return survivors in original order.
739|For each day's temperature, return days until a strictly warmer temperature, or zero when none follows.
743|Edges [u,v,w] give directed travel time. Return how long a signal from k takes to reach every node 1 through n, or -1 if any node is unreachable.
746|Pay cost[i] to use stair i and then climb one or two stairs. Start at stair 0 or 1. Return the least cost to move beyond the last stair.
752|Starting at 0000, rotate one digit up or down per move, wrapping between 0 and 9. Avoid deadends. Return minimum moves to target or -1.
763|Partition s into as many consecutive parts as possible so that no character appears in multiple parts. Return their lengths.
767|Rearrange every character of s so no adjacent characters are equal. Return any valid string or an empty string if impossible.
778|Each square grid elevation is a distinct integer from 0 through n*n-1. At time t you may enter cells of elevation at most t. Return the earliest time a path connects top-left to bottom-right.
787|Return the cheapest flight cost from src to dst using at most k intermediate stops, or -1 if impossible.
846|Return whether all cards can be partitioned into groups of groupSize consecutive integer values.
853|Cars at distinct positions drive toward target at their given speeds. Cars cannot pass and merge into fleets when they catch up. Return how many fleets reach target.
860|Lemonade costs 5. Process bills of 5, 10, or 20 in order starting with no cash. Return whether exact change can be given to everyone.
867|Return the transpose of matrix, exchanging rows and columns.
875|Koko eats from one pile each hour at a fixed positive integer speed. Return the smallest speed that finishes all piles within h hours.
877|Two optimal players take a whole pile from either end of an even-length row. The positive pile total is odd. Return whether the first player wins.
881|Each boat carries at most two people with combined weight at most limit. Every person fits alone. Return the fewest boats needed.
895|Implement FreqStack.push(val) and pop(). pop removes and returns the most frequent value, breaking ties by the most recent occurrence.
901|Implement StockSpanner.next(price). Return the number of consecutive days ending today with price no greater than today's price.
912|Return nums sorted in ascending order.
918|Return the greatest sum of a nonempty circular subarray, using each original position at most once.
933|Implement RecentCounter.ping(t), returning the count of calls in the inclusive interval [t-3000,t]. Calls have strictly increasing positive timestamps.
953|Return whether words are lexicographically sorted according to the supplied permutation of the 26 lowercase letters. A shorter prefix comes first.
973|Return k input points nearest to the origin by Euclidean distance. Any tied selection and any result order are accepted; preserve multiplicity.
978|Return the longest contiguous subarray whose adjacent comparisons strictly alternate greater-than and less-than. A single element is valid.
981|Implement TimeMap.set(key,value,timestamp) and get(key,timestamp). get returns the value at the latest set time no greater than the query time, or an empty string. Set timestamps strictly increase.
994|Each minute, rotten oranges (2) rot horizontally/vertically adjacent fresh oranges (1). Empty cells are 0. Return the time until no fresh oranges remain, or -1 if impossible.
997|Among people 1 through n, the town judge trusts nobody and is trusted by everyone else. Return that person or -1.
1011|Ship packages in their given order over at most days days. Return the smallest daily weight capacity needed.
1046|Repeatedly smash the two heaviest stones. Equal weights vanish; otherwise replace them by their difference. Return the last weight or zero.
1049|Choose stone pairs to smash in any order. Equal weights vanish, otherwise their difference remains. Return the smallest possible final weight.
1071|Return the longest string that repeats a whole number of times to form both str1 and str2, or an empty string.
1094|Trips [passengers,start,end] occupy seats from start up to but excluding end. Return whether all trips fit within capacity along the route.
1095|Return the smallest index of target in a strictly rising then strictly falling MountainArray, or -1. Use arr.length() and arr.get(index); at most 100 get calls are allowed.
1137|Return Tn where T0=0, T1=T2=1, and each later term is the sum of the preceding three terms.
1140|Players alternately take the next 1 through 2*M piles, with M initially 1 and then max(M,taken). Both play optimally. Return the first player's maximum total stones.
1143|Return the length of the longest subsequence shared by text1 and text2.
1325|Delete every leaf with value target, repeating when deletion creates new target leaves. Return the remaining root or null.
1405|Using at most a copies of a, b copies of b, and c copies of c, return any longest string with no three equal consecutive letters.
1406|Players alternately take the next one, two, or three stones from the front. Both maximize their total value. Return Alice, Bob, or Tie according to the outcome.
1448|Count nodes whose value is at least every value on their path from the root.
1462|Prerequisite pairs [a,b] mean course a precedes b. For each query [u,v], return whether u is a direct or indirect prerequisite of v. The graph is acyclic.
1489|For a connected weighted graph, return [critical,pseudoCritical] edge-index arrays. Critical edges appear in every minimum spanning tree; pseudo-critical edges appear in some but not every minimum spanning tree.
1584|Connect all points with minimum total Manhattan edge length. Return the weight of a minimum spanning tree.
1631|A path's effort is the largest absolute height change between neighboring cells. Return the minimum effort to travel from top-left to bottom-right.
1768|Merge word1 and word2 by alternating characters starting with word1, appending any remainder at the end.
1834|Tasks [enqueueTime,processingTime] run on one nonpreemptive CPU. When idle, choose an available task with shortest processing time, then smallest original index. Return execution indices.
1851|For each query, return the length of the shortest closed interval containing it, or -1. A closed interval [l,r] has length r-l+1.
1863|For every subset, XOR its elements, with the empty subset contributing zero. Return the sum of all subset XOR values.
1871|Starting at index 0 of a binary string, jump between minJump and maxJump positions rightward, landing only on 0. Return whether the final index is reachable.
1899|You may combine two triplets by taking their coordinatewise maximum. Return whether some selection can produce target exactly.
1929|Return the input array concatenated with itself.
2013|Implement DetectSquares.add(point) and count(point). Count axis-aligned positive-area squares having the query as one corner and three stored point occurrences as the others. Duplicate stored points multiply the count.
2392|Place 1 through k once each in a k by k zero-filled matrix. Each row condition [a,b] puts a above b; each column condition puts a left of b. Return any valid matrix, or [] if impossible.
2402|Assign meetings in start-time order to the lowest available room index. If all rooms are busy, delay until the earliest room frees, keeping duration; break ties by room index. Return the most-used room, breaking ties by smallest index.
2707|Split s into nonoverlapping dictionary words and leftover characters. Return the minimum number of leftover characters. Dictionary words may be reused.
2709|Indices are adjacent when their values have gcd greater than one. Return whether every index can reach every other index through such links.
2807|Insert a node containing the greatest common divisor between each adjacent pair of list nodes. Return the head.
3133|Construct n strictly increasing positive integers whose bitwise AND is x. Return the smallest possible final value.
`.trim().split('\n').map(line=>{const [id,...text]=line.split('|');return [Number(id),text.join('|')];}));
