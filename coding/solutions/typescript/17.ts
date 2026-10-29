function letterCombinations(digits: string): string[] {
  if (digits.length === 0) return [];
  const map = new Map<string, string>([['2', 'abc'], ['3', 'def'], ['4', 'ghi'], ['5', 'jkl'], ['6', 'mno'], ['7', 'pqrs'], ['8', 'tuv'], ['9', 'wxyz']]);
  const res: string[] = [];
  const path: string[] = [];
  function dfs(i: number): void {
    if (i === digits.length) {
      res.push(path.join(''));
      return;
    }
    for (const c of map.get(digits[i])!) {
      path.push(c);
      dfs(i + 1);
      path.pop();
    }
  }
  dfs(0);
  return res;
}
