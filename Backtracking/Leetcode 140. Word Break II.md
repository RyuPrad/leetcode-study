
<iframe
  src="word_break_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | the string to segment |
| `wordDict` | the list of allowed dictionary words |
| `words` | a Set built from `wordDict` for O(1) lookups |
| `res` | list of all valid sentences |
| `path` | the words chosen so far |
| `start` | index where the next word begins |
| `end` | exclusive index of the prefix being tested |
| `word` | the prefix `s.substring(start, end)` |
