
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Binary%20Search/search_in_rotated_sorted_array_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | The rotated sorted input array to search. |
| target | The value we are searching for. |
| left | Left boundary index of the current search window. |
| right | Right boundary index of the current search window. |
| mid | Middle index, `Math.floor((left + right) / 2)`; one half around it is always sorted. |
