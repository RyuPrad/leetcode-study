
<iframe
  src="candy_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `ratings` | Input array of each child's rating. |
| `n` | Number of children (`ratings.length`). |
| `candies` | Candy count per child; starts at all 1s, raised in two passes. |
| `i` | Index of the child currently being compared with a neighbor. |
| `ans` | Result: minimum total candies that satisfy both neighbor rules. |
