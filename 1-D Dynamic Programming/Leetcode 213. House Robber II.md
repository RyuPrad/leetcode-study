
<iframe
  src="house_robber_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | Money in each house, arranged in a **circle** (house `0` and house `n-1` are adjacent). |
| `n` | Number of houses, `nums.length`. |
| `robLine` | Helper that solves the **linear** House Robber on a sub-array via a rolling DP. |
| `prev` | Best loot using houses up to two positions back (the `dp[i-2]` role). |
| `curr` | Best loot using houses up to the previous position (the `dp[i-1]` role); ends as the slice answer. |
| `next` | Candidate best for the current house: `max(curr, prev + x)` — skip it or rob it. |
| `x` | Current house value being considered inside `robLine`. |
| `ans` | Final answer: `max(robLine(exclude last), robLine(exclude first))`. |
