
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Tries/word_search_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `board` | The `m × n` grid of letters. Cells are temporarily set to `"#"` to mark them visited on the current DFS path. |
| `words` | The list of target words; each is stored in the trie so the grid is scanned only once. |
| `root` | Root `TrieNode` of the trie built from `words`. |
| `node` | The current `TrieNode` (the DFS parameter) before descending to a child. |
| `child` | `node.children[ch]` — the trie node for the current cell's letter; if absent, the path is a dead end. |
| `ch` | The letter at the current cell, `board[r][c]`. |
| `rows` | Number of board rows, `board.length`. |
| `cols` | Number of board columns, `board[0].length`. |
| `res` | The result array of found words. A word is pushed once, then `child.word` is nulled to dedupe. |
| `r`, `c` | Current cell coordinates (row, column) during DFS. |
| `dirs` | The four movement deltas `[[1,0],[-1,0],[0,1],[0,-1]]` (down, up, right, left). |
