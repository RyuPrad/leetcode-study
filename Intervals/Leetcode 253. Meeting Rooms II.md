
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Intervals/meeting_rooms_ii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `intervals` | Array of `[start, end]` meeting times |
| `starts` | All meeting start times, sorted ascending — the "rising" events of the sweep line |
| `ends` | All meeting end times, sorted ascending — the "falling" events of the sweep line |
| `rooms` | Number of meetings currently in progress; `++` on a start event, `--` on an end event |
| `maxRooms` | Running maximum of `rooms` — the peak concurrency, i.e. the minimum rooms needed (returned) |
| `s` | Pointer into `starts` — index of the next meeting to begin |
| `e` | Pointer into `ends` — index of the next meeting to finish |
