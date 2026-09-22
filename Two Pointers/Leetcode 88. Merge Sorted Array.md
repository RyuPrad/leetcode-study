
<iframe
  src="merge_sorted_array_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums1 | first sorted array with n trailing slots, merged in place |
| nums2 | second sorted array to merge into nums1 |
| m | number of real elements in nums1 |
| n | number of elements in nums2 |
| i | scanner at the end of nums1's real part, starts at m - 1 |
| j | scanner at the end of nums2, starts at n - 1 |
| k | write position from the back of nums1, starts at m + n - 1 |
