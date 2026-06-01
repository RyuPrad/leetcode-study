
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/walls_and_gates_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

> [!note] Premium problem
> LeetCode 286 is a **Premium** problem; the statement here is reconstructed from the canonical multi-source BFS solution. `-1` = wall, `0` = gate, `2147483647` (`INF`, shown as ∞) = empty room. Each empty room is filled with its shortest distance to the nearest gate; unreachable rooms stay `INF`.

## Variable Pattern

| Name | Meaning |
|---|---|
| `rooms` | The `rows x cols` grid; mutated in place so each empty room holds its distance to the nearest gate. |
| `rows` | Number of rows, `rooms.length`. |
| `cols` | Number of columns, `rooms[0].length`. |
| `INF` | The empty-room sentinel `2147483647`; a cell is fillable only while it still equals `INF`. |
| `queue` | The BFS frontier of `[r, c]` cells for the current level; reassigned to `next` after each level (level-by-level multi-source BFS). |
| `dirs` | The four 4-directional moves `[[1,0],[-1,0],[0,1],[0,-1]]`. |
| `nr` | Neighbor row `r + dr` being considered for filling. |
| `nc` | Neighbor column `c + dc` being considered for filling. |
