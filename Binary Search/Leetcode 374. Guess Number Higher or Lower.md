
<iframe
  src="guess_number_higher_or_lower_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | Upper bound of the guessing range; we search the integers 1..n |
| left | Lower bound of the current search range (starts at 1) |
| right | Upper bound of the current search range (starts at n) |
| mid | Current guess, `Math.floor((left + right) / 2)` |
| pick | The hidden target number; only the `guess()` API can see it |
| res | Result of `guess(mid)`: 0 if correct, -1 if mid is too high, 1 if mid is too low |
