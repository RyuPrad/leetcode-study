
<iframe
  src="stone_game_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `piles` | Input array of stone-pile sizes. |
| `n` | Number of piles, `piles.length`. |
| `suffix` | Suffix-sum array; `suffix[i]` = total stones in `piles[i..n-1]`. Built right-to-left. |
| `dp` | Table indexed by `(i, M)`; `dp[i][M]` = max stones the player to move can secure starting at index `i` when allowed to take `1..2M` piles. |
| `i` | Current starting pile index (outer loop runs `n-1` down to `0`). |
| `m` | Current `M` value (how many piles may be taken is `1..2M`). |
| `x` | Candidate number of piles taken this turn, scanned `1..2M`. |
| `best` | Running maximum over `x` of `suffix[i] - dp[i+x][max(M, x)]`. |
| `ans` | Final answer `dp[0][1]`. |
