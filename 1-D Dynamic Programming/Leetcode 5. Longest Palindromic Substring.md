
<iframe
  src="longest_palindromic_substring_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | The input string we search for the longest palindromic substring. |
| `start` | Start index of the best palindrome found so far. |
| `maxLen` | Length of the best palindrome found so far (the answer is `s.substring(start, start + maxLen)`). |
| `expand` | Helper arrow function that grows two pointers `l`/`r` outward while the characters match. |
| `l` | Left pointer of the current expansion (moves left, `l--`). |
| `r` | Right pointer of the current expansion (moves right, `r++`). |
| `i` | Loop index; each `i` is tried as both an odd center (`expand(i, i)`) and an even center (`expand(i, i + 1)`). |
