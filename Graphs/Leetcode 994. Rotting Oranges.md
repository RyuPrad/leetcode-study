
<iframe
  src="rotting_oranges_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `grid` | The input matrix; `0` empty, `1` fresh orange, `2` rotten orange. BFS flips fresh to rotten. |
| `rows` | Number of rows, `grid.length`. |
| `cols` | Number of columns, `grid[0].length`. |
| `queue` | Current BFS frontier of rotten cells `[r, c]`; one full sweep of it equals one minute. |
| `fresh` | Count of fresh oranges still left; the loop stops when it reaches `0`. |
| `minutes` | Running answer: BFS levels elapsed. Returned if `fresh === 0`, otherwise `-1`. |
| `dirs` | The four 4-directional offsets `[[1,0],[-1,0],[0,1],[0,-1]]`. |
| `nr` | Neighbor row, `r + dr`. |
| `nc` | Neighbor column, `c + dc`. |
