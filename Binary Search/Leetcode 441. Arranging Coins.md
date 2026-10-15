<iframe
  src="arranging_coins_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | number of coins |
| left | smallest row count still possible |
| right | largest row count still possible |
| res | most complete rows confirmed so far |
| mid | row count being tested |
| coins | coins needed for mid complete rows: mid * (mid + 1) / 2 |
