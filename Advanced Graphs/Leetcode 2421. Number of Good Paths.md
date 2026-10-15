<iframe
  src="number_of_good_paths_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| vals | value of each node |
| edges | tree edges |
| n | number of nodes |
| parent | union-find parent of each node |
| find | returns the root of a node, compressing the path |
| adj | neighbors of each node |
| order | nodes sorted by value |
| res | good paths counted |
| i | first node of the current value group in order |
| j | one past the last node of the group |
| count | root → nodes of the current value in that component |
| root | component of a node in the group |
| c | how many group nodes share a component |
