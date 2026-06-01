
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/island_perimeter_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `grid` | The input matrix; `grid[r][c] === 1` is land, `0` is water. |
| `rows` | Number of rows, `grid.length`. |
| `cols` | Number of columns, `grid[0].length`. |
| `r` | Current row index in the outer scan loop. |
| `c` | Current column index in the inner scan loop. |
| `perimeter` | Running answer: each land cell adds `4`, each shared edge with the land cell above or to the left subtracts `2`. |
