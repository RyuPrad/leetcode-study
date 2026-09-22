
<iframe
  src="minimum_height_trees_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | Number of nodes labeled `0..n-1`. The tree has exactly `n - 1` edges. `n === 1` returns `[0]`. |
| `edges` | Undirected edges `[a, b]`; each adds `b` to `adj[a]` and `a` to `adj[b]`. |
| `adj` | Adjacency list; `adj[v]` is the list of `v`'s neighbors. |
| `degree` | `degree[v]` = current number of remaining neighbors of `v`. A node is a leaf when `degree === 1`. |
| `leaves` | The current outer layer (all nodes with `degree === 1`) being trimmed this round. |
| `remaining` | Count of nodes not yet peeled; the loop runs while `remaining > 2`. |
| `nei` | A neighbor of a leaf being removed; its `degree` is decremented, and it joins the next layer if it becomes a leaf. |
| `ans` | The returned value: the 1 or 2 surviving centroid nodes — the roots of all minimum-height trees. |
