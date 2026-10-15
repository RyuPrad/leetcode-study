<iframe
  src="concatenated_words_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| words | distinct words |
| dict | set of all words |
| res | concatenated words found |
| word | word being tested |
| n | its length |
| dp | dp[k] = word[0..k-1] splits into dictionary words |
| end | end of the prefix being decided |
| start | where its last piece begins |
