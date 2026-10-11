function wordBreak(s: string, wordDict: string[]): string[] {
  const words = new Set(wordDict);
  const res: string[] = [];
  const path: string[] = [];
  function dfs(start: number): void {
    if (start === s.length) {
      res.push(path.join(' '));
      return;
    }
    for (let end = start + 1; end <= s.length; end++) {
      const word = s.substring(start, end);
      if (words.has(word)) {
        path.push(word);
        dfs(end);
        path.pop();
      }
    }
  }
  dfs(0);
  return res;
}
