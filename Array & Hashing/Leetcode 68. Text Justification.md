<iframe
  src="text_justification_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| words | words to lay out |
| maxWidth | exact width of every line |
| res | finished lines |
| i | first word of the current line |
| j | one past the last word that fits |
| length | letters in words[i..j-1] |
| gaps | number of gaps between those words |
| line | the line being built |
| spaces | spaces in every gap |
| extra | gaps that get one more space (the leftmost ones) |
| k | word whose following gap is being filled |
