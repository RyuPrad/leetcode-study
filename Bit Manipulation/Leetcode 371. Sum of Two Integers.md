
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Bit%20Manipulation/sum_of_two_integers_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `a` | First integer; also accumulates the running carry-less sum (`a ^ b`). Becomes the final answer. |
| `b` | Second integer; reused each iteration to hold the carry that still needs to be added. Loop ends when `b` is 0. |
| `carry` | The carry bits for this step, computed as `(a & b) << 1`. Columns where both `a` and `b` are 1 produce a carry into the next-higher bit. |
