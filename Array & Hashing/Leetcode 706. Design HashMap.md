
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Array%20%26%20Hashing/design_hashmap_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| size | number of buckets (fixed at 8) |
| buckets | array of `size` chains; each chain is a list of `[key, value]` pairs (separate chaining) |
| key | the key being put, gotten, or removed |
| value | the value stored for a key on `put` |
| idx | bucket index for a key, computed as `key % size` |
