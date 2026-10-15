<iframe
  src="number_of_ways_to_form_a_target_string_given_a_dictionary_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| words | words of equal length |
| target | string to form |
| MOD | 10^9 + 7 |
| len | length of each word |
| m | length of target |
| count | count[c][x] = how many words have letter x in column c |
| word | word being counted |
| c | column being used |
| dp | dp[t] = ways to form target[0..t-1] from the columns so far |
| t | target prefix length being extended |
| ways | words whose column c has the letter target[t - 1] |
