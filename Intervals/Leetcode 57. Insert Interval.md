
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Intervals/insert_interval_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `intervals` | The input list of non-overlapping intervals, already sorted by start. |
| `newInterval` | The interval to insert; it grows in Phase 2 as overlapping intervals are absorbed (`[min(start), max(end)]`). |
| `res` | The output list of intervals being assembled across the three phases. |
| `i` | Index sweeping left to right through `intervals`. |
| `n` | `intervals.length`, the fixed loop bound. |
