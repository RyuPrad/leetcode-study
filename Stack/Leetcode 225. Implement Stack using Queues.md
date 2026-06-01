
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Stack/implement_stack_using_queues_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `q` | the single backing FIFO queue; `q[0]` is the front (the logical top of the stack) |
| `x` | the value being pushed |
| `i` | loop index used while rotating the queue so the newest element reaches the front |
