
<iframe
  src="transpose_matrix_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `matrix` | The input 2D matrix (`m` rows by `n` columns). |
| `m` | Number of rows in the input matrix (`matrix.length`). |
| `n` | Number of columns in the input matrix (`matrix[0].length`). |
| `res` | The output matrix, allocated as `n` rows by `m` columns and filled with zeros. |
| `i` | Outer loop index walking the rows of the source matrix (`0 .. m-1`). |
| `j` | Inner loop index walking the columns of the source matrix (`0 .. n-1`). |

The transpose flips every element across the main diagonal: the value at source position `(i, j)` is written to result position `(j, i)`. Because rows become columns, an `m x n` matrix produces an `n x m` result.
