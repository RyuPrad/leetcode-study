<iframe
  src="sum_root_to_leaf_numbers_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| root | root of the tree (digits 0 to 9) |
| res | sum of the numbers finished so far |
| stack | nodes still to visit, each with the number formed above it |
| node | node being visited |
| prefix | number formed by the digits above node |
| number | prefix with node's digit appended |
