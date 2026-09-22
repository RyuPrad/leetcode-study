
<iframe
  src="first_missing_positive_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | input array (mutated in place) |
| n | nums.length |
| i | primary loop index (both phases) |
| j | target/home index for the value being placed = nums[i] − 1 |
| ans | return value: first missing positive |
