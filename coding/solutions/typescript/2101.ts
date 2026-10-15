function maximumDetonation(bombs: number[][]): number {
  const n = bombs.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const dx = bombs[i][0] - bombs[j][0], dy = bombs[i][1] - bombs[j][1];
      if (i !== j && dx * dx + dy * dy <= bombs[i][2] * bombs[i][2]) {
        adj[i].push(j);
      }
    }
  }
  let res = 0;
  for (let start = 0; start < n; start++) {
    const visited = new Set([start]);
    const stack = [start];
    while (stack.length) {
      const bomb = stack.pop()!;
      for (const next of adj[bomb]) {
        if (!visited.has(next)) {
          visited.add(next);
          stack.push(next);
        }
      }
    }
    res = Math.max(res, visited.size);
  }
  return res;
}
