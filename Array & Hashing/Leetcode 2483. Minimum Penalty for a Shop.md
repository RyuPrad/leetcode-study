<iframe
  src="minimum_penalty_for_a_shop_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| customers | "Y" if customers come in that hour, "N" if not |
| penalty | penalty of closing after hour i, relative to closing at hour 0 |
| best | lowest relative penalty so far |
| bestHour | earliest closing hour with that penalty |
| i | hour the shop stays open through |
