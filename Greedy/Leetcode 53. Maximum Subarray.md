
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Greedy/maximum_subarray_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | The input integer array being scanned. |
| `curSum` | Largest subarray sum that **ends** at the current index `i`. Either extends the previous run (`curSum + nums[i]`) or restarts at `nums[i]`. |
| `maxSum` | Largest subarray sum seen **anywhere** so far; the eventual answer. |
| `i` | Loop index, scanning left to right from `1`. |
| `ans` | The returned value — equals `maxSum` when the loop finishes. |
