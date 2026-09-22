
<iframe
  src="search_in_rotated_sorted_array_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | The rotated sorted input array, which may contain duplicates. |
| target | The value we are searching for. |
| left | Left boundary index of the current search window. |
| right | Right boundary index of the current search window. |
| mid | Middle index, `Math.floor((left + right) / 2)`; when `nums[left] === nums[mid] === nums[right]` the sorted half is ambiguous and both ends shrink. |
