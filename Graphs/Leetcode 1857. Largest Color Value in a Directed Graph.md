<iframe
  src="largest_color_value_in_a_directed_graph_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| colors | colors[i] = lowercase color of node i |
| edges | directed edges [a, b] |
| n | number of nodes |
| adj | nodes each node points to |
| indegree | unprocessed edges into each node |
| a | edge start |
| b | edge end |
| count | count[v][k] = most nodes of color k on a path ending at v |
| queue | nodes in topological order |
| node | node being processed |
| res | largest color value found |
| head | next node to process |
| own | color index of the node |
| next | node it points to |
