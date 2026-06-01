
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Stack/online_stock_span_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `stack` | monotonic stack of `[price, span]` entries; prices stay strictly decreasing from top to bottom |
| `price` | the price passed to the current `next(price)` call |
| `span` | the answer being built: 1 plus the spans of every popped entry whose price is `<= price` |
