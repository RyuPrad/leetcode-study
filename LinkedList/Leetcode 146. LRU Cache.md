
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/LinkedList/lru_cache_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `capacity` | maximum number of entries the cache holds |
| `cache` | `Map` of key to value; insertion order = recency (front = LRU, back = MRU) |
| `key` | key being read or written |
| `value` | value read from or written to the cache |
