
<iframe
  src="happy_number_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | The current number. Each round it is replaced by the sum of the squares of its digits. Reaching `1` means happy. |
| `seen` | A `Set` of every value of `n` already visited. If `n` reappears, we are in a cycle and the number is not happy. |
| `sum` | The running sum of squared digits while decomposing the current `n`. Becomes the next `n`. |
| `digit` | The rightmost digit of `n` peeled off via `n % 10`, then squared into `sum`. |
| `ans` | The final boolean returned: `n === 1` (happy) is `true`, a detected cycle is `false`. |
