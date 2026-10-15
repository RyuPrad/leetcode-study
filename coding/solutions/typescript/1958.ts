function checkMove(board: string[][], rMove: number, cMove: number, color: string): boolean {
  const other = color === 'B' ? 'W' : 'B';
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const [dr, dc] of dirs) {
    let r = rMove + dr, c = cMove + dc, length = 1;
    while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === other) {
      r += dr;
      c += dc;
      length++;
    }
    if (length >= 2 && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === color) {
      return true;
    }
  }
  return false;
}
