<iframe
  src="number_of_longest_increasing_subsequence_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | the sequence |
| n | its length |
| length | length[i] = longest increasing subsequence ending at i |
| count | count[i] = how many subsequences ending at i have that length |
| i | end of the subsequences being counted |
| j | earlier position that could come just before i |
| longest | overall longest length |
| res | number of longest subsequences |
