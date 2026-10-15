<iframe
  src="find_the_longest_valid_obstacle_course_at_each_position_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| obstacles | obstacle heights in order |
| tails | tails[k] = smallest last height of a non-decreasing course of length k + 1 |
| res | longest course ending at each obstacle |
| height | obstacle being placed |
| lo | binary search: first length whose tail is greater than height |
| hi | binary search upper bound |
| mid | middle of the search range |
