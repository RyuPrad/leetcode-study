
<iframe
  src="clone_graph_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `node` | The entry node of the input graph (a `Node` instance). Return `null` immediately if it is `null`. |
| `visited` | A `Map` from each **original** node to its single **clone**. Recording the clone *before* recursing is what prevents cycles from looping forever and stops duplicate copies. |
| `dfs` | Recursive helper `dfs(curr)`: returns the clone of `curr`, creating it (and its sub-clones) on first visit. |
| `copy` | The freshly created clone `new Node(curr.val)` for the current original node, with an initially empty `neighbors` list. |
| `nei` | The current neighbor of `curr` being cloned/linked inside the `for...of` loop. |
| `val` | A node's integer value (`this.val`); clone shares the same value as the original. |
| `neighbors` | A node's adjacency list (`this.neighbors`); the clone's list is rebuilt with cloned neighbors via `copy.neighbors.push(dfs(nei))`. |
