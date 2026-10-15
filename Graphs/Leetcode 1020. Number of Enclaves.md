<iframe
  src="number_of_enclaves_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| grid | 1 is land, 0 is sea; land that can walk off is cleared to 0 |
| m | rows |
| n | columns |
| dirs | the four neighbor offsets |
| stack | land cells connected to the border, still to explore |
| r | row being scanned |
| c | column being scanned |
| y | row of the cell being explored |
| x | column of that cell |
| ny | neighbor row |
| nx | neighbor column |
| res | land cells left |
| row | row being summed |
| value | cell being added |
