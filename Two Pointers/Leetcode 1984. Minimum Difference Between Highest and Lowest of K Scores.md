<iframe
  src="minimum_difference_between_highest_and_lowest_of_k_scores_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | scores, sorted in place |
| k | number of students to choose |
| res | smallest highest-minus-lowest difference so far |
| left | lowest index of the current window |
| right | highest index of the current window (left + k - 1) |
