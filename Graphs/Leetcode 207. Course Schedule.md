
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/course_schedule_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `numCourses` | Number of courses, labeled `0 .. numCourses - 1`. |
| `prerequisites` | List of pairs `[course, pre]` meaning you must take `pre` before `course` (edge `pre → course`). |
| `adj` | Adjacency list; `adj[pre]` holds every course that `pre` directly unlocks. |
| `indegree` | `indegree[c]` = how many prerequisites course `c` still has unmet. |
| `queue` | Courses whose `indegree` has reached `0` — ready to be taken next (Kahn's BFS). |
| `count` | How many courses have been removed/taken so far. |
| `node` | The course currently dequeued and being "taken". |
| `next` | A course unlocked by `node`; its `indegree` is decremented. |
| `ans` | Final boolean: `count === numCourses` (true ⇒ no cycle ⇒ all courses finishable). |
