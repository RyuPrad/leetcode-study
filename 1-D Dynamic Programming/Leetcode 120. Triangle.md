<iframe
  src="triangle_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| triangle | rows of the triangle, row r has r + 1 numbers |
| dp | dp[c] = cheapest path from the current row at column c down to the bottom |
| r | row being folded into dp |
| c | column in row r |
