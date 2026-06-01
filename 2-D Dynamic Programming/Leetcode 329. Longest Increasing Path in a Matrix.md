
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/2-D%20Dynamic%20Programming/longest_increasing_path_in_a_matrix_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `matrix` | Input grid of integers |
| `rows` | Number of rows in the matrix |
| `cols` | Number of columns in the matrix |
| `memo` | `memo[r][c]` = length of the longest strictly-increasing path that starts at cell `(r, c)` (0 = not computed yet) |
| `dirs` | The four step directions: up, down, left, right |
| `dfs` | Recursive helper that returns the longest increasing path starting at `(r, c)`, caching the result in `memo` |
| `r` | Row index of the cell currently being explored |
| `c` | Column index of the cell currently being explored |
| `nr` | Row index of a neighbor being probed (`r + dr`) |
| `nc` | Column index of a neighbor being probed (`c + dc`) |
| `best` | Longest path found so far starting at `(r, c)`; at least 1 (the cell itself) |
| `ans` | Overall answer = the longest increasing path anywhere in the matrix |
