
<iframe
  src="range_sum_query_2d_immutable_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| matrix | input m × n grid of numbers |
| prefix | (m+1) × (n+1) prefix-sum matrix; prefix[i][j] = sum of all source cells above and left of (i, j) |
| row1 | top row of the query rectangle |
| col1 | left column of the query rectangle |
| row2 | bottom row of the query rectangle |
| col2 | right column of the query rectangle |
