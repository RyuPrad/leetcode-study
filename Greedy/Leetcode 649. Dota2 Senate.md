
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Greedy/dota2_senate_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| senate | Input string of `R`/`D` senators in voting order |
| n | Number of senators (`senate.length`) |
| radiant | Queue of Radiant senator indices waiting to vote |
| dire | Queue of Dire senator indices waiting to vote |
| i | Index used while filling the two queues |
| r | Front Radiant index dequeued this round |
| d | Front Dire index dequeued this round |
| ans | Winning party: `"Radiant"` or `"Dire"` |
