function isBipartite(graph: number[][]): boolean {
  const n = graph.length;
  const color: number[] = new Array(n).fill(-1);
  for (let start = 0; start < n; start++) {
    if (color[start] !== -1) {
      continue;
    }
    color[start] = 0;
    const queue = [start];
    for (let head = 0; head < queue.length; head++) {
      const node = queue[head];
      for (const next of graph[node]) {
        if (color[next] === -1) {
          color[next] = 1 - color[node];
          queue.push(next);
        } else if (color[next] === color[node]) {
          return false;
        }
      }
    }
  }
  return true;
}
