# Path Sum III

[Problem 437 on LeetCode](https://leetcode.com/problems/path-sum-iii/description/)

Given a binary tree and an integer targetSum, return the number of nonempty paths whose node values add to targetSum. Each path follows parent-to-child edges downward; it may start or end at any node. Count different paths separately, even when they overlap or contain the same values.

## Prefix frequencies on one branch

A prefix is the sum from the root to a position on the current branch. If the current prefix is sum, removing an earlier prefix need leaves a path of sum - need. We need that difference to equal targetSum, so look up sum - targetSum.

The Map starts with 0 → 1. This represents the position just before the root and lets a root-starting path count normally. Read the frequency before inserting the current prefix: otherwise target zero would include an empty path.

Several ancestors can have the same prefix, especially with zero and negative values. Add their full frequency, rather than checking only whether the prefix exists. A path need not reach a leaf, and a larger prefix does not permit pruning because later values can be negative.

After exploring both children, decrement this node's prefix frequency once. Delete it only if the frequency becomes zero. This restores the caller's ancestor context before another branch is visited. Leaving a prefix behind incorrectly counts paths crossing between siblings.

For [0,0,0] and target 0 there are five paths: the three single nodes and the two root-to-child paths. The children cannot be combined into a downward path.

## Reference JavaScript

```javascript
function pathSum(root, targetSum) {
  const freq = new Map();
  freq.set(0, 1);
  let count = 0;
  function dfs(node, sum) {
    if (node === null) {
      return;
    }
    sum += node.val;
    const need = sum - targetSum;
    const matches = freq.get(need) || 0;
    count += matches;
    freq.set(sum, (freq.get(sum) || 0) + 1);
    dfs(node.left, sum);
    dfs(node.right, sum);
    freq.set(sum, freq.get(sum) - 1);
    if (freq.get(sum) === 0) {
      freq.delete(sum);
    }
    return;
  }
  dfs(root, 0);
  return count;
}
```

## Variables

| Name | Meaning |
| --- | --- |
| `root` | original root of the input tree |
| `targetSum` | required sum of a nonempty downward path |
| `node` | node in the current recursive call, or null for an absent child |
| `sum` | prefix sum in this call, passed by value to its children |
| `need` | earlier prefix needed: sum - targetSum |
| `matches` | number of earlier matching prefixes read before insertion |
| `freq` | Map from ancestor prefix sums to their occurrence counts |
| `count` | total matching paths counted across the tree |

## Complexity and limits

The algorithm visits every node once: expected O(n) time with Map operations, and O(h) working space for the recursive calls and active prefix frequencies. h is the tree height, so a skewed tree can require O(n) call-stack space. The teaching visualizer additionally keeps history and draws the tree; those presentation costs are separate from the algorithm.

The coding contract follows the problem bounds: 0–1,000 nodes; integer values from -1,000,000,000 to 1,000,000,000; targetSum from -1,000 to 1,000. The local judge also limits the level-order array to 2,000 entries. Thus prefix sums and prefix-minus-target remain exact JavaScript numbers, even when they exceed the signed 32-bit range. Do not coerce sums with bitwise operators.

The visualizer uses the same numeric bounds and limits diagrams to 63 non-null nodes and 127 level-order entries. Use [] for an empty tree and null for absent children. Unreachable entries and invalid input are rejected without resetting the current walkthrough.

## Try it

- Three paths: [10,5,-3,3,2,null,11,3,-2,null,1], target 8 → 3
- Repeated zero prefixes: [0,0,0], target 0 → 5
- Sibling isolation: [1,1,1], target 0 → 0
- Overlap on a chain: [1,null,1,null,1], target 2 → 2

<iframe src="path_sum_iii_visualizer.html" width="100%" height="900" allowfullscreen></iframe>
