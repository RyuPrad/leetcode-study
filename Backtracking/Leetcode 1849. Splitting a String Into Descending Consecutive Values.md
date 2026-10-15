<iframe
  src="splitting_a_string_into_descending_consecutive_values_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | the digits |
| dfs | can s[start..] continue a sequence that last had value prev? |
| start | where the next piece begins |
| prev | value of the previous piece |
| value | value of the piece s[start..end] |
| end | last digit of the piece |
| first | value of the first piece |
| cut | last digit of the first piece |
