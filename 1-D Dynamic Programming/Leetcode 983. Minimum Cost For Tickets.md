<iframe
  src="minimum_cost_for_tickets_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| days | travel days, increasing |
| costs | prices of a 1-day, 7-day and 30-day pass |
| last | final travel day |
| travel | set of travel days |
| dp | dp[d] = cheapest cost to cover every travel day up to day d |
| d | day being priced |
| day | cost if a 1-day pass covers day d |
| week | cost if a 7-day pass ending on day d covers it |
| month | cost if a 30-day pass ending on day d covers it |
