
<iframe
  src="edit_distance_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `word1` | The source string we are editing; its characters label the rows (row `i` ↔ `word1[i-1]`). |
| `word2` | The target string we want to reach; its characters label the columns (col `j` ↔ `word2[j-1]`). |
| `m` | Length of `word1` (number of data rows below the empty-string row). |
| `n` | Length of `word2` (number of data columns after the empty-string column). |
| `dp` | `(m+1)×(n+1)` table where `dp[i][j]` = minimum edits to turn `word1[0..i)` into `word2[0..j)`. Column 0 = `i` (delete all), row 0 = `j` (insert all). |
| `i` | Current row index (`1..m`); selects character `word1[i-1]`. |
| `j` | Current column index (`1..n`); selects character `word2[j-1]`. |

When `word1[i-1] === word2[j-1]` the characters match, so no edit is needed: `dp[i][j] = dp[i-1][j-1]` (copy the diagonal). Otherwise `dp[i][j] = 1 + min(` up `dp[i-1][j]` = **delete**, left `dp[i][j-1]` = **insert**, diagonal `dp[i-1][j-1]` = **replace** `)`. The answer is `dp[m][n]`.
