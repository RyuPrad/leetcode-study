<iframe
  src="maximum_subarray_min_product_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | positive values |
| prefix | prefix[i] = sum of nums[0..i-1] |
| num | value being added to the prefix sums |
| stack | [start, value] pairs with increasing values: each value is the minimum from its start onward |
| res | best min-product so far (a BigInt, so large products stay exact) |
| i | position being processed; i = n flushes the stack |
| value | nums[i], or 0 after the end |
| start | leftmost index the new value can extend back to |
| left | start of the popped entry |
| min | value of the popped entry |
| product | min × sum of nums[left..i-1] |
