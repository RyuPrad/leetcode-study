
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Advanced%20Graphs/cheapest_flights_within_k_stops_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | Number of cities (nodes), labeled `0 .. n-1`. |
| `flights` | List of directed edges `[u, v, w]`: a flight from city `u` to city `v` costing `w`. |
| `src` | Source city we depart from. |
| `dst` | Destination city we want the cheapest price to. |
| `k` | Maximum number of intermediate stops allowed (so at most `k + 1` flights). |
| `dist` | Cheapest known price to reach each city using the edges relaxed so far. Starts `Infinity` everywhere except `dist[src] = 0`. |
| `tmp` | A fresh copy of `dist` for the current round. Relaxing into `tmp` while reading from `dist` guarantees each round adds exactly one more flight, which is what bounds the path to `k + 1` edges. |
| `i` | Round counter, `0 .. k`. Round `i` lets paths use one more hop than round `i-1`. |
| `u` | Origin city of the flight currently being relaxed. |
| `v` | Destination city of the flight currently being relaxed (the entry we may improve in `tmp`). |
| `w` | Price (weight) of the flight currently being relaxed. |

## Idea

This is **Bellman-Ford with a stop limit**. Plain Dijkstra fails because the cheapest route may not be the one with the fewest stops, and the "at most `k` stops" constraint is about path *length*, not cost.

Bellman-Ford relaxes every edge once per round. After round `i`, `dist[v]` holds the cheapest price to `v` using **at most `i + 1` flights**. So running exactly `k + 1` rounds gives the cheapest price within `k` stops.

The crucial trick is the `tmp = dist.slice()` copy: we read from the *previous* round's `dist` and write improvements into `tmp`. Without the copy, an edge relaxed earlier in the same round could feed another relaxation, letting a single round use more than one new flight and breaking the stop bound.

- **Time:** `O((k + 1) * E)` — `k + 1` rounds, each scanning all `E` flights.
- **Space:** `O(n)` for `dist` and `tmp`.
