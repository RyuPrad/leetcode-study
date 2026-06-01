
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Advanced%20Graphs/swim_in_rising_water_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `grid` | Input `n × n` grid; `grid[r][c]` is the elevation of cell `(r, c)`. Water level rises by 1 each time unit. |
| `n` | Side length of the square grid = `grid.length`. |
| `time` | `time[r][c]` = earliest moment you can be standing on `(r, c)` = the smallest possible "max cell value" along a path from `(0,0)`; starts at `Infinity`, with `time[0][0] = grid[0][0]`. |
| `heap` | Min-heap of `[t, r, c]` ordered by time `t` (a `class MinHeap`); pops the cell reachable at the earliest time. |
| `dirs` | The four orthogonal moves `[[1,0],[-1,0],[0,1],[0,-1]]`. |
| `t` | Time popped off the heap for the current cell `(r, c)`. |
| `r`, `c` | Row and column of the cell just popped. |
| `nr`, `nc` | Row and column of a neighboring cell. |
| `nt` | Candidate time to reach `(nr, nc)`: `max(t, grid[nr][nc])` — you must wait until the water covers the neighbor's elevation. |

## Idea
Dijkstra where a path's cost is the **maximum** cell value along it. To move onto a neighbor you must wait until the rising water reaches that cell's elevation, so the arrival time is `max(t, grid[nr][nc])`. Pop the earliest-reachable cell; because the heap pops in non-decreasing time, the first pop of the bottom-right cell gives the minimum time to swim there, and we return it. The `t > time[r][c]` check discards stale heap entries.

- Time: `O(n²·log n)`.
- Space: `O(n²)` for the `time` grid and heap.
