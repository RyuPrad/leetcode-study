
<iframe
  src="network_delay_time_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `times` | Input edge list; each `[u, v, w]` is a directed edge from node `u` to node `v` with travel time (weight) `w`. |
| `n` | Number of nodes, labeled `1..n`. |
| `k` | The source node where the signal starts. |
| `adj` | Adjacency list, size `n + 1`; `adj[u]` holds `[v, w]` pairs for every edge leaving `u`. |
| `dist` | `dist[i]` = shortest known delay from `k` to node `i`; starts at `Infinity`, with `dist[k] = 0`. |
| `heap` | Min-heap of `[d, node]` entries ordered by `d`; always pops the smallest tentative distance (a `class MinHeap`). |
| `d` | The delay popped off the heap for the current `node`. |
| `node` | The node just popped from the heap; finalized if `d <= dist[node]`. |
| `nei` | A neighbor of `node` reached by an outgoing edge. |
| `w` | Weight (time) of the edge `node → nei`. |
| `ans` | The answer: `Math.max` over all `dist[i]`, or `-1` if any node is unreachable. |

## Idea
Dijkstra from source `k`. Repeatedly pop the closest unfinalized node, finalize it, and relax its outgoing edges. The signal reaches the whole network in `max(dist[1..n])` time; if any `dist[i]` is still `Infinity`, return `-1`. The `d > dist[node]` check discards stale heap entries left behind by earlier, larger distances.

- Time: `O(E log V)` — every edge can push one heap entry.
- Space: `O(V + E)` for the adjacency list and heap.
