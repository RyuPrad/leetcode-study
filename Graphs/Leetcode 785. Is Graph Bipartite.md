<iframe
  src="is_graph_bipartite_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| graph | graph[u] = neighbors of node u (undirected) |
| n | number of nodes |
| color | color[u] = 0 or 1, or -1 if not colored yet |
| start | node that starts a new component |
| queue | nodes of the component in the order colored |
| head | next node to expand |
| node | node being expanded |
| next | its neighbor |
