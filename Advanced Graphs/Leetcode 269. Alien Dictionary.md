
<iframe
  src="file:///C:/Users/ryupr/Documents/Obsidian%20Vault/Leetcode/Advanced%20Graphs/alien_dictionary_visualizer.html"
  width="100%"
  height="800px"
  frameborder="0"
  allow="fullscreen"
  allowfullscreen>
</iframe>

## Variable Pattern

| Name | Meaning |
|---|---|
| `words` | The list of alien words, already sorted in the unknown alphabet's lexicographic order. The whole problem is to recover that order. |
| `adj` | `Map<char, Set<char>>` adjacency list. `adj[a]` holds every character that must come *after* `a`. An edge `a → b` means `a` precedes `b`. |
| `indegree` | `Map<char, number>` counting how many edges point *into* each character. A character with indegree 0 has no unresolved predecessor and may be emitted next. Its `.size` is the number of distinct characters. |
| `w1` | The earlier word of the adjacent pair `words[i]` being compared. |
| `w2` | The later word of the adjacent pair `words[i + 1]`. The first position where `w1` and `w2` differ reveals one ordering constraint. |
| `minLen` | `Math.min(w1.length, w2.length)` — only the shared-length prefix can be compared. If `w1` is longer but the prefix is identical (`["abc","ab"]`), the input is invalid and the answer is `""`. |
| `queue` | The Kahn (BFS) queue, seeded with every indegree-0 character. Processed with a moving `head` index instead of `shift()`, so it doubles as the visit history. |
| `res` | The result string built one character at a time as nodes are popped. If `res.length` ends up less than `indegree.size`, a cycle exists (e.g. `["z","x","z"]`) and the function returns `""`. |
| `ch` | The character currently popped from the queue (and appended to `res`), or the loop variable while registering nodes. |
| `nei` | A neighbor of `ch` (`ch → nei`). Its indegree is decremented; if it drops to 0 it is enqueued. |
