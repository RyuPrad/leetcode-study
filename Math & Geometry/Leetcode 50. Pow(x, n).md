
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Math%20%26%20Geometry/pow_x_n_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| x | The base. When `n` is negative it is replaced by its reciprocal `1 / x`, then repeatedly squared each iteration |
| n | The exponent. Made positive up front if negative, then halved (`Math.floor(n / 2)`) until it reaches 0 |
| res | The accumulator, starting at 1. Whenever the current `n` is odd (`n % 2 === 1`) the current `x` is multiplied into it; returned at the end |
