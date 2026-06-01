
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Tries/implement_trie_prefix_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | The trie's entry point: a `TrieNode` with no letter of its own. Every word's first character is a child of `root`. |
| `node` | The pointer that walks down the trie one level at a time during `insert` / `_find`. Starts at `this.root`. |
| `ch` | The current character of `word` / `prefix` being consumed inside the `for (const ch of ...)` loop. |
| `word` | The string passed to `insert` or `search` — the full word to store or look up. |
| `prefix` | The string passed to `startsWith` — only the path needs to exist; `isEnd` is irrelevant. |
| `str` | The generic parameter of the shared helper `_find(str)`, reused by both `search` and `startsWith`. |
| `children` | A `TrieNode` field: a map `{ letter: TrieNode }` of outgoing edges from that node. |
| `isEnd` | A `TrieNode` boolean flag: `true` only on the node where a complete inserted word ends (drawn as a ✓). `search` requires it; `startsWith` does not. |
