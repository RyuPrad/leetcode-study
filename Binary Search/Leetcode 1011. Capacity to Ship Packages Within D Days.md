
<iframe
  src="capacity_to_ship_packages_within_d_days_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `weights` | array of package weights, shipped in order |
| `days` | maximum number of days allowed to ship everything |
| `left` | low end of the candidate capacity range (starts at max(weights)) |
| `right` | high end of the candidate capacity range (starts at sum(weights)) |
| `mid` | candidate ship capacity being tested = floor((left + right) / 2) |
| `ans` | smallest feasible capacity found so far (the answer) |
