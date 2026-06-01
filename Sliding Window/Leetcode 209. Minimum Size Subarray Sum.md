
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Sliding%20Window/minimum_size_subarray_sum_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| target | sum the subarray must reach or exceed |
| nums | input array of positive numbers |
| left | left bound of the window |
| right | right bound of the window |
| sum | running sum of the current window |
| ans | shortest qualifying window length so far (Infinity until one is found, 0 if none) |
