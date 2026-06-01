
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Advanced%20Graphs/find_critical_and_pseudo_critical_edges_in_mst_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | Number of vertices `0 .. n-1`. A spanning tree connects all `n` of them with exactly `n - 1` edges. |
| `edges` | Input array of `[u, v, w]` weighted undirected edges. Indices into this array are what the answer reports. |
| `indexed` | `edges` rewritten as `[u, v, w, origIndex]`, then sorted ascending by weight `w`. Sorting is what makes Kruskal greedy; `origIndex` (slot 3) lets us report answers in the caller's original numbering. |
| `dsu` | A `DSU` (Disjoint Set Union / union-find) instance. `dsu.find(x)` returns x's component root (with path-halving); `dsu.union(a,b)` merges and returns `true` only if they were separate. |
| `parent` | The DSU's backing array; `parent[x]` points one step toward x's root, and a root points to itself. Snapshotted each step so Step Back is reversible. |
| `buildMST` | `(skip, force) => weight`. Runs Kruskal but (a) ignores edge `skip`, and (b) unions edge `force` first regardless of order. Returns the spanning-tree weight, or `Infinity` if the result is disconnected (`dsu.count !== 1`). |
| `skip` | Index (into `indexed`) of an edge to exclude. `buildMST(i, -1)` tests "what is the best MST without edge `i`?" |
| `force` | Index of an edge to include up front. `buildMST(-1, i)` tests "is there an MST that uses edge `i`?" |
| `weight` | Running total of accepted edge weights inside one `buildMST` run. |
| `mstWeight` | The baseline `buildMST(-1, -1)` weight — the true minimum spanning tree weight, the yardstick for every classification. |
| `critical` | Edges where `buildMST(skip=i) > mstWeight` (removing the edge raises the MST weight or disconnects the graph). Every MST must contain them. |
| `pseudo` | Edges that are not critical but where `buildMST(force=i) === mstWeight` (some MST can include them). |
| `i` | Loop index over `indexed`; identifies the edge currently being added (inside `buildMST`) or classified (in the outer loop). |

**Algorithm — Kruskal + union-find, tested per edge.** First compute the baseline MST weight with plain Kruskal: sort edges by weight, union endpoints when they are in different components, and sum the accepted weights; the tree is valid iff one component remains. Then classify each edge `i`:

1. **Critical test** — run `buildMST(skip = i)`. If the best achievable weight is strictly greater than `mstWeight` (including `Infinity` when removing the edge disconnects the graph), the edge is **critical**: it appears in *every* MST.
2. **Pseudo-critical test** — only if the edge is not critical, run `buildMST(force = i)`, which unions that edge first and then completes the tree greedily. If the result still equals `mstWeight`, the edge belongs to *some* MST and is **pseudo-critical**.

An edge that fails both tests appears in no MST. The visualizer shows the sorted edge list, the live DSU parent forest unioning, the running `weight` versus `mstWeight`, and the accumulating `critical` / `pseudo` index lists. Complexity is `O(E^2 · α(n))`: for each of the `E` edges we run two near-linear Kruskal passes.
