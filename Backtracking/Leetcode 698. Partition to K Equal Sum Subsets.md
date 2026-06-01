
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/partition_to_k_equal_sum_subsets_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | input numbers, sorted descending before the search |
| `k` | number of equal-sum subsets to form (also the live count of subsets still to complete) |
| `total` | sum of all numbers |
| `target` | required sum of each subset (`total / k`) |
| `used` | boolean flag per element: already placed in some subset or not |
| `start` | index to begin scanning from when filling the current subset |
| `curSum` | running sum of the subset currently being built |
