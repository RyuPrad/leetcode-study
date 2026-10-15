<iframe
  src="remove_covered_intervals_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| intervals | intervals [start, end), sorted by start, longer first on ties |
| res | intervals not covered so far |
| maxEnd | farthest end of any interval kept so far |
| start | start of the interval being checked |
| end | end of the interval being checked |
