<iframe
  src="maximum_product_of_the_length_of_two_palindromic_subsequences_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| s | input string (at most 12 characters) |
| n | s.length |
| palindromes | bitmask → length, for every palindromic subsequence |
| mask | subset of indices being tested |
| picked | characters of s chosen by mask |
| i | index tested in mask |
| res | largest product found |
| a | first mask of a pair |
| lenA | its length |
| b | second mask of a pair |
| lenB | its length |
