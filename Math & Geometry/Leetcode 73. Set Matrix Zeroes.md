
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Math%20%26%20Geometry/set_matrix_zeroes_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| matrix | The input grid, modified in place and returned at the end |
| m | Number of rows (`matrix.length`) |
| n | Number of columns (`matrix[0].length`) |
| rows | Set of row indices that contained at least one zero (filled during pass 1) |
| cols | Set of column indices that contained at least one zero (filled during pass 1) |
| i | Outer loop index over rows in both the scan pass and the apply pass |
| j | Inner loop index over columns in both the scan pass and the apply pass |
