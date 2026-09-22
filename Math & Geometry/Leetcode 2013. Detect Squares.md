
<iframe
  src="detect_squares_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `counts` | `Map` from `"x,y"` key to multiplicity (how many times that point was added). |
| `point` | The `[x, y]` argument passed to `add()` or `count()`. |
| `key` | String form `point[0] + "," + point[1]` used as the Map key. |
| `x`, `y` | Coordinates of the query point inside `count()`. |
| `px`, `py` | Coordinates of a candidate diagonal point pulled from the Map keys. |
| `c1`, `c2`, `c3` | Multiplicities of the diagonal corner and the two adjacent corners of the square. |
| `res` | Running total of squares: `res += c1 * c2 * c3` over every valid diagonal. |
