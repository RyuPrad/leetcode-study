function snakesAndLadders(board: number[][]): number {
  const n = board.length;
  const cell = (square: number): number => {
    const r = Math.floor((square - 1) / n), c = (square - 1) % n;
    return board[n - 1 - r][r % 2 === 0 ? c : n - 1 - c];
  };
  const moves: number[] = new Array(n * n + 1).fill(-1);
  moves[1] = 0;
  const queue = [1];
  for (let head = 0; head < queue.length; head++) {
    const square = queue[head];
    for (let next = square + 1; next <= Math.min(square + 6, n * n); next++) {
      const value = cell(next);
      const dest = value === -1 ? next : value;
      if (moves[dest] === -1) {
        moves[dest] = moves[square] + 1;
        queue.push(dest);
      }
    }
  }
  return moves[n * n];
}
