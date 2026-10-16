<iframe
  src="minimum_time_to_collect_all_apples_in_a_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | number of vertices |
| edges | undirected tree edges |
| hasApple | hasApple[v] is true when vertex v holds an apple |
| adj | neighbours of each vertex |
| parent | parent of each vertex when the tree hangs from vertex 0 |
| order | vertices in breadth-first order from 0 |
| i | position in order |
| next | neighbour being checked |
| need | need[v] is true when the walk must enter v |
| res | seconds walked |
| node | vertex whose edge to its parent is checked |
