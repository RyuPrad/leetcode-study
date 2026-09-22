
<iframe
  src="implement_queue_using_stacks_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `sIn` | input stack; every `push` lands here (newest on top) |
| `sOut` | output stack; serves the oldest element. Filled by pouring `sIn` into it, which reverses the order so the oldest element ends up on top |
| `x` | the value being pushed |
