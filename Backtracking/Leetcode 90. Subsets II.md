
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/subsets_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | input array, sorted so equal values are adjacent |
| `res` | output list collecting every unique subset |
| `path` | current partial subset being built |
| `start` | index this dfs frame may begin choosing from |
| `i` | loop index scanning candidates; skipped when `nums[i] === nums[i-1]` and `i > start` |
