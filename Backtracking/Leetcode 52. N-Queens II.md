
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/n_queens_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | board size (n x n) and number of queens to place |
| `count` | running counter of valid full placements (the answer) |
| `cols` | Set of columns already occupied by a queen |
| `diag` | Set of occupied `r - c` (top-left to bottom-right) diagonals |
| `antiDiag` | Set of occupied `r + c` (top-right to bottom-left) diagonals |
| `r` | current row being filled by `dfs` |
| `c` | column being tried in the current row |
