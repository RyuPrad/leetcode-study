function minScore(n: number, roads: number[][]): number {
  const adj: number[][][] = Array.from({ length: n + 1 }, () => []);
  for (const [a, b, d] of roads) {
    adj[a].push([b, d]);
    adj[b].push([a, d]);
  }
  const visited: boolean[] = new Array(n + 1).fill(false);
  visited[1] = true;
  const stack = [1];
  let res = Infinity;
  while (stack.length) {
    const node = stack.pop()!;
    for (const [next, d] of adj[node]) {
      res = Math.min(res, d);
      if (!visited[next]) {
        visited[next] = true;
        stack.push(next);
      }
    }
  }
  return res;
}
