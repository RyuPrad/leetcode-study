<iframe
  src="find_eventual_safe_states_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| graph | graph[i] = nodes that i has edges to |
| n | number of nodes |
| reverse | reverse[j] = nodes with an edge to j |
| outDegree | edges out of each node that do not yet lead to a known safe node |
| node | node being processed |
| next | target of an edge |
| queue | nodes known to be safe, in the order found |
| safe | safe[i] = whether node i is safe |
| head | next safe node to process |
| prev | node with an edge into the safe node |
| res | safe nodes in increasing order |
