<iframe
  src="shortest_bridge_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| grid | 1 is land, 0 is water; cells reached from the first island become 2 |
| n | side length |
| dirs | the four neighbor offsets |
| start | first land cell found |
| r | row being scanned |
| c | column being scanned |
| queue | current BFS level |
| stack | cells of the first island still to explore |
| y | row of the cell being expanded |
| x | column of that cell |
| ny | neighbor row |
| nx | neighbor column |
| distance | water cells crossed so far |
| next | the next BFS level |
