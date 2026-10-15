function minimumFuelCost(roads: number[][], seats: number): number {
  const n = roads.length + 1;
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of roads) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const parent: number[] = new Array(n).fill(-1);
  parent[0] = 0;
  const order = [0];
  for (let i = 0; i < order.length; i++) {
    for (const next of adj[order[i]]) {
      if (parent[next] === -1) {
        parent[next] = order[i];
        order.push(next);
      }
    }
  }
  const people: number[] = new Array(n).fill(1);
  let fuel = 0;
  for (let i = n - 1; i > 0; i--) {
    const node = order[i];
    fuel += Math.ceil(people[node] / seats);
    people[parent[node]] += people[node];
  }
  return fuel;
}
