
<iframe
  src="copy_list_with_random_pointer_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `head` | head node of the original list to deep-copy |
| `map` | `Map` from each original node to its freshly created copy; lets `next`/`random` pointers (which can point anywhere) be resolved in O(1) |
| `curr` | cursor walking the original list, once in pass 1 to clone nodes and once in pass 2 to wire `next` and `random` |
