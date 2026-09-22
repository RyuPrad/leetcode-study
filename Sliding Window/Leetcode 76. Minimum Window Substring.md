
<iframe
  src="minimum_window_substring_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | source string to search within |
| t | target string whose characters must all be covered |
| need | frequency map of the characters in t |
| window | frequency map of the characters currently in [left, right] |
| left | left bound of the current window |
| right | right bound of the current window |
| have | number of distinct chars whose required count is currently met |
| needCount | number of distinct chars required (Object.keys(need).length) |
| ans | smallest valid window substring found so far |
