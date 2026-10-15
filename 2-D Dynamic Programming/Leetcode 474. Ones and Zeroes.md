<iframe
  src="ones_and_zeroes_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| strs | binary strings |
| m | how many 0s may be used |
| n | how many 1s may be used |
| dp | dp[i][j] = most strings that fit in i zeros and j ones |
| str | string being considered |
| zeros | its count of 0s |
| ones | its count of 1s |
| i | zero budget being updated |
| j | one budget being updated |
