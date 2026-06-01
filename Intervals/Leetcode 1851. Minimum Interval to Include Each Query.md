
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Intervals/minimum_interval_to_include_each_query_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `intervals` | Array of `[left, right]` intervals, sorted ascending by start. |
| `queries` | The query points, answered in their original order in the output. |
| `sortedQueries` | `[q, idx]` pairs sorted by `q`; lets us sweep queries left to right (offline). |
| `res` | Answer array, filled with `-1`; `res[idx]` gets the smallest covering size per original index. |
| `heap` | Min-heap of `[size, end]` for intervals whose start `<= q`; ordered by interval size. |
| `i` | Pointer into `intervals`; only moves forward as queries increase. |
| `q`, `idx` | Current query value and its original index in `queries`. |
| `l`, `r` | Left/right endpoints of the interval being pushed; size is `r - l + 1`. |
