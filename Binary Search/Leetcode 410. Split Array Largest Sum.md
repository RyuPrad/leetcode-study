
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Binary%20Search/split_array_largest_sum_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | array of non-negative integers to split |
| `k` | number of contiguous subarrays to split into |
| `left` | low end of the candidate largest-sum range (starts at max(nums)) |
| `right` | high end of the candidate largest-sum range (starts at sum(nums)) |
| `mid` | candidate largest-sum value being tested = floor((left + right) / 2) |
| `ans` | smallest feasible largest-sum found so far (the answer) |
