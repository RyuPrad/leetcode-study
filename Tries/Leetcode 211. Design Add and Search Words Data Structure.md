
<iframe
  src="design_add_and_search_words_data_structure_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | The dictionary's entry point: a `TrieNode` holding the first letter of every added word as its children. `search` always starts its DFS here with `dfs(this.root, 0)`. |
| `node` | The current `TrieNode` being examined — the first parameter of `dfs(node, i)`, and the walking pointer in `addWord`. |
| `ch` | The current search character `word[i]`. If it equals `"."` it is a wildcard that matches ANY child; otherwise it must match a single specific child. |
| `word` | The string passed to `addWord` (letters only) or `search` (letters plus `.` wildcards). |
| `i` | The DFS depth / index into `word`. The base case is `i === word.length`, where the answer is `node.isEnd`. |
| `key` | A child letter iterated by `for (const key in node.children)` while resolving a `.` wildcard — every key is a branch the DFS may try. |
| `children` | A `TrieNode` field: the map `{ letter: TrieNode }` of outgoing edges. At a `.`, the DFS recurses into each entry of this map. |
| `isEnd` | A `TrieNode` boolean flag marking where a complete added word ends (drawn as a ✓). Returned at the base case `i === word.length`. |
| `dfs` | The recursive arrow function inside `search`. It returns `true` as soon as one branch succeeds and backtracks (`return false`) when a path dead-ends, so `.` patterns explore the trie depth-first. |
