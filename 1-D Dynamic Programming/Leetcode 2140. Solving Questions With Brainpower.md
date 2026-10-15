<iframe
  src="solving_questions_with_brainpower_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| questions | questions[i] = [points, brainpower] |
| n | number of questions |
| dp | dp[i] = most points from questions i..n-1 |
| i | question being decided |
| points | points for solving question i |
| skip | questions that must be skipped after solving it |
| solve | points if question i is solved |
