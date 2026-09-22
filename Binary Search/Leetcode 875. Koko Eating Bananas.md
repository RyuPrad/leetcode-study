
<iframe
  src="koko_eating_bananas_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `piles` | array of banana pile sizes |
| `h` | total hours Koko is allowed to eat |
| `left` | low end of the candidate eating-speed range (starts at 1) |
| `right` | high end of the candidate eating-speed range (starts at max(piles)) |
| `mid` | candidate eating speed being tested = floor((left + right) / 2) |
| `ans` | smallest feasible speed found so far (the answer) |
