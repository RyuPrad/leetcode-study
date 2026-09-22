
<iframe
  src="pacific_atlantic_water_flow_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `heights` | The `rows x cols` matrix of cell elevations. Water flows from a cell to an equal-or-lower neighbor. |
| `rows` | Number of rows, `heights.length`. |
| `cols` | Number of columns, `heights[0].length`. |
| `pac` | Boolean matrix; `pac[r][c]` is `true` once cell `(r,c)` can drain to the Pacific (top/left edges). |
| `atl` | Boolean matrix; `atl[r][c]` is `true` once cell `(r,c)` can drain to the Atlantic (bottom/right edges). |
| `dirs` | The four 4-directional moves `[[1,0],[-1,0],[0,1],[0,-1]]`. |
| `dfs` | Reverse flood-fill `(r, c, ocean, prev)`: from an ocean border, walk **uphill** (only to neighbors `>= prev`) marking every reachable cell in `ocean`. |
| `prev` | The height of the cell we came from; a neighbor is reachable only if its height is `>= prev`. |
| `res` | The answer: every `[r, c]` with `pac[r][c] && atl[r][c]` — cells that drain to **both** oceans. |
