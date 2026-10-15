<iframe
  src="find_all_numbers_disappeared_in_an_array_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | values in [1, n], marked in place |
| num | value read in the first pass (its sign may be flipped) |
| index | position that records num was seen: |num| - 1 |
| res | values never seen |
| i | position checked in the second pass |
