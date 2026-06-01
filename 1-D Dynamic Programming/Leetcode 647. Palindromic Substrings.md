
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/1-D%20Dynamic%20Programming/palindromic_substrings_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | The input string whose palindromic substrings we count. |
| `count` | Running total of palindromic substrings found so far (the answer). |
| `expand` | Helper arrow function that grows two pointers `l`/`r` outward, incrementing `count` for every matching span. |
| `l` | Left pointer of the current expansion (moves left, `l--`). |
| `r` | Right pointer of the current expansion (moves right, `r++`). |
| `i` | Loop index; each `i` is tried as both an odd center (`expand(i, i)`) and an even center (`expand(i, i + 1)`). |
