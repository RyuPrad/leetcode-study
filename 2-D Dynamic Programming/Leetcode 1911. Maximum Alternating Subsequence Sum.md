<iframe
  src="maximum_alternating_subsequence_sum_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | the array |
| plus | best sum of a subsequence whose last term was added |
| minus | best sum of a subsequence whose last term was subtracted (or that is empty) |
| num | value being considered |
| nextPlus | plus after considering num |
| nextMinus | minus after considering num |
