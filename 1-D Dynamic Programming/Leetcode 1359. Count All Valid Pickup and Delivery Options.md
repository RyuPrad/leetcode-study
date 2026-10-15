<iframe
  src="count_all_valid_pickup_and_delivery_options_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | number of orders |
| MOD | 10^9 + 7 |
| res | valid sequences for the orders placed so far |
| i | order being added |
| slots | gaps for the new pickup among the 2(i - 1) existing stops, plus one |
