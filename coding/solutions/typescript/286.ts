function wallsAndGates(rooms: number[][]): void {
  const rows = rooms.length;
  const cols = rooms[0].length;
  const INF = 2147483647;
  let queue: number[][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rooms[r][c] === 0) queue.push([r, c]);
    }
  }
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (queue.length > 0) {
    const next: number[][] = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && rooms[nr][nc] === INF) {
          rooms[nr][nc] = rooms[r][c] + 1;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
  }
}
