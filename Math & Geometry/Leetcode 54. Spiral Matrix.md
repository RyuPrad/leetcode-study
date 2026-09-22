
<iframe
  src="spiral_matrix_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `matrix` | The input 2D matrix to read in spiral order. |
| `res` | The output array collecting cell values in spiral order. |
| `top` | Index of the topmost unvisited row. Increases after the top row is consumed. |
| `bottom` | Index of the bottommost unvisited row. Decreases after the bottom row is consumed. |
| `left` | Index of the leftmost unvisited column. Increases after the left column is consumed. |
| `right` | Index of the rightmost unvisited column. Decreases after the right column is consumed. |
| `i` | Row index used when walking the right column (top&rarr;bottom) and the left column (bottom&rarr;top). |
| `j` | Column index used when walking the top row (left&rarr;right) and the bottom row (right&rarr;left). |

Four boundaries enclose the unvisited region. Each loop pass peels one ring: walk the top row, then the right column, then (if rows remain) the bottom row, then (if columns remain) the left column, shrinking the matching boundary after each edge. The two `if` guards prevent re-reading a row or column in thin matrices.
