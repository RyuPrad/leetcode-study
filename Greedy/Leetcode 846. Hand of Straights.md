
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Greedy/hand_of_straights_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| hand | The array of card values dealt to you |
| groupSize | Required length of each consecutive straight |
| count | Map from card value to how many copies remain |
| keys | The distinct card values, sorted ascending |
| start | Smallest still-available value; head of the next straight |
| need | How many copies of `start` remain (groups to build from here) |
| card | The value currently being removed while extending a straight |
| ans | Result: `true` if every card fits a straight, else `false` |
