<iframe
  src="minimum_cost_to_cut_a_stick_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | length of the stick |
| cuts | positions to cut |
| points | both ends and every cut, sorted |
| m | number of points |
| dp | dp[left][right] = cheapest way to make every cut strictly between points[left] and points[right] |
| gap | how many points apart left and right are |
| left | left end of the piece |
| right | right end of the piece |
| best | cheapest split of the piece found so far |
| mid | cut made first on this piece |
