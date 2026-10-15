<iframe
  src="maximum_subsequence_score_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums1 | values that are summed |
| nums2 | values whose minimum multiplies the sum |
| k | how many indices to choose |
| pairs | [nums1[i], nums2[i]] sorted by nums2, largest first |
| heap | min-heap of the chosen nums1 values |
| sum | sum of the values in the heap |
| res | best score |
| a | nums1 value of the pair |
| b | nums2 value of the pair, the minimum so far |
