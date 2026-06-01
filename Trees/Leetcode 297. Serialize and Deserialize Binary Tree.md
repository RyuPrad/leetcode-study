
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Trees/serialize_and_deserialize_binary_tree_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | root of the tree being serialized (and the tree rebuilt by deserialize) |
| `res` | array collected during serialize: each `node.val` plus a `"null"` marker for every missing child |
| `node` | current node during the preorder DFS of each phase |
| `data` | the comma-joined serialized string passed from serialize to deserialize |
| `vals` | `data.split(",")`, the token list consumed during deserialize |
| `i` | index into `vals`; advances left-to-right as deserialize rebuilds the tree |
