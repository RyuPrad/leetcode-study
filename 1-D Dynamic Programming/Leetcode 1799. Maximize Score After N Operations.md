<iframe
  src="maximize_score_after_n_operations_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | the 2n numbers |
| gcd | greatest common divisor helper |
| m | how many numbers |
| full | mask with every number used |
| dp | dp[mask] = best score after removing the numbers in mask |
| mask | numbers already removed (bit i set = nums[i] used) |
| used | how many numbers mask removes |
| op | number of the next operation |
| i | first number of the next pair |
| j | second number of the next pair |
| next | mask after removing the pair |
