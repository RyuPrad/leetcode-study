
<iframe
  src="longest_substring_without_repeating_characters_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | input string being scanned |
| `left` | left edge of the window; slides right to drop repeated characters |
| `right` | right edge of the window; advances one character each iteration |
| `seen` | Set of the characters currently inside the window `[left, right]` |
| `ans` | longest window length found so far, `max(ans, right - left + 1)` |
