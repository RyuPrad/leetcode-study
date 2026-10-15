<iframe
  src="repeated_dna_sequences_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | DNA string of A, C, G and T |
| seen | every 10-letter sequence met so far |
| repeated | sequences met more than once |
| i | start of the current 10-letter window |
| sequence | s.slice(i, i + 10) |
