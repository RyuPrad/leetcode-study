
<iframe
  src="car_pooling_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `trips` | Input `[num, start, end]` triples, sorted ascending by `start`. |
| `capacity` | Maximum passengers the car can hold at once. |
| `heap` | Min-heap of `[end, num]` tuples, compared by `el[0]` (drop-off location). |
| `cur` | Passengers currently on board; must never exceed `capacity`. |
| `num` / `start` / `end` | Fields of the trip being processed. |
