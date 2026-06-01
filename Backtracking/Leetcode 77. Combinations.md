
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/combinations_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | numbers to choose from are `1..n` |
| `k` | size each combination must reach |
| `res` | output list of all combinations |
| `path` | current partial combination being built |
| `start` | smallest number this dfs frame may choose |
| `i` | loop variable iterating `start..n` |
