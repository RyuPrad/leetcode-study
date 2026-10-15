<iframe
  src="maximum_twin_sum_of_a_linked_list_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| head | first node of the list (even length) |
| slow | moves one node per step; ends at the first node of the second half |
| fast | moves two nodes per step |
| prev | head of the reversed first half |
| next | node after slow, saved before relinking |
| res | largest twin sum so far |
