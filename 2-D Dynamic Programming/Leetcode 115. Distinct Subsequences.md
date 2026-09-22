
<iframe
  src="distinct_subsequences_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | The source string; its characters label the rows (row `i` ↔ `s[i-1]`). We pick subsequences out of `s`. |
| `t` | The target string; its characters label the columns (col `j` ↔ `t[j-1]`). We want subsequences equal to `t`. |
| `m` | Length of `s` (number of data rows below the empty-string row). |
| `n` | Length of `t` (number of data columns after the empty-string column). |
| `dp` | `(m+1)×(n+1)` table where `dp[i][j]` = number of distinct subsequences of `s[0..i)` that equal `t[0..j)`. Column 0 is all `1` (one way to form the empty target: delete everything). |
| `i` | Current row index (`1..m`); selects character `s[i-1]`. |
| `j` | Current column index (`1..n`); selects character `t[j-1]`. |

Every cell first inherits `dp[i-1][j]` (the cell directly above) — these are the subsequences that **skip** `s[i-1]`. When `s[i-1] === t[j-1]` the current character can also be **used**, so we add the diagonal `dp[i-1][j-1]`. The answer is `dp[m][n]`.
