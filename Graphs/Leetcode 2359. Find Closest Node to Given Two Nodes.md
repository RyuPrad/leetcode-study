<iframe
  src="find_closest_node_to_given_two_nodes_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| edges | edges[i] = the one node i points to, or -1 |
| node1 | first start node |
| node2 | second start node |
| distances | walks the single path from a start and records the distance to each node |
| start | where the walk begins |
| dist | dist[i] = steps from start to i, -1 if never reached |
| node | current node of the walk |
| d | steps taken so far |
| d1 | distances from node1 |
| d2 | distances from node2 |
| res | best meeting node so far |
| best | its larger distance |
