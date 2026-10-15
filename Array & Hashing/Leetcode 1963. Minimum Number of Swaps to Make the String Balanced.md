<iframe
  src="minimum_number_of_swaps_to_make_the_string_balanced_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | brackets, half "[" and half "]" |
| extraClose | unmatched "]" minus open "[" so far |
| maxClose | largest excess of "]" over any prefix |
| c | bracket being read |
