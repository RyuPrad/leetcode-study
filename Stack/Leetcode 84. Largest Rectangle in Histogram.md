
<iframe
  src="largest_rectangle_in_histogram_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `heights` | input histogram bar heights |
| `stack` | indices of bars whose heights are strictly increasing from bottom to top (the monotonic invariant) |
| `i` | primary loop index; runs one past the end (`i === heights.length`) so a sentinel height `h = 0` flushes the stack |
| `maxArea` | largest rectangle area found so far; on each pop, `width` spans from `i` back to the index below the popped bar |
