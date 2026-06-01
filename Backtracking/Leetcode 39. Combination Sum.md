
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/combination_sum_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `candidates` | array of distinct positive numbers we may reuse |
| `target` | sum each combination must reach |
| `res` | output list of all valid combinations |
| `path` | current partial candidate being built |
| `start` | first index this dfs frame may choose from |
| `remain` | target minus the sum of `path` so far |
| `i` | loop index over `candidates`, from `start` |
