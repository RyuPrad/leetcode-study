<iframe
  src="as_far_from_land_as_possible_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| grid | 1 is land, 0 is water |
| n | side length |
| dist | dist[r][c] = distance to the nearest land, -1 if not reached |
| queue | cells in the order they were reached |
| r | row |
| c | column |
| res | largest distance found |
| head | next cell to expand |
| dr | row offset |
| dc | column offset |
| nr | neighbor row |
| nc | neighbor column |
