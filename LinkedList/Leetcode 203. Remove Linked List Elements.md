<iframe
  src="remove_linked_list_elements_visualizer.html"
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
| val | value to remove |
| dummy | extra node before head, so the head can be removed like any other node |
| curr | last kept node; its next is checked |
