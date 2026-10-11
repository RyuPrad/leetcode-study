function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  const indegree: number[] = new Array(numCourses).fill(0);
  for (const [course, pre] of prerequisites) {
    adj[pre].push(course);
    indegree[course]++;
  }
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i);
  }
  let count = 0;
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    count++;
    for (const next of adj[node]) {
      indegree[next]--;
      if (indegree[next] === 0) queue.push(next);
    }
  }
  return count === numCourses;
}
