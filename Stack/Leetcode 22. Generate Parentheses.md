
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Stack/generate_parentheses_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | Number of pairs of parentheses to generate. |
| `stack` | Explicit char stack holding the current partial string; push on each choice, pop to backtrack. |
| `open` | Count of `(` placed so far on the current path. |
| `close` | Count of `)` placed so far on the current path. |
| `res` | Result list collecting every completed valid combination (`stack.join("")`). |
