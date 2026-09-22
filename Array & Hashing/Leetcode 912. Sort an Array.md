
<iframe
  src="sort_an_array_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | input array of integers (sorted in-place, then returned) |
| left | left boundary of the current subrange in `sort` / start of the left run in `merge` |
| mid | midpoint splitting the subrange; end of the left run in `merge` |
| right | right boundary of the current subrange / end of the right run in `merge` |
| i | scan pointer over the left run during a merge |
| j | scan pointer over the right run during a merge |
| k | write-back index copying `temp` into `nums` |
| temp | temporary buffer holding the merged (sorted) run before write-back |
