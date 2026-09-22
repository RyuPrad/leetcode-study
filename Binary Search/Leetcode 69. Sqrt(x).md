
<iframe
  src="sqrt_x_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| x | The non-negative integer whose integer square root (floor) we want |
| left | Lower bound of the candidate range (starts at 0) |
| right | Upper bound of the candidate range (starts at x) |
| mid | Current candidate root, `Math.floor((left + right) / 2)` |
| ans | Largest candidate found so far whose square is `<= x`; the final answer |
