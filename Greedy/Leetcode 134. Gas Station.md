
<iframe
  src="gas_station_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `gas` | Fuel available at each station. |
| `cost` | Fuel needed to travel from each station to the next. |
| `total` | Running sum of `diff` over all stations; circuit is possible only if `total >= 0`. |
| `tank` | Fuel in the tank since the current candidate start station; resets to 0 when it goes negative. |
| `start` | Candidate starting station index; bumped to `i + 1` whenever `tank` drops below 0. |
| `diff` | `gas[i] - cost[i]` — net fuel gained crossing station `i`. |
| `i` | Index of the station currently being visited. |
| `ans` | Result: the valid starting index, or `-1` if no circuit is possible. |
