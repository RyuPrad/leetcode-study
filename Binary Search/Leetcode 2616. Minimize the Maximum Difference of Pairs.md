<iframe
  src="minimize_the_maximum_difference_of_pairs_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | values, sorted in place |
| p | pairs needed |
| left | smallest maximum difference still possible |
| right | largest maximum difference still possible |
| mid | maximum difference being tested |
| pairs | pairs formed greedily with difference <= mid |
| i | index scanned while pairing |
