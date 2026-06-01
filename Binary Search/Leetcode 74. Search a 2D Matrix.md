
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Binary%20Search/search_a_2d_matrix_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| matrix | The row-sorted 2D grid; row-major order makes it one sorted sequence |
| target | The value we are searching for |
| m | Number of rows, `matrix.length` |
| n | Number of columns, `matrix[0].length` |
| left | Lower bound of the virtual 1-D index range (starts at 0) |
| right | Upper bound of the virtual 1-D index range (starts at m*n - 1) |
| mid | Current virtual index; the cell is `matrix[Math.floor(mid / n)][mid % n]` |
