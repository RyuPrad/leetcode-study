
<iframe
  src="min_cost_to_connect_all_points_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `points` | Input array of `[x, y]` coordinates; the graph is complete with edge weights = Manhattan distance `|x1-x2| + |y1-y2|`. |
| `n` | Number of points (nodes). The MST has exactly `n - 1` edges and `total` is minimized. |
| `inMST` | Boolean array of length `n`; `inMST[i]` is `true` once node `i` has been pulled into the growing tree. Prim's "visited" set. |
| `heap` | A `MinHeap` of `[cost, node]` entries ordered by `cost`. Holds candidate edges crossing from the tree to outside nodes (the frontier). Stale duplicates are tolerated. |
| `total` | Running sum of the weights of edges accepted into the MST. The final answer. |
| `count` | How many nodes are in the tree so far. The loop stops once `count === n`. |
| `cost` | Weight popped off the heap for the current candidate node. Added to `total` when the node is accepted. |
| `i` | The node just popped from the heap (and being added to the tree). Its neighbors are relaxed. |
| `j` | Loop index over all nodes; for each `j` not yet `inMST`, push the distance from the new tree node `i` to `j`. |
| `d` | Manhattan distance `Math.abs(points[i][0]-points[j][0]) + Math.abs(points[i][1]-points[j][1])` — the candidate edge weight pushed as `[d, j]`. |

**Algorithm — Prim's MST with a lazy min-heap.** Start by seeding the heap with `[0, 0]` (reach node 0 for free). Repeatedly pop the cheapest frontier edge; if its target node is already in the tree, discard it (a stale entry) and continue. Otherwise accept the node: mark `inMST[i]`, add `cost` to `total`, increment `count`, then push the distance from `i` to every still-outside node `j`. Because the graph is complete (every pair of points is connected), we never store an explicit edge list — distances are computed on the fly. The heap may hold outdated entries for a node, but the `if (inMST[i]) continue` guard makes them harmless. Complexity is `O(n^2 log n)` time (each of the `n` accepted nodes pushes up to `n` entries) and `O(n^2)` heap space.
