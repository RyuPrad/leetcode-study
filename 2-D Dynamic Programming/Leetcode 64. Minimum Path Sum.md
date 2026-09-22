
<iframe
  src="minimum_path_sum_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `grid` | Input grid of non-negative costs for each cell |
| `m` | Number of rows in the grid |
| `n` | Number of columns in the grid |
| `dp` | `dp[i][j]` = minimum total cost to reach cell `(i, j)` moving only right or down |
| `i` | Current row index in the outer loop |
| `j` | Current column index in the inner loop |
