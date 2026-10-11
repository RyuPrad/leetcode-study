function checkIfPrerequisite(numCourses: number, prerequisites: number[][], queries: number[][]): boolean[] {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) adj[a].push(b);
  const reach: boolean[][] = Array.from({ length: numCourses }, () => new Array<boolean>(numCourses).fill(false));
  const dfs = (src: number, node: number): void => {
    for (const nei of adj[node]) {
      if (!reach[src][nei]) {
        reach[src][nei] = true;
        dfs(src, nei);
      }
    }
  };
  for (let i = 0; i < numCourses; i++) dfs(i, i);
  return queries.map(([u, v]) => reach[u][v]);
}
