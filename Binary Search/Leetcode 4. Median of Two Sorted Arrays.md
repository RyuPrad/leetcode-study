
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Binary%20Search/median_of_two_sorted_arrays_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums1` | First sorted array (the algorithm searches the smaller of the two) |
| `nums2` | Second sorted array |
| `m` | Length of the smaller array `nums1` after any swap |
| `n` | Length of the larger array `nums2` after any swap |
| `left` | Left bound of the partition search on `nums1` |
| `right` | Right bound of the partition search on `nums1` |
| `i` | Number of `nums1` elements placed in the combined left half (the cut in `nums1`) |
| `j` | Number of `nums2` elements in the left half, `half - i` (the cut in `nums2`) |
| `left1` | Largest value left of the cut in `nums1` (`-Infinity` if none) |
| `right1` | Smallest value right of the cut in `nums1` (`+Infinity` if none) |
| `left2` | Largest value left of the cut in `nums2` (`-Infinity` if none) |
| `right2` | Smallest value right of the cut in `nums2` (`+Infinity` if none) |
