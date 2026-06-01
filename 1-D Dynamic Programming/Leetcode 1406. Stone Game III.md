
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/1-D%20Dynamic%20Programming/stone_game_iii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `stoneValue` | The input row of stone values. Alice and Bob alternate, each taking the first 1, 2, or 3 remaining stones; both play optimally. |
| `n` | Number of stones, `stoneValue.length`. |
| `dp` | Suffix-DP array of length `n + 1`, filled **right → left**. `dp[i]` is the best achievable (current player − opponent) score margin when the game starts at index `i`; `dp[n] = 0` is the empty-suffix base case. |
| `take` | Running sum of the stones the current player grabs (1, 2, or up to 3) at index `i`. |
| `i` | Outer index, decremented from `n - 1` down to `0` — the start of the suffix being solved. |
| `k` | Inner index 0..2 choosing how many stones to take; the option value is `take - dp[i + k + 1]`, subtracting the opponent's best margin on the rest. |
| `ans` | Sign of `dp[0]`: positive → `"Alice"`, negative → `"Bob"`, zero → `"Tie"`. |
