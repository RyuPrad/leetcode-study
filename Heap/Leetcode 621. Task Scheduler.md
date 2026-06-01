
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Heap/task_scheduler_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `tasks` | Input array of task labels (e.g. `["A","A","A","B","B","B"]`). |
| `n` | Cooldown: the same task must wait `n` cycles before running again. |
| `freq` | Map of each task to how many times it must run. |
| `heap` | Max-heap of the remaining counts; the root is the task with the most work left. |
| `time` | CPU clock; incremented every cycle and returned as the answer. |
| `queue` | Cooldown queue of `[count, readyTime]`; a task re-enters `heap` when `readyTime === time`. |
| `cnt` | `heap.pop() - 1`: remaining count after running the chosen task this cycle. |
