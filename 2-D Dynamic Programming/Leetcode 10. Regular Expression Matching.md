
<iframe
  src="regular_expression_matching_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | Input string to match; its characters label the DP table rows. |
| `p` | Pattern (may contain `.` and `*`); its tokens label the DP table columns. |
| `m` | Length of `s` (number of grid rows beyond row 0). |
| `n` | Length of `p` (number of grid columns beyond column 0). |
| `dp` | Boolean `(m+1)×(n+1)` table; `dp[i][j]` is true if `s[0..i)` matches the pattern prefix `p[0..j)`. |
| `i` | Current row index (chars of `s` consumed so far). |
| `j` | Current column index (tokens of `p` consumed so far). |
