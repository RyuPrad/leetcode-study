<iframe
  src="brick_wall_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| wall | rows of brick widths |
| edges | position → rows with a brick edge there |
| best | most rows sharing one inner edge |
| row | row being scanned |
| position | distance from the left edge after a brick |
| i | brick index in the row (the last brick is skipped) |
