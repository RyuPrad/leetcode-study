
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/LinkedList/reverse_nodes_in_k_group_visualizer.html"
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
| `dummy` | sentinel node placed before `head` so the first group has a stable predecessor |
| `groupPrev` | node just before the group currently being reversed |
| `groupNext` | node just after the group (the boundary where reversal stops) |
| `kth` | the k-th node of the current group (its new head after reversal) |
| `prev` | previous node during the in-group reversal |
| `curr` | current node during the in-group reversal |
| `next` | saved `curr.next` before each `.next` rewire |
| `k` | group size to reverse |
