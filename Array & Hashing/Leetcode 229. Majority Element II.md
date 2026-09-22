
<iframe
  src="majority_element_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | input array |
| num | current value being read in each pass |
| cand1 | first candidate value (Boyer-Moore slot 1) |
| cand2 | second candidate value (Boyer-Moore slot 2) |
| count1 | vote counter for cand1 (reused as a true recount in the verification pass) |
| count2 | vote counter for cand2 (reused as a true recount in the verification pass) |
| res | output array of values appearing more than ⌊n/3⌋ times |
