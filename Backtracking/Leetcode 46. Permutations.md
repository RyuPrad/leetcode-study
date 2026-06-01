
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/permutations_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | input array of distinct numbers to permute |
| `res` | output list of all complete permutations |
| `path` | current partial permutation being built |
| `used` | boolean flag per index marking which numbers are already in `path` |
| `i` | loop index over `nums` at the current depth |
