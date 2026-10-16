function isBipartite(graph: number[][]): boolean {
  const n = graph.length;
  const color: number[] = Array(n).fill(0);
  let start = 0;
  while (start < n) {
    if (color[start] === 0) {
      color[start] = 1;
      const queue: number[] = [start];
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
