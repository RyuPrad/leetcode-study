<iframe
  src="count_sub_islands_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| grid1 | first map: 1 is land |
| grid2 | second map; visited land is set to 0 |
| m | rows |
| n | columns |
| dirs | the four neighbor offsets |
| res | sub-islands counted |
| r | row being scanned |
| c | column being scanned |
| sub | whether every cell of this island is land in grid1 |
| stack | cells of the island still to explore |
| y | row of the cell being explored |
| x | column of that cell |
| ny | neighbor row |
| nx | neighbor column |
