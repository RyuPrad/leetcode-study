
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Math%20%26%20Geometry/insert_greatest_common_divisors_in_linked_list_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `head` | Head node of the input linked list (also returned at the end). |
| `gcd` | Recursive Euclid helper: `gcd(a, b) = b === 0 ? a : gcd(b, a % b)`. |
| `curr` | Walking pointer; sits on the left node of the current consecutive pair. |
| `node` | The freshly created `ListNode` holding `gcd(curr.val, curr.next.val)`. |
| `ListNode` | ES6 class node: `constructor(val, next = null)` with `this.val` and `this.next`. |
| `a`, `b` | The two values fed into `gcd` (`curr.val` and `curr.next.val`). |
