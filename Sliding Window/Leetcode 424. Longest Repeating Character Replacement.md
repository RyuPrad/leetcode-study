
<iframe
  src="longest_repeating_character_replacement_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | input string |
| k | max number of characters allowed to replace |
| left | left bound of the window |
| right | right bound of the window |
| freq | map of char to its count inside the current window |
| maxFreq | count of the most common char in the window |
| ans | longest valid window length found so far |
