<iframe
  src="find_first_and_last_position_of_element_in_sorted_array_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | sorted input |
| target | value to locate |
| bound | helper: binary search biased to the first or last match |
| leftBias | true while searching for the first match |
| left | start of the search range |
| right | end of the search range |
| res | best match index found so far, or -1 |
| mid | index being tested |
| first | index of the first match, or -1 |
| last | index of the last match, or -1 |
