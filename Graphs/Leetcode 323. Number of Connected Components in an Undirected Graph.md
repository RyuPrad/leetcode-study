
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/number_of_connected_components_in_an_undirected_graph_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | Number of nodes, labeled `0..n-1`. |
| `edges` | Undirected edges `[a, b]`; each may or may not connect two separate components. |
| `dsu` | The `DSU` (union-find) instance; its `count` field tracks the live component total. |
| `parent` | `parent[x]` is `x`'s parent pointer; following it to a fixed point yields the component root. |
| `count` | Number of connected components. Starts at `n`, and `count--` each time `union` joins two different sets. This is the answer. |
| `a` | First endpoint of the current edge. |
| `b` | Second endpoint of the current edge. |
| `ra` | `find(a)` — the root of `a`'s component. |
| `rb` | `find(b)` — the root of `b`'s component. |
