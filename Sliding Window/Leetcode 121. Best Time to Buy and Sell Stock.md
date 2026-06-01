
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Sliding%20Window/best_time_to_buy_and_sell_stock_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `prices` | input array where `prices[d]` is the stock price on day `d` |
| `left` | buy day; the left edge of the window (the cheapest day seen so far) |
| `right` | sell day; the right edge of the window that scans forward |
| `ans` | best profit found so far, `max(ans, prices[right] - prices[left])` |
