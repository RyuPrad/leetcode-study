
<iframe
  src="n_queens_visualizer.html"
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
| `res` | output array of solution boards |
| `board` | current n x n grid of `'.'` / `'Q'` |
| `cols` | Set of columns already occupied by a queen |
| `diag` | Set of occupied `r - c` (top-left to bottom-right) diagonals |
| `antiDiag` | Set of occupied `r + c` (top-right to bottom-left) diagonals |
| `r` | current row being filled by `dfs` |
| `c` | column being tried in the current row |
