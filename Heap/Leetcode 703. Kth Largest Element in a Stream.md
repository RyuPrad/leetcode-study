
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Heap/kth_largest_element_in_a_stream_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `k` | which largest element to track (the kth largest) |
| `heap` | a MinHeap holding the k largest values seen so far |
| `val` | the value passed to `add(val)` |
| `nums` | the initial numbers used to seed the stream in the constructor |
| `num` | the current initial number being added during construction |
