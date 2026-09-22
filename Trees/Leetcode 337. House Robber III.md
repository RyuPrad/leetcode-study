
<iframe
  src="house_robber_iii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `root` | root node of the binary tree |
| `node` | current node in the `dfs` recursion |
| `left` | pair `[robThis, skipThis]` returned by the left child |
| `right` | pair `[robThis, skipThis]` returned by the right child |
| `withRoot` | best total if we rob this node: `node.val + left[1] + right[1]` |
| `withoutRoot` | best total if we skip this node: `max(left) + max(right)` |
| `res` | pair `[withRoot, withoutRoot]` returned by `dfs(root)` |
