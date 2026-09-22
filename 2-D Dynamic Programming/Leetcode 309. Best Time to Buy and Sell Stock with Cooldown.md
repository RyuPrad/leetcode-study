
<iframe
  src="best_time_to_buy_and_sell_stock_with_cooldown_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `prices` | Input array of daily stock prices |
| `n` | Number of days (length of `prices`) |
| `hold` | `hold[i]` = max profit on day `i` while **owning** a share |
| `sold` | `sold[i]` = max profit on day `i` if you **sold today** (next day is a forced cooldown) |
| `rest` | `rest[i]` = max profit on day `i` while **idle** (not holding, free to buy) |
| `i` | Current day index in the loop |
| `ans` | Final answer = `max(sold[n-1], rest[n-1])` (never end while still holding) |
