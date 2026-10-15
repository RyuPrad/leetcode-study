<iframe
  src="palindrome_linked_list_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| head | first node of the list |
| slow | moves one node per step; ends at the start of the second half |
| fast | moves two nodes per step |
| prev | head of the reversed second half |
| next | node after slow, saved before relinking |
| left | walks the first half from the head |
| right | walks the reversed second half |
