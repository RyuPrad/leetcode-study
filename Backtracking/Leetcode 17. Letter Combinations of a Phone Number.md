
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Backtracking/letter_combinations_of_a_phone_number_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `digits` | input string of digits 2-9 |
| `map` | keypad mapping from each digit to its letters |
| `res` | output list of all complete combination strings |
| `path` | letters chosen so far (one per digit) |
| `i` | index of the digit currently being expanded |
