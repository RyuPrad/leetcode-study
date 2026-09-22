
<iframe
  src="sort_colors_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | input array containing only 0s, 1s, and 2s (sorted in-place) |
| low | boundary of the 0-region; everything in [0..low-1] is 0 |
| mid | scanning pointer; nums[mid] is the value currently examined |
| high | boundary of the 2-region; everything in [high+1..] is 2 |
