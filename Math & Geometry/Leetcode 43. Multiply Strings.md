
<iframe
  src="multiply_strings_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `num1`, `num2` | The two non-negative integers given as strings (may be too large for a JS number). |
| `m`, `n` | Lengths of `num1` and `num2`. |
| `pos` | Digit accumulator of length `m + n`; `pos[k]` holds the digit at place `k` (most significant on the left). |
| `mul` | Product of the two current single digits `num1[i] * num2[j]`. |
| `p1`, `p2` | The two landing slots for `mul`: carry goes to `p1 = i + j`, the units digit to `p2 = i + j + 1`. |
| `sum` | `mul + pos[p2]` — the new value at the low slot before splitting into digit + carry. |
| `res` | `pos` joined into a string, then with leading zeros stripped. |

## Idea

This is grade-school long multiplication, but instead of building partial rows we accumulate directly into a single `pos` array of length `m + n` (the product of an m-digit and n-digit number has at most `m + n` digits). The key index fact: multiplying `num1[i]` by `num2[j]` contributes to positions `i + j` (carry / tens) and `i + j + 1` (units). Iterate both indices from least significant to most, add each product's units into `pos[p2]` (keeping `% 10`) and push the carry up into `pos[p1]`. Finally join and strip the possible leading zero. The `"0"` short-circuit avoids returning `"0...0"`.

- Time: `O(m · n)`.
- Space: `O(m + n)` for `pos`.
