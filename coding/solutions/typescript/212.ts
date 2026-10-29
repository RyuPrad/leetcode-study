class TrieNode {
  children = new Map<string, TrieNode>();
  word: string | null = null;
}

function findWords(board: string[][], words: string[]): string[] {
  const root = new TrieNode();
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.word = word;
  }

  const rows = board.length;
  const cols = board[0].length;
  const res: string[] = [];

  const dfs = (r: number, c: number, node: TrieNode): void => {
    const ch = board[r][c];
    const child = node.children.get(ch);
    if (!child) return;
    if (child.word !== null) {
      res.push(child.word);
      child.word = null;
    }
    board[r][c] = "#";
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] !== "#") {
        dfs(nr, nc, child);
      }
    }
    board[r][c] = ch;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, root);
    }
  }
  return res;
}
