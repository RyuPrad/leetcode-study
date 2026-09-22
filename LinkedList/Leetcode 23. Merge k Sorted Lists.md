
<iframe
  src="merge_k_sorted_lists_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `lists` | array of the k sorted linked lists being merged |
| `l1` | first list of the current pair passed to `mergeTwo` |
| `l2` | second list of the current pair (or `null` when odd one out) |
| `dummy` | sentinel head node used while merging a pair |
| `curr` | tail pointer of the merged list being built in `mergeTwo` |
| `merged` | array collecting the merged pair results for the current round |
