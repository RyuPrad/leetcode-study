
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/surrounded_regions_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `board` | The `rows x cols` grid of `"X"` and `"O"`. Mutated in place: any `"O"` region that does **not** touch the border is captured to `"X"`. |
| `rows` | Number of rows, `board.length`. |
| `cols` | Number of columns, `board[0].length`. |
| `dfs` | Flood-fill `(r, c)` from a border cell; marks every border-connected `"O"` as `"S"` (safe) so it survives the final flip. |
| `r` | Current row index in the border scan / final flip. |
| `c` | Current column index in the border scan / final flip. |
