
<iframe
  src="merge_intervals_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `intervals` | The input list, sorted in place by start (`a[0] - b[0]`) so overlapping intervals become adjacent. |
| `res` | The merged output list; seeded with the first interval, then extended or appended as the sweep proceeds. |
| `i` | Index sweeping left to right through the sorted `intervals`, starting at 1. |
| `last` | `res[res.length - 1]`, the most recent merged interval — extended when the current bar overlaps it (`start <= last.end`). |
