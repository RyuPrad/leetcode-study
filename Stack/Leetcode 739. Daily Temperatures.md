
<iframe
  src="daily_temperatures_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `temperatures` | input array of daily temperatures |
| `stack` | indices of days awaiting a warmer day; their temperatures stay strictly decreasing top-to-bottom (the monotonic invariant) |
| `i` | primary loop index = current day |
| `j` | index popped from the stack = a day whose warmer day is now found (`j = stack.pop()`) |
| `res` | output array; `res[j] = i - j` is how many days day `j` waits for a warmer temperature |
