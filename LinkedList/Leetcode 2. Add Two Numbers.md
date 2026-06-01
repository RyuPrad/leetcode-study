
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/LinkedList/add_two_numbers_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `l1` | first input list, digits stored least-significant-first |
| `l2` | second input list, digits stored least-significant-first |
| `dummy` | sentinel node before the result list head |
| `curr` | builder pointer; appends each new result digit node |
| `carry` | carry into the next digit (0 or 1) |
| `sum` | `l1.val + l2.val + carry` for the current position |
