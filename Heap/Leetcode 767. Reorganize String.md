
<iframe
  src="reorganize_string_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | Input string to rearrange so no two adjacent characters are equal. |
| `freq` | Map of each character to its count. |
| `heap` | Max-heap of `[count, char]`, compared by `count` (element `[0]`); root is the most frequent char. |
| `res` | The result string built one character at a time. |
| `prev` | The `[count, char]` just placed, held back one turn so it cannot repeat; pushed back when its count is still > 0. |
| `cnt`, `ch` | Destructured from `heap.pop()`: the count and character of the most frequent available char. |
