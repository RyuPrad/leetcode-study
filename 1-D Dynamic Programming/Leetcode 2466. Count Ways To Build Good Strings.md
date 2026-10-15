<iframe
  src="count_ways_to_build_good_strings_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| low | shortest good length |
| high | longest good length |
| zero | length of each block of 0s |
| one | length of each block of 1s |
| MOD | 10^9 + 7 |
| dp | dp[len] = number of strings of exactly that length |
| res | good strings counted so far |
| len | length being counted |
