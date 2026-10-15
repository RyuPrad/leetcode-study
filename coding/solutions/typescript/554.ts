function leastBricks(wall: number[][]): number {
  const edges = new Map<number, number>();
  let best = 0;
  for (const row of wall) {
    let position = 0;
    for (let i = 0; i < row.length - 1; i++) {
      position += row[i];
      edges.set(position, (edges.get(position) || 0) + 1);
      best = Math.max(best, edges.get(position)!);
    }
  }
  return wall.length - best;
}
