
<iframe
  src="last_stone_weight_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `stones` | Input array of positive stone weights to smash together. |
| `total` | Sum of all stone weights; the two final piles must add up to this. |
| `target` | `floor(total / 2)` — the ideal size of the smaller pile; we maximize a subset sum that does not exceed it. |
| `dp` | 1-D array of length `target + 1`; `dp[j]` = the largest achievable subset sum that is `&le; j`. |
| `stone` | The current stone being considered in the outer loop (each stone used at most once). |
| `j` | Inner-loop index sweeping from `target` down to `stone`; the `dp` cell currently being updated. |
