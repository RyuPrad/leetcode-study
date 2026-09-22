
<iframe
  src="jump_game_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| nums | Input array; `nums[i]` is the max jump length from index `i`. |
| goal | The leftmost index currently known to reach the last cell; starts at `nums.length - 1` and shrinks left. |
| i | Loop pointer scanning the array from right to left (`nums.length - 2` down to `0`). |
| ans | Final boolean: `true` iff `goal` reaches `0`, meaning the start can chain to the end. |
