
<iframe
  src="maximum_product_subarray_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `nums` | Input integer array (may contain negatives and zeros). |
| `res` | Best (maximum) product of any contiguous subarray seen so far — the answer. |
| `curMax` | Largest product of a subarray **ending at** the current index. |
| `curMin` | Smallest (most negative) product of a subarray **ending at** the current index; tracked because a negative × negative can become the new max. |
| `n` | Current element `nums[i]`. |
| `tmpMax` | Saved candidate for the new `curMax` (`max(n, curMax·n, curMin·n)`), computed before `curMin` is overwritten. |
| `i` | Loop index, scanning from `1` to `nums.length - 1`. |
