
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Math%20%26%20Geometry/plus_one_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `digits` | The array of single digits representing one big number, most-significant first. We add 1 to it in place. |
| `i` | The loop index, walking from the rightmost digit (`digits.length - 1`) toward index 0 as the carry propagates. |
| `carry` | Conceptual flag: a digit was 9, so it became 0 and the +1 must continue into the digit to its left. |
| `ans` | The returned array — either the in-place modified `digits`, or `[1, ...digits]` when every digit carried (e.g. `[9,9]` → `[1,0,0]`). |
