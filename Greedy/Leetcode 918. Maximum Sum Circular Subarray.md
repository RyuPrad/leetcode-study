
<iframe
  src="maximum_sum_circular_subarray_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | The input integer array, treated as circular (the end wraps to the start). |
| `total` | Running sum of every element; the whole-array sum once the loop ends. |
| `curMax` | Kadane running max: best subarray sum ending at the current element. |
| `maxSum` | Best **maximum** subarray sum found by standard (non-wrapping) Kadane. |
| `curMin` | Mirror Kadane running min: smallest subarray sum ending at the current element. |
| `minSum` | Best **minimum** subarray sum; `total - minSum` is the best wrap-around sum. |
| `num` | The current element in the `for...of` loop. |
| `ans` | Final result: `maxSum > 0 ? max(maxSum, total - minSum) : maxSum` (the guard avoids removing the entire all-negative array). |
