function calcEquation(equations: string[][], values: number[], queries: string[][]): number[] {
  const graph = new Map<string, [string, number][]>();
  const addEdge = (a: string, b: string, w: number): void => {
    if (!graph.has(a)) graph.set(a, []);
    graph.get(a)!.push([b, w]);
  };
  for (let i = 0; i < equations.length; i++) {
    const [a, b] = equations[i];
    addEdge(a, b, values[i]);
    addEdge(b, a, 1 / values[i]);
  }
  const dfs = (src: string, dst: string, visited: Set<string>): number => {
    if (!graph.has(src) || !graph.has(dst)) return -1;
    if (src === dst) return 1;
    visited.add(src);
    for (const [nei, w] of graph.get(src)!) {
      if (!visited.has(nei)) {
        const sub = dfs(nei, dst, visited);
        if (sub !== -1) return w * sub;
      }
    }
    return -1;
  };
  return queries.map(([a, b]) => dfs(a, b, new Set()));
}
