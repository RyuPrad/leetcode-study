<iframe
  src="max_points_on_a_line_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| points | distinct points [x, y] |
| res | most points found on one line |
| i | anchor point every line passes through |
| count | slope → points on that line through the anchor |
| j | point paired with the anchor |
| dx | x distance from the anchor |
| dy | y distance from the anchor |
| slope | dy / dx, Infinity for a vertical line |
