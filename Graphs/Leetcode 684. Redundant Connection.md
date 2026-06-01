
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/redundant_connection_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `edges` | The input list of undirected edges `[a, b]`; exactly one creates a cycle. |
| `dsu` | The `DSU` (disjoint-set / union-find) instance tracking connected components. |
| `parent` | `parent[x]` is `x`'s parent pointer; following it to a fixed point gives the set's root. |
| `rank` | Upper bound on a tree's height, used to attach the shorter tree under the taller (union by rank). |
| `a` | First endpoint of the current edge. |
| `b` | Second endpoint of the current edge. |
| `ra` | `find(a)` — the root/representative of `a`'s set. |
| `rb` | `find(b)` — the root/representative of `b`'s set. |
| `ans` | The redundant edge `[a, b]` whose union failed (already in same set). |
