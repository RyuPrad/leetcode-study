
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/LinkedList/lfu_cache_visualizer.html"
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
| `keyToVal` | `Map` from key to its stored value |
| `keyToFreq` | `Map` from key to its current access frequency |
| `freqToKeys` | `Map` from frequency to a `Set` of keys at that frequency (insertion-ordered) |
| `minFreq` | smallest frequency currently present; its oldest key is evicted first |
| `key` | key being read or written |
| `value` | value read from or written to the cache |
