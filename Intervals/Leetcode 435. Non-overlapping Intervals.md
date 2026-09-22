
<iframe
  src="non_overlapping_intervals_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `intervals` | The input list, sorted in place by **END** (`a[1] - b[1]`); keeping earliest-ending intervals greedily leaves the most room for the rest. |
| `count` | The running number of intervals that must be removed — this is the returned value (a number, not a list). |
| `prevEnd` | The end of the last interval we decided to keep; the next bar overlaps when its start is `< prevEnd`. |
| `i` | Index sweeping left to right through the sorted `intervals`, starting at 1. |
