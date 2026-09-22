
<iframe
  src="open_the_lock_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `deadends` | List of forbidden 4-digit states the lock can never display. |
| `target` | The 4-digit combination we are trying to reach from `"0000"`. |
| `dead` | A `Set` of the deadends for O(1) membership tests. |
| `visited` | A `Set` of every state already enqueued, so BFS never revisits one. |
| `queue` | The current BFS frontier: all states reachable in exactly `turns` moves. |
| `turns` | BFS level counter = number of single-wheel moves so far (the answer). |
| `state` | The 4-digit string popped from the frontier and expanded this step. |
| `digit` | A neighbouring wheel value, computed as `(Number(state[i]) + d + 10) % 10`. |
| `nextState` | A neighbour string formed by turning one wheel of `state` up or down. |
