
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/2-D%20Dynamic%20Programming/unique_paths_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `grid` | Input grid where `1` marks an obstacle and `0` is an open cell |
| `m` | Number of rows in the grid |
| `n` | Number of columns in the grid |
| `dp` | `dp[i][j]` = number of obstacle-free paths from `(0, 0)` to cell `(i, j)` |
| `i` | Current row index in the outer loop |
| `j` | Current column index in the inner loop |
