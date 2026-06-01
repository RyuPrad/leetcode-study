
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/evaluate_division_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `equations` | List of variable pairs `[a, b]`; each means the ratio `a / b` is known. |
| `values` | `values[i]` is the numeric value of `equations[i]`, i.e. `a / b`. |
| `queries` | List of `[c, d]` pairs asking for the value of `c / d`. |
| `graph` | A `Map` from each variable to its weighted out-edges `[neighbour, ratio]`. |
| `addEdge` | Helper that appends a directed weighted edge `a -> b` with weight `w`. |
| `dfs` | Recursive search from `src` to `dst`, multiplying edge weights along the path. |
| `src` | The variable the current DFS frame starts from. |
| `dst` | The destination variable the query is trying to reach. |
| `visited` | A `Set` of variables on the current path, preventing cycles. |
| `w` | The weight (ratio) of the edge being traversed out of `src`. |
| `res` | The array of query answers; `-1.0` marks an undefined or unreachable ratio. |
