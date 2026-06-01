
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Greedy/jump_game_ii_visualizer.html"
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
| jumps | Count of jumps taken so far; the final answer (minimum jumps to reach the last index). |
| curEnd | The farthest index reachable using the current number of jumps — the right edge of the current BFS "level" window. |
| farthest | The farthest index reachable from any cell scanned so far; becomes the next `curEnd` when a jump is taken. |
| i | Loop pointer scanning indices `0 .. nums.length - 2`. |
