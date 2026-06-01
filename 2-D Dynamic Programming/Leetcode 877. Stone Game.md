
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/2-D%20Dynamic%20Programming/stone_game_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `piles` | Input array of stone-pile sizes (even length). |
| `n` | Number of piles, `piles.length`. |
| `dp` | Upper-triangular table; `dp[i][j]` = best score *difference* the player to move can force on subarray `piles[i..j]`. |
| `i` | Left index of the current interval `[i..j]`. |
| `j` | Right index of the current interval, `j = i + len - 1`. |
| `len` | Current interval length (outer loop runs `2..n`); the table fills by increasing length, not row by row. |
| `ans` | Final answer `dp[0][n-1] > 0` — `true` iff player 1 (Alice) can win. |
