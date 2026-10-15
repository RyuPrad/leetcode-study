<iframe
  src="maximum_number_of_removable_characters_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | source string |
| p | pattern that must stay a subsequence of s |
| removable | indices of s, removed in this order |
| isSubsequence | helper: is p still a subsequence after removing the first k indices? |
| k | number of removals being tested |
| removed | the first k removable indices |
| i | index in s |
| j | index in p matched next |
| left | most removals known to keep p |
| right | most removals still possible |
| mid | removal count being tested |
