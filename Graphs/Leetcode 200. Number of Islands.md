
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/number_of_islands_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `grid` | The input matrix of strings; `"1"` is land, `"0"` is water. DFS mutates land to `"0"` as it floods. |
| `rows` | Number of rows, `grid.length`. |
| `cols` | Number of columns, `grid[0].length`. |
| `r` | Current row index (scan loop, and the row argument inside `dfs`). |
| `c` | Current column index (scan loop, and the column argument inside `dfs`). |
| `count` | Running answer: number of islands found so far. Incremented once per new land seed. |
| `dfs` | Recursive flood-fill closure that sinks every land cell connected to `(r, c)`. |
