
<iframe
  src="missing_number_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | Distinct integers, a permutation of `0..n` with exactly one missing |
| res | XOR accumulator; starts at `n`, then XORs every index and value so matched pairs cancel |
| i | Loop index; both `i` and `nums[i]` are XOR-ed into `res` |
