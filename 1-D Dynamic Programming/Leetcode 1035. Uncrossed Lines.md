<iframe
  src="uncrossed_lines_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums1 | numbers on the top line |
| nums2 | numbers on the bottom line |
| m | length of nums1 |
| n | length of nums2 |
| dp | dp[i][j] = most lines between nums1[0..i-1] and nums2[0..j-1] |
| i | prefix length of nums1 |
| j | prefix length of nums2 |
