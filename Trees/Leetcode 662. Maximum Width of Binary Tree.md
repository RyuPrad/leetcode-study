<iframe
  src="maximum_width_of_binary_tree_visualizer.html"
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
| res | widest level so far |
| level | [node, position] pairs of the current level |
| first | position of the leftmost node of the level |
| next | pairs of the following level |
| node | node whose children are placed |
| index | position of node |
| i | position of node counted from the leftmost one |
