
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/2-D%20Dynamic%20Programming/longest_common_subsequence_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `text1` | First input string; its characters label the rows of the DP table (row `i` ↔ `text1[i-1]`). |
| `text2` | Second input string; its characters label the columns (col `j` ↔ `text2[j-1]`). |
| `m` | Length of `text1` (number of data rows below the empty-string row). |
| `n` | Length of `text2` (number of data columns after the empty-string column). |
| `dp` | `(m+1)×(n+1)` table where `dp[i][j]` = length of the LCS of `text1[0..i)` and `text2[0..j)`. Row 0 / col 0 are all `0` (empty string). |
| `i` | Current row index (`1..m`); selects character `text1[i-1]`. |
| `j` | Current column index (`1..n`); selects character `text2[j-1]`. |

When `text1[i-1] === text2[j-1]` the characters match, so `dp[i][j] = dp[i-1][j-1] + 1` (extend the diagonal). Otherwise `dp[i][j] = max(dp[i-1][j], dp[i][j-1])` (carry the better of the cell above or the cell to the left). The answer is `dp[m][n]`.
