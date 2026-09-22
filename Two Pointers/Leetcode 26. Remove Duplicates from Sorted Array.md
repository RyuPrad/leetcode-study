
<iframe
  src="remove_duplicates_from_sorted_array_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | sorted input array, deduplicated in place |
| left | last unique index / write boundary (the prefix nums[0..left] is unique) |
| right | scanner index that walks forward looking for new values |
| k | count of unique elements returned, equals left + 1 |
