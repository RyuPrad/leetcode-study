
<iframe
  src="baseball_game_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `operations` | input array of record operations (integers, `"+"`, `"D"`, `"C"`) |
| `stack` | LIFO stack of valid recorded scores |
| `res` | final answer: sum of every record left on the stack |
