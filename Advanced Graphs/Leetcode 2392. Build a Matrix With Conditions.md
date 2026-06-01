
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Advanced%20Graphs/build_a_matrix_with_conditions_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `k` | The matrix is `k × k` and must contain each value `1..k` exactly once, with the remaining cells set to 0. |
| `rowConditions` | Pairs `[a, b]` meaning value `a` must appear in an **earlier row** than value `b`. Fed into the first topological sort. |
| `colConditions` | Pairs `[a, b]` meaning value `a` must appear in an **earlier column** than value `b`. Fed into the second, independent topological sort. |
| `adj` | Adjacency list built inside `topo(conditions)`: `adj[a]` lists every value that must come after `a` along the current axis. |
| `indeg` | Indegree array for the current axis. A value with indegree 0 has no predecessor left and can be placed next; Kahn's algorithm decrements indegrees as nodes are removed. |
| `order` | The topological order produced for one axis. Its index is the position: `order[i] = v` means value `v` takes slot `i` on that axis. If `order.length !== k`, that axis has a cycle and `topo` returns `null`. |
| `rowPos` | `Map<value, rowIndex>` derived from `rowOrder` — the row each value occupies. |
| `colPos` | `Map<value, colIndex>` derived from `colOrder` — the column each value occupies. |
| `matrix` | The `k × k` result, initialized to all zeros. Each value `v` is written at `matrix[rowPos[v]][colPos[v]]`. Returned as `[]` if either axis was impossible. |
| `v` | The value `1..k` currently being placed into the matrix at its `(rowPos[v], colPos[v])` cell. |
