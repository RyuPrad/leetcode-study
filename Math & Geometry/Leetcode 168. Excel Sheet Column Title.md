
<iframe
  src="excel_sheet_column_title_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `columnNumber` | The 1-indexed column number being converted; shrinks each loop after the `--` and floor-divide by 26. |
| `res` | The accumulating column title string; each new letter is prepended (built right-to-left). |
| `rem` | `columnNumber % 26` after decrementing — the 0-based letter index (0 = `A`, 25 = `Z`). |

## Idea

Excel columns are **bijective base-26**: there is no digit `0`, so `A..Z` map to `1..26` rather than `0..25`. To convert a number, decrement by 1 first to shift into a normal 0-indexed system, take `% 26` for the current letter (`String.fromCharCode(65 + rem)`), prepend it to the answer, then floor-divide by 26 to move to the next place. Repeat until the number reaches 0.

- Time: `O(log_26 n)` — one iteration per output letter.
- Space: `O(1)` extra (ignoring the output string).
