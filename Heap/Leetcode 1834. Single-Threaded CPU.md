
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Heap/single_threaded_cpu_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `tasks` | Input array; `tasks[i] = [enqueueTime, processingTime]`. |
| `indexed` | `tasks` tagged with original index `[enqueueTime, processingTime, i]`, then sorted by `enqueueTime`. |
| `heap` | Min-heap of available tasks, keyed lexicographically by `[processingTime, index]`. |
| `time` | The CPU clock; advances by a task's `processingTime`, or jumps to the next `enqueueTime` when idle. |
| `i` | Pointer into `indexed`; admits every task with `enqueueTime <= time` into the heap. |
| `res` | Output order: indices of tasks in the sequence the CPU runs them. |
