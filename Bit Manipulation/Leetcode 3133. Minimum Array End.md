
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Bit%20Manipulation/minimum_array_end_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | Number of array elements. The last (largest) element is the `(n - 1)`-th value above `x`. |
| `x` | Required AND-mask. Every element must contain all of `x`'s set bits, so the answer starts from `x`. |
| `result` | The minimum last element, built as a `BigInt`. Starts at `x`; free (zero) bit slots get filled from `remaining`. Returned as a `Number`. |
| `remaining` | `BigInt(n - 1)`. Its bits are distributed, lowest-first, into the zero-bit positions of `result`. |
| `bit` | One-hot `BigInt` cursor (`1n`, then `<< 1n` each step) marking the bit position currently under inspection. |
