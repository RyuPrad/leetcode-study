
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Greedy/merge_triplets_to_form_target_triplet_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| triplets | List of `[x, y, z]` triplet rows we may merge with max() |
| target | The triplet `[t0, t1, t2]` we are trying to build |
| a | Flag: some usable triplet has its first component equal to target[0] |
| b | Flag: some usable triplet has its second component equal to target[1] |
| c | Flag: some usable triplet has its third component equal to target[2] |
| x, y, z | The three components of the current triplet being examined |
| ans | Final result: `a && b && c` |
