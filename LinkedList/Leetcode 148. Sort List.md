<iframe
  src="sort_list_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| head | first node of the list this call sorts |
| slow | ends at the last node of the left half |
| fast | moves two nodes per step |
| right | first node of the right half |
| a | next unmerged node of the sorted left half |
| b | next unmerged node of the sorted right half |
| dummy | extra node before the merged list |
| tail | last node of the merged list |
