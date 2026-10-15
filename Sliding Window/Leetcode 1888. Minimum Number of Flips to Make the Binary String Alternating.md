<iframe
  src="minimum_number_of_flips_to_make_the_binary_string_alternating_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | input binary string |
| n | s.length |
| t | s + s: every rotation of s is a window of t |
| diff1 | mismatches against 0101… in the window |
| diff2 | mismatches against 1010… in the window |
| res | fewest flips found |
| right | index entering the window |
| left | index leaving the window |
