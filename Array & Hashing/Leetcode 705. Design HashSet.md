
<iframe
  src="design_hashset_visualizer.html"
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
| buckets | array of `size` chains; each chain is a list of keys (separate chaining) |
| key | the value being added, removed, or looked up |
| idx | bucket index for a key, computed as `key % size` |
