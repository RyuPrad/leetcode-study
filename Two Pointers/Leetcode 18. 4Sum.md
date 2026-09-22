
<iframe
  src="four_sum_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | sorted input array |
| target | sum every quadruple must reach |
| i | first fixed index (outer loop) |
| j | second fixed index (inner loop) |
| left | left pointer, starts at j + 1 |
| right | right pointer, starts at the last index |
| sum | nums[i] + nums[j] + nums[left] + nums[right] |
| res | unique quadruples that sum to target |
