
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Math%20%26%20Geometry/rotate_image_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `matrix` | The input `n x n` matrix, rotated 90&deg; clockwise in place. |
| `n` | The side length of the square matrix (`matrix.length`). |
| `i` | Row index. In phase 1 it is the outer transpose index; in phase 2 it selects the row to reverse. |
| `j` | Column index in phase 1, starting at `i + 1` so each pair across the diagonal is swapped exactly once. |
| `temp` | Temporary holder used to swap `matrix[i][j]` with `matrix[j][i]` during the transpose. |

A 90&deg; clockwise rotation is the composition of two in-place steps: first **transpose** the matrix (swap every `(i, j)` with `(j, i)` for `j > i`), then **reverse each row**. This uses O(1) extra space.
