
<iframe
  src="combination_sum_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `candidates` | array sorted ascending; each value used at most once |
| `target` | sum each combination must reach |
| `res` | output list of all unique combinations |
| `path` | current partial candidate being built |
| `start` | first index this dfs frame may choose from |
| `remain` | target minus the sum of `path` so far |
| `i` | loop index over `candidates`, from `start` |
