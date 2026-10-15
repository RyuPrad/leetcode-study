<iframe
  src="shuffle_the_array_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | [x1, ..., xn, y1, ..., yn], rearranged in place |
| n | half the length |
| i | pair being packed or unpacked |
| j | last free slot of the output, filled from the right |
| y | low 10 bits: the y value of pair i |
| x | high bits: the x value of pair i |
