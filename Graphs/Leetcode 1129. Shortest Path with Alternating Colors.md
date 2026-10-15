<iframe
  src="shortest_path_with_alternating_colors_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | number of nodes |
| redEdges | red directed edges |
| blueEdges | blue directed edges |
| adj | adj[a] = [neighbor, color]; color 0 is red, 1 is blue |
| a | edge start |
| b | edge end |
| res | shortest alternating distance to each node, -1 if none |
| seen | seen[v][color] = whether v was reached by an edge of that color |
| queue | [node, color of the last edge, length] |
| head | next state to expand |
| node | node of the expanded state |
| color | color of the edge that reached it (-1 at the start) |
| length | edges on that path |
| next | neighbor |
| edgeColor | color of the edge to it |
