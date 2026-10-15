<iframe
  src="remove_max_number_of_edges_to_keep_graph_fully_traversable_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | number of nodes, labeled 1 to n |
| edges | [type, a, b]: type 1 Alice only, 2 Bob only, 3 both |
| alice | union-find parents for Alice's graph |
| bob | union-find parents for Bob's graph |
| find | root of a node, with path compression |
| union | joins two components; false if already joined |
| used | edges that were needed |
| aliceParts | components in Alice's graph |
| bobParts | components in Bob's graph |
| type | type of the edge being considered |
| a | one end |
| b | other end |
| useful | whether this edge joined anything |
