<iframe
  src="check_completeness_of_a_binary_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| root | root of the tree |
| queue | nodes and null children in level order |
| seenNull | true once a missing child was met |
| head | next entry of queue |
| node | entry being checked (may be null) |
