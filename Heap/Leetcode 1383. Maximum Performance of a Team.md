<iframe
  src="maximum_performance_of_a_team_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| n | number of engineers |
| speed | speed of each engineer |
| efficiency | efficiency of each engineer |
| k | most engineers on the team |
| engineers | [efficiency, speed] sorted by efficiency, highest first |
| heap | min-heap of the chosen speeds |
| sum | sum of the speeds in the heap |
| best | best performance (a BigInt, so large products stay exact) |
| eff | efficiency of the engineer being added, the minimum so far |
| spd | speed of that engineer |
| performance | sum × eff |
