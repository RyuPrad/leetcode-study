<iframe
  src="swapping_nodes_in_a_linked_list_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| head | first node of the list |
| k | 1-indexed position from both ends |
| fast | walks ahead to the kth node, then to the last node |
| i | position of fast while it walks to the kth node |
| first | kth node from the start |
| slow | starts at the head, k - 1 nodes behind fast |
