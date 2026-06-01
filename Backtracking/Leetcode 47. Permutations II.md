
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/permutations_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | input array (sorted first) that may contain duplicates |
| `res` | output list of all distinct permutations |
| `path` | current partial permutation being built |
| `used` | boolean flag per index marking which numbers are already in `path` |
| `i` | loop index over `nums`; the duplicate guard compares `nums[i]` with `nums[i-1]` |
