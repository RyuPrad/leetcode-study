
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/word_ladder_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `beginWord` | The starting word of the transformation ladder. |
| `endWord` | The target word we must reach by changing one letter at a time. |
| `wordList` | The set of allowed intermediate words; every step must land on one. |
| `words` | A `Set` built from `wordList` for O(1) membership checks. |
| `queue` | The current BFS frontier: all words reachable in the same number of steps. |
| `visited` | A `Set` of words already enqueued, so BFS never revisits one. |
| `level` | BFS depth = number of words on the path so far (the answer when `endWord` is popped). |
| `word` | The word popped from the frontier and expanded this step. |
| `cand` | A candidate word formed by replacing one letter of `word` with a–z. |
