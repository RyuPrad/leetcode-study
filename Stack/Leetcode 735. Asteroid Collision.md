
<iframe
  src="asteroid_collision_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `asteroids` | input array of nonzero ints; sign = direction (positive moves right, negative moves left), magnitude = size |
| `stack` | LIFO stack of asteroids that have survived so far |
| `a` | the current asteroid being processed in the for-loop |
| `top` | the asteroid currently on top of the stack (`stack[stack.length - 1]`) compared against `a` during a collision |
