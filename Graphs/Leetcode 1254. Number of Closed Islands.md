<iframe
  src="number_of_closed_islands_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| grid | 0 is land, 1 is water; visited land is set to 1 |
| m | rows |
| n | columns |
| dirs | the four neighbor offsets |
| res | closed islands counted |
| r | row being scanned |
| c | column being scanned |
| closed | whether the island has stayed off the border |
| stack | cells of the island still to explore |
| y | row of the cell being explored |
| x | column of that cell |
| ny | neighbor row |
| nx | neighbor column |
