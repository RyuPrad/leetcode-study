
<iframe
  src="meeting_rooms_iii_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `n` | Number of meeting rooms, indexed `0 .. n-1`. |
| `meetings` | Array of `[start, end]` meetings, sorted ascending by start time. |
| `count` | `count[r]` = how many meetings room `r` has hosted (the booking counter). |
| `available` | Sorted list of free room indices; lowest index is taken first. |
| `busy` | List of `[endTime, room]` for rooms in use, kept sorted by end time (ties by room). |
| `start`, `end` | Endpoints of the meeting currently being processed. |
| `room` | The room chosen for the current meeting (freed, assigned, or waited for). |
| `freeTime` | When the earliest-freeing busy room becomes available (used when all rooms are busy). |
| `best` | Index of the busiest room so far; the final answer (lowest index wins ties). |
| `r` | Loop index over rooms (initial fill and final scan for the busiest room). |
