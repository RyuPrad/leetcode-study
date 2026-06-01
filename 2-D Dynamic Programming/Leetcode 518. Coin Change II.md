
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/2-D%20Dynamic%20Programming/coin_change_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `amount` | Target amount we want to make change for. |
| `coins` | Array of distinct coin denominations (unlimited supply of each). |
| `n` | Number of coins, `coins.length`; the table has `n + 1` rows. |
| `dp` | 2-D table; `dp[i][a]` = number of combinations using the first `i` coins that sum to amount `a`. Row 0 = "no coins"; column 0 = 1 (empty combination). |
| `i` | Outer-loop row index, 1..n; selects the coin `coins[i - 1]` now available. |
| `a` | Inner-loop column index, 1..amount; the sub-amount currently being solved. |
| `coin` | The denomination for row `i`, i.e. `coins[i - 1]`. |
