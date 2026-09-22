
<iframe
  src="perfect_squares_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | The target value. We want the fewest perfect squares (1, 4, 9, 16, …) that sum to it. |
| `dp` | `dp[k]` = the minimum number of perfect squares that sum to `k`. Length `n + 1`, filled with `Infinity` except `dp[0] = 0`. |
| `i` | The outer-loop value currently being solved, from `1` to `n`. |
| `j` | The inner-loop counter producing the candidate square `j * j` (bounded by `j * j <= i`). It reads `dp[i - j*j]` and proposes `dp[i - j*j] + 1`. |
