
<iframe
  src="path_with_minimum_effort_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `heights` | Input grid; `heights[r][c]` is the elevation of cell `(r, c)`. |
| `rows` | Number of rows = `heights.length`. |
| `cols` | Number of columns = `heights[0].length`. |
| `effort` | `effort[r][c]` = smallest possible "max absolute height jump" along any path from `(0,0)` to `(r, c)`; starts at `Infinity`, with `effort[0][0] = 0`. |
| `heap` | Min-heap of `[e, r, c]` ordered by effort `e` (a `class MinHeap`); pops the cell reachable with the least effort. |
| `dirs` | The four orthogonal moves `[[1,0],[-1,0],[0,1],[0,-1]]`. |
| `e` | Effort popped off the heap for the current cell `(r, c)`. |
| `r`, `c` | Row and column of the cell just popped. |
| `nr`, `nc` | Row and column of a neighboring cell. |
| `ne` | Candidate effort to reach `(nr, nc)`: `max(e, |heights[nr][nc] - heights[r][c]|)`. |

## Idea
This is Dijkstra where the "distance" of a path is the **maximum** edge cost on it, not the sum. The cost of stepping from `(r,c)` to a neighbor is the absolute height difference, so a path's effort is `max(e, |Δheight|)`. Pop the least-effort cell; the first time we pop the bottom-right cell, its effort is minimal, so we can return early. The `e > effort[r][c]` check skips stale heap entries.

- Time: `O(R·C·log(R·C))`.
- Space: `O(R·C)` for the `effort` grid and heap.
