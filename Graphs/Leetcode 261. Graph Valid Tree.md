
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/graph_valid_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | Number of nodes, labeled `0..n-1`. A tree on `n` nodes has exactly `n-1` edges. |
| `edges` | Undirected edges `[a, b]`. The graph is a tree iff it has `n-1` edges and no cycle. |
| `dsu` | The `DSU` (union-find) instance used to detect a cycle while joining edges. |
| `parent` | `parent[x]` is `x`'s parent pointer; following it to a fixed point gives the set's root. |
| `a` | First endpoint of the current edge. |
| `b` | Second endpoint of the current edge. |
| `ra` | `find(a)` — the root of `a`'s set. |
| `rb` | `find(b)` — the root of `b`'s set. If `ra === rb`, the edge forms a cycle. |
| `ans` | Boolean result: `true` only if the edge-count gate passes and every `union` succeeds (no cycle). |
