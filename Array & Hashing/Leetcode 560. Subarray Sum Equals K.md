
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Array%20%26%20Hashing/subarray_sum_equals_k_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | input array |
| k | target subarray sum |
| num | value at the current index |
| sum | running prefix sum of nums[0..i] |
| freq | map of prefix sum → how many times it has occurred |
| count | number of subarrays whose sum equals k |
