<iframe
  src="maximal_square_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| matrix | grid of "0" and "1" |
| m | rows |
| n | columns |
| dp | dp[r][c] = side of the largest all-1 square whose bottom-right corner is cell (r - 1, c - 1) |
| side | largest side found |
| r | row in dp (matrix row r - 1) |
| c | column in dp (matrix column c - 1) |
