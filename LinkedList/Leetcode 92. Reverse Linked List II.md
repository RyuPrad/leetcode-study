
<iframe
  src="reverse_linked_list_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `head` | head node of the input linked list |
| `dummy` | sentinel node before `head` so the node before `left` always exists |
| `prev` | node fixed just before position `left`; the reversed section is head-inserted after it |
| `curr` | first node of the section to reverse; stays put and slides toward the back |
| `next` | node being detached from after `curr` and spliced to the front each iteration |
| `left` | start position of the sublist to reverse (1-indexed) |
| `right` | end position of the sublist to reverse (1-indexed) |
