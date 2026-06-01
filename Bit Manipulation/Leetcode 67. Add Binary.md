
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Bit%20Manipulation/add_binary_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| a | First binary string operand. |
| b | Second binary string operand. |
| res | Result binary string, built one bit at a time by prepending each column's output bit. |
| i | Index into `a`, walking from the last character toward index 0. |
| j | Index into `b`, walking from the last character toward index 0. |
| carry | Carry bit (0 or 1) flowing from the current column into the next column to the left. |
| sum | Per-column total = `carry` + current bit of `a` + current bit of `b`; the output bit is `sum % 2`, the new carry is `floor(sum / 2)`. |
