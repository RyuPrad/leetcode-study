
<iframe
  src="partition_labels_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | The input string to split into as many parts as possible |
| last | Map from each character to the LAST index where it appears |
| res | Output array collecting the length of each finished partition |
| start | Index where the current partition begins |
| end | Farthest last-occurrence index seen so far in the current partition |
| i | Sweep pointer over the string |
