function eventualSafeNodes(graph: number[][]): number[] {
  const n = graph.length;
  const reverse: number[][] = Array.from({ length: n }, () => []);
  const outDegree: number[] = new Array(n).fill(0);
  for (let node = 0; node < n; node++) {
    outDegree[node] = graph[node].length;
    for (const next of graph[node]) {
      reverse[next].push(node);
    }
  }
  const queue: number[] = [];
  for (let node = 0; node < n; node++) {
    if (outDegree[node] === 0) {
      queue.push(node);
    }
  }
  const safe: boolean[] = new Array(n).fill(false);
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    safe[node] = true;
    for (const prev of reverse[node]) {
      outDegree[prev]--;
      if (outDegree[prev] === 0) {
        queue.push(prev);
      }
    }
  }
  const res: number[] = [];
  for (let node = 0; node < n; node++) {
    if (safe[node]) {
      res.push(node);
    }
  }
  return res;
}
