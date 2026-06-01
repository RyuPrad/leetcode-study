
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Math%20%26%20Geometry/roman_to_integer_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `s` | The input Roman numeral string being scanned left to right. |
| `map` | Lookup of each Roman symbol to its integer value (`I`=1 … `M`=1000). |
| `res` | The running total; we subtract or add each symbol's value into it. |
| `i` | Current scan index into `s`. |

## Idea

Roman numerals are almost purely additive — except for the six subtractive pairs (`IV`, `IX`, `XL`, `XC`, `CD`, `CM`). The trick: a symbol is subtractive exactly when its value is **less than the value of the symbol immediately to its right**. So scan left to right and for each symbol, peek at the next one: if `map[s[i]] < map[s[i+1]]`, subtract; otherwise add.

- Time: `O(n)` — one pass over the string.
- Space: `O(1)` — fixed-size value map.
