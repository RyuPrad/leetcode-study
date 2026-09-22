
<iframe
  src="decode_string_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | The encoded input string being scanned left to right. |
| `stack` | LIFO stack of entries `[curStr, curNum]` saved when a `[` opens a group. |
| `curStr` | The string built so far at the current bracket depth. |
| `curNum` | The repeat-count being accumulated from digit characters. |
