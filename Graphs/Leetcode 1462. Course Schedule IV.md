
<iframe
  src="course_schedule_iv_visualizer.html"
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
| `prerequisites` | List of pairs `[a, b]` meaning `a` is a prerequisite of `b` (directed edge `a → b`). |
| `queries` | List of pairs `[u, v]`; each asks "is `u` a prerequisite of `v`?" |
| `adj` | Adjacency list; `adj[a]` holds every course that `a` directly unlocks. |
| `reach` | `numCourses × numCourses` boolean matrix; `reach[src][dst]` is `true` when `src` is a (direct or indirect) prerequisite of `dst`. |
| `dfs` | Depth-first search from a fixed `src`; marks `reach[src][nei]` for everything reachable. |
| `src` | The root course whose transitive descendants we are filling in. |
| `nei` | A neighbor of the current node being marked reachable from `src`. |
| `res` | Result array: `queries.map(([u, v]) => reach[u][v])`. |
