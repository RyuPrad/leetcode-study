
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Graphs/course_schedule_ii_visualizer.html"
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
| `prerequisites` | List of pairs `[course, pre]` meaning `pre` must come before `course` (edge `pre → course`). |
| `adj` | Adjacency list; `adj[pre]` holds every course that `pre` directly unlocks. |
| `indegree` | `indegree[c]` = how many prerequisites course `c` still has unmet. |
| `queue` | Courses with `indegree === 0`, ready to be scheduled next (Kahn's BFS). |
| `order` | The topological order being built — the answer when it contains every course. |
| `node` | The course currently dequeued and appended to `order`. |
| `next` | A course unlocked by `node`; its `indegree` is decremented and it may enter the queue. |
