
<iframe
  src="target_sum_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | Input array of non-negative integers; each gets a `+` or `-` sign. |
| `target` | The signed sum we want to reach. |
| `total` | Sum of all numbers; the positive subset `P` and negative subset `N` satisfy `P - N = target` and `P + N = total`. |
| `subsetSum` | `(total + target) / 2` — the sum the positive subset must hit; the problem reduces to counting subsets that add to this. |
| `dp` | 1-D array of length `subsetSum + 1`; `dp[s]` = number of subsets of `nums` that sum to exactly `s`. |
| `num` | The current number being considered in the outer loop. |
| `s` | Inner-loop index sweeping from `subsetSum` down to `num`; the `dp` cell currently being updated. |
