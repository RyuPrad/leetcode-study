
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Heap/find_median_from_data_stream_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `small` | Max-heap holding the lower half of the stream; its root is the largest of the small numbers. |
| `large` | Min-heap holding the upper half of the stream; its root is the smallest of the large numbers. |
| `num` | The value passed to `addNum`; pushed into `small` first, then rebalanced across the two heaps. |
| `median` | Top of the larger heap when sizes differ; the average of the two roots when sizes are equal. |
