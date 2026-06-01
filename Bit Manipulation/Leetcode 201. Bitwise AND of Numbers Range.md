
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Bit%20Manipulation/bitwise_and_of_numbers_range_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `left` | Low end of the range. Repeatedly right-shifted to strip low bits; when it equals `right` it holds the common binary prefix. |
| `right` | High end of the range. Right-shifted in lockstep with `left` until the two match. |
| `shift` | Count of low bits dropped while finding the common prefix. Used at the end to shift the prefix back left into its original position (`left << shift`). |
