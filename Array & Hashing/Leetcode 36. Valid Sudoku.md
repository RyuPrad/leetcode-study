
<iframe
  src="valid_sudoku_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| board | 9×9 grid of digit chars and '.' for empty |
| r | current row index (0-8) |
| c | current column index (0-8) |
| val | digit at board[r][c] |
| rows | array of 9 Sets, one per row |
| cols | array of 9 Sets, one per column |
| boxes | array of 9 Sets, one per 3×3 box |
| b | box index = Math.floor(r/3)*3 + Math.floor(c/3) |
| ans | boolean result: true if valid, false on first conflict |
