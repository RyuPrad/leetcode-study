<iframe
  src="path_with_maximum_probability_visualizer.html"
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
| edges | undirected edges [a, b] |
| succProb | success probability of each edge |
| start_node | where the path starts |
| end_node | where the path ends |
| adj | adj[a] = [neighbor, probability] pairs |
| i | edge being added |
| a | one end of the edge |
| b | other end |
| best | best[v] = highest probability found to reach v |
| heap | max-heap of [probability, node] |
| prob | probability of the popped path |
| node | node it reaches |
| next | neighbor being relaxed |
| edgeProb | probability of that edge |
| candidate | probability of reaching next through node |
