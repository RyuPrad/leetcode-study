
<iframe
  src="k_closest_points_to_origin_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `points` | Input list of `[x, y]` coordinates. |
| `k` | How many closest points to return. |
| `heap` | Min-heap of `[dist, x, y]` tuples, compared by `el[0]` (squared distance). |
| `dist` | Squared distance `x*x + y*y` of the current point (no `sqrt` needed for ordering). |
| `res` | Result list collecting the `k` popped (closest) points. |
| `i` | Loop counter for the `k` pops. |
