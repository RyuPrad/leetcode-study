<iframe
  src="minimum_number_of_days_to_eat_n_oranges_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | oranges at the start |
| memo | oranges left → fewest days to eat them |
| dfs | fewest days to eat k oranges |
| k | oranges left |
| half | days if we eat down to a multiple of 2, then halve |
| third | days if we eat down to a multiple of 3, then take two thirds |
