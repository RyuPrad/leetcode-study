
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Sliding%20Window/sliding_window_maximum_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | input array of numbers |
| k | window size |
| deque | indices whose values stay strictly decreasing from front to back; the front is the current window max |
| left | left bound of the current window (right - k + 1) |
| right | right bound of the current window (driven by the for loop) |
| res | output array of each window's maximum |
