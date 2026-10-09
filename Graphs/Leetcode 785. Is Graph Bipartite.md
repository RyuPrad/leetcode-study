# Is Graph Bipartite?

[Problem 785 on LeetCode](https://leetcode.com/problems/is-graph-bipartite/description/)

Decide whether an undirected graph can be split into two groups so every edge joins a vertex in one group to a vertex in the other. The input is a zero-based adjacency list: graph[u] lists the neighbors of vertex u. Vertices may be isolated and the graph may have several connected components.

## Opposite labels across each edge

Use 0 for unassigned, and +1 and -1 for the two groups. These are names, so understanding the lesson never depends on a screen color. Pick an unassigned vertex and label it +1. A breadth-first queue visits its component. For an unassigned neighbor, negate the current vertex’s label and then append that neighbor to the queue.

Assign before enqueueing: two vertices may share a neighbor, but its nonzero label tells the second vertex that it is already discovered. Every vertex enters a queue at most once. An existing opposite label is valid; an existing equal label proves a contradiction, so return false immediately.

When one queue finishes, continue the outer scan. Earlier components can be valid while a later triangle makes the entire graph fail. Isolated vertices form valid one-vertex components. A new component may choose +1 independently because it has no edges to earlier components.

A cycle of even length alternates labels consistently. In a triangle, starting at 0 assigns both 1 and 2 label -1, but edge 1–2 would need them to differ. An odd cycle always causes such a contradiction. A graph with no odd cycle can be two-colored.

## Reference JavaScript

```javascript
function isBipartite(graph) {
  const n = graph.length;
  const color = Array(n).fill(0);
  let start = 0;
  while (start < n) {
    if (color[start] === 0) {
      color[start] = 1;
      const queue = [start];
      let head = 0;
      while (head < queue.length) {
        const node = queue[head];
        head++;
        let i = 0;
        while (i < graph[node].length) {
          const neighbor = graph[node][i];
          if (color[neighbor] === 0) {
            color[neighbor] = -color[node];
            queue.push(neighbor);
          } else if (color[neighbor] === color[node]) {
            return false;
          }
          i++;
        }
      }
    }
    start++;
  }
  return true;
}
```

## Variables

| Name | Meaning |
| --- | --- |
| `graph` | original zero-based undirected adjacency list; each row keeps its node identity |
| `n` | number of vertices, including isolated vertices |
| `color` | 0 means unassigned; +1 and -1 name the two groups |
| `start` | next vertex checked by the outer component scan |
| `queue` | vertices discovered in this component, retained in insertion order |
| `head` | index of the next queue entry to read; earlier entries are already dequeued |
| `node` | vertex currently being expanded |
| `i` | index of the next neighbor in graph[node] |
| `neighbor` | neighbor read for this one edge check |

## Complexity and limits

Let V be the number of vertices and E the number of undirected edges. The algorithm takes O(V + E) time: the outer scan examines every vertex and each adjacency entry is read once. Each undirected edge has two entries. Using a monotonically increasing head avoids shifting the queue array. The color array and queue use O(V) auxiliary space. The visualizer’s saved history, rendering and input validation have separate costs.

Coding follows the official bounds: 1–100 vertices, integer neighbor IDs from 0 through V - 1, no self edges or duplicate neighbors, and symmetric adjacency. Neighbor order does not matter. The visualizer limits input to 16 vertices so the adjacency rows and recorded history remain readable. [[]] is valid; [] is not. All fields are validated before input replaces the current walkthrough.

## Try it

- Even cycle: [[1,3],[0,2],[1,3],[0,2]] → true
- Triangle: [[1,2],[0,2],[0,1]] → false
- A later component fails: [[],[2],[1],[],[5,6],[4,6],[4,5]] → false
- Isolated vertex: [[]] → true
- Shared neighbors: [[2,3],[2,3],[0,1],[0,1]] → true; each vertex is enqueued once

<iframe src="is_graph_bipartite_visualizer.html" width="100%" height="900" allowfullscreen></iframe>
