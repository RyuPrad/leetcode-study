
<iframe
  src="valid_parenthesis_string_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | The input string made of `(`, `)` and `*` |
| low | Smallest possible number of open `(` so far (every `*` treated as `)`) |
| high | Largest possible number of open `(` so far (every `*` treated as `(`) |
| ch | The current character being processed |
| ans | Final result: whether `low` can reach 0 at the end |
