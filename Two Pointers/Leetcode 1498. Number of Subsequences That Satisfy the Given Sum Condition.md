<iframe
  src="number_of_subsequences_that_satisfy_the_given_sum_condition_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | input values, sorted in place |
| target | limit for minimum + maximum |
| MOD | 1000000007 |
| pow | pow[i] = 2^i mod MOD |
| left | index of the minimum being counted |
| right | largest index usable with nums[left] |
| res | count of valid subsequences so far |
