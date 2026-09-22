
<iframe
  src="find_in_mountain_array_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `arr` | The mountain array (strictly increasing, then strictly decreasing) |
| `target` | The value we are searching for |
| `n` | `arr.length` |
| `left` | Left bound of the current search window |
| `right` | Right bound of the current search window |
| `mid` | Midpoint index, `Math.floor((left + right) / 2)` |
| `peak` | Index of the mountain's peak (found in phase 1) |
| `res` | Result of the ascending search; the final answer, or `-1` |
