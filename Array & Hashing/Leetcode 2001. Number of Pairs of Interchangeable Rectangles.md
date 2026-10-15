<iframe
  src="number_of_pairs_of_interchangeable_rectangles_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| rectangles | [width, height] pairs |
| gcd | helper: greatest common divisor |
| count | reduced ratio → rectangles seen with it |
| res | interchangeable pairs counted so far |
| w | width |
| h | height |
| g | gcd(w, h) |
| key | w / g : h / g, the exact reduced ratio |
