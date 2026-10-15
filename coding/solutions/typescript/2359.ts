function closestMeetingNode(edges: number[], node1: number, node2: number): number {
  const distances = (start: number): number[] => {
    const dist: number[] = new Array(edges.length).fill(-1);
    let node = start, d = 0;
    while (node !== -1 && dist[node] === -1) {
      dist[node] = d++;
      node = edges[node];
    }
    return dist;
  };
  const d1 = distances(node1), d2 = distances(node2);
  let res = -1, best = Infinity;
  for (let node = 0; node < edges.length; node++) {
    if (d1[node] !== -1 && d2[node] !== -1 && Math.max(d1[node], d2[node]) < best) {
      best = Math.max(d1[node], d2[node]);
      res = node;
    }
  }
  return res;
}
