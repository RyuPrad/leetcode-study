
<iframe
  src="interleaving_string_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s1` | First source string; its characters label the DP table rows. |
| `s2` | Second source string; its characters label the DP table columns. |
| `s3` | Target string we test as an interleaving of `s1` and `s2`. |
| `m` | Length of `s1` (number of grid rows beyond row 0). |
| `n` | Length of `s2` (number of grid columns beyond column 0). |
| `dp` | Boolean `(m+1)×(n+1)` table; `dp[i][j]` is true if `s3[0..i+j)` is an interleaving of `s1[0..i)` and `s2[0..j)`. |
| `i` | Current row index (chars of `s1` consumed so far). |
| `j` | Current column index (chars of `s2` consumed so far). |
