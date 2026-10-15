function minReorder(n: number, connections: number[][]): number {
  const adj: number[][][] = Array.from({ length: n }, () => []);
  for (const [a, b] of connections) {
    adj[a].push([b, 1]);
    adj[b].push([a, 0]);
  }
  const visited: boolean[] = new Array(n).fill(false);
  visited[0] = true;
  const stack = [0];
  let res = 0;
  while (stack.length) {
    const node = stack.pop()!;
    for (const [next, cost] of adj[node]) {
      if (!visited[next]) {
        visited[next] = true;
        res += cost;
        stack.push(next);
      }
    }
  }
  return res;
}
