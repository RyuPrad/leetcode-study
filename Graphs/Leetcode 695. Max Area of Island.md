
<iframe
  src="max_area_of_island_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `grid` | The input matrix of numbers; `1` is land, `0` is water. DFS sinks land to `0` as it counts it. |
| `rows` | Number of rows, `grid.length`. |
| `cols` | Number of columns, `grid[0].length`. |
| `r` | Current row index (scan loop and `dfs` argument). |
| `c` | Current column index (scan loop and `dfs` argument). |
| `area` | The running area of the island currently being explored (sum that the active `dfs` chain is accumulating). |
| `ans` | Best answer so far: `Math.max(ans, dfs(r, c))` over every island seed. |
| `dfs` | Recursive flood-fill closure that returns `1 + dfs(down) + dfs(up) + dfs(right) + dfs(left)`. |
