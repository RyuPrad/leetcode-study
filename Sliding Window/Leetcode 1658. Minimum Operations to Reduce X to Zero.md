<iframe
  src="minimum_operations_to_reduce_x_to_zero_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | positive input values |
| x | amount to remove from the two ends |
| target | total - x: the sum the untouched middle must keep |
| left | first index of the middle window |
| right | last index of the middle window |
| sum | sum of the window |
| best | longest window summing to target (-1 if none) |
