
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Advanced%20Graphs/reconstruct_itinerary_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `tickets` | List of `[from, to]` airport pairs. Each ticket is a directed edge that must be used **exactly once**. |
| `adj` | `Map` from an airport to its list of destinations. Built from `tickets`, then each list is sorted lexically. |
| `dests` | The destination list `adj.get(airport)` for the airport currently being visited. `shift()` removes (consumes) the smallest unused edge. |
| `res` | The route collected in **post-order** — an airport is pushed only after all of its outgoing edges are used. Reversed at the end to give the itinerary. |
| `visit` | Recursive Hierholzer DFS. Drains an airport's edges, recursing greedily into the lexically smallest first. |
| `airport` | The airport whose frame is currently on the call stack (argument to `visit`). |
| `next` | The destination just `shift()`-ed off `dests`; the recursion target `visit(next)`. |
| `from` | Origin airport of a ticket while building `adj`. |
| `to` | Destination airport of a ticket while building `adj`. |

## Idea

We must use every ticket exactly once and return the **lexically smallest** valid itinerary starting at `JFK`. That is an **Eulerian path**, and **Hierholzer's algorithm** builds one in linear time.

Two ideas combine:

1. **Lexical greed.** Sorting each `adj` list and always taking the smallest destination first biases the walk toward the smallest itinerary.
2. **Post-order collection.** A naive greedy walk can wander into a dead end before using all tickets. Hierholzer fixes this: when an airport has no remaining edges, we push it to `res` and back out. Because dead ends are appended *last*, reversing `res` produces a valid Eulerian path — any stranded "tail" ends up correctly stitched into the route.

Each ticket is consumed once via `dests.shift()`, so the recursion depth and total work are bounded by the number of edges.

- **Time:** `O(E log E)` — sorting the adjacency lists dominates (`E` = number of tickets).
- **Space:** `O(E)` for `adj`, the recursion stack, and `res`.
