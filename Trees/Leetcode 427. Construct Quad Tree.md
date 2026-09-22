
<iframe
  src="construct_quad_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `grid` | the n x n grid of 0s and 1s (n is a power of 2) being encoded |
| `r` | top row of the current block under consideration |
| `c` | left column of the current block under consideration |
| `n` | side length of the current block |
| `same` | whether every cell in the block equals the top-left cell; if true the block is a leaf, otherwise it splits into four `half x half` quadrants |
