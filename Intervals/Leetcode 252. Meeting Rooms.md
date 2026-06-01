
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Intervals/meeting_rooms_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `intervals` | Array of `[start, end]` meeting times, sorted ascending by start time |
| `i` | Loop index (starts at 1); compares meeting `i` against the previous meeting `i - 1` |
| `intervals[i][0]` | Start time of the current meeting |
| `intervals[i - 1][1]` | End time of the previous meeting |
| `ans` | Boolean result — `true` if the person can attend every meeting, `false` if any two overlap |
