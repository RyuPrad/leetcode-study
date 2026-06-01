
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Heap/last_stone_weight_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `stones` | input array of stone weights |
| `heap` | a MaxHeap so the root is always the heaviest stone |
| `s` | the current stone weight being pushed while building the heap |
| `a` | the heaviest stone, popped first each round |
| `b` | the second heaviest stone, popped next |
