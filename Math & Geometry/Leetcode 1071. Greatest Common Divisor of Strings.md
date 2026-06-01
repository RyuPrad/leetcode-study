
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Math%20%26%20Geometry/greatest_common_divisor_of_strings_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| str1 | First input string; the answer is taken as a prefix of this string |
| str2 | Second input string; compared against str1 for a common base unit |
| gcd | Recursive Euclid helper `(a, b) => b === 0 ? a : gcd(b, a % b)` run on the two lengths |
| len | `gcd(str1.length, str2.length)` — the length of the largest common divisor string |
| ans | Return value: `str1.substring(0, len)`, or `""` when `str1 + str2 !== str2 + str1` |
