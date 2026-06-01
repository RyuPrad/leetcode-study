
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Stack/car_fleet_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `target` | the finish-line position every car drives toward |
| `position` | input array of each car's starting position on the road |
| `speed` | input array of each car's speed (same index as `position`) |
| `cars` | `[position, speed]` pairs sorted by position descending (closest to target first) |
| `stack` | LIFO stack of fleet arrival times; each surviving entry is one fleet, so `stack.length` is the answer |
