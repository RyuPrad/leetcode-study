function shortestAlternatingPaths(n: number, redEdges: number[][], blueEdges: number[][]): number[] {
  const adj: number[][][] = Array.from({ length: n }, () => []);
  for (const [a, b] of redEdges) {
    adj[a].push([b, 0]);
  }
  for (const [a, b] of blueEdges) {
    adj[a].push([b, 1]);
  }
  const res: number[] = new Array(n).fill(-1);
  const seen = Array.from({ length: n }, () => [false, false]);
  const queue: number[][] = [[0, -1, 0]];
  res[0] = 0;
  for (let head = 0; head < queue.length; head++) {
    const [node, color, length] = queue[head];
    for (const [next, edgeColor] of adj[node]) {
      if (edgeColor !== color && !seen[next][edgeColor]) {
        seen[next][edgeColor] = true;
        if (res[next] === -1) {
          res[next] = length + 1;
        }
        queue.push([next, edgeColor, length + 1]);
      }
    }
  }
  return res;
}
