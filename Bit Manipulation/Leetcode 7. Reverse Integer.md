
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Bit%20Manipulation/reverse_integer_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| x | The working magnitude. Starts as `Math.abs(input)`, then each iteration its last digit is peeled with `x % 10` and removed with `Math.floor(x / 10)`. |
| sign | The original sign, `-1` if the input was negative else `1`. Reapplied to `res` after the digits are reversed. |
| res | The reversed value, built by `res = res * 10 + (x % 10)`. After sign is reapplied it is bounds-checked against the signed 32-bit range; out of range returns 0. |
