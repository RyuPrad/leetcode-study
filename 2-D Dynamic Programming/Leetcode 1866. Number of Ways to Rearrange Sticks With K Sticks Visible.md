<iframe
  src="number_of_ways_to_rearrange_sticks_with_k_sticks_visible_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | number of sticks, lengths 1 to n |
| k | how many must be visible from the left |
| MOD | 10^9 + 7 |
| dp | dp[i][j] = arrangements of i sticks with j visible |
| i | number of sticks arranged |
| j | number visible |
