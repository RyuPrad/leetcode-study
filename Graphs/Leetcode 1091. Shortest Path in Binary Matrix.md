<iframe
  src="shortest_path_in_binary_matrix_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| grid | 0 is open, 1 is blocked |
| n | side length |
| dist | dist[r][c] = cells on the shortest path to (r, c), 0 if not reached |
| queue | cells in the order they were reached |
| head | next cell to expand |
| r | row of the expanded cell |
| c | column of the expanded cell |
| dr | row step, -1 to 1 |
| dc | column step, -1 to 1 |
| nr | neighbor row |
| nc | neighbor column |
