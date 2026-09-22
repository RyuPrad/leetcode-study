
<iframe
  src="remove_nth_node_from_end_of_list_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `head` | head node of the input linked list |
| `dummy` | sentinel node placed before `head` so removing the first node is uniform |
| `fast` | lead pointer; advances `n` nodes ahead to create the gap |
| `slow` | trailing pointer; ends up just before the node to remove |
| `n` | the position from the end of the node to remove (1-indexed) |
