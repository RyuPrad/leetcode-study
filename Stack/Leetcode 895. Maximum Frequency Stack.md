
<iframe
  src="maximum_frequency_stack_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `freq` | Map from a value to its current count (how many copies are live in the structure) |
| `group` | Map from a count to the stack of values that have reached that count; `group[f]` is the LIFO stack for frequency `f` |
| `maxFreq` | the highest frequency any value currently has; `pop()` always serves from `group[maxFreq]` |
| `val` | the value being pushed, or the value popped and returned (top of `group[maxFreq]`, ties broken by most recent) |
